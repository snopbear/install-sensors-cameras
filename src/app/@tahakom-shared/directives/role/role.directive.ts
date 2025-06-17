// directives/role.directive.ts
import {
  Directive,
  Input,
  TemplateRef,
  ViewContainerRef,
  inject,
} from "@angular/core";
import { AuthService } from "@services/modules/auth/auth.service";

@Directive({
  selector: "[appRole]",
  standalone: true,
})
export class RoleDirective {
  private authService = inject(AuthService);
  private templateRef = inject(TemplateRef<any>);
  private viewContainer = inject(ViewContainerRef);
  private hasView = false;

  @Input() set appRole(requiredRoles: string | string[]) {
    const rolesToCheck = requiredRoles === "*" ? [] : requiredRoles;
    const hasAccess =
      requiredRoles === "*"
        ? this.authService.isAuthenticated()
        : Array.isArray(rolesToCheck)
        ? this.authService.hasAnyRole(rolesToCheck)
        : this.authService.hasRole(rolesToCheck);

    if (hasAccess && !this.hasView) {
      this.viewContainer.createEmbeddedView(this.templateRef);
      this.hasView = true;
    } else if (!hasAccess && this.hasView) {
      this.viewContainer.clear();
      this.hasView = false;
    }
  }
}
