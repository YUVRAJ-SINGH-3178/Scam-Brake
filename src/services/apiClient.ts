import {
  Payment,
  InterventionSession,
  InterventionMessage,
  AuditEvent,
  DashboardMetrics,
  RiskLevel,
  AuthorizationStatus,
  SponsorIntegration,
  SimulationScenario,
} from '@/types';

class ScamBrakeApiClient {
  private baseUrl = '';

  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const res = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options?.headers || {}),
      },
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: res.statusText }));
      throw new Error(err.error || `API Error ${res.status}`);
    }

    return res.json();
  }

  // Payments
  async getPayments(params?: {
    search?: string;
    riskLevel?: RiskLevel;
    status?: AuthorizationStatus;
  }): Promise<{ payments: Payment[]; total: number }> {
    const query = new URLSearchParams();
    if (params?.search) query.set('search', params.search);
    if (params?.riskLevel) query.set('riskLevel', params.riskLevel);
    if (params?.status) query.set('status', params.status);
    return this.request(`/api/payments?${query.toString()}`);
  }

  async getPayment(id: string): Promise<{ payment: Payment; intervention?: InterventionSession; auditLogs: AuditEvent[] }> {
    return this.request(`/api/payments/${id}`);
  }

  async capturePayment(id: string, notes?: string): Promise<{ success: boolean; payment: Payment }> {
    return this.request(`/api/payments/${id}/capture`, {
      method: 'POST',
      body: JSON.stringify({ notes }),
    });
  }

  async voidPayment(id: string, reason?: string): Promise<{ success: boolean; payment: Payment }> {
    return this.request(`/api/payments/${id}/void`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  }

  // Interventions
  async sendInterventionMessage(
    paymentId: string,
    message: string
  ): Promise<{
    reply: string;
    quickReplies?: string[];
    flaggedKeywords?: string[];
    coercionIndicatorsDetected: string[];
    recommendedNextStep: string;
  }> {
    return this.request(`/api/intervention/${paymentId}/message`, {
      method: 'POST',
      body: JSON.stringify({ message }),
    });
  }

  async updateTrustedContactConsent(
    paymentId: string,
    consentGranted: boolean
  ): Promise<{ success: boolean }> {
    return this.request(`/api/intervention/${paymentId}/consent`, {
      method: 'POST',
      body: JSON.stringify({ consentGranted }),
    });
  }

  async notifyTrustedContact(paymentId: string): Promise<{ success: boolean; dispatchReference: string }> {
    return this.request(`/api/intervention/${paymentId}/notify-contact`, {
      method: 'POST',
    });
  }

  async verifyDirectory(query: string) {
    return this.request(`/api/intervention/verify-directory?query=${encodeURIComponent(query)}`);
  }

  // Merchant Analytics & Ops
  async getMetrics(): Promise<DashboardMetrics> {
    return this.request('/api/merchant/metrics');
  }

  async getAuditLogs(paymentId?: string): Promise<{ logs: AuditEvent[]; tamperEvidentSeal: string }> {
    const q = paymentId ? `?paymentId=${paymentId}` : '';
    return this.request(`/api/merchant/audit-log${q}`);
  }

  async getSchedulerData() {
    return this.request('/api/merchant/scheduler');
  }

  async runSimulation(scenarioKey: string) {
    return this.request('/api/simulation/run', {
      method: 'POST',
      body: JSON.stringify({ scenarioKey }),
    });
  }
}

export const apiClient = new ScamBrakeApiClient();

