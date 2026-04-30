import { prisma } from "../lib/prisma"
import bcrypt from "bcryptjs"

async function main() {
  console.log("Seeding database...")

  // Clean existing data (optional - comment out if you want to keep existing data)
  // await prisma.session.deleteMany({})
  // await prisma.account.deleteMany({})
  // await prisma.user.deleteMany({})

  // Create admin user
  const hashedPassword = await bcrypt.hash("admin123", 10)

  const adminUser = await prisma.user.upsert({
    where: { email: "admin@demo.com" },
    update: {},
    create: {
      email: "admin@demo.com",
      password: hashedPassword,
      name: "Admin User",
      role: "ADMIN",
    },
  })

  console.log("✓ Admin user created:", {
    id: adminUser.id,
    email: adminUser.email,
    role: adminUser.role,
  })

  // Create analyst user
  const analystPassword = await bcrypt.hash("analyst123", 10)

  const analystUser = await prisma.user.upsert({
    where: { email: "analyst@demo.com" },
    update: {},
    create: {
      email: "analyst@demo.com",
      password: analystPassword,
      name: "Analyst User",
      role: "ANALYST",
    },
  })

  console.log("✓ Analyst user created:", {
    id: analystUser.id,
    email: analystUser.email,
    role: analystUser.role,
  })

  // Create viewer user
  const viewerPassword = await bcrypt.hash("viewer123", 10)

  const viewerUser = await prisma.user.upsert({
    where: { email: "viewer@demo.com" },
    update: {},
    create: {
      email: "viewer@demo.com",
      password: viewerPassword,
      name: "Viewer User",
      role: "VIEWER",
    },
  })

  console.log("✓ Viewer user created:", {
    id: viewerUser.id,
    email: viewerUser.email,
    role: viewerUser.role,
  })

  console.log("\n✅ Seeding completed!")
  console.log("\nDemo credentials:")
  console.log("- Admin: admin@demo.com / admin123")
  console.log("- Analyst: analyst@demo.com / analyst123")
  console.log("- Viewer: viewer@demo.com / viewer123")
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
