import {Injectable, signal} from "@angular/core";
export type MessageSeverity = "error" | "warning" | "info" | "success";

export type Message = {
  severity: MessageSeverity;
  text: string;
};


@Injectable({
  providedIn: 'root'
})
export class MessagesService {

  #messageSignal = signal<Message | null>(null);

  message = this.#messageSignal.asReadonly();

  showMessage(text:string, severity: MessageSeverity) {
    this.#messageSignal.set({
      text, severity
    })
  }

  clear() {
    this.#messageSignal.set(null);
  }

}
