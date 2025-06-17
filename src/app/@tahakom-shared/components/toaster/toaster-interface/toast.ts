export type ToastType =
  | "success"
  | "error"
  | "info"
  | "warning"
  | "primary"
  | "light"
  | "dark";

export interface IToast {
  message: string;
  type: ToastType;
  duration?: number;
}
