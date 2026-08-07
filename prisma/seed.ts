import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.business.upsert({
    where: { slug: "imani-stays" },
    update: {},
    create: {
      name: "Imani Stays",
      slug: "imani-stays",
      whatsapp: "2348160000000", // placeholder — swap in the real number
      vertical: "SHORTLET",
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
