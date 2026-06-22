import { PrismaClient, Role, FeedbackStatus } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import bcrypt from "bcryptjs";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding database...");

  // Clean existing data
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

  // Create users
  const globalAdmin = await prisma.user.create({
    data: {
      name: "System Admin",
      email: "admin@example.com",
      passwordHash,
      role: "GLOBAL_ADMIN",
      isActive: true,
    },
  });

  const nyAdmin = await prisma.user.create({
    data: {
      name: "Alice Manager",
      email: "alice@nyoffice.com",
      passwordHash,
      role: "OFFICE_ADMIN",
      officeId: nyOffice.id,
      isActive: true,
    },
  });

  const sfAdmin = await prisma.user.create({
    data: {
      name: "Bob Director",
      email: "bob@sfoffice.com",
      passwordHash,
      role: "OFFICE_ADMIN",
      officeId: sfOffice.id,
      isActive: true,
    },
  });

  const lonAdmin = await prisma.user.create({
    data: {
      name: "Carol Lead",
      email: "carol@lonoffice.com",
      passwordHash,
      role: "OFFICE_ADMIN",
      officeId: lonOffice.id,
      isActive: true,
    },
  });

  const nyUsers = await Promise.all([
    prisma.user.create({
      data: { name: "Dave Wilson", email: "dave@nyoffice.com", passwordHash, role: "OFFICE_USER", officeId: nyOffice.id, isActive: true },
    }),
    prisma.user.create({
      data: { name: "Eve Chen", email: "eve@nyoffice.com", passwordHash, role: "OFFICE_USER", officeId: nyOffice.id, isActive: true },
    }),
    prisma.user.create({
      data: { name: "Frank Brown", email: "frank@nyoffice.com", passwordHash, role: "OFFICE_USER", officeId: nyOffice.id, isActive: true },
    }),
    prisma.user.create({
      data: { name: "Grace Lee", email: "grace@nyoffice.com", passwordHash, role: "OFFICE_USER", officeId: nyOffice.id, isActive: true },
    }),
  ]);

  const sfUsers = await Promise.all([
    prisma.user.create({
      data: { name: "Henry Zhang", email: "henry@sfoffice.com", passwordHash, role: "OFFICE_USER", officeId: sfOffice.id, isActive: true },
    }),
    prisma.user.create({
      data: { name: "Iris Patel", email: "iris@sfoffice.com", passwordHash, role: "OFFICE_USER", officeId: sfOffice.id, isActive: true },
    }),
    prisma.user.create({
      data: { name: "Jack Smith", email: "jack@sfoffice.com", passwordHash, role: "OFFICE_USER", officeId: sfOffice.id, isActive: true },
    }),
  ]);

  const lonUsers = await Promise.all([
    prisma.user.create({
      data: { name: "Diana Ross", email: "diana@lonoffice.com", passwordHash, role: "OFFICE_USER", officeId: lonOffice.id, isActive: true },
    }),
    prisma.user.create({
      data: { name: "Edward King", email: "edward@lonoffice.com", passwordHash, role: "OFFICE_USER", officeId: lonOffice.id, isActive: true },
    }),
  ]);

  // Create service categories and services for NY office
  const nyTechCat = await prisma.serviceCategory.create({
    data: { name: "Technical Support", description: "Technical assistance and support", officeId: nyOffice.id, sortOrder: 1 },
  });
  const nySalesCat = await prisma.serviceCategory.create({
    data: { name: "Sales", description: "Sales and account management", officeId: nyOffice.id, sortOrder: 2 },
  });
  const nyAdminCat = await prisma.serviceCategory.create({
    data: { name: "Administrative", description: "Administrative tasks", officeId: nyOffice.id, sortOrder: 3 },
  });

  await Promise.all([
    prisma.service.create({ data: { name: "Phone Support", categoryId: nyTechCat.id, officeId: nyOffice.id, sortOrder: 1 } }),
    prisma.service.create({ data: { name: "Email Support", categoryId: nyTechCat.id, officeId: nyOffice.id, sortOrder: 2 } }),
    prisma.service.create({ data: { name: "Live Chat", categoryId: nyTechCat.id, officeId: nyOffice.id, sortOrder: 3 } }),
    prisma.service.create({ data: { name: "New Account Setup", categoryId: nySalesCat.id, officeId: nyOffice.id, sortOrder: 1 } }),
    prisma.service.create({ data: { name: "Billing Inquiry", categoryId: nySalesCat.id, officeId: nyOffice.id, sortOrder: 2 } }),
    prisma.service.create({ data: { name: "Contract Renewal", categoryId: nySalesCat.id, officeId: nyOffice.id, sortOrder: 3 } }),
    prisma.service.create({ data: { name: "Document Processing", categoryId: nyAdminCat.id, officeId: nyOffice.id, sortOrder: 1 } }),
    prisma.service.create({ data: { name: "Scheduling", categoryId: nyAdminCat.id, officeId: nyOffice.id, sortOrder: 2 } }),
  ]);

  // Service categories for SF office
  const sfProductCat = await prisma.serviceCategory.create({
    data: { name: "Product Support", description: "Product-related inquiries", officeId: sfOffice.id, sortOrder: 1 },
  });
  await Promise.all([
    prisma.service.create({ data: { name: "Product Training", categoryId: sfProductCat.id, officeId: sfOffice.id, sortOrder: 1 } }),
    prisma.service.create({ data: { name: "Technical Consultation", categoryId: sfProductCat.id, officeId: sfOffice.id, sortOrder: 2 } }),
    prisma.service.create({ data: { name: "Bug Report", officeId: sfOffice.id, sortOrder: 3 } }),
  ]);

  // Service categories for London office
  const lonSupportCat = await prisma.serviceCategory.create({
    data: { name: "Customer Support", description: "Customer service inquiries", officeId: lonOffice.id, sortOrder: 1 },
  });
  await Promise.all([
    prisma.service.create({ data: { name: "Phone Support", categoryId: lonSupportCat.id, officeId: lonOffice.id, sortOrder: 1 } }),
    prisma.service.create({ data: { name: "Email Support", categoryId: lonSupportCat.id, officeId: lonOffice.id, sortOrder: 2 } }),
    prisma.service.create({ data: { name: "On-Site Visit", officeId: lonOffice.id, sortOrder: 3 } }),
  ]);

  // Create feedback entries
  const now = new Date();

  // Helper to create feedback at a specific date offset
  const createFeedback = (
    rating: number,
    comment: string,
    authorId: string,
    targetUserId: string,
    officeId: string,
    serviceId: string | null,
    daysAgo: number,
    status: FeedbackStatus
  ) =>
    prisma.feedback.create({
      data: {
        rating,
        comment,
        authorId,
        targetUserId,
        officeId,
        serviceId,
        status,
        isAnonymous: false,
        createdAt: new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000),
      },
    });

  // NY Office feedback (30 entries over the last 60 days)
  const nyServices = await prisma.service.findMany({ where: { officeId: nyOffice.id } });

  await createFeedback(5, "Excellent support from Dave on the phone, resolved my issue quickly.", nyAdmin.id, nyUsers[0].id, nyOffice.id, nyServices[0].id, 1, "RESOLVED");
  await createFeedback(4, "Eve helped me set up my account, very professional.", nyAdmin.id, nyUsers[1].id, nyOffice.id, nyServices[3].id, 2, "RESOLVED");
  await createFeedback(5, "Frank went above and beyond to help with our contract renewal.", nyAdmin.id, nyUsers[2].id, nyOffice.id, nyServices[5].id, 3, "RESOLVED");
  await createFeedback(3, "Grace was helpful but the response was a bit slow.", nyAdmin.id, nyUsers[3].id, nyOffice.id, nyServices[1].id, 4, "ACKNOWLEDGED");
  await createFeedback(5, "Dave is always reliable and knowledgeable.", nyUsers[1].id, nyUsers[0].id, nyOffice.id, null, 5, "RESOLVED");
  await createFeedback(4, "Eve handled my billing question perfectly.", nyUsers[0].id, nyUsers[1].id, nyOffice.id, nyServices[4].id, 6, "RESOLVED");
  await createFeedback(5, "Frank is the best! Always goes the extra mile.", nyUsers[3].id, nyUsers[2].id, nyOffice.id, nyServices[2].id, 7, "RESOLVED");
  await createFeedback(4, "Grace provided great support with document processing.", nyUsers[0].id, nyUsers[3].id, nyOffice.id, nyServices[6].id, 8, "RESOLVED");
  await createFeedback(5, "Dave resolved my issue in under 5 minutes, amazing service.", nyUsers[2].id, nyUsers[0].id, nyOffice.id, nyServices[0].id, 10, "NEW");
  await createFeedback(2, "Response time was too slow for an urgent request.", nyUsers[1].id, nyUsers[3].id, nyOffice.id, nyServices[6].id, 12, "ACKNOWLEDGED");
  await createFeedback(4, "Eve explained everything clearly and patiently.", nyUsers[2].id, nyUsers[1].id, nyOffice.id, nyServices[4].id, 14, "RESOLVED");
  await createFeedback(5, "Outstanding service from the whole team!", nyAdmin.id, nyUsers[0].id, nyOffice.id, null, 15, "RESOLVED");
  await createFeedback(3, "Could have been faster but the resolution was good.", nyUsers[0].id, nyUsers[2].id, nyOffice.id, nyServices[5].id, 18, "NEW");
  await createFeedback(5, "Frank helped me understand the new billing system perfectly.", nyUsers[3].id, nyUsers[2].id, nyOffice.id, nyServices[4].id, 20, "RESOLVED");
  await createFeedback(4, "Great phone support from Dave, very courteous.", nyUsers[1].id, nyUsers[0].id, nyOffice.id, nyServices[0].id, 22, "RESOLVED");
  await createFeedback(1, "Very disappointed with the response time on my email.", nyUsers[2].id, nyUsers[3].id, nyOffice.id, nyServices[1].id, 25, "NEW");
  await createFeedback(5, "Grace scheduled my appointment perfectly, thank you!", nyUsers[0].id, nyUsers[3].id, nyOffice.id, nyServices[7].id, 28, "RESOLVED");
  await createFeedback(4, "Eve is always professional and helpful.", nyUsers[3].id, nyUsers[1].id, nyOffice.id, nyServices[3].id, 30, "RESOLVED");
  await createFeedback(5, "Excellent live chat support from Frank at 9 PM!", nyUsers[0].id, nyUsers[2].id, nyOffice.id, nyServices[2].id, 32, "NEW");
  await createFeedback(3, "Average experience, room for improvement in communication.", nyUsers[1].id, nyUsers[0].id, nyOffice.id, nyServices[0].id, 35, "NEW");
  await createFeedback(4, "Good service overall, would recommend.", nyUsers[2].id, nyUsers[1].id, nyOffice.id, nyServices[1].id, 38, "ACKNOWLEDGED");
  await createFeedback(5, "Dave is a rockstar! Always delivers exceptional service.", nyAdmin.id, nyUsers[0].id, nyOffice.id, nyServices[0].id, 40, "RESOLVED");
  await createFeedback(4, "Smooth contract renewal process thanks to Grace.", nyAdmin.id, nyUsers[3].id, nyOffice.id, nyServices[5].id, 42, "RESOLVED");
  await createFeedback(5, "Best customer experience I've had in a long time!", nyUsers[1].id, nyUsers[2].id, nyOffice.id, nyServices[2].id, 45, "NEW");
  await createFeedback(2, "The live chat agent seemed unprepared for my question.", nyUsers[3].id, nyUsers[2].id, nyOffice.id, nyServices[2].id, 48, "ACKNOWLEDGED");
  await createFeedback(4, "Eve processed my documents quickly and accurately.", nyUsers[0].id, nyUsers[1].id, nyOffice.id, nyServices[6].id, 50, "RESOLVED");
  await createFeedback(5, "Amazing support from the entire NY office team!", nyAdmin.id, nyUsers[0].id, nyOffice.id, null, 52, "RESOLVED");
  await createFeedback(3, "Decent service but the follow-up took too long.", nyUsers[2].id, nyUsers[3].id, nyOffice.id, nyServices[7].id, 55, "NEW");
  await createFeedback(5, "Grace went above and beyond to accommodate my schedule.", nyUsers[0].id, nyUsers[3].id, nyOffice.id, nyServices[7].id, 58, "RESOLVED");
  await createFeedback(4, "Dave provided excellent technical support again.", nyUsers[1].id, nyUsers[0].id, nyOffice.id, nyServices[0].id, 60, "RESOLVED");

  // SF Office feedback (15 entries)
  const sfServices = await prisma.service.findMany({ where: { officeId: sfOffice.id } });

  await createFeedback(5, "Henry provided excellent product training session.", sfAdmin.id, sfUsers[0].id, sfOffice.id, sfServices[0].id, 2, "RESOLVED");
  await createFeedback(4, "Iris was very knowledgeable about the technical consultation.", sfAdmin.id, sfUsers[1].id, sfOffice.id, sfServices[1].id, 5, "RESOLVED");
  await createFeedback(5, "Jack fixed the bug in record time, great work!", sfAdmin.id, sfUsers[2].id, sfOffice.id, sfServices[2].id, 8, "RESOLVED");
  await createFeedback(3, "Henry was helpful but the training could be more detailed.", sfUsers[1].id, sfUsers[0].id, sfOffice.id, sfServices[0].id, 12, "ACKNOWLEDGED");
  await createFeedback(5, "Iris went above and beyond in understanding our needs.", sfUsers[0].id, sfUsers[1].id, sfOffice.id, sfServices[1].id, 15, "RESOLVED");
  await createFeedback(4, "Jack's bug fix was thorough and well-documented.", sfUsers[0].id, sfUsers[2].id, sfOffice.id, sfServices[2].id, 18, "RESOLVED");
  await createFeedback(5, "Outstanding technical consultation from the SF team!", sfAdmin.id, sfUsers[1].id, sfOffice.id, sfServices[1].id, 22, "NEW");
  await createFeedback(2, "Response time needs improvement on bug reports.", sfUsers[1].id, sfUsers[2].id, sfOffice.id, sfServices[2].id, 25, "NEW");
  await createFeedback(4, "Henry's product knowledge is impressive.", sfUsers[2].id, sfUsers[0].id, sfOffice.id, sfServices[0].id, 30, "ACKNOWLEDGED");
  await createFeedback(5, "Excellent service from the whole SF office!", sfAdmin.id, sfUsers[0].id, sfOffice.id, null, 35, "RESOLVED");
  await createFeedback(4, "Iris helped us optimize our workflow significantly.", sfUsers[2].id, sfUsers[1].id, sfOffice.id, sfServices[1].id, 40, "RESOLVED");
  await createFeedback(3, "Good but expected more from the consultation.", sfUsers[0].id, sfUsers[1].id, sfOffice.id, sfServices[1].id, 45, "NEW");
  await createFeedback(5, "Jack's debugging skills are incredible!", sfUsers[1].id, sfUsers[2].id, sfOffice.id, sfServices[2].id, 50, "RESOLVED");
  await createFeedback(4, "Henry delivered the training on time and on point.", sfUsers[2].id, sfUsers[0].id, sfOffice.id, sfServices[0].id, 55, "RESOLVED");
  await createFeedback(5, "Best technical team I've worked with, keep it up!", sfAdmin.id, sfUsers[0].id, sfOffice.id, null, 60, "RESOLVED");

  // London Office feedback (8 entries)
  const lonServices = await prisma.service.findMany({ where: { officeId: lonOffice.id } });

  await createFeedback(5, "Diana provided excellent phone support for our clients.", lonAdmin.id, lonUsers[0].id, lonOffice.id, lonServices[0].id, 3, "RESOLVED");
  await createFeedback(4, "Edward handled the email inquiry professionally.", lonAdmin.id, lonUsers[1].id, lonOffice.id, lonServices[1].id, 7, "RESOLVED");
  await createFeedback(5, "Diana's on-site visit was very productive.", lonUsers[1].id, lonUsers[0].id, lonOffice.id, lonServices[2].id, 14, "RESOLVED");
  await createFeedback(3, "Response time on email could be improved.", lonUsers[0].id, lonUsers[1].id, lonOffice.id, lonServices[1].id, 21, "ACKNOWLEDGED");
  await createFeedback(5, "Excellent customer service from the London team!", lonAdmin.id, lonUsers[0].id, lonOffice.id, lonServices[0].id, 28, "RESOLVED");
  await createFeedback(4, "Edward provided detailed and helpful responses.", lonUsers[0].id, lonUsers[1].id, lonOffice.id, lonServices[1].id, 35, "RESOLVED");
  await createFeedback(5, "Diana went above and beyond during the site visit.", lonAdmin.id, lonUsers[0].id, lonOffice.id, lonServices[2].id, 42, "NEW");
  await createFeedback(4, "Good support from the London office, keep it up!", lonUsers[1].id, lonUsers[0].id, lonOffice.id, lonServices[0].id, 50, "RESOLVED");

  // Create notifications
  const allFeedback = await prisma.feedback.findMany({ take: 10, orderBy: { createdAt: "desc" } });
  for (const fb of allFeedback) {
    if (fb.targetUserId) {
      await prisma.notification.create({
        data: {
          type: "NEW_FEEDBACK",
          title: "New Feedback Received",
          message: `You've received new feedback with a rating of ${fb.rating}/5`,
          link: `/dashboard/feedback?feedbackId=${fb.id}`,
          userId: fb.targetUserId,
          feedbackId: fb.id,
        },
      });
    }
  }

  console.log("Seed complete!");
  console.log(`  Offices: 3`);
  console.log(`  Users: ${globalAdmin ? 1 : 0 + (nyAdmin ? 1 : 0) + (sfAdmin ? 1 : 0) + (lonAdmin ? 1 : 0) + nyUsers.length + sfUsers.length + lonUsers.length}`);
  console.log(`  Service Categories: 5`);
  console.log(`  Services: ${nyServices.length + sfServices.length + lonServices.length}`);
  console.log(`  Feedback entries: ${allFeedback.length + 30 + 15 + 8}`);
  console.log(`  Login with: admin@example.com / password123`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());