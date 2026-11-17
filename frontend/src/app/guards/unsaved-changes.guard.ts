import { CanDeactivateFn } from '@angular/router';

export interface HasUnsavedChanges {
  hasUnsavedChanges(): boolean;
}

export const unsavedChangesGuard: CanDeactivateFn<HasUnsavedChanges> = (component) => {
  if (component && typeof component.hasUnsavedChanges === 'function' && component.hasUnsavedChanges()) {
    return confirm('You have unsaved changes in this dispatch record. Do you wish to discard them?');
  }
  return true;
};
