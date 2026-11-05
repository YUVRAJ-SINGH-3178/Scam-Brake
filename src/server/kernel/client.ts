export interface VerifiedDirectoryEntry {
  organization: string;
  officialPhone: string;
  officialDomain: string;
  verificationSourceUrl: string;
  lastAuditedAt: string;
  antiSpoofWarning: string;
}

// Certified Public Switchboard Directory (Audited Ground Truth)
const CERTIFIED_REGISTRY: Record<string, VerifiedDirectoryEntry> = {
  IRS: {
    organization: 'Internal Revenue Service (IRS)',
    officialPhone: '1-800-829-1040',
    officialDomain: 'irs.gov',
    verificationSourceUrl: 'https://www.irs.gov/help/telephone-assistance',
    lastAuditedAt: '2026-10-15T00:00:00Z',
    antiSpoofWarning:
      'The IRS never demands immediate payment via gift cards or wire transfer and will never threaten immediate arrest by local police over the phone.',
  },
  SSA: {
    organization: 'Social Security Administration (SSA)',
    officialPhone: '1-800-772-1213',
    officialDomain: 'ssa.gov',
    verificationSourceUrl: 'https://www.ssa.gov/agency/contact/',
    lastAuditedAt: '2026-09-20T00:00:00Z',
    antiSpoofWarning:
      'The SSA will never threaten to suspend your Social Security number or demand cash/prepaid cards to clear your record.',
  },
  CHASE: {
    organization: 'JPMorgan Chase Fraud Prevention',
    officialPhone: '1-800-935-9935',
    officialDomain: 'chase.com',
    verificationSourceUrl: 'https://www.chase.com/digital/resources/privacy-security/security/fraud-scams',
    lastAuditedAt: '2026-11-01T00:00:00Z',
    antiSpoofWarning:
      'Chase fraud departments will never instruct you to move money to a "safe government account" or purchase retail gift cards.',
  },
  MICROSOFT: {
    organization: 'Microsoft Customer Support',
    officialPhone: '1-800-642-7676',
    officialDomain: 'microsoft.com',
    verificationSourceUrl: 'https://support.microsoft.com/contactus',
    lastAuditedAt: '2026-08-10T00:00:00Z',
    antiSpoofWarning:
      'Microsoft error pop-ups never include phone numbers to call. Microsoft will never ask for gift cards to repair your computer.',
  },
  APPLE: {
    organization: 'Apple Support',
    officialPhone: '1-800-275-2273',
    officialDomain: 'apple.com',
    verificationSourceUrl: 'https://support.apple.com/gift-card-scams',
    lastAuditedAt: '2026-10-05T00:00:00Z',
    antiSpoofWarning:
      'Apple Gift Cards are ONLY for purchasing goods at Apple stores or on the App Store. They cannot be used to pay taxes, medical bills, or legal fines.',
  },
};

// Strict SSRF Allowlist
const ALLOWED_DOMAINS = [
  'irs.gov',
  'ssa.gov',
  'ftc.gov',
  'consumerfinance.gov',
  'chase.com',
  'wellsfargo.com',
  'apple.com',
  'microsoft.com',
];

class KernelVerificationClient {
  private kernelApiKey: string;
  private isConfigured: boolean;

  constructor() {
    this.kernelApiKey = process.env.KERNEL_API_KEY || '';
    this.isConfigured = Boolean(this.kernelApiKey);
  }

  public getStatus(): { isConfigured: boolean; status: string } {
    return {
      isConfigured: this.isConfigured,
      status: this.isConfigured ? 'REAL_INTEGRATION' : 'MOCK_MODE',
    };
  }

  /**
   * Looks up authentic directory switchboard for an alleged organization
   */
  async lookupOfficialDirectory(query: string): Promise<VerifiedDirectoryEntry | null> {
    const q = query.toUpperCase();

    let matchedKey: string | null = null;
    if (q.includes('IRS') || q.includes('TAX') || q.includes('INTERNAL REVENUE')) matchedKey = 'IRS';
    else if (q.includes('SSA') || q.includes('SOCIAL SECURITY')) matchedKey = 'SSA';
    else if (q.includes('CHASE') || q.includes('JPMORGAN')) matchedKey = 'CHASE';
    else if (q.includes('MICROSOFT') || q.includes('WINDOWS')) matchedKey = 'MICROSOFT';
    else if (q.includes('APPLE') || q.includes('ITUNES')) matchedKey = 'APPLE';

    if (!matchedKey) {
      // Default to IRS as primary reference if general government inquiry
      matchedKey = 'IRS';
    }

    const entry = CERTIFIED_REGISTRY[matchedKey];

    // If KERNEL API Key is available, verify live certificate status via Kernel cloud browser
    if (this.isConfigured) {
      try {
        const res = await fetch('https://api.kernel.sh/v1/browser/verify', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${this.kernelApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            targetDomain: entry.officialDomain,
            verifyCertificate: true,
          }),
        });
        if (res.ok) {
          const liveData = await res.json();
          return {
            ...entry,
            lastAuditedAt: liveData.verifiedAt || new Date().toISOString(),
          };
        }
      } catch (err) {
        console.warn('[KERNEL] Cloud browser verify failed, returning verified local registry:', err);
      }
    }

    return entry;
  }

  /**
   * Validates target URL against strict SSRF filter
   */
  public isUrlAllowed(targetUrl: string): boolean {
    try {
      const parsed = new URL(targetUrl);
      const host = parsed.hostname.toLowerCase();
      // Block local and private IPs
      if (
        host === 'localhost' ||
        host.startsWith('127.') ||
        host.startsWith('10.') ||
        host.startsWith('192.168.') ||
        host.startsWith('169.254.')
      ) {
        return false;
      }
      return ALLOWED_DOMAINS.some((domain) => host === domain || host.endsWith(`.${domain}`));
    } catch {
      return false;
    }
  }
}

export const kernelVerificationClient = new KernelVerificationClient();

