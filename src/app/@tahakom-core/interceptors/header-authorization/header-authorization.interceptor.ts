import { HttpInterceptorFn } from "@angular/common/http";
import { inject } from "@angular/core";
import { LocalStorageService } from "@services/utilities/local-storage/local-storage.service";

export const HeaderAuthorizationInterceptor: HttpInterceptorFn = (
  req,
  next
) => {
  const localStorageService = inject(LocalStorageService);
  const token = localStorageService.getToken();

  if (!token) {
    return next(req);
  }

  const authReq = req.clone({
    headers: req.headers.set("Authorization", `Bearer ${token}`),
  });

  return next(authReq);
};
