import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { EMPTY, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';

import * as AuthActions from './auth.actions';
import { AuthService } from '../services/auth.service';
import {
  Credentials,
  ResetPasswordCredentials,
} from '../interfaces/credentials.interface';
import { AuthResponse } from '@app/modules/user/interfaces/user.interface';
import { LocalStorageService } from '../services/local-storage.service';
import { getNotificationStatusAction } from '@app/core/store/notification/notification.actions';
import { Store } from '@ngrx/store';

@Injectable()
export class AuthEffects {
  constructor(
    private actions$: Actions,
    private store: Store,
    private authService: AuthService,
    private localStorageService: LocalStorageService,
    private router: Router
  ) {}

  authenticateEffect = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.authenticateAction),
      switchMap(({ credentials }: { credentials: Credentials }) =>
        this.authService.authenticate(credentials).pipe(
          map((authResponse: AuthResponse) => {
            this.localStorageService.setAccessToken(
              authResponse.data.access_token,
              authResponse.data.expires_in
            );
            this.localStorageService.setLocalStorage(
              'user',
              JSON.stringify(authResponse.data.user)
            );
            this.localStorageService.setLocalStorage(
              'roles',
              JSON.stringify(authResponse.data.roles)
            );

            this.router.navigateByUrl('/dashboard');

            this.store.dispatch(getNotificationStatusAction({ notification: {
              title: 'Connexion',
              description: "Vous êtes desormais connecté!",
              type: 'success'
            }}))

            return AuthActions.fetchAuthenticateSuccessAction({
              user: authResponse.data.user,
              roles: authResponse.data.roles,
              permissions: authResponse.data.permissions,
            });
          }),
          catchError(error => {
            return of(
              AuthActions.fetchAuthenticateFailureAction({
                error: error.error?.message ?? 'Une erreur est survenue',
              })
            );
          })
        )
      )
    )
  );

  forgotPasswordEffect = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.forgotPasswordAction),
      switchMap(({ email }: { email: string }) =>
        this.authService.forgotPassword(email).pipe(
          map(({ message }: { message: string }) =>
            AuthActions.fetchForgotPasswordSuccessAction({ message })
          ),
          catchError(error => {
            return of(
              AuthActions.fetchForgotPasswordFailureAction({
                error: error.error?.message ?? 'Une erreur est survenue',
              })
            );
          })
        )
      )
    )
  );

  resetPasswordEffect = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.resetPasswordAction),
      switchMap(({ credentials }: { credentials: ResetPasswordCredentials }) =>
        this.authService.resetPassword(credentials).pipe(
          map(({ message }: { message: string }) =>
            AuthActions.fetchResetPasswordSuccessAction({ message })
          ),
          catchError(error => {
            return of(
              AuthActions.fetchResetPasswordFailureAction({
                error: error.error?.message ?? 'Une erreur est survenue',
              })
            );
          })
        )
      )
    )
  );

  getCurrentUserEffect = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.getCurrentUserAction),
      switchMap(() =>
        this.authService.getCurrentUser().pipe(
          map(({ data }: any) =>
            AuthActions.fetchCurrentUserSuccessAction({ user: data.user })
          ),
          catchError(() => EMPTY)
        )
      )
    )
  );

  getUserRolesAndPermissionsEffect = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.getUserRolesAndPermissionsAction),
      switchMap(() =>
        this.authService.getUserRolesPermissions().pipe(
          map(
            ({
              roles,
              permissions,
            }: {
              roles: string[];
              permissions: string[];
            }) =>
              AuthActions.fetchUserRolesAndPermissionsSuccessAction({
                roles,
                permissions,
              })
          ),
          catchError(() => EMPTY)
        )
      )
    )
  );

  logoutEffect = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.logoutAction),
      switchMap(() =>
        this.authService.logout().pipe(
          map(() => {

            this.store.dispatch(getNotificationStatusAction({ notification: {
              title: 'Déconnexion',
              description: "Vous êtes desormais déconnecté!",
              type: 'success',
            }}))

            this.localStorageService.removeAccessToken();
            this.router.navigateByUrl('/auth/login');
            return AuthActions.fetchLogoutSuccessAction();
          }),
          catchError(() => EMPTY)
        )
      )
    )
  );
}
