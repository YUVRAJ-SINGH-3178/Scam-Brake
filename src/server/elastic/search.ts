export interface ScamPatternDocument {
  id: string;
  clusterName: string;
  title: string;
  category: 'GOVERNMENT_IMPERSONATION' | 'BANK_IMPERSONATION' | 'GIFT_CARD_EXTORTION' | 'TECH_SUPPORT_POPUP' | 'FAMILY_EMERGENCY';
  summary: string;
  keyIndicators: string[];
  officialWarningUrl: string;
  recommendedCountermeasure: string;
  lastUpdated: string;
}

export interface ElasticSearchResult {
  document: ScamPatternDocument;
  score: number; // 0 to 1
  matchedKeywords: string[];
  retrievalTimestamp: string;
  engine: 'ELASTICSEARCH_CLUSTER' | 'LOCAL_HYBRID_FALLBACK';
}

// Curated Scam Knowledge Corpus (Ground Truth from FTC & IC3)
const KNOWLEDGE_CORPUS: ScamPatternDocument[] = [
  {
    id: 'doc_irs_tax_warrant',
    clusterName: 'cluster-irs-urgent-wire',
    title: 'IRS & Law Enforcement Immediate Warrant Scam',
    category: 'GOVERNMENT_IMPERSONATION',
    summary:
      'Scammers impersonate federal tax agents claiming overdue taxes, suspended SSNs, or active arrest warrants. Victims are told local police are en route unless immediate bond is posted via prepaid store cards.',
    keyIndicators: ['irs', 'tax', 'warrant', 'arrest', 'sheriff', 'federal', 'ssn', 'bail', 'secrecy', 'jail'],
    officialWarningUrl: 'https://www.irs.gov/newsroom/tax-scams-consumer-alerts',
    recommendedCountermeasure:
      'IRS never calls demanding immediate payment via gift cards or wire. Direct victim to certified public switchboard 1-800-829-1040.',
    lastUpdated: '2026-09-15T00:00:00Z',
  },
  {
    id: 'doc_bank_fraud_transfer',
    clusterName: 'cluster-bank-impersonation-transfer',
    title: 'Bank Fraud Department "Safe Account" Scam',
    category: 'BANK_IMPERSONATION',
    summary:
      'Fraudsters pose as bank fraud investigators alerting victim to alleged fraudulent charges. They instruct victim to transfer funds or purchase store vouchers to "protect their money in a federal reserve vault".',
    keyIndicators: ['bank', 'chase', 'wells fargo', 'fraud department', 'safe account', 'security hold', 'compromised account'],
    officialWarningUrl: 'https://www.consumerfinance.gov/consumer-tools/fraud/',
    recommendedCountermeasure:
      'Financial institutions never advise customers to buy gift cards or move funds to external accounts to secure them.',
    lastUpdated: '2026-10-01T00:00:00Z',
  },
  {
    id: 'doc_tech_support_anydesk',
    clusterName: 'cluster-tech-support-anydesk',
    title: 'Fake Tech Support & Remote Desktop Hijack',
    category: 'TECH_SUPPORT_POPUP',
    summary:
      'Pop-up alert or fake invoice warning of computer infection. Scammer requests remote connection via AnyDesk or TeamViewer, manipulates inspect element to show fake refunds, and demands cash/cards back.',
    keyIndicators: ['anydesk', 'teamviewer', 'microsoft', 'virus', 'hacked', 'refund', 'overpayment', 'screen share'],
    officialWarningUrl: 'https://consumer.ftc.gov/articles/how-spot-avoid-and-report-tech-support-scams',
    recommendedCountermeasure:
      'Disconnect computer from internet immediately. Close all remote desktop connections and do not access online banking while screen is shared.',
    lastUpdated: '2026-08-20T00:00:00Z',
  },
  {
    id: 'doc_gift_card_coercion',
    clusterName: 'cluster-retail-gift-card-coercion',
    title: 'Retail Store Voucher & Gift Card Coercion',
    category: 'GIFT_CARD_EXTORTION',
    summary:
      'Victim is pressured to visit a retail store or online checkout to purchase large denomination Apple, Target, or Steam cards. Scammer demands photos or codes of the card back.',
    keyIndicators: ['gift card', 'voucher', 'apple card', 'target card', 'steam', 'scratch back', 'pin code', 'stay on the phone'],
    officialWarningUrl: 'https://www.ftc.gov/giftcards',
    recommendedCountermeasure:
      'Gift cards are for gifts, not for payments. Once codes are read, funds are irreversibly stolen in seconds.',
    lastUpdated: '2026-11-01T00:00:00Z',
  },
];

