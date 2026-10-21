import { PrismaClient, Prisma } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const SAMPLE_IMAGES = [
  "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1200&q=80",
  "https://images.unsplash.com/photo-1524813686514-a57563d77965?w=1200&q=80",
  "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1200&q=80",
  "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200&q=80",
  "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=1200&q=80",
  "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=1200&q=80",
  "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&q=80",
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=80",
];

function pick(n: number, offset: number) {
  return Array.from({ length: n }, (_, i) => SAMPLE_IMAGES[(offset + i) % SAMPLE_IMAGES.length]);
}

async function location(county: string, town: string) {
  const slug = `${county}-${town}`.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  return prisma.location.upsert({
    where: { slug },
    update: {},
    create: { county, town, slug },
  });
}

async function seedCrm(agentId: string, buyerId: string) {
  const props = await prisma.property.findMany({
    where: { status: "PUBLISHED" },
    take: 3,
    orderBy: { createdAt: "asc" },
  });
  if (props.length < 2) return;

  const firstProperty = await prisma.property.findFirst({ where: { status: "PUBLISHED" } });
  const inquiry = firstProperty
    ? await prisma.inquiry.findFirst({ where: { propertyId: firstProperty.id } })
    : null;

  const leadSpecs: {
    name: string;
    email: string;
    phone: string;
    stage: "NEW" | "QUALIFYING" | "VIEWING" | "OFFER" | "WON" | "LOST";
    propertyId: string;
    budgetMin: number;
    budgetMax: number;
    notes: string;
    nextFollowUp?: Date;
  }[] = [
    {
      name: "Alice Wanjiru",
      email: "alice.wanjiru@example.com",
      phone: "+254711000101",
      stage: "NEW",
      propertyId: props[0].id,
      budgetMin: 3000000,
      budgetMax: 4500000,
      notes: "Interested in a commercial plot for flats development.",
      nextFollowUp: new Date(Date.now() + 2 * 86400000),
    },
    {
      name: "Brian Kiprop",
      email: "brian.kiprop@example.com",
      phone: "+254711000102",
      stage: "QUALIFYING",
      propertyId: props[1].id,
      budgetMin: 10000000,
      budgetMax: 15000000,
      notes: "Looking at the car wash as a going concern. Wants income figures.",
      nextFollowUp: new Date(Date.now() + 5 * 86400000),
    },
    {
      name: "Cynthia Achieng",
      email: "cynthia.achieng@example.com",
      phone: "+254711000103",
      stage: "VIEWING",
      propertyId: props[0].id,
      budgetMin: 3500000,
      budgetMax: 5000000,
      notes: "Viewing booked for the Kitengela plot.",
    },
    {
      name: "David Mwenda",
      email: "david.mwenda@example.com",
      phone: "+254711000104",
      stage: "OFFER",
      propertyId: props[1].id,
      budgetMin: 11000000,
      budgetMax: 12500000,
      notes: "Made an offer, negotiating on price.",
    },
  ];

  for (const spec of leadSpecs) {
    const existing = await prisma.lead.findFirst({ where: { email: spec.email } });
    if (existing) continue;
    await prisma.lead.create({
      data: {
        stage: spec.stage,
        source: "WEBSITE_ENQUIRY",
        name: spec.name,
        email: spec.email,
        phone: spec.phone,
        budgetMin: new Prisma.Decimal(spec.budgetMin),
        budgetMax: new Prisma.Decimal(spec.budgetMax),
        notes: spec.notes,
        agentId,
        propertyId: spec.propertyId,
        nextFollowUp: spec.nextFollowUp,
      },
    });
  }

  const viewingLead = await prisma.lead.findFirst({
    where: { email: "cynthia.achieng@example.com" },
  });
  if (viewingLead) {
    const existingViewing = await prisma.viewing.findFirst({ where: { leadId: viewingLead.id } });
    if (!existingViewing) {
      await prisma.viewing.create({
        data: {
          status: "CONFIRMED",
          scheduledFor: new Date(Date.now() + 3 * 86400000),
          durationMins: 60,
          notes: "Site visit for the Kitengela commercial plot.",
          propertyId: viewingLead.propertyId!,
          agentId,
          buyerId,
          leadId: viewingLead.id,
        },
      });
      await prisma.activityLog.create({
        data: {
          action: "Viewing confirmed",
          detail: "Confirmed a site visit with Cynthia Achieng.",
          actorId: agentId,
          leadId: viewingLead.id,
        },
      });
    }
  }

  const offerLead = await prisma.lead.findFirst({
    where: { email: "david.mwenda@example.com" },
  });
  if (offerLead && !(await prisma.deal.findFirst({ where: { leadId: offerLead.id } }))) {
    await prisma.deal.create({
      data: {
        status: "NEGOTIATION",
        title: `Negotiation — ${props[1].title}`,
        amount: new Prisma.Decimal(11800000),
        notes: "Buyer offered KSh 11.8M against an asking price of KSh 12M.",
        propertyId: props[1].id,
        agentId,
        leadId: offerLead.id,
      },
    });
    await prisma.activityLog.create({
      data: {
        action: "Deal opened",
        detail: "Opened a negotiation deal for the car wash property.",
        actorId: agentId,
        leadId: offerLead.id,
      },
    });
  }

  if (inquiry) {
    const linked = await prisma.lead.findFirst({ where: { inquiryId: inquiry.id } });
    if (!linked) {
      await prisma.lead.updateMany({
        where: { email: "alice.wanjiru@example.com", inquiryId: null },
        data: { inquiryId: inquiry.id, source: "WEBSITE_ENQUIRY" },
      });
    }
  }
}


