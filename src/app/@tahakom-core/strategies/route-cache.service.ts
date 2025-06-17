import { Injectable } from "@angular/core";
import { CustomRouteReuseStrategy } from "./custom-route-reuse-strategy";

@Injectable({ providedIn: "root" })
export class RouteCacheService {
  constructor(private reuseStrategy: CustomRouteReuseStrategy) {}

  clearCacheForRoute(path: string): void {
    this.reuseStrategy.clearRouteSnapshot(path);
  }

  clearAllCache(): void {
    this.reuseStrategy.clearAll();
  }
}
