import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import { config } from "./config";
import { prisma } from "./prisma";
import authRouter from "./routes/auth";
import productsRouter from "./routes/products";
import cartRouter from "./routes/cart";
import ordersRouter from "./routes/orders";
import adminOrdersRouter from "./routes/adminOrders";

const app = express();

app.use(
  cors({
    origin: config.webOrigin,
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());
app.use("/auth", authRouter);
app.use("/products", productsRouter);
app.use("/cart", cartRouter);
app.use("/orders", ordersRouter);
app.use("/api/admin/orders", adminOrdersRouter);

async function startServer() {
  try {
    await prisma.$connect();
    console.log("Prisma connected");

    const server = app.listen(config.port, () => {
      console.log(`Backend listening on http://localhost:${config.port}`);
    });

    const shutdown = async (signal: NodeJS.Signals) => {
      console.log(`Received ${signal}, shutting down`);
      server.close(async () => {
        await prisma.$disconnect();
        process.exit(0);
      });
    };

    process.on("SIGINT", shutdown);
    process.on("SIGTERM", shutdown);
  } catch (error) {
    console.error("Failed to start backend", error);
    await prisma.$disconnect().catch(() => undefined);
    process.exit(1);
  }
}

void startServer();
