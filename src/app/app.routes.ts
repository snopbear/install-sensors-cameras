import { Routes } from '@angular/router';
import { roleGuard } from './@tahakom-core/guards/role/role.guard';
import { inject } from '@angular/core';
import { HttpResourceService } from '@services/utilities/http-calls/http-calls-observable.service';
import { NetworkDeviceService } from '@services/modules/network-devices/network-devices.service';

export const routes: Routes = [
  { path: "", redirectTo: "auth", pathMatch: "full" },
  {
    path: "auth",
    loadChildren: () =>
      import("./@tahakom-feature/auth/auth.routes").then((m) => m.AUTH_ROUTES),
  },
  {
    path: "install-cameras",
    loadComponent: () =>
      import(
        "./@tahakom-feature/install-cameras/install-cameras.component"
      ).then((m) => m.InstallCamerasComponent),

    resolve: {
      preload: () => {
        const httpResource = inject(HttpResourceService);
        return httpResource.resolveFromConfig([
          NetworkDeviceService.RESOLVERS.networkDevicesList,
          NetworkDeviceService.RESOLVERS.cameraTypesList,
        ]);
      },
    },
    data: { reuse: true }, // This route will be cached

    // canActivate: [authGuard], // Protected route
  },
  {
    path: "polygon",
    loadComponent: () =>
      import("./@tahakom-feature/polygon/polygon.component").then(
        (m) => m.PolygonComponent
      ),
  },
  {
    path: "tree-view",
    loadComponent: () =>
      import("./@tahakom-feature/tree-view/tree-view.component").then(
        (m) => m.TreeViewComponent
      ),
    // canActivate: [roleGuard],
    // data: { roles: ["user", "admin"] },
  },
];
  