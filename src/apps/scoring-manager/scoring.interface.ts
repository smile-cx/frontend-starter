import type { BehaviorSubject } from 'rxjs';

export interface Score {
  score: number;
  numericValue?: { from: number; to: number };
  arrayValue?: string[];
  boolValue?: boolean;
}

export interface FieldToSend {
  id: number;
  name: string;
  type: string;
  weight: number;
  scores: Score[];
}
export interface FormToSend {
  contactability: FieldToSend[];
  propensity: FieldToSend[];
}

export interface IScoringService {
  fieldsToSend$: BehaviorSubject<FieldToSend[]>;
  totalweight$: BehaviorSubject<number>;
  formToSend$: BehaviorSubject<FormToSend>;
  totalweightContactability$: BehaviorSubject<number>;
  totalweightPropensity$: BehaviorSubject<number>;

  addFieldToSend(field: FieldToSend, scope: 'Contactability' | 'Propensity'): void;
  editFieldsToSend(field: FieldToSend, key: number, scope: 'Contactability' | 'Propensity'): Promise<void>;
  editTotalWeight(scope: 'Contactability' | 'Propensity'): void;
  normalize(scope: 'Contactability' | 'Propensity'): void;
  deleteField(key: number, scope: 'Contactability' | 'Propensity'): void;
}
