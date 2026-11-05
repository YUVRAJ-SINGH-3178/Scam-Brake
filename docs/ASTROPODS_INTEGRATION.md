# SCAM BRAKE — ASTROPODS AGENT INTEGRATION SPECIFICATION

**Sponsor:** Astropods  
**Classification:** `MOCK_MODE` (Fallback Adapter Active; `REAL_INTEGRATION` enabled when `ASTROPODS_API_KEY` is supplied).

---

## 1. Role in Scam Brake

Astropods powers edge execution for the conversational safety intervention agent.

When a customer enters `/intervention/chat`, the Astropods agent coordinates:
1. Low-latency edge responses so the check-in feels natural and reassuring.
2. Contextual extraction of manipulation signals (impersonation, secrecy, threats).
3. Retrieval hooks to Elastic knowledge patterns and Kernel switchboard numbers.

---

## 2. API Contract & Payload Schema

### Request to Astropods Agent
```json
POST https://api.astropods.io/v1/interventions/chat
Authorization: Bearer <ASTROPODS_API_KEY>
Content-Type: application/json

{
  "paymentId": "pay_sb_881901",
  "message": "The IRS caller said I would be jailed if I don't buy Apple cards.",
  "indicators": ["AUTHORITY_IMPERSONATION", "URGENCY_THREAT"],
  "elasticCluster": "cluster-irs-urgent-wire"
}
```

### Response from Astropods Agent
```json
{
  "reply": "Thank you for telling me. It is very important to know: The IRS will NEVER demand payment via gift cards or threaten arrest over the phone. Would you like to check the certified IRS directory independently right now?",
  "quickReplies": [
    "Yes, verify official phone",
    "They said I will be arrested",
    "Cancel payment immediately"
  ],
  "confidenceScore": 0.96,
  "recommendedStep": "OFFER_KERNEL_VERIFY"
}
```

---

## 3. Fallback Adapter

If `ASTROPODS_API_KEY` is not present, `ScamBrakeInterventionAgent` automatically switches to:
1. OpenAI fallback if `OPENAI_API_KEY` is present.
2. The deterministic safe agent engine (`DETERMINISTIC_SAFE_AGENT`), which guarantees zero hallucinations, immediate response times, and full test suite compliance.

