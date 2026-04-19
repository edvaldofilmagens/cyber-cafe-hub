import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { authMiddleware, adminOnly } from "../middleware/auth";

const router = Router();
const prisma = new PrismaClient();

function generateCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 8; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code.slice(0, 4) + "-" + code.slice(4);
}

// GET /api/vouchers
router.get("/", authMiddleware, adminOnly, async (_req, res) => {
  try {
    const vouchers = await prisma.voucher.findMany({ orderBy: { createdAt: "desc" } });
    res.json(vouchers);
  } catch {
    res.status(500).json({ error: "Erro ao listar vouchers" });
  }
});

// POST /api/vouchers — gera N vouchers a partir de um plano
router.post("/", authMiddleware, adminOnly, async (req, res) => {
  try {
    const { hours, price, qty = 1 } = req.body;
    if (!hours || !price) return res.status(400).json({ error: "hours e price são obrigatórios" });

    const created: unknown[] = [];
    for (let i = 0; i < Number(qty); i++) {
      // Garante código único (tenta 5x)
      let code = generateCode();
      for (let attempt = 0; attempt < 5; attempt++) {
        const existing = await prisma.voucher.findUnique({ where: { code } });
        if (!existing) break;
        code = generateCode();
      }
      const v = await prisma.voucher.create({
        data: {
          code,
          hours: Number(hours),
          price: Number(price),
          status: "disponivel",
        },
      });
      created.push(v);
    }
    res.status(201).json(created);
  } catch {
    res.status(500).json({ error: "Erro ao gerar vouchers" });
  }
});

// PUT /api/vouchers/:id
router.put("/:id", authMiddleware, adminOnly, async (req, res) => {
  try {
    const voucher = await prisma.voucher.update({
      where: { id: parseInt(req.params.id) },
      data: req.body,
    });
    res.json(voucher);
  } catch {
    res.status(500).json({ error: "Erro ao atualizar voucher" });
  }
});

// DELETE /api/vouchers/:id
router.delete("/:id", authMiddleware, adminOnly, async (req, res) => {
  try {
    await prisma.voucher.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: "Erro ao remover voucher" });
  }
});

export default router;
