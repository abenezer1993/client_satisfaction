import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

// Simple in-memory rate limit to prevent accidental repeated calls
let lastRun = 0;
const MIN_INTERVAL_MS = 10_000;

export async function GET() {
  const now = Date.now();
  if (now - lastRun < MIN_INTERVAL_MS) {
    return NextResponse.json(
      { error: "Please wait at least 10 seconds between seed calls." },
      { status: 429 }
    );
  }
  lastRun = now;

  try {
    // Clean existing data (order matters for foreign keys)
    await prisma.notification.deleteMany();
    await prisma.feedbackResponse.deleteMany();
    await prisma.followUpTask.deleteMany();
    await prisma.feedback.deleteMany();
    await prisma.service.deleteMany();
    await prisma.serviceCategory.deleteMany();
    await prisma.officeSettings.deleteMany();
    await prisma.auditLog.deleteMany();
    await prisma.user.deleteMany();
    await prisma.office.deleteMany();
    await prisma.globalSettings.deleteMany();

    // Global settings
    await prisma.globalSettings.create({
      data: {
        id: "global",
        ratingScaleMin: 1,
        ratingScaleMax: 5,
        allowGuestReviews: true,
        defaultRetentionDays: 365,
        requireAuthForInternal: true,
      },
    });

    const passwordHash = await bcrypt.hash("password123", 12);

    // Create offices
    const nyOffice = await prisma.office.create({
      data: { name: "New York Office", description: "Main headquarters" },
    });
    const sfOffice = await prisma.office.create({
      data: { name: "San Francisco Office", description: "West coast branch" },
    });
    const lonOffice = await prisma.office.create({
      data: { name: "London Office", description: "UK office" },
    });

    // Create admin user
    await prisma.user.create({
      data: {
        name: "System Admin",
        email: "admin@example.com",
        passwordHash,
        role: "GLOBAL_ADMIN",
        isActive: true,
      },
    });

    // Create office admins
    await prisma.user.create({
      data: {
        name: "Alice Manager",
        email: "alice@nyoffice.com",
        passwordHash,
        role: "OFFICE_ADMIN",
        officeId: nyOffice.id,
        isActive: true,
      },
    });
    await prisma.user.create({
      data: {
        name: "Bob Director",
        email: "bob@sfoffice.com",
        passwordHash,
        role: "OFFICE_ADMIN",
        officeId: sfOffice.id,
        isActive: true,
      },
    });
    await prisma.user.create({
      data: {
        name: "Carol Lead",
        email: "carol@lonoffice.com",
        passwordHash,
        role: "OFFICE_ADMIN",
        officeId: lonOffice.id,
        isActive: true,
      },
    });

    // Create some office users
    await prisma.user.create({
      data: { name: "Dave Wilson", email: "dave@nyoffice.com", passwordHash, role: "OFFICE_USER", officeId: nyOffice.id, isActive: true },
    });
    await prisma.user.create({
      data: { name: "Eve Chen", email: "eve@nyoffice.com", passwordHash, role: "OFFICE_USER", officeId: nyOffice.id, isActive: true },
    });
    await prisma.user.create({
      data: { name: "Henry Zhang", email: "henry@sfoffice.com", passwordHash, role: "OFFICE_USER", officeId: sfOffice.id, isActive: true },
    });
    await prisma.user.create({
      data: { name: "Iris Patel", email: "iris@sfoffice.com", passwordHash, role: "OFFICE_USER", officeId: sfOffice.id, isActive: true },
    });
    await prisma.user.create({
      data: { name: "Diana Ross", email: "diana@lonoffice.com", passwordHash, role: "OFFICE_USER", officeId: lonOffice.id, isActive: true },
    });
    await prisma.user.create({
      data: { name: "Edward King", email: "edward@lonoffice.com", passwordHash, role: "OFFICE_USER", officeId: lonOffice.id, isActive: true },
    });

    return NextResponse.json({
      success: true,
      message: "Database seeded successfully!",
      users: {
        admin: { email: "admin@example.com", password: "password123", role: "GLOBAL_ADMIN" },
        offices: [
          { name: "New York Office", admin: "alice@nyoffice.com" },
          { name: "San Francisco Office", admin: "bob@sfoffice.com" },
          { name: "London Office", admin: "carol@lonoffice.com" },
        ],
      },
    });
  } catch (error: any) {
    console.error("Seed error:", error);
    return NextResponse.json(
      { error: "Seed failed: " + (error?.message || "Unknown error") },
      { status: 500 }
    );
  }
}
