import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { authMiddleware, adminOnly } from "../middleware/auth";

const router = Router();
const prisma = new PrismaClient();

// GET /api/products
router.get("/", authMiddleware, async (_req, res) => {
  try {
    const products = await prisma.product.findMany({
      where: { active: true },
      orderBy: { category: "asc" },
    });
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: "Erro ao listar produtos" });
  }
});

// POST /api/products
router.post("/", authMiddleware, adminOnly, async (req, res) => {
  try {
    const { name, price, category, icon, stock, minStock, costPrice } = req.body;
    const product = await prisma.product.create({
      data: {
        name,
        price,
        category,
        icon: icon || "Package",
        stock: stock || 0,
        minStock: minStock || 0,
        costPrice: costPrice || 0,
      },
    });
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ error: "Erro ao criar produto" });
  }
});

// PUT /api/products/:id
router.put("/:id", authMiddleware, adminOnly, async (req, res) => {
  try {
    const product = await prisma.product.update({
      where: { id: parseInt(req.params.id) },
      data: req.body,
    });
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: "Erro ao atualizar produto" });
  }
});

// DELETE /api/products/:id (soft delete)
router.delete("/:id", authMiddleware, adminOnly, async (req, res) => {
  try {
    await prisma.product.update({
      where: { id: parseInt(req.params.id) },
      data: { active: false },
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Erro ao desativar produto" });
  }
});

export default router;
