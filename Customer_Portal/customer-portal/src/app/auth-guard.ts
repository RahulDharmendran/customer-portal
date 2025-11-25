import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {

  constructor(private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean | UrlTree {
    const token = localStorage.getItem("customer_token");

    // Always allow access to login page
    if (state.url === '/login') {
      return true;
    }

    // For other routes, token is required
    if (token) {
      return true;
    }

    // No token -> redirect to login
    return this.router.parseUrl('/login');
  }
}
