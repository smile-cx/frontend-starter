import { inject, injectable } from 'inversify';
import { BehaviorSubject } from 'rxjs';
import { LOGGER_TYPES } from '../../di/types';
import type { ILogger } from '../../libs/logger';
import { StarterDebugNamespaces } from '../../libs/logger';
import type { FieldToSend, FormToSend, IScoringService } from './scoring.interface';

@injectable()
export class ScoringService implements IScoringService {
  private logger = this.loggerService.getLogger(StarterDebugNamespaces.Mapping);

  fieldsToSend$ = new BehaviorSubject<FieldToSend[]>([]);
  formToSend$ = new BehaviorSubject<FormToSend>({ contactability: [], propensity: [] });
  totalweightContactability$ = new BehaviorSubject<number>(0);
  totalweightPropensity$ = new BehaviorSubject<number>(0);
  totalweight$ = new BehaviorSubject<number>(0);

  constructor(@inject(LOGGER_TYPES.Logger) private loggerService: ILogger) {
    this.logger.log('MappingService initialized');
  }

  addFieldToSend(field: FieldToSend, scope?: string) {
    const current = this.formToSend$.getValue();
    if (scope == 'Contactability')
      this.formToSend$.next({ ...current, contactability: [...current.contactability, field] });
    else this.formToSend$.next({ ...current, propensity: [...current.propensity, field] });
  }
  // addFieldToSend(field: FieldToSend) {
  //   const current = this.fieldsToSend$.getValue();
  //   this.fieldsToSend$.next([...current, field]);
  //   console.log('aggiunto', this.fieldsToSend$.getValue());
  // }
  async editFieldsToSend(newField: FieldToSend, key: number, scope?: string) {
    const current = this.formToSend$.getValue();
    if (scope == 'Contactability') {
      const updated = current.contactability.map((field, index) => (index == key ? newField : field));
      this.formToSend$.next({ ...current, contactability: updated });
    } else {
      const updated = current.propensity.map((field, index) => (index == key ? newField : field));
      this.formToSend$.next({ ...current, propensity: updated });
    }
  }
  // async editFieldsToSend(newField: FieldToSend, key: number) {
  //   const current = this.fieldsToSend$.getValue();
  //   const updated = current.map((field, index) => (index == key ? newField : field));
  //   this.fieldsToSend$.next(updated);
  // }
  deleteField(key: number, scope?: string) {
    const current = this.formToSend$.getValue();
    if (scope == 'Contactability') {
      const updated = current.contactability.filter((_, index) => index != key);
      this.formToSend$.next({ ...current, contactability: updated });
    } else {
      const updated = current.propensity.filter((_, index) => index != key);
      this.formToSend$.next({ ...current, propensity: updated });
    }
    // const current = this.formToSend$..getValue().filter((_, index) => index != key);
    // this.fieldsToSend$.next(current);
  }
  // deleteField(key: number) {
  //   const current = this.fieldsToSend$.getValue().filter((_, index) => index != key);
  //   this.fieldsToSend$.next(current);
  // }

  editTotalWeight(scope: 'Contactability' | 'Propensity') {
    if (scope === 'Contactability') {
      const current = this.formToSend$.getValue().contactability;
      const total = current.reduce((sum, field) => sum + field.weight, 0);
      this.totalweightContactability$.next(total);
    } else {
      const current = this.formToSend$.getValue().propensity;
      const total = current.reduce((sum, field) => sum + field.weight, 0);
      this.totalweightPropensity$.next(total);
    }
  }

  calcolo(current: FieldToSend[], tot: number) {
    var diff = 0;

    const normalized = current.map((field, index) => {
      if (index == current.length - 1) {
        return {
          ...field,
          weight: 100 - diff,
        };
      } else {
        diff += Math.round((field.weight * 100) / tot);
        return {
          ...field,
          weight: Math.round((field.weight * 100) / tot),
        };
      }
    });
    return normalized;
    // this.fieldsToSend$.next(normalized);
  }

  normalize(scope: 'Contactability' | 'Propensity') {
    const current = this.formToSend$.getValue();
    if (scope === 'Contactability') {
      const tot = this.totalweightContactability$.getValue();
      const normalize = this.calcolo(current.contactability, tot);
      this.formToSend$.next({ ...current, contactability: normalize });
    } else {
      const tot = this.totalweightPropensity$.getValue();
      const normalize = this.calcolo(current.propensity, tot);
      this.formToSend$.next({ ...current, propensity: normalize });
    }
  }
}
