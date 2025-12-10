import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from './auth.service';
import { Observable, of } from 'rxjs';
import { map, take, delay, switchMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
    console.log('[AuthGuard] canActivate called for:', state.url);
    console.log('[AuthGuard] Initial isLoggedIn:', this.authService.isLoggedIn());
    console.log('[AuthGuard] Current user:', this.authService.getCurrentUser());

    return of(null).pipe(
      delay(0),
      switchMap(() => this.authService.currentUser$),
      take(1),
      map(user => {
        console.log('[AuthGuard] After delay - user:', user);

        if (user) {
          console.log('[AuthGuard] User authenticated, allowing access');
          return true;
        }

        console.log('[AuthGuard] No user found, redirecting to login');
        this.router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
        return false;
      })
    );
  }
}