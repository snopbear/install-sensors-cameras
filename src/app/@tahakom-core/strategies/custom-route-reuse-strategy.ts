/**
 * 
 * @author Mohammed Assaf
 * @created 2023-6-17
 * @version 1.0.0
 * Custom Route Reuse Strategy for Angular Applications
 *
 * @description
 * Enhances Angular's default routing by intelligently caching components to:
 * - Accelerate navigation between frequently-used routes
 * - Preserve component state (forms, scroll positions, UI)
 * - Minimize redundant API calls and DOM re-rendering
 *
 * @usage
 * 1. Apply to routes:
 * @example
 * {
 *   path: 'dashboard',
 *   loadComponent: () => import('./dashboard.component'),
 *   data: { reuse: true }  // Enable caching
 * }
 *
 * 2. Register strategy:
 * @example
 * providers: [
 *   { provide: RouteReuseStrategy, useClass: CustomRouteReuseStrategy }
 * ]
 *
 * @performance_considerations
 * - ✔️ Ideal for: Tab interfaces, wizard flows, data-heavy dashboards
 * - ⚠️ Avoid for: Routes requiring fresh data on every visit
 * - 🧹 Always call clearAll() after logout to prevent memory leaks

 */

import {
  ActivatedRouteSnapshot,
  DetachedRouteHandle,
  RouteReuseStrategy,
} from "@angular/router";

interface ReuseRouteData {
  reuse?: boolean;
}

export class CustomRouteReuseStrategy implements RouteReuseStrategy {
  private storedRoutes = new Map<string, DetachedRouteHandle>();

  //#region Core Strategy Methods

  /**
   * Determines if routes should be reused (default Angular behavior)
   * @param future - Upcoming route snapshot
   * @param curr - Current route snapshot
   * @returns true if route configurations match
   */
  shouldReuseRoute(
    future: ActivatedRouteSnapshot,
    curr: ActivatedRouteSnapshot
  ): boolean {
    return future.routeConfig === curr.routeConfig;
  }

  /**
   * Decides whether to cache the current route
   * @param route - Route being evaluated
   * @returns true if route has data: { reuse: true }
   */
  shouldDetach(route: ActivatedRouteSnapshot): boolean {
    const routeData = route.routeConfig?.data as ReuseRouteData;
    return routeData?.reuse === true;
  }

  /**
   * Stores detached route component in cache
   * @param route - Route being cached
   * @param handle - Component instance to store
   */
  store(
    route: ActivatedRouteSnapshot,
    handle: DetachedRouteHandle | null
  ): void {
    if (handle && route.routeConfig) {
      this.storedRoutes.set(this.getRouteKey(route), handle);
    }
  }

  //#endregion

  //#region Cache Retrieval Methods

  /**
   * Checks if cached component exists for route
   * @param route - Target route
   * @returns true if cached version available
   */
  shouldAttach(route: ActivatedRouteSnapshot): boolean {
    return (
      !!route.routeConfig && !!this.storedRoutes.get(this.getRouteKey(route))
    );
  }

  /**
   * Retrieves cached component if available
   * @param route - Target route
   * @returns Cached component or null
   */
  retrieve(route: ActivatedRouteSnapshot): DetachedRouteHandle | null {
    return route.routeConfig
      ? this.storedRoutes.get(this.getRouteKey(route)) || null
      : null;
  }

  //#endregion

  //#region Utility Methods

  /**
   * Generates unique cache key from route path
   * @example
   * // Returns 'parent/child' for route /parent/child
   */
  private getRouteKey(route: ActivatedRouteSnapshot): string {
    return route.pathFromRoot
      .filter((u) => u.url)
      .map((u) => u.url.map((segment) => segment.toString()).join("/"))
      .join("/");
  }

  /**
   * Clears specific cached route
   * @param key - Route key to remove
   */
  clearRouteSnapshot(key: string): void {
    this.storedRoutes.delete(key);
  }

  /**
   * Clears entire route cache
   * @critical Call during logout or when forced refresh needed
   */
  clearAll(): void {
    this.storedRoutes.clear();
  }

  //#endregion
}
