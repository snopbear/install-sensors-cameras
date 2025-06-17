// guards/role.guard.ts
import { inject } from "@angular/core";
import { CanActivateFn, Router } from "@angular/router";
import { AuthService } from "@services/modules/auth/auth.service";

export const roleGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const requiredRoles = route.data["roles"] as string[] | undefined;

  if (!authService.isAuthenticated()) {
    router.navigate(["/auth/login"], {
      queryParams: { returnUrl: state.url },
    });
    return false;
  }

  // No roles specified = any authenticated user can access
  if (!requiredRoles || requiredRoles.length === 0) {
    return true;
  }

  if (authService.hasAnyRole(requiredRoles)) {
    return true;
  }

  // User doesn't have required role
  router.navigate(["/unauthorized"]);
  return false;
};
