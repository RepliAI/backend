import { IPlanLimitsService } from 'src/domain/plans/services/plan-limits.service';
import { PlanLimitsEntity } from 'src/domain/plans/entities/plan-limits.entity';

export function createPlanLimitsServiceMock(): jest.Mocked<IPlanLimitsService> {
  const mockPlanLimits = new PlanLimitsEntity('free', 20, 1, null, false, false);

  return {
    getPlanLimits: jest.fn().mockReturnValue(mockPlanLimits),
    getMaxGmailAccounts: jest.fn().mockReturnValue(1),
    allowsAutoImport: jest.fn().mockReturnValue(false),
    allowsAutoAiSend: jest.fn().mockReturnValue(false),
    getAiResponseLimit: jest.fn().mockReturnValue(20),
    getAutoImportInterval: jest.fn().mockReturnValue(null),
  };
}

