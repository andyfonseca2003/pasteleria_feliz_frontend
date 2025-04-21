import { inject, Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot } from '@angular/router';
import { TokenService } from '../token.service';

@Injectable({
  providedIn: 'root'
})
export class RolesService {

  realRole: boolean = false;

  constructor(private tokenService: TokenService, private router: Router) { }

  canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const expectedRoles: string[] = next.data["roles"] || [];

    this.realRole = this.tokenService.getIsAdmin();

    // Si no está logueado, lo sacamos
    if (!this.tokenService.isLogged()) {
      this.router.navigate(["/login"]);
      return false;
    }

    // Si no hay roles requeridos, lo dejamos pasar
    if (expectedRoles.length === 0) {
      return true;
    }

    // Si requiere ADMIN y el usuario es admin, lo dejamos pasar
    if (expectedRoles.includes('ADMIN') && this.realRole) {
      return true;
    }

    // Si requiere ADMIN y no es admin, lo sacamos
    if (expectedRoles.includes('ADMIN') && !this.realRole) {
      this.router.navigate(["/administrador"]);
      return false;
    }

    // Si los roles requeridos NO incluyen ADMIN, dejar pasar
    return true;
  }

}

export const RolesGuard: CanActivateFn = (next: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean => {
  return inject(RolesService).canActivate(next, state);
}

