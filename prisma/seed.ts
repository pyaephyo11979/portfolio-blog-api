import { prisma } from "../src/utils/prisma";

async function seed() {
  const user = await prisma.user.create({
    data: {
      username: "admin",
      email: "pyarephyoehlaing16@gmail.com",
      password: "password",
    },
  });
  console.log("Seeded user:", user);
}

seed()
  .catch((error) => {
    console.error("Error occurred while seeding the database:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
