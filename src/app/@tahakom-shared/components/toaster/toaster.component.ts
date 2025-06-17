import { Component } from "@angular/core";
import {
  trigger,
  state,
  style,
  transition,
  animate,
} from "@angular/animations";
import { ToasterService } from "./toaster-service/toaster.service";
import { IToast } from "./toaster-interface/toast";
import { CommonModule } from "@angular/common";

@Component({
  selector: "app-toaster",
  standalone: true,
  templateUrl: "./toaster.component.html",
  styleUrls: ["./toaster.component.css"],
  imports: [CommonModule],
  animations: [
    trigger("toastAnimation", [
      state(
        "void",
        style({
          opacity: 0,
          transform: "translateX(100%)",
        })
      ),
      state(
        "*",
        style({
          opacity: 1,
          transform: "translateX(0)",
        })
      ),
      transition(":enter", animate("300ms ease-out")),
      transition(":leave", animate("200ms ease-in")),
    ]),
  ],
})
export class ToasterComponent {
  constructor(public toasterService: ToasterService) {}

  getToastClass(toast: IToast): string {
    return `toast-${toast.type}`;
  }

  removeToast(toast: IToast): void {
    this.toasterService.remove(toast);
  }
}
