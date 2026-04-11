import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { authMiddleware } from "../middleware/auth";

const router = Router();
const prisma = new PrismaClient();

// GET /api/reports/daily?date=2026-04-11
router.get("/daily", authMiddleware, async (req, res) => {
  try {
    const dateStr = (req.query.date as string) || new Date().toISOString().slice(0, 10);
    const startOfDay = new Date(`${dateStr}T00:00:00.000Z`);
    const endOfDay = new Date(`${dateStr}T23:59:59.999Z`);

    const closedOrders = await prisma.order.findMany({
      where: {
        status: "paga",
        closedAt: { gte: startOfDay, lte: endOfDay },
      },
      include: { items: true, closedBy: { select: { name: true } } },
      orderBy: { closedAt: "desc" },
    });

    const cancelledOrders = await prisma.order.findMany({
      where: {
        status: "cancelada",
        closedAt: { gte: startOfDay, lte: endOfDay },
      },
    });

    const totalVendas = closedOrders.reduce((s, o) => s + o.total, 0);

    // Totals by payment method
    const byPaymentMethod: Record<string, number> = {};
    closedOrders.forEach((o) => {
      const pm = o.paymentMethod || "outros";
      byPaymentMethod[pm] = (byPaymentMethod[pm] || 0) + o.total;
    });

    // Totals by source
    const bySource: Record<string, number> = {};
    closedOrders.forEach((o) => {
      bySource[o.source] = (bySource[o.source] || 0) + o.total;
    });

    // Top products
    const productMap: Record<string, { name: string; qty: number; total: number }> = {};
    closedOrders.forEach((o) =>
      o.items.forEach((i) => {
        const key = String(i.productId);
        if (!productMap[key]) productMap[key] = { name: i.name, qty: 0, total: 0 };
        productMap[key].qty += i.qty;
        productMap[key].total += i.price * i.qty;
      })
    );
    const topProducts = Object.values(productMap)
      .sort((a, b) => b.total - a.total)
      .slice(0, 10);

    res.json({
      date: dateStr,
      totalVendas,
      totalOrders: closedOrders.length,
      totalCancelled: cancelledOrders.length,
      byPaymentMethod,
      bySource,
      topProducts,
      orders: closedOrders,
    });
  } catch (error) {
    console.error("Report error:", error);
    res.status(500).json({ error: "Erro ao gerar relatório" });
  }
});

export default router;
