import { Injectable, signal } from "@angular/core";
import { IToast } from "../toaster-interface/toast";


@Injectable({
  providedIn: "root",
})
export class ToasterService {
  private _toasts = signal<IToast[]>([]);
  public toasts = this._toasts.asReadonly();

  private defaultDuration = 5000; // 5 seconds

  show(toast: IToast): void {
    this._toasts.update((toasts:any) => [...toasts, toast]);

    // Auto-remove the toast after duration
    if (toast.duration !== 0) {
      const duration = toast.duration || this.defaultDuration;
      setTimeout(() => this.remove(toast), duration);
    }
  }

  success(message: string, duration?: number): void {
    this.show({ message, type: "success", duration });
  }

  error(message: string, duration?: number): void {
    this.show({ message, type: "error", duration });
  }

  info(message: string, duration?: number): void {
    this.show({ message, type: "info", duration });
  }

  warning(message: string, duration?: number): void {
    this.show({ message, type: "warning", duration });
  }

  primary(message: string, duration?: number): void {
    this.show({ message, type: "primary", duration });
  }

  light(message: string, duration?: number): void {
    this.show({ message, type: "light", duration });
  }

  dark(message: string, duration?: number): void {
    this.show({ message, type: "dark", duration });
  }

  remove(toast: IToast): void {
    this._toasts.update((toasts) => toasts.filter((t) => t !== toast));
  }

  clear(): void {
    this._toasts.set([]);
  }
}
