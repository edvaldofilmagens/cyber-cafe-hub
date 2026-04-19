import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { authMiddleware, adminOnly } from "../middleware/auth";

const router = Router();
const prisma = new PrismaClient();

// GET /api/accounts
router.get("/", authMiddleware, adminOnly, async (_req, res) => {
  try {
    const accounts = await prisma.account.findMany({ orderBy: { dueDate: "asc" } });
    res.json(accounts);
  } catch {
    res.status(500).json({ error: "Erro ao listar contas" });
  }
});

// POST /api/accounts
router.post("/", authMiddleware, adminOnly, async (req, res) => {
  try {
    const { description, value, dueDate, type } = req.body;
    if (!description || !value || !dueDate || !type) {
      return res.status(400).json({ error: "Campos obrigatórios faltando" });
    }
    const account = await prisma.account.create({
      data: {
        description,
        value: Number(value),
        dueDate: new Date(dueDate),
        type,
        status: "pendente",
      },
    });
    res.status(201).json(account);
  } catch {
    res.status(500).json({ error: "Erro ao criar conta" });
  }
});

// PUT /api/accounts/:id
router.put("/:id", authMiddleware, adminOnly, async (req, res) => {
  try {
    const data: Record<string, unknown> = { ...req.body };
    if (data.dueDate) data.dueDate = new Date(data.dueDate as string);
    const account = await prisma.account.update({
      where: { id: parseInt(req.params.id) },
      data,
    });
    res.json(account);
  } catch {
    res.status(500).json({ error: "Erro ao atualizar conta" });
  }
});

// DELETE /api/accounts/:id
router.delete("/:id", authMiddleware, adminOnly, async (req, res) => {
  try {
    await prisma.account.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: "Erro ao remover conta" });
  }
});

export default router;
