# Sponsor integration evidence

This matrix reports repository evidence as of 2026-11-05. Credentials merely being present do not count as verification. No sponsor deployment or externally hosted request was verified in this audit.

| Sponsor | Classification | Product/function and source | Credentials / evidence | Test result and fallback |
|---|---|---|---|---|
| PayPal | IMPLEMENTED_BUT_UNVERIFIED | Sandbox REST adapter in `src/server/paypal/client.ts`; Orders v2 create/authorize and Payments v2 capture/void; webhook verification. | `PAYMENT_MODE=paypal_sandbox`, Sandbox client ID/secret and webhook ID. No credentials or real order IDs supplied. | Local tests use simulated responses. Buyer approval and checkout persistence are missing, so checkout is disabled. |
| AG Grid | NOT_USED | Dependency is installed; repository source has no `AgGridReact` usage. Payment table renders without evidenced AG Grid integration. | No credential required. | No AG Grid execution/test. |
| APIMatic | NOT_USED | `docs/openapi.json` and a viewer exist, but no APIMatic SDK, API tool, code generation, or platform execution evidence was found. | No credential configured. | No APIMatic test or execution. An OpenAPI file alone is not APIMatic use. |
| Astropods | IMPLEMENTED_BUT_UNVERIFIED | Optional outbound chat request in `src/server/ai/agent.ts`. Customer message endpoint is currently disabled. | `ASTROPODS_API_KEY`, optional agent ID. No credentials or response evidence. | Not called in audit. Local reasoning fallback exists; AI output schema validation remains incomplete. |
| Bryntum | MOCK_ONLY | `src/server/bryntum/scheduler.ts` stores sample investigators and events in process memory; source reports no license configured. | Commercial license required for product use. | Unit test covers local assignment only. No Bryntum Scheduler runtime/license evidence. |
| Channel3 | IMPLEMENTED_BUT_UNVERIFIED | Optional product lookup in `src/server/channel3/client.ts`. | `CHANNEL3_API_KEY`. No live request evidence. | Unit test exercises local enrichment fallback. External behavior unverified. |
| Elastic | IMPLEMENTED_BUT_UNVERIFIED | Optional search request in `src/server/elastic/search.ts`. | `ELASTICSEARCH_URL`, `ELASTICSEARCH_API_KEY`, matching index. No endpoint or index supplied. | Unit test exercises local pattern corpus. No live retrieval evidence. |
| Kernel | IMPLEMENTED_BUT_UNVERIFIED | Optional verification request in `src/server/kernel/client.ts`; bundled local directory is a fallback. | `KERNEL_API_KEY`. No live response evidence. | Unit test verifies local directory and SSRF filter. It does not establish that Kernel certified the directory. |
| Postman | IMPLEMENTED_BUT_UNVERIFIED | Collection and environment JSON are in `docs/`. | Postman CLI/app and environment required. | Collection was not run. Repository tests are Node tests, not Postman execution. |
| Render | CONFIGURED_NOT_DEPLOYED | `render.yaml` describes web, worker, and PostgreSQL services; worker command now targets `npm run worker`. | Render account, database, Sandbox credentials, secrets. | No deployment, service health, migration, or worker execution evidence. |
| Zapier | IMPLEMENTED_BUT_UNVERIFIED | HMAC-signed outbound request in `src/server/zapier/relay.ts`. Missing URL/key now fails rather than reporting success. | `ZAPIER_WEBHOOK_URL` and a 32+ character `ZAPIER_WEBHOOK_SECRET`. | Unit test stubs HTTP success and checks HMAC path. No Zapier account or live delivery evidence. |

No sponsor currently qualifies as `REAL_AND_VERIFIED`. The adapters and local tests must not be presented as completed live integrations.
