import { PrismaClient } from '@prisma/client';
import {
  SEED_PAYMENTS,
  SEED_INTERVENTIONS,
  SEED_AUDIT_LOGS,
  SIMULATION_SCENARIOS,
  SPONSORS,
} from '../src/data/seedData';

const prisma = new PrismaClient();

export async function main() {
  console.log('Seeding Scam Brake database...');

  // 1. Create Default Users
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@scambrake.internal' },
    update: {},
    create: {
      email: 'admin@scambrake.internal',
      name: 'System Administrator',
      passwordHash: '$2b$10$ep/0kS6hHk9U5o9b.OqgG.aT6Mv.7B67Z5o9jP2N6CqF6vW4K8oGa', // 'AdminPass2026!'
      role: 'ADMIN',
    },
  });

  const analystUser = await prisma.user.upsert({
    where: { email: 'analyst@scambrake.internal' },
    update: {},
    create: {
      email: 'analyst@scambrake.internal',
      name: 'Sarah Chen (Lead Risk Analyst)',
      passwordHash: '$2b$10$ep/0kS6hHk9U5o9b.OqgG.aT6Mv.7B67Z5o9jP2N6CqF6vW4K8oGa',
      role: 'RISK_ANALYST',
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
      apiKey: 'sb_live_key_apex9812_47bf92',
      webhookSecret: 'whsec_apex9812_secure_hash_2026',
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
          { userId: analystUser.id, role: 'ANALYST' },
        ],
      },
    },
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
        sampleConversation: scenario.sampleConversation as any,
        investigationFindings: scenario.investigationFindings as any,
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
        sampleConversation: scenario.sampleConversation as any,
        investigationFindings: scenario.investigationFindings as any,
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

if (require.main === module) {
  main()
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}

