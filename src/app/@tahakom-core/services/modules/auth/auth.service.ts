import { Injectable, computed, effect, inject, signal } from "@angular/core";
import { Router } from "@angular/router";
import { User } from "@models/interfaces/user/user";
import { JwtHelperService } from "@auth0/angular-jwt";
import {
  Observable,
  of,
  throwError,
  timer,
  EMPTY,
  BehaviorSubject,
} from "rxjs";
import { switchMap, catchError, tap, filter, take } from "rxjs/operators";
import { environment } from "src/environments/environment";
import { HttpResourceService } from "@services/utilities/http-calls/http-calls-observable.service";

export interface AuthState {
  user: User | null;
  status: AuthStatus;
  error: string | null;
  tokenRefreshInProgress: boolean;
}
export type AuthStatus = "idle" | "loading" | "success" | "error";

@Injectable({
  providedIn: "root",
})
export class AuthService {
  private http = inject(HttpResourceService);
  private router = inject(Router);
  private jwtHelper = inject(JwtHelperService);
  private tokenRefreshSubject = new BehaviorSubject<boolean>(false);

  private baseUrl = environment.apiUrl;
  private endPoints = {
    login: "auth/login",
  };

  // State management with signals
  private state = signal<AuthState>({
    user: null,
    status: "idle",
    error: null,
    tokenRefreshInProgress: false,
  });

  // Computed values
  // Public computed signals
  public user = computed(() => this.state().user);
  public roles = computed(() => {
    const token = this.state().user?.token;
    return token ? this.jwtHelper.decodeToken(token).roles || [] : [];
  });
  public isAuthenticated = computed(() => {
    const token = this.state().user?.token;
    return !!token && !this.jwtHelper.isTokenExpired(token);
  });
  public status = computed(() => this.state().status);
  public error = computed(() => this.state().error);

  // Auto-redirect effect
  private authEffect = effect(() => {
    if (this.isAuthenticated()) {
      const redirectUrl =
        localStorage.getItem("auth_redirect_url") || "/dashboard";
      localStorage.removeItem("auth_redirect_url");
      this.router.navigateByUrl(redirectUrl);
      this.scheduleTokenRefresh();
    } else if (
      !this.state().tokenRefreshInProgress &&
      !this.router.url.startsWith("/auth")
    ) {
      localStorage.setItem("auth_redirect_url", this.router.url);
      this.router.navigate(["/auth/login"]);
    }
  });

  // Role checking methods
  hasRole(role: string | string[]): boolean {
    const userRoles = this.roles();
    if (Array.isArray(role)) {
      return role.some((r) => userRoles.includes(r));
    }
    return userRoles.includes(role);
  }

  hasAnyRole(roles: string[]): boolean {
    return roles.some((role) => this.hasRole(role));
  }

  // Login/logout methods
  login(
    credentials: { username: string; password: string },
    rememberMe = false
  ): Observable<User> {
    this.state.update((s) => ({ ...s, status: "loading", error: null }));

    // Replace with actual HTTP call: return this.http.post<User>(`${this.baseUrl}/${this.endPoints.login}`, credentials);
    return of(null).pipe(
      switchMap(() => {
        // Simulate API call delay
        return timer(1000).pipe(
          switchMap(() => {
            // For demo purposes - create fake user
            const fakeUser: User = {
              id: "123",
              username: credentials.username,
              email: `${credentials.username}@example.com`,
              token: "fake-jwt-token",
              refreshToken: "fake-refresh-token",
              roles: ["user"],
              firstName: "",
              lastName: "",
              city: [],
              area: [],
            };

            // Add admin role if username contains 'admin'
            if (credentials.username.includes("admin")) {
              fakeUser.roles?.push("admin");
            }

            return of(fakeUser);
          })
        );
      }),
      tap((user) => {
        this.setUser(user, rememberMe);
        this.state.update((s) => ({ ...s, user, status: "success" }));
        this.scheduleTokenRefresh();
      }),
      catchError((error) => {
        this.state.update((s) => ({
          ...s,
          status: "error",
          error: this.getErrorMessage(error),
        }));
        return throwError(() => error);
      })
    );
  }

