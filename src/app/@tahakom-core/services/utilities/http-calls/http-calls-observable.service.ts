import { Injectable, inject, signal, WritableSignal } from "@angular/core";
import {
  HttpClient,
  HttpParams,
  HttpContext,
  HttpContextToken,
} from "@angular/common/http";
import {
  ActivatedRouteSnapshot,
  Resolve,
  RouterStateSnapshot,
} from "@angular/router";
import { Observable, throwError, forkJoin, of } from "rxjs";
import { catchError, finalize, tap } from "rxjs/operators";
import { environment } from "src/environments/environment";

/**
 * HTTP Resource Service
 *
 * @author Mohammed Assaf
 * @created 2023-06-17
 * @version 1.0.0
 *
 * @description
 * A comprehensive Angular service that combines HTTP client functionality with reactive state management,
 * route resolving, and error handling. It provides a unified interface for data fetching with built-in
 * loading states, error handling, and data caching using Angular signals.
 *
 * @usage
 * 1. As a route resolver (configure in router data):
 *    { path: 'users', component: UserComponent, resolve: { users: HttpResourceService }, data: {
 *      resolver: { url: 'users', method: 'GET' }
 *    }}
 *
 * 2. Direct service calls:
 *    this.httpResource.resolveFromConfig({ url: 'posts' }).subscribe();
 *    const state = this.httpResource.getState('GET_posts');
 *
 * 3. Multiple parallel requests:
 *    this.httpResource.resolveFromConfig([
 *      { url: 'users', key: 'users' },
 *      { url: 'posts', key: 'posts' }
 *    ]).subscribe();
 *
 * @performance_considerations
 * - State is maintained in memory (Map) - consider cleanup for long-running apps
 * - Each request creates signals - monitor memory usage with many concurrent requests
 * - ForkJoin for parallel requests waits for all to complete - consider race conditions
 * - Loading states are synchronous signals - minimal performance impact
 * - Avoid excessive state keys to prevent memory bloat
 * - Consider implementing a cleanup mechanism for unused states
 */

export const SKIP_LOADING = new HttpContextToken<boolean>(() => false);

export interface ResolverConfig<T = any> {
  url: string;
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: any;
  params?: Record<string, any>;
  getFromParams?: boolean;
  key?: string;
  skipLoading?: boolean;
}

@Injectable({ providedIn: "root" })
export class HttpResourceService implements Resolve<any> {
  private http = inject(HttpClient);
  private stateMap = new Map<
    string,
    {
      loading: WritableSignal<boolean>;
      error: WritableSignal<string | null>;
      data: WritableSignal<any>;
    }
  >();

  /**
   * Manually resolve one or multiple resolver configs
   * @description
   * Handles both single and multiple requests with automatic state management.
   * Can be used both in components and services for data fetching needs.
   *
   * @usage
   * // Single request
   * this.httpResource.resolveFromConfig({ url: 'users' });
   *
   * // Multiple requests
   * this.httpResource.resolveFromConfig([
   *   { url: 'users', key: 'users' },
   *   { url: 'posts', key: 'posts' }
   * ]);
   *
   * @performance_considerations
   * - Array inputs create multiple observables - be mindful of memory usage
   * - Each request maintains separate state - consider key naming strategy
   * - ForkJoin waits for all requests - may delay UI if one request is slow
   */
  resolveFromConfig(
    configs: ResolverConfig | ResolverConfig[],
    routeParams: Record<string, any> = {}
  ): Observable<any> {
    const isArray = Array.isArray(configs);
    const configArray = isArray ? configs : [configs];

    const results$ = configArray.map((config) => {
      const key = config.key || `resolver_${config.url}`;
      const id = config.getFromParams ? routeParams["id"] : undefined;
      const url = id ? `${config.url}/${id}` : config.url;

      return this.request(config.method || "GET", url, {
        body: config.body,
        params: config.params,
        context: config.skipLoading
          ? new HttpContext().set(SKIP_LOADING, true)
          : undefined,
        key,
      }).pipe(
        catchError((error) => {
          console.error(`[Resolver Error: ${key}]`, error);
          return of(null);
        })
      );
    });

    return isArray ? forkJoin(results$) : results$[0];
  }

