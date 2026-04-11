import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { authMiddleware } from "../middleware/auth";

const router = Router();
const prisma = new PrismaClient();

// GET /api/orders
router.get("/", authMiddleware, async (req, res) => {
  try {
    const { status, source } = req.query;
    const where: any = {};
    if (status) where.status = { in: (status as string).split(",") };
    if (source) where.source = source;

    const orders = await prisma.order.findMany({
      where,
      include: { items: true },
      orderBy: { createdAt: "desc" },
    });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: "Erro ao listar comandas" });
  }
});

// GET /api/orders/:id
router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: req.params.id },
      include: { items: true },
    });
    if (!order) return res.status(404).json({ error: "Comanda não encontrada" });
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar comanda" });
  }
});

// GET /api/orders/source/:source/:sourceId
router.get("/source/:source/:sourceId", authMiddleware, async (req, res) => {
  try {
    const order = await prisma.order.findFirst({
      where: {
        source: req.params.source as any,
        sourceId: parseInt(req.params.sourceId),
        status: { in: ["aberta", "aguardando_pagamento"] },
      },
      include: { items: true },
    });
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar comanda" });
  }
});

// POST /api/orders
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { source, sourceId, sourceLabel, sessionMinutes, sessionPricePerHour } = req.body;

    const order = await prisma.order.create({
      data: {
        source,
        sourceId,
        sourceLabel,
        sessionMinutes: sessionMinutes ?? null,
        sessionStartedAt: sessionMinutes !== undefined ? new Date() : null,
        sessionPricePerHour: sessionPricePerHour ?? null,
      },
      include: { items: true },
    });

    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ error: "Erro ao criar comanda" });
  }
});

// POST /api/orders/:id/items
router.post("/:id/items", authMiddleware, async (req, res) => {
  try {
    const { productId, name, price, qty, category } = req.body;
    const orderId = req.params.id;

    // Check if item already exists
    const existing = await prisma.orderItem.findFirst({
      where: { orderId, productId },
    });

    if (existing) {
      await prisma.orderItem.update({
        where: { id: existing.id },
        data: { qty: existing.qty + qty },
      });
    } else {
      await prisma.orderItem.create({
        data: { orderId, productId, name, price, qty, category },
      });
    }

    // Recalculate total
    const order = await recalcTotal(orderId);
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: "Erro ao adicionar item" });
  }
});

// PUT /api/orders/:id/items/:productId
router.put("/:id/items/:productId", authMiddleware, async (req, res) => {
  try {
    const { delta } = req.body;
    const orderId = req.params.id;
    const productId = parseInt(req.params.productId);

    const item = await prisma.orderItem.findFirst({
      where: { orderId, productId },
    });

    if (!item) return res.status(404).json({ error: "Item não encontrado" });

    const newQty = item.qty + delta;
    if (newQty <= 0) {
      await prisma.orderItem.delete({ where: { id: item.id } });
    } else {
      await prisma.orderItem.update({
        where: { id: item.id },
        data: { qty: newQty },
      });
    }

    const order = await recalcTotal(orderId);
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: "Erro ao atualizar item" });
  }
});

// DELETE /api/orders/:id/items/:productId
router.delete("/:id/items/:productId", authMiddleware, async (req, res) => {
  try {
    const orderId = req.params.id;
    const productId = parseInt(req.params.productId);

    await prisma.orderItem.deleteMany({
      where: { orderId, productId },
    });

    const order = await recalcTotal(orderId);
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: "Erro ao remover item" });
  }
});

// PUT /api/orders/:id/send-to-payment
router.put("/:id/send-to-payment", authMiddleware, async (req, res) => {
  try {
    const order = await prisma.order.update({
      where: { id: req.params.id },
      data: { status: "aguardando_pagamento" },
      include: { items: true },
    });
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: "Erro ao enviar para pagamento" });
  }
});

// PUT /api/orders/:id/finalize
router.put("/:id/finalize", authMiddleware, async (req, res) => {
  try {
    const { paymentMethod } = req.body;

    // Recalc before finalizing
    await recalcTotal(req.params.id);

    const order = await prisma.order.update({
      where: { id: req.params.id },
      data: {
        status: "paga",
        paymentMethod,
        closedAt: new Date(),
        closedById: req.user!.userId,
      },
      include: { items: true },
    });

    // Decrement stock for each item
    for (const item of order.items) {
      await prisma.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.qty } },
      });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ error: "Erro ao finalizar comanda" });
  }
});

// PUT /api/orders/:id/cancel
router.put("/:id/cancel", authMiddleware, async (req, res) => {
  try {
    const order = await prisma.order.update({
      where: { id: req.params.id },
      data: { status: "cancelada", closedAt: new Date() },
      include: { items: true },
    });
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: "Erro ao cancelar comanda" });
  }
});

// Helper
async function recalcTotal(orderId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true },
  });
  if (!order) throw new Error("Order not found");

  let itemsTotal = order.items.reduce((sum, i) => sum + i.price * i.qty, 0);

  if (order.source === "computador" && order.sessionMinutes && order.sessionPricePerHour) {
    itemsTotal += (order.sessionMinutes / 60) * order.sessionPricePerHour;
  }

  return prisma.order.update({
    where: { id: orderId },
    data: { total: itemsTotal },
    include: { items: true },
  });
}

export default router;