  logout(): Observable<void> {
    return of(null).pipe(
      tap(() => {
        this.tokenRefreshSubject.next(false);
        this.clearUser();
        this.state.update((s) => ({
          ...s,
          user: null,
          status: "idle",
          error: null,
        }));
      }),
      switchMap(() => EMPTY)
    );
  }

  // Token management
  private scheduleTokenRefresh(): void {
    const token = this.state().user?.token;
    if (!token) return;

    const expirationDate = this.jwtHelper.getTokenExpirationDate(token);
    if (!expirationDate) return;

    const expiresIn = expirationDate.getTime() - Date.now() - 60000; // 1 min before expiry

    if (expiresIn > 0) {
      timer(expiresIn)
        .pipe(
          take(1),
          switchMap(() => this.refreshToken()),
          catchError(() => EMPTY)
        )
        .subscribe();
    } else {
      this.refreshToken().subscribe();
    }
  }

  private refreshToken(): Observable<User> {
    if (!this.state().user?.refreshToken) {
      return throwError(() => new Error("No refresh token available"));
    }

    this.state.update((s) => ({ ...s, tokenRefreshInProgress: true }));
    this.tokenRefreshSubject.next(true);

    // Replace with actual refresh token API call
    // return this.http.post<{token: string}>(`${this.baseUrl}/auth/refresh`, {refreshToken: this.state().user?.refreshToken});
    return timer(500).pipe(
      switchMap(() => {
        const newToken = "fake-new-jwt-token";
        const currentUser = { ...this.state().user!, token: newToken };
        return of(currentUser);
      }),
      tap((user) => {
        this.setUser(user);
        this.state.update((s) => ({
          ...s,
          user,
          tokenRefreshInProgress: false,
        }));
        this.tokenRefreshSubject.next(false);
        this.scheduleTokenRefresh();
      }),
      catchError((error) => {
        this.clearUser();
        this.state.update((s) => ({
          ...s,
          user: null,
          status: "error",
          error: "Session expired. Please login again.",
          tokenRefreshInProgress: false,
        }));
        this.tokenRefreshSubject.next(false);
        return throwError(() => error);
      })
    );
  }

  // Observable for token refresh status
  get tokenRefreshInProgress$(): Observable<boolean> {
    return this.tokenRefreshSubject.asObservable();
  }

  // Storage helpers
  private setUser(user: User, rememberMe = false): void {
    rememberMe
      ? localStorage.setItem("currentUser", JSON.stringify(user))
      : sessionStorage.setItem("currentUser", JSON.stringify(user));
  }

  private getUserFromStorage(): User | null {
    const user =
      localStorage.getItem("currentUser") ||
      sessionStorage.getItem("currentUser");
    return user ? JSON.parse(user) : null;
  }

  private clearUser(): void {
    localStorage.removeItem("currentUser");
    sessionStorage.removeItem("currentUser");
    localStorage.removeItem("auth_redirect_url");
  }

  private getErrorMessage(error: unknown): string {
    if (error instanceof Error) return error.message;
    if (typeof error === "string") return error;
    return "An unknown error occurred";
  }

  // Initialize auth state
  initialize(): Observable<void> {
    return of(null).pipe(
      switchMap(() => {
        const user = this.getUserFromStorage();
        if (user?.token) {
          if (this.jwtHelper.isTokenExpired(user.token)) {
            if (user.refreshToken) {
              return this.refreshToken().pipe(
                switchMap(() => EMPTY),
                catchError(() => {
                  this.clearUser();
                  return EMPTY;
                })
              );
            }
            this.clearUser();
          } else {
            this.state.update((s) => ({ ...s, user }));
            this.scheduleTokenRefresh();
          }
        }
        return EMPTY;
      })
    );
  }
}
