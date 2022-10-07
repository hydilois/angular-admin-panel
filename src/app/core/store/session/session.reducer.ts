import { createReducer, on } from '@ngrx/store';

import { IValidationError } from '@app/core/interfaces/session.interface';
import * as SessionActions from './session.actions';

export interface SessionState {
  formErrors: IValidationError | null;
}

export const sessionFeatureKey = 'session';

export const sessionState: SessionState = {
  formErrors: null,
};

export const sessionReducer = createReducer(
  sessionState,
  on(
    SessionActions.fetchFormsErrorAction,
    (state: SessionState, { formErrors }): SessionState => {
      return {
        ...state,
        formErrors,
      };
    }
  ),
  on(SessionActions.clearErrorsAction, (state: SessionState): SessionState => {
    return {
      ...state,
      formErrors: null,
    };
  })
);
