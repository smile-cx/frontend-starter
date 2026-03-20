import type { BehaviorSubject } from 'rxjs';

export interface Model {
  name: string;
  fileName: string;
  campaignId: string;
}

export interface Mapping {
  id: string;
  campaignId: string;
  mappingItems: MappingItem[];
}

export interface MappingItem {
  csvField: string;
  aliasName: string;
  mappingField: string;
}

export interface CSVJSONItems {
  name: string;
  type?: string | string[];
  minimum?: number;
  maximum?: number;
  minLength?: number;
  maxLength?: number;
  format?: string;
  dateFormat?: string;
  description?: string;
  entityType?: string;
  renameField?: string; // Add renameField to CSVJSONItems
}

export interface IMappingService {
  mappings$: BehaviorSubject<Mapping[]>;
  mappingItems$: BehaviorSubject<MappingItem[]>;
  JSONFields$: BehaviorSubject<CSVJSONItems[]>;
  UserModel$: BehaviorSubject<Model | null>;

  saveMapping(value: CSVJSONItems[]): Promise<void>;

  /**
   * Load mapping fields from JSON
   *
   * @returns Promise that always resolves (never throws)
   */
  loadMappingFields(jsonText: string): Promise<CSVJSONItems[]>;
  LoadcsvJson(): Promise<string>;
  saveModel(model: Model): Promise<void>;
}
