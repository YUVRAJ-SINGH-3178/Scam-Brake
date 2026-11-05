# SCAM BRAKE — ELASTIC KNOWLEDGE ENGINE SPECIFICATION

**Sponsor:** Elastic  
**Classification:** `MOCK_MODE` (Local Hybrid Scoring Active; `REAL_INTEGRATION` enabled when `ELASTICSEARCH_URL` and `ELASTICSEARCH_API_KEY` are provided).

---

## 1. Role in Scam Brake

Elastic provides semantic search and pattern clustering against a curated index of known social engineering scripts, government impersonation tactics, and consumer protection advisories.

---

## 2. Index Specification: `scambrake-threat-vectors-2026`

### Document Mapping
```json
{
  "mappings": {
    "properties": {
      "id": { "type": "keyword" },
      "clusterName": { "type": "keyword" },
      "title": { "type": "text" },
      "category": { "type": "keyword" },
      "summary": { "type": "text" },
      "keyIndicators": { "type": "keyword" },
      "officialWarningUrl": { "type": "keyword" },
      "recommendedCountermeasure": { "type": "text" },
      "vectorEmbedding": {
        "type": "dense_vector",
        "dims": 1536,
        "index": true,
        "similarity": "cosine"
      }
    }
  }
}
```

---

## 3. Curated Extortion Clusters
1. **`cluster-irs-urgent-wire`**: IRS, police warrants, sheriff arrest threats, immediate prepaid voucher demands.
2. **`cluster-bank-impersonation-transfer`**: Bank fraud departments advising moving funds to "safe reserve vaults".
3. **`cluster-tech-support-anydesk`**: Remote screen sharing software (AnyDesk, TeamViewer) manipulated refund overpayments.
4. **`cluster-retail-gift-card-coercion`**: Pressure to purchase high-denomination physical/digital store cards.

---

## 4. Local Hybrid Fallback Engine
When direct Elastic cluster credentials are not injected, `elasticScamEngine` (`src/server/elastic/search.ts`) runs an in-memory BM25-style keyword and semantic proximity scorer against the audited ground truth corpus.

