import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const imaniStays = {
    name: "Imani Stays",
    whatsapp: "2348157082684", // real pilot number, intl digits only
    vertical: "SHORTLET" as const,
  };

  await prisma.business.upsert({
    where: { slug: "imani-stays" },
    update: imaniStays,
    create: { slug: "imani-stays", ...imaniStays },
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
