import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

    // Check if the user is authenticated
    if (!this.authService.isAuthenticated()) {
      // If not authenticated, redirect to login with return URL
      return this.router.createUrlTree(['/login'], {
        queryParams: { returnUrl: state.url }
      });
    }

    // Check if a specific role is required for this route
    const requiredRole = route.data['requiredRole'] as string;
    if (requiredRole && !this.authService.hasRole(requiredRole)) {
      // User doesn't have the required role, redirect to home
      return this.router.createUrlTree(['/home']);
    }

    // User is authenticated and has the required role (if any)
    return true;
  }
}
