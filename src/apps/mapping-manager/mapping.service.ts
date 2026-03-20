import { inject, injectable } from 'inversify';
import { BehaviorSubject } from 'rxjs';
import { LOGGER_TYPES } from '../../di/types';
import type { ILogger } from '../../libs/logger';
import { StarterDebugNamespaces } from '../../libs/logger';
import type { CSVJSONItems, IMappingService, Mapping, MappingItem ,Model } from './mapping.interface';

@injectable()
export class MappingService implements IMappingService {
  private logger = this.loggerService.getLogger(StarterDebugNamespaces.Mapping);
  mappings$ = new BehaviorSubject<Mapping[]>([]);
  mappingItems$ = new BehaviorSubject<MappingItem[]>([]);
  JSONFields$ = new BehaviorSubject<CSVJSONItems[]>([]);
  UserModel$ = new BehaviorSubject<Model | null>(null);

  constructor(@inject(LOGGER_TYPES.Logger) private loggerService: ILogger) {
    this.logger.log('MappingService initialized');
  }

    async LoadcsvJson(): Promise<string> {
        const filePath = '../../assets/data/leads-schema.json'; // Adjust path as needed
          try {
            const response = await fetch(filePath);
            if (!response.ok) throw new Error('Failed to fetch JSON file');
            const jsonText = await response.text();         
            return jsonText;
          } catch (error) {
            console.error('Failed to load mapping fields from constant file:', error);
            return '';
          }
    }


    async loadMappingFields(): Promise<CSVJSONItems[]> {
      this.logger.debug('Loading mapping fields from JSON...'); 
      try {
            const jsonText = await this.LoadcsvJson();
            if(!jsonText || jsonText.trim() === '') throw new Error('No JSON data loaded');

            const schema = JSON.parse(jsonText);
            const properties = schema?.items?.properties ?? {};

            const jsonFields = Object.entries(properties).map(([name, value]: [string, any]) => ({
              name,
              type: value.type,
              minimum: value.minimum,
              maximum: value.maximum,
              minLength: value.minLength,
              maxLength: value.maxLength,
              format: value.format,
              dateFormat: value.dateFormat,
              description: value.description,
              entityType: value.entityType,
            }));

            this.JSONFields$.next(jsonFields);
            return jsonFields;
      } 
      catch (error) {
        this.logger.error('Failed to load mapping fields from JSON:', error);
        return [];
      }
    }

  async saveMapping(value: CSVJSONItems[]): Promise<void> {
    this.logger.debug('Saving mapping configuration...');

    this.JSONFields$.next(value);

    //Populate mappingItems$ based on value for using in scoring configuration
    const mappingItems = value.map(item => ({
      csvField: item.name,
      aliasName: item.renameField || '', // Use renameField if available, otherwise default to empty string
      mappingField: item.entityType || '',
    }));
    this.mappingItems$.next(mappingItems); 
  }

  async saveModel(model: Model): Promise<void> {
    this.logger.debug('Saving model...', model);
    // Implement your logic to save the model, e.g., send it to an API or store it locally
    this.UserModel$.next(model);
  }
}
