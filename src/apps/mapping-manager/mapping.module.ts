import { ContainerModule } from 'inversify';
import { MappingService } from './mapping.service';
import { MAPPING_TYPES } from './mapping.types';

export const mappingModule = new ContainerModule(({ bind }) => {
  bind(MAPPING_TYPES.MappingService).to(MappingService).inSingletonScope();
});
