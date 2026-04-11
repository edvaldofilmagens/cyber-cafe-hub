import { Router } from "express";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import { authMiddleware, adminOnly } from "../middleware/auth";

const router = Router();
const prisma = new PrismaClient();

// GET /api/users
router.get("/", authMiddleware, adminOnly, async (_req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true, active: true, createdAt: true },
      orderBy: { createdAt: "desc" },
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: "Erro ao listar usuários" });
  }
});

// POST /api/users
router.post("/", authMiddleware, adminOnly, async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: "Nome, email e senha são obrigatórios" });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({ error: "Email já cadastrado" });
    }

    const hashed = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: { name, email, password: hashed, role: role || "funcionario" },
      select: { id: true, name: true, email: true, role: true, active: true, createdAt: true },
    });

    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({ error: "Erro ao criar usuário" });
  }
});

// PUT /api/users/:id
router.put("/:id", authMiddleware, adminOnly, async (req, res) => {
  try {
    const { name, email, role, active, password } = req.body;

    const data: any = {};
    if (name) data.name = name;
    if (email) data.email = email;
    if (role) data.role = role;
    if (typeof active === "boolean") data.active = active;
    if (password) data.password = await bcrypt.hash(password, 10);

    const user = await prisma.user.update({
      where: { id: req.params.id },
      data,
      select: { id: true, name: true, email: true, role: true, active: true, createdAt: true },
    });

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: "Erro ao atualizar usuário" });
  }
});

// DELETE /api/users/:id
router.delete("/:id", authMiddleware, adminOnly, async (req, res) => {
  try {
    await prisma.user.update({
      where: { id: req.params.id },
      data: { active: false },
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Erro ao desativar usuário" });
  }
});

export default router;
