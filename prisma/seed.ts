import { Prisma, PrismaClient } from '@prisma/client';
import crypto from 'node:crypto';
import { hashPassword } from '../src/server/auth/password.ts';
import {
  SEED_PAYMENTS,
  SEED_INTERVENTIONS,
  SEED_AUDIT_LOGS,
  SIMULATION_SCENARIOS,
  SPONSORS,
} from '../src/data/seedData';

const prisma = new PrismaClient();

export async function main() {
  if (process.env.NODE_ENV === 'production' || process.env.DEMO_AUTH_ENABLED !== 'true') {
    throw new Error('Seeding is local-demo only. Set DEMO_AUTH_ENABLED=true outside production.');
  }
  const demoPassword = process.env.DEMO_ADMIN_PASSWORD;
  if (!demoPassword || demoPassword.length < 16) {
    throw new Error('Set DEMO_ADMIN_PASSWORD to a unique password of at least 16 characters before seeding.');
  }
  const demoEmail = process.env.DEMO_ADMIN_EMAIL || 'admin@scambrake.local';
  const demoPasswordHash = await hashPassword(demoPassword);
  console.log('Seeding Scam Brake database...');

  // 1. Create Default Users
  const adminUser = await prisma.user.upsert({
    where: { email: demoEmail },
    update: { passwordHash: demoPasswordHash, role: 'ADMIN' },
    create: {
      email: demoEmail,
      name: 'Local Demo Administrator',
      passwordHash: demoPasswordHash,
      role: 'ADMIN',
    },
  });

  // 2. Create Default Merchants
  const apexMerchant = await prisma.merchant.upsert({
    where: { slug: 'apex-electronics' },
    update: {},
    create: {
      id: 'merch_apex_9812',
      name: 'Apex Electronics Direct',
      slug: 'apex-electronics',
      category: 'Consumer Electronics & Hardware',
      apiKey: `sb_demo_${crypto.randomBytes(32).toString('hex')}`,
      webhookSecret: crypto.randomBytes(32).toString('hex'),
      riskPolicy: {
        create: {
          autoHoldThreshold: 60,
          autoCaptureThreshold: 25,
          interventionTimeoutMinutes: 10,
          timeoutAction: 'VOID',
          requireTrustedContactOver: 1000.0,
          prohibitRemoteDesktopGiftCard: true,
        },
      },
      merchantUsers: {
        create: [
          { userId: adminUser.id, role: 'ADMIN' },
        ],
      },
    },
  });
  await prisma.merchantUser.upsert({
    where: { merchantId_userId: { merchantId: apexMerchant.id, userId: adminUser.id } },
    update: { role: 'ADMIN' },
    create: { merchantId: apexMerchant.id, userId: adminUser.id, role: 'ADMIN' },
  });

  // 3. Create Investigators & Assignments (Bryntum Scheduler)
  const investigatorSarah = await prisma.investigator.upsert({
    where: { id: 'inv_sarah_chen' },
    update: {},
    create: {
      id: 'inv_sarah_chen',
      merchantId: apexMerchant.id,
      name: 'Sarah Chen',
      email: 'sarah.chen@scambrake.internal',
      role: 'SENIOR_FRAUD_SPECIALIST',
      isAvailable: true,
    },
  });

  const investigatorMarcus = await prisma.investigator.upsert({
    where: { id: 'inv_marcus_vance' },
    update: {},
    create: {
      id: 'inv_marcus_vance',
      merchantId: apexMerchant.id,
      name: 'Marcus Vance',
      email: 'marcus.vance@scambrake.internal',
      role: 'COERCION_INTERVIEW_LEAD',
      isAvailable: true,
    },
  });

  // 4. Seed Sponsor Integrations
  for (const sponsor of SPONSORS) {
    await prisma.sponsorIntegration.upsert({
      where: { sponsorKey: sponsor.id },
      update: {
        name: sponsor.name,
        category: sponsor.category,
        status: sponsor.status,
        purpose: sponsor.purpose,
        interfaceMethod: sponsor.interfaceMethod,
        docsUrl: sponsor.docsUrl,
        latencyMs: sponsor.latencyMs || 25,
      },
      create: {
        sponsorKey: sponsor.id,
        name: sponsor.name,
        category: sponsor.category,
        status: sponsor.status,
        purpose: sponsor.purpose,
        interfaceMethod: sponsor.interfaceMethod,
        docsUrl: sponsor.docsUrl,
        latencyMs: sponsor.latencyMs || 25,
      },
    });
  }

  // 5. Seed Simulation Scenarios
  for (const scenario of SIMULATION_SCENARIOS) {
    await prisma.simulationScenario.upsert({
      where: { scenarioKey: scenario.id },
      update: {
        title: scenario.title,
        riskLevel: scenario.riskLevel,
        coercionVector: scenario.coercionVector,
        shortDescription: scenario.shortDescription,
        merchantName: scenario.merchantName,
        productName: scenario.productName,
        amount: scenario.amount,
        expectedOutcome: scenario.expectedOutcome,
        sampleConversation: JSON.parse(JSON.stringify(scenario.sampleConversation)) as Prisma.InputJsonValue,
        investigationFindings: JSON.parse(JSON.stringify(scenario.investigationFindings)) as Prisma.InputJsonValue,
      },
      create: {
        scenarioKey: scenario.id,
        title: scenario.title,
        riskLevel: scenario.riskLevel,
        coercionVector: scenario.coercionVector,
        shortDescription: scenario.shortDescription,
        merchantName: scenario.merchantName,
        productName: scenario.productName,
        amount: scenario.amount,
        expectedOutcome: scenario.expectedOutcome,
        sampleConversation: JSON.parse(JSON.stringify(scenario.sampleConversation)) as Prisma.InputJsonValue,
        investigationFindings: JSON.parse(JSON.stringify(scenario.investigationFindings)) as Prisma.InputJsonValue,
      },
    });
  }

  // 6. Seed Payments, Customers, and Authorizations
  for (const payment of SEED_PAYMENTS) {
    // Upsert customer
    const customer = await prisma.customer.upsert({
      where: { id: payment.customer.id },
      update: {
        name: payment.customer.name,
        email: `${payment.customer.id}@customer-preview.test`,
        phone: '+1 (555) 234-5678',
        accountAgeMonths: payment.customer.accountAgeMonths,
      },
      create: {
        id: payment.customer.id,
        name: payment.customer.name,
        email: `${payment.customer.id}@customer-preview.test`,
        phone: '+1 (555) 234-5678',
        accountAgeMonths: payment.customer.accountAgeMonths,
      },
    });

    // Create Payment
    await prisma.payment.upsert({
      where: { paymentReference: payment.paymentReference },
      update: {
        state: payment.authorizationStatus === 'CAPTURED' ? 'CAPTURED' : payment.authorizationStatus === 'VOIDED' ? 'VOIDED' : 'AUTHORIZED',
        authorizationStatus: payment.authorizationStatus,
        interventionStatus: payment.interventionStatus,
        riskScore: payment.riskScore,
        riskLevel: payment.riskLevel,
        amount: payment.amount,
        resolvedAt: payment.resolvedAt ? new Date(payment.resolvedAt) : null,
        resolutionNotes: payment.resolutionNotes,
      },
      create: {
        id: payment.id,
        paymentReference: payment.paymentReference,
        merchantId: apexMerchant.id,
        customerId: customer.id,
        amount: payment.amount,
        currency: payment.currency,
        productName: payment.productName,
        productCategory: payment.productCategory,
        state: payment.authorizationStatus === 'CAPTURED' ? 'CAPTURED' : payment.authorizationStatus === 'VOIDED' ? 'VOIDED' : 'AUTHORIZED',
        authorizationStatus: payment.authorizationStatus,
        interventionStatus: payment.interventionStatus,
        riskScore: payment.riskScore,
        riskLevel: payment.riskLevel,
        authorizedAt: new Date(payment.authorizedAt),
        holdExpiresAt: new Date(payment.holdExpiresAt),
        resolvedAt: payment.resolvedAt ? new Date(payment.resolvedAt) : null,
        resolutionNotes: payment.resolutionNotes,
        paypalOrder: {
          create: {
            paypalOrderId: payment.paypalOrderId,
            intent: 'AUTHORIZE',
            status: 'COMPLETED',
            amount: payment.amount,
            currency: 'USD',
          },
        },
        paymentAuthorization: {
          create: {
            paypalAuthorizationId: payment.paypalAuthorizationId,
            status: payment.authorizationStatus === 'CAPTURED' ? 'CAPTURED' : payment.authorizationStatus === 'VOIDED' ? 'VOIDED' : 'CREATED',
            amount: payment.amount,
            currency: 'USD',
            expirationTime: new Date(payment.holdExpiresAt),
          },
        },
      },
    });
  }

  console.log('Seeding completed successfully!');
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

