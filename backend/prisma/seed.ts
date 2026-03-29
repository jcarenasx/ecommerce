import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main(): Promise<void> {
  await prisma.product.upsert({
    where: { id: 1 },
    update: {
      name: "Camiseta",
      priceCents: 200,
    },
    create: {
      id: 1,
      name: "Camiseta",
      priceCents: 200,
    },
  });

  await prisma.product.upsert({
    where: { id: 2 },
    update: {
      name: "Pantalón",
      priceCents: 350,
    },
    create: {
      id: 2,
      name: "Pantalón",
      priceCents: 350,
    },
  });

  await prisma.product.upsert({
    where: { id: 3 },
    update: {
      name: "Zapatos",
      priceCents: 500,
    },
    create: {
      id: 3,
      name: "Zapatos",
      priceCents: 500,
    },
  });

  console.log("Products seeded ✅");
}

main()
  .catch(async (error: unknown) => {
    console.error("Failed to seed products", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
