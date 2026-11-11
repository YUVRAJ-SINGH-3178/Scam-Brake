import { register } from 'node:module';
import { run } from 'node:test';
import { spec } from 'node:test/reporters';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Normalize extensionless Next.js package imports for raw Node ESM
register(`data:text/javascript,
export async function resolve(specifier, context, nextResolve) {
  if (specifier === 'next/server') {
    return nextResolve('next/server.js', context);
  }
  return nextResolve(specifier, context);
}
`);

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const files = [
  path.join(__dirname, 'unit', 'auth.test.mjs'),
  path.join(__dirname, 'unit', 'customerSession.test.mjs'),
  path.join(__dirname, 'unit', 'tenantIsolation.test.mjs'),
  path.join(__dirname, 'unit', 'riskEngine.test.mjs'),
  path.join(__dirname, 'unit', 'paymentStateMachine.test.mjs'),
  path.join(__dirname, 'unit', 'concurrency.test.mjs'),
  path.join(__dirname, 'unit', 'workerSweep.test.mjs'),
  path.join(__dirname, 'integration', 'apiRoutes.test.mjs'),
  path.join(__dirname, 'integration', 'sponsorAdapters.test.mjs'),
  path.join(__dirname, 'integration', 'paymentOperationsPostgres.test.mjs'),
  path.join(__dirname, 'e2e', 'primaryDemoTaxScam.test.mjs'),
  path.join(__dirname, 'e2e', 'legitimateCaptureDemo.test.mjs'),
];

console.log('====================================================');
console.log('  SCAM BRAKE AUTOMATED TEST SUITE');
console.log('  Testing Risk Engine, State Machine, Provider Adapters & Local Mock Scenarios');
console.log('====================================================\n');

run({ files })
  .on('test:fail', () => {
    process.exitCode = 1;
  })
  .compose(new spec())
  .pipe(process.stdout);

