// loading.interceptor.ts
import {
  HttpInterceptorFn,
  HttpRequest,
  HttpHandlerFn,
} from "@angular/common/http";
import { inject } from "@angular/core";
import { SkipLoading } from "@services/utilities/http-calls/http-context-tokens";
import { finalize } from "rxjs";
import { LoadingService } from "src/app/@tahakom-shared/components/loading/loading.service";

export const LoadingInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
) => {
  const skipLoading = req.context.get(SkipLoading);
  if (skipLoading) {
    return next(req);
  }

  const loadingService = inject(LoadingService);
  loadingService.loadingOn();

  return next(req).pipe(
    finalize(() => {
      loadingService.loadingOff();
    })
  );
};
