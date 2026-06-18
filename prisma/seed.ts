import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const email = process.env.APP_USER;
  if (!email) throw new Error("APP_USER must be set to seed the owner user");
  await prisma.user.upsert({
    where: { email },
    update: {},
    create: { email },
  });
  console.log(`Seeded owner user: ${email}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
