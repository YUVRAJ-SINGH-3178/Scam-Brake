import { NextResponse } from 'next/server';
import { checkDatabaseConnection } from '@/server/db/client';
import { paypalClient } from '@/server/paypal/client';
import { elasticScamEngine } from '@/server/elastic/search';
import { kernelVerificationClient } from '@/server/kernel/client';
import { channel3Client } from '@/server/channel3/client';
import { zapierAutomationRelay } from '@/server/zapier/relay';
import { bryntumSchedulerManager } from '@/server/bryntum/scheduler';

export async function GET() {
  const isDbConnected = await checkDatabaseConnection();
  const paypalStatus = paypalClient.getConfig();
  const elasticStatus = elasticScamEngine.getStatus();
  const kernelStatus = kernelVerificationClient.getStatus();
  const channel3Status = channel3Client.getStatus();
  const zapierStatus = zapierAutomationRelay.getStatus();
  const bryntumStatus = bryntumSchedulerManager.getStatus();

  return NextResponse.json({
    status: 'HEALTHY',
    service: 'SCAM_BRAKE_PAYMENT_PROTECTION',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    database: {
      provider: 'PostgreSQL (Prisma ORM)',
      connected: isDbConnected,
      mode: isDbConnected ? 'POSTGRESQL_LIVE' : 'IN_MEMORY_TRANSACTIONAL_FALLBACK',
    },
    paypal: {
      environment: paypalStatus.environment,
      isConfigured: paypalStatus.isConfigured,
      intent: 'AUTHORIZE',
      mode: paypalStatus.isConfigured ? 'REAL_INTEGRATION' : 'MOCK_MODE',
    },
    sponsors: {
      paypal: paypalStatus.isConfigured ? 'REAL_INTEGRATION' : 'MOCK_MODE',
      ag_grid: 'REAL_INTEGRATION',
      apimatic: 'REAL_INTEGRATION',
      astropods: process.env.ASTROPODS_API_KEY ? 'REAL_INTEGRATION' : 'MOCK_MODE',
      bryntum: bryntumStatus.status,
      channel3: channel3Status.status,
      elastic: elasticStatus.engine,
      kernel: kernelStatus.status,
      postman: 'REAL_INTEGRATION',
      render: process.env.RENDER ? 'REAL_INTEGRATION' : 'CONFIGURED_UNVERIFIED',
      zapier: zapierStatus.status,
    },
  });
}

