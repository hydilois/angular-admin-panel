import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateChild, Router, RouterStateSnapshot } from '@angular/router';
import { AccessTokenService } from '@app/modules/authentication/services/access-token.service';
import { selectIsLoggedIn } from '@app/modules/authentication/store/auth.selectors';
import { Store } from '@ngrx/store';
import { filter, first, map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GuestGuard implements CanActivateChild {
  constructor(
    private store: Store,
    private router: Router,
    private accessTokenService: AccessTokenService
  ) {}

  canActivateChild(): Observable<boolean> {
    return this.store.select(selectIsLoggedIn).pipe(
      first((value) => value !== null),
      map((isLoggedIn: boolean | null) => {
        if (isLoggedIn && this.accessTokenService.getAccessToken()) {
          this.router.navigateByUrl('/dashboard')
          return false
        }

        return true;
      })
    );
  }

} 