class ElasticScamEngine {
  private isConfigured: boolean;
  private esUrl: string;
  private esApiKey: string;

  constructor() {
    this.esUrl = process.env.ELASTICSEARCH_URL || '';
    this.esApiKey = process.env.ELASTICSEARCH_API_KEY || '';
    this.isConfigured = Boolean(this.esUrl && this.esApiKey);
  }

  public getStatus(): { isConfigured: boolean; engine: string } {
    return {
      isConfigured: this.isConfigured,
      engine: this.isConfigured ? 'REAL_INTEGRATION' : 'MOCK_MODE',
    };
  }

  /**
   * Performs hybrid semantic & keyword pattern matching
   */
  async searchPatterns(queryText: string): Promise<ElasticSearchResult[]> {
    const textLower = queryText.toLowerCase();

    if (this.isConfigured) {
      try {
        const res = await fetch(`${this.esUrl}/scambrake-threat-vectors-2026/_search`, {
          method: 'POST',
          headers: {
            Authorization: `ApiKey ${this.esApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            query: {
              multi_match: {
                query: queryText,
                fields: ['title^2', 'summary', 'keyIndicators^3'],
              },
            },
            size: 3,
          }),
        });

        if (res.ok) {
          const data = await res.json() as {
            hits?: { hits?: Array<{ _source: unknown; _score?: number; highlight?: Record<string, string[]> }> };
          };
          const hits = data.hits?.hits || [];
          return hits.map((hit) => ({
            document: hit._source as ScamPatternDocument,
            score: hit._score ? Math.min(1.0, hit._score / 10) : 0.9,
            matchedKeywords: hit.highlight ? Object.values(hit.highlight).flat() : [],
            retrievalTimestamp: new Date().toISOString(),
            engine: 'ELASTICSEARCH_CLUSTER',
          }));
        }
      } catch (err) {
        console.warn('[ELASTIC] Real cluster query failed, falling back to local hybrid scoring:', err);
      }
    }

    // Local Hybrid BM25 / Keyword Scorer Fallback
    const results: ElasticSearchResult[] = [];

    for (const doc of KNOWLEDGE_CORPUS) {
      const matched: string[] = [];
      let score = 0;

      for (const kw of doc.keyIndicators) {
        if (textLower.includes(kw)) {
          matched.push(kw);
          score += 0.25;
        }
      }

      if (matched.length > 0) {
        results.push({
          document: doc,
          score: Math.min(0.98, Math.max(0.4, score)),
          matchedKeywords: matched,
          retrievalTimestamp: new Date().toISOString(),
          engine: 'LOCAL_HYBRID_FALLBACK',
        });
      }
    }

    // Sort by score descending
    results.sort((a, b) => b.score - a.score);

    // If no direct keyword match, return most relevant general pattern with low confidence
    if (results.length === 0) {
      results.push({
        document: KNOWLEDGE_CORPUS[3], // Gift card baseline
        score: 0.15,
        matchedKeywords: [],
        retrievalTimestamp: new Date().toISOString(),
        engine: 'LOCAL_HYBRID_FALLBACK',
      });
    }

    return results;
  }
}

export const elasticScamEngine = new ElasticScamEngine();