async function main() {
  const passwordHash = await bcrypt.hash("password123", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@erntproperties.co.ke" },
    update: {},
    create: {
      name: "ERNT Admin",
      email: "admin@erntproperties.co.ke",
      passwordHash,
      role: "ADMIN",
      phone: "+254700000001",
    },
  });

  const agent = await prisma.user.upsert({
    where: { email: "agent@erntproperties.co.ke" },
    update: {},
    create: {
      name: "Grace Mwangi",
      email: "agent@erntproperties.co.ke",
      passwordHash,
      role: "AGENT",
      phone: "+254700000002",
      company: "ERNT Properties",
      bio: "Land and property specialist covering Nairobi metro.",
    },
  });

  const buyer = await prisma.user.upsert({
    where: { email: "buyer@example.com" },
    update: {},
    create: {
      name: "Peter Otieno",
      email: "buyer@example.com",
      passwordHash,
      role: "BUYER",
      phone: "+254700000003",
    },
  });

  const kitengela = await location("Kajiado", "Kitengela");
  const kinanie = await location("Machakos", "Kinanie");
  const ruiru = await location("Kiambu", "Ruiru");
  const westlands = await location("Nairobi", "Westlands");
  const nyali = await location("Mombasa", "Nyali");
  const karen = await location("Nairobi", "Karen");

  const listings: Prisma.PropertyCreateInput[] = [
    {
      slug: "commercial-50x100-plot-kitengela-orata",
      title: "Commercial 50x100 Plot with 2BR House — Kitengela",
      description:
        "Commercial 50 by 100 plot located about 70m behind Orata, off Miriam's Road. Includes an existing 2 bedroom house and sits in a high demand rental area popular for apartment developments.\n\nStrong rental demand driven by nearby industries and EPZ workers. Bedsitters average KSh 5,000 and 1 bedroom units average KSh 8,000. Accessible via tarmacked road.",
      listingType: "FOR_SALE",
      propertyType: "COMMERCIAL_LAND",
      status: "PUBLISHED",
      price: new Prisma.Decimal(4000000),
      sizeSqft: 5000,
      hasTitleDeed: true,
      featured: true,
      amenities: ["Tarmac access", "Water", "Electricity", "Existing house"],
      publishedAt: new Date(),
      agent: { connect: { id: agent.id } },
      location: { connect: { id: kitengela.id } },
      images: {
        create: pick(3, 0).map((url, i) => ({ url, position: i, alt: "Kitengela plot" })),
      },
    },
    {
      slug: "income-generating-car-wash-kinanie",
      title: "Income Generating Car Wash — Kinanie, Mavoko",
      description:
        "Fully operational car wash and service bay located in Kinanie, just 200m from town and 7.3km from Mombasa Road. A ready income business with strong daily cash flow.\n\nIncludes 2 modern machines, full service bay, and a 200m deep borehole producing about 20,000 litres per hour with no water costs.",
      listingType: "FOR_SALE",
      propertyType: "COMMERCIAL_LAND",
      status: "PUBLISHED",
      price: new Prisma.Decimal(12000000),
      sizeSqft: 5663,
      hasTitleDeed: true,
      featured: true,
      amenities: ["Borehole", "Car wash", "Service bay", "Highway traffic"],
      publishedAt: new Date(),
      agent: { connect: { id: agent.id } },
      location: { connect: { id: kinanie.id } },
      images: {
        create: pick(3, 2).map((url, i) => ({ url, position: i, alt: "Kinanie car wash" })),
      },
    },
    {
      slug: "prime-residential-plots-ruiru-membley",
      title: "Prime Residential Plots — Ruiru, Membley",
      description:
        "Ready-to-build 50x100 residential plots in a fast developing, gated neighbourhood. All plots have ready title deeds and access to tarmac, water and electricity. Ideal for owner-occupiers and investors.",
      listingType: "FOR_SALE",
      propertyType: "RESIDENTIAL_LAND",
      status: "PUBLISHED",
      price: new Prisma.Decimal(3500000),
      sizeSqft: 5000,
      hasTitleDeed: true,
      featured: true,
      amenities: ["Ready title", "Tarmac access", "Water", "Electricity", "Gated"],
      publishedAt: new Date(),
      agent: { connect: { id: agent.id } },
      location: { connect: { id: ruiru.id } },
      images: {
        create: pick(2, 4).map((url, i) => ({ url, position: i, alt: "Ruiru plots" })),
      },
    },
    {
      slug: "furnished-2br-apartment-westlands",
      title: "Furnished 2 Bedroom Apartment — Westlands",
      description:
        "Modern furnished 2 bedroom apartment in the heart of Westlands with backup power, lift, gym and 24/7 security. Walking distance to offices, malls and restaurants. Ideal for expatriates and professionals.",
      listingType: "FOR_RENT",
      propertyType: "APARTMENT",
      status: "PUBLISHED",
      price: new Prisma.Decimal(120000),
      pricePeriod: "per month",
      bedrooms: 2,
      bathrooms: 2,
      sizeSqft: 1100,
      amenities: ["Furnished", "Lift", "Gym", "Backup power", "24/7 security", "Parking"],
      publishedAt: new Date(),
      agent: { connect: { id: agent.id } },
      location: { connect: { id: westlands.id } },
      images: {
        create: pick(3, 1).map((url, i) => ({ url, position: i, alt: "Westlands apartment" })),
      },
    },
    {
      slug: "beachfront-villa-nyali",
      title: "4 Bedroom Beachfront Villa — Nyali, Mombasa",
      description:
        "Spacious 4 bedroom villa with private pool, lush garden and direct beach access in Nyali. Perfect holiday home or short-let investment with excellent occupancy.",
      listingType: "FOR_SALE",
      propertyType: "VILLA",
      status: "PUBLISHED",
      price: new Prisma.Decimal(65000000),
      bedrooms: 4,
      bathrooms: 4,
      sizeSqft: 4500,
      hasTitleDeed: true,
      featured: true,
      amenities: ["Beach access", "Swimming pool", "Garden", "Staff quarters", "Borehole"],
      publishedAt: new Date(),
      agent: { connect: { id: admin.id } },
      location: { connect: { id: nyali.id } },
      images: {
        create: pick(3, 5).map((url, i) => ({ url, position: i, alt: "Nyali villa" })),
      },
    },
    {
      slug: "half-acre-karen-gated-community",
      title: "Half Acre Plot — Karen Gated Community",
      description:
        "Prime half acre residential plot in a controlled, gated community in Karen. Flat land with perimeter fence, cabro paved access roads and mature neighbourhood. Ready title.",
      listingType: "FOR_SALE",
      propertyType: "RESIDENTIAL_LAND",
      status: "PUBLISHED",
      price: new Prisma.Decimal(58000000),
      sizeAcres: 0.5,
      hasTitleDeed: true,
      amenities: ["Perimeter fence", "Cabro roads", "Gated", "Ready title"],
      publishedAt: new Date(),
      agent: { connect: { id: agent.id } },
      location: { connect: { id: karen.id } },
      images: {
        create: pick(2, 6).map((url, i) => ({ url, position: i, alt: "Karen plot" })),
      },
    },
    {
      slug: "pending-3br-townhouse-ruiru",
      title: "3 Bedroom Townhouse — Ruiru (pending review)",
      description:
        "Brand new 3 bedroom townhouse in a gated estate in Ruiru with DSQ option, ample parking and children's play area. Awaiting admin approval.",
      listingType: "FOR_SALE",
      propertyType: "TOWNHOUSE",
      status: "PENDING",
      price: new Prisma.Decimal(12500000),
      bedrooms: 3,
      bathrooms: 3,
      sizeSqft: 2200,
      amenities: ["Gated", "Parking", "Play area"],
      agent: { connect: { id: agent.id } },
      location: { connect: { id: ruiru.id } },
      images: {
        create: pick(2, 3).map((url, i) => ({ url, position: i, alt: "Ruiru townhouse" })),
      },
    },
  ];

  for (const data of listings) {
    await prisma.property.upsert({
      where: { slug: data.slug },
      update: {},
      create: data,
    });
  }

  const firstProperty = await prisma.property.findFirst({ where: { status: "PUBLISHED" } });
  if (firstProperty) {
    await prisma.inquiry.create({
      data: {
        propertyId: firstProperty.id,
        agentId: firstProperty.agentId,
        senderId: buyer.id,
        name: buyer.name,
        email: buyer.email,
        phone: buyer.phone,
        message: "Hello, is this plot still available? I would like to arrange a site visit this weekend.",
      },
    });

    await prisma.favorite.upsert({
      where: { userId_propertyId: { userId: buyer.id, propertyId: firstProperty.id } },
      update: {},
      create: { userId: buyer.id, propertyId: firstProperty.id },
    });
  }

  await seedCrm(agent.id, buyer.id);

  console.log("Seed complete.");
  console.log("Admin:  admin@erntproperties.co.ke / password123");
  console.log("Agent:  agent@erntproperties.co.ke / password123");
  console.log("Buyer:  buyer@example.com / password123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
