import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Create admin user
  const adminPassword = await bcrypt.hash("admin123", 10);
  await prisma.user.upsert({
    where: { email: "admin@conectaremigio.com" },
    update: {},
    create: {
      name: "Admin",
      email: "admin@conectaremigio.com",
      password: adminPassword,
      role: "admin",
    },
  });

  // Create funcionario user
  const funcPassword = await bcrypt.hash("func123", 10);
  await prisma.user.upsert({
    where: { email: "funcionario@conectaremigio.com" },
    update: {},
    create: {
      name: "Funcionário",
      email: "funcionario@conectaremigio.com",
      password: funcPassword,
      role: "funcionario",
    },
  });

  // Seed products
  const products = [
    { name: "Café Expresso", price: 7.0, category: "Bebidas", icon: "Coffee", stock: 100 },
    { name: "Café com Leite", price: 8.5, category: "Bebidas", icon: "Coffee", stock: 100 },
    { name: "Cappuccino", price: 10.0, category: "Bebidas", icon: "Coffee", stock: 50 },
    { name: "Suco Natural", price: 9.0, category: "Bebidas", icon: "Coffee", stock: 50 },
    { name: "Água Mineral", price: 4.0, category: "Bebidas", icon: "Coffee", stock: 200 },
    { name: "Pão de Queijo", price: 4.5, category: "Lanches", icon: "Sandwich", stock: 50 },
    { name: "Coxinha", price: 6.0, category: "Lanches", icon: "Sandwich", stock: 40 },
    { name: "Misto Quente", price: 8.0, category: "Lanches", icon: "Sandwich", stock: 30 },
    { name: "Bolo Fatia", price: 7.5, category: "Lanches", icon: "Sandwich", stock: 20 },
    { name: "Voucher 1h Wi-Fi", price: 5.0, category: "Internet", icon: "Wifi", stock: 999 },
    { name: "Voucher 2h Wi-Fi", price: 10.0, category: "Internet", icon: "Wifi", stock: 999 },
    { name: "Voucher 5h Wi-Fi", price: 20.0, category: "Internet", icon: "Wifi", stock: 999 },
  ];

  for (const p of products) {
    await prisma.product.upsert({
      where: { id: products.indexOf(p) + 1 },
      update: {},
      create: p,
    });
  }

  console.log("✅ Seed concluído!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
