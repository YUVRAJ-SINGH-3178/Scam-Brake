export interface BryntumResource {
  id: string;
  name: string;
  role: string;
  avatarColor?: string;
  isAvailable: boolean;
  activeCaseCount: number;
}

export interface BryntumEvent {
  id: string;
  resourceId: string;
  name: string; // Case Reference or Task
  startDate: string;
  endDate: string;
  paymentId: string;
  riskScore: number;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  status: 'SCHEDULED' | 'ACTIVE' | 'COMPLETED';
}

class BryntumSchedulerManager {
  private resources: BryntumResource[] = [
    {
      id: 'inv_sarah_chen',
      name: 'Sarah Chen',
      role: 'Senior Fraud Specialist',
      avatarColor: '#1A7A64',
      isAvailable: true,
      activeCaseCount: 2,
    },
    {
      id: 'inv_marcus_vance',
      name: 'Marcus Vance',
      role: 'Coercion Interview Lead',
      avatarColor: '#2D5BFF',
      isAvailable: true,
      activeCaseCount: 1,
    },
    {
      id: 'inv_elena_rostova',
      name: 'Elena Rostova',
      role: 'Identity & Directory Auditor',
      avatarColor: '#784D00',
      isAvailable: true,
      activeCaseCount: 1,
    },
  ];

  private events: BryntumEvent[] = [
    {
      id: 'evt_sched_01',
      resourceId: 'inv_sarah_chen',
      name: 'Case SB-2026-8819 (IRS Threat Review)',
      startDate: new Date(Date.now() - 3600000).toISOString(),
      endDate: new Date(Date.now() + 1800000).toISOString(),
      paymentId: 'pay_sb_881901',
      riskScore: 94,
      priority: 'CRITICAL',
      status: 'ACTIVE',
    },
    {
      id: 'evt_sched_02',
      resourceId: 'inv_marcus_vance',
      name: 'Case SB-2026-8822 (Bank Scam Verification)',
      startDate: new Date(Date.now() - 1800000).toISOString(),
      endDate: new Date(Date.now() + 3600000).toISOString(),
      paymentId: 'pay_sb_882204',
      riskScore: 82,
      priority: 'HIGH',
      status: 'ACTIVE',
    },
    {
      id: 'evt_sched_03',
      resourceId: 'inv_elena_rostova',
      name: 'Case SB-2026-8821 (Tech Support AnyDesk Follow-up)',
      startDate: new Date(Date.now() + 7200000).toISOString(),
      endDate: new Date(Date.now() + 10800000).toISOString(),
      paymentId: 'pay_sb_882103',
      riskScore: 88,
      priority: 'HIGH',
      status: 'SCHEDULED',
    },
  ];

  public getStatus(): { isConfigured: boolean; status: string } {
    return {
      isConfigured: false, // Bryntum commercial license not injected into environment
      status: 'MOCK_MODE',
    };
  }

  public getSchedulerData(): { resources: BryntumResource[]; events: BryntumEvent[] } {
    return {
      resources: this.resources,
      events: this.events,
    };
  }

  public assignCase(params: {
    eventId: string;
    resourceId: string;
    startTime?: string;
    endTime?: string;
  }): BryntumEvent {
    const evt = this.events.find((e) => e.id === params.eventId);
    if (!evt) throw new Error(`Event ${params.eventId} not found in Bryntum scheduler.`);

    evt.resourceId = params.resourceId;
    if (params.startTime) evt.startDate = params.startTime;
    if (params.endTime) evt.endDate = params.endTime;

    // Recalculate resource counts
    this.resources.forEach((r) => {
      r.activeCaseCount = this.events.filter((e) => e.resourceId === r.id && e.status === 'ACTIVE').length;
    });

    return evt;
  }
}

export const bryntumSchedulerManager = new BryntumSchedulerManager();

