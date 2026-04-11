import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth";
import userRoutes from "./routes/users";
import orderRoutes from "./routes/orders";
import productRoutes from "./routes/products";
import reportRoutes from "./routes/reports";

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/products", productRoutes);
app.use("/api/reports", reportRoutes);

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", version: "1.0.0" });
});

app.listen(PORT, () => {
  console.log(`🚀 Conecta Remígio API rodando na porta ${PORT}`);
});