  /**
   * Make HTTP requests with built-in state management
   * @description
   * Core method for making HTTP requests that automatically manages loading state,
   * error handling, and data storage using Angular signals.
   *
   * @usage
   * this.httpResource.request('GET', 'users', { key: 'users' })
   *   .subscribe();
   *
   * const state = this.httpResource.getState('users');
   *
   * @performance_considerations
   * - Each request creates/updates signals - lightweight but consider bulk operations
   * - Automatic URL construction adds minimal overhead
   * - Error handling pipeline adds slight processing overhead
   * - Consider using skipLoading for background refreshes to avoid UI updates
   */
  request<T>(
    method: string,
    endpoint: string,
    options: {
      body?: any;
      params?: Record<string, any>;
      context?: HttpContext;
      key?: string;
    } = {}
  ): Observable<T> {
    const key = options.key || `${method}_${endpoint}`;
    const url = `${environment.apiUrl}/${endpoint.replace(/^\/|\/$/g, "")}`;
    const params = this.buildParams(options.params);

    this.initState(key);

    return this.http
      .request<T>(method, url, {
        body: options.body,
        params,
        context: options.context,
      })
      .pipe(
        tap((response) => this.stateMap.get(key)!.data.set(response)),
        catchError((error) => this.handleError(error, key)),
        finalize(() => this.stateMap.get(key)!.loading.set(false))
      );
  }

  /**
   * Angular router resolver implementation
   * @description
   * Implements Angular's Resolve interface to fetch data before route activation.
   * Supports both single and multiple resolver configurations.
   *
   * @usage
   * // In route configuration:
   * {
   *   path: 'user/:id',
   *   component: UserComponent,
   *   resolve: { user: HttpResourceService },
   *   data: {
   *     resolver: {
   *       url: 'users',
   *       getFromParams: true
   *     }
   *   }
   * }
   *
   * @performance_considerations
   * - Route resolution blocks navigation - optimize request speed
   * - Consider lazy loading for non-critical data
   * - Complex resolver configurations may impact initial load performance
   */
  resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<any> | Promise<any> | any {
    const resolverConfig = route.data["resolver"] as
      | ResolverConfig
      | ResolverConfig[];

    if (!resolverConfig) return of(null);

    return Array.isArray(resolverConfig)
      ? forkJoin(
          resolverConfig.map((config) => this.resolveItem(config, route))
        )
      : this.resolveItem(resolverConfig, route);
  }

  /**
   * Get state signals for a given key
   * @description
   * Provides access to the reactive state (loading, error, data) for a request.
   * Automatically initializes state if it doesn't exist.
   *
   * @usage
   * const { loading, error, data } = this.httpResource.getState('users');
   *
   * @performance_considerations
   * - Initializes new signals if state doesn't exist - minimal overhead
   * - Signals are lightweight but consider cleanup for unused states
   * - Frequent access has minimal performance impact
   */
  getState<T>(key: string) {
    if (!this.stateMap.has(key)) {
      this.stateMap.set(key, {
        loading: signal(false),
        error: signal(null),
        data: signal<T | null>(null),
      });
    }
    return this.stateMap.get(key)!;
  }

  /**
   * Resolve a single route item
   * @param config Resolver configuration
   * @param route Current activated route
   * @returns Observable with resolved data
   */
  private resolveItem(
    config: ResolverConfig,
    route: ActivatedRouteSnapshot
  ): Observable<any> {
    const key = config.key || `resolver_${config.url}`;
    const id = config.getFromParams ? route.params["id"] : undefined;
    const url = id ? `${config.url}/${id}` : config.url;

    return this.request(config.method || "GET", url, {
      body: config.body,
      params: config.params,
      context: config.skipLoading
        ? new HttpContext().set(SKIP_LOADING, true)
        : undefined,
      key,
    }).pipe(catchError((error) => of(error))); // Continue even if there's an error
  }

  /**
   * Convert plain object to HttpParams
   * @param params Parameters object
   * @returns HttpParams instance
   */
  private buildParams(params?: Record<string, any>): HttpParams {
    let httpParams = new HttpParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value != null) httpParams = httpParams.append(key, String(value));
      });
    }
    return httpParams;
  }

  /**
   * Initialize state for a given key
   * @param key State identifier
   */
  private initState(key: string): void {
    if (!this.stateMap.has(key)) {
      this.stateMap.set(key, {
        loading: signal(true),
        error: signal(null),
        data: signal(null),
      });
    } else {
      const state = this.stateMap.get(key)!;
      state.loading.set(true);
      state.error.set(null);
    }
  }

  /**
   * Handle request errors and update state
   * @param error Error object
   * @param key State identifier
   * @returns Error observable
   */
  private handleError(error: any, key: string): Observable<never> {
    const errorMessage =
      error.error?.message || error.message || "Unknown error";
    this.stateMap.get(key)!.error.set(errorMessage);
    return throwError(() => errorMessage);
  }
}
