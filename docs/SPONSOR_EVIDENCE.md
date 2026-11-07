# Sponsor evidence

Updated 2026-11-07. No sponsor deployment or externally hosted request was verified. An installed dependency, configured key, adapter, or local mock is not evidence of a live integration.

| Sponsor | Status | Code / product use | Evidence from this repository | Remaining requirement |
|---|---|---|---|---|
| PayPal | IMPLEMENTED_BUT_UNVERIFIED | Sandbox REST adapter, JS SDK buyer approval, server-side order verification/authorization, capture/void, signature verification, atomic webhook claims, provider reconciliation. | Local adapter tests use simulations. PostgreSQL host was unreachable for migration/integration. No Sandbox order or webhook ID evidence. | Reachable disposable PostgreSQL, Sandbox buyer/seller accounts, and verified order/authorization/capture/void/webhook lifecycle. |
| AG Grid | NOT_USED | Dependency exists; payment table has no `AgGridReact` usage. | Source inspection only. | Add actual table usage only if it serves the product; run and verify it. |
| APIMatic | NOT_USED | OpenAPI material exists; no APIMatic SDK/code generation/plugin execution found. | OpenAPI file is not APIMatic evidence. | Record actual tool/plugin workflow if available. |
| Astropods | IMPLEMENTED_BUT_UNVERIFIED | Optional outbound chat adapter with persisted history, local evidence context, and schema-validated structured output in `src/server/ai/agent.ts`. | No external request. Database persistence and provider grounding remain unverified. | Credentials, verified response, and repeatable customer workflow with grounded evidence. |
| Bryntum | MOCK_ONLY | In-memory sample scheduler in `src/server/bryntum/scheduler.ts`. | Local unit test only; no licensed Scheduler runtime evidence. | License and actual scheduler integration, or keep it unused. |
| Channel3 | IMPLEMENTED_BUT_UNVERIFIED | Optional lookup in `src/server/channel3/client.ts`. | Local enrichment fallback test; no live request. | Provider access and recorded live request/response. |
| Elastic | IMPLEMENTED_BUT_UNVERIFIED | Optional search in `src/server/elastic/search.ts`. | Unit test uses local pattern corpus. | Configured index and verified live retrieval. |
| Kernel | IMPLEMENTED_BUT_UNVERIFIED | Optional adapter in `src/server/kernel/client.ts`; bundled static directory fallback. | Local directory and SSRF test only; not proof of live source verification. | Verified browser execution and real source URL/timestamp evidence. |
| Postman | IMPLEMENTED_BUT_UNVERIFIED | Collection/environment under `docs/`. | Collection was not run. | Run via Postman/Newman with safe Sandbox environment and retain output. |
| Render | CONFIGURED_NOT_DEPLOYED | `render.yaml` defines web, worker and database services. | No deployment or service-health evidence. | Deploy only after gates, apply migrations safely, and verify worker health. |
| Zapier | IMPLEMENTED_BUT_UNVERIFIED | Signed outbound relay in `src/server/zapier/relay.ts`. | Unit test stubs HTTP response and checks HMAC; no live delivery. | Configured endpoint and recorded authenticated delivery. |

No sponsor currently qualifies as `REAL_AND_VERIFIED`. See [SPONSOR_INTEGRATIONS.md](SPONSOR_INTEGRATIONS.md) for environment and fallback details.
