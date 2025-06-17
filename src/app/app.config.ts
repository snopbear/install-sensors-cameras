import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter, RouteReuseStrategy } from '@angular/router';

import { routes } from './app.routes';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { JWT_OPTIONS, JwtHelperService } from "@auth0/angular-jwt";
import { LoadingInterceptor } from './@tahakom-core/interceptors/loading/loading.interceptor';
import { BrowserAnimationsModule, provideAnimations } from '@angular/platform-browser/animations';
import { provideToastr } from "ngx-toastr";
import { CustomRouteReuseStrategy } from './@tahakom-core/strategies/custom-route-reuse-strategy';



export function tokenGetter() {
  const user = localStorage.getItem("currentUser");
  return user ? JSON.parse(user).token : null;
}

// JWT configuration
export const jwtConfig = {
  tokenGetter,
  allowedDomains: ['your-api-domain.com'],
  disallowedRoutes: [
    'http://your-api-domain.com/auth/login',
    'http://your-api-domain.com/auth/refresh'
  ],
};
export const appConfig: ApplicationConfig = {
  providers: [
    BrowserAnimationsModule,
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes),
    provideHttpClient(withFetch(), withInterceptors([LoadingInterceptor])),
    { provide: JWT_OPTIONS, useValue: jwtConfig },
    JwtHelperService,
    provideAnimations(), // required animations providers
    provideToastr(), // Toastr providers
    {
      provide: RouteReuseStrategy,
      useClass: CustomRouteReuseStrategy,
    },
  ],
};
