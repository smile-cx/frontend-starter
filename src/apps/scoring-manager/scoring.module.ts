import { ContainerModule } from 'inversify';
import { ScoringService } from './scoring.service';
import { SCORING_TYPES } from './scoring.types';

export const scoringModule = new ContainerModule(({ bind }) => {
  bind(SCORING_TYPES.ScoringService).to(ScoringService).inSingletonScope();
});
