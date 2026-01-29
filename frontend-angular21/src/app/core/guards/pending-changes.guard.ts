import { CanDeactivateFn } from '@angular/router';
import { Observable } from 'rxjs';

export interface CanComponentDeactivate {
  canDeactivate: () => boolean | Observable<boolean>;
}

export const pendingChangesGuard: CanDeactivateFn<CanComponentDeactivate> = (
  component
) => {
  if (!component || typeof component.canDeactivate !== 'function') {
    return true;
  }

  return component.canDeactivate();
};
