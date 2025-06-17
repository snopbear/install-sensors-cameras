import { Routes } from "@angular/router";
import { AuthShellContainerComponent } from "./auth-shell-container/auth-shell-container.component";

export const AUTH_ROUTES: Routes = [
  {
    path: "",
    component: AuthShellContainerComponent,
    children: [
      {
        path: "",
        redirectTo: "login",
        pathMatch: "full",
      },
      {
        path: "login",
        loadComponent: () =>
          import("./login/login.component").then((c) => c.LoginComponent),
      },
      {
        path: "forget-password",
        loadComponent: () =>
          import("./forget-password/forget-password.component").then((c) => c.ForgetPasswordComponent),
      },
      // Add other auth routes here (register, forgot-password, etc.)
      // {
      //   path: 'register',
      //   loadComponent: () =>
      //     import('./register/register.component').then((c) => c.RegisterComponent)
      // },
    ],
  },
];
