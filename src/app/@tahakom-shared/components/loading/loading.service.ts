// loading.service.ts
import { inject, Injectable, signal } from "@angular/core";
import { Router } from "@angular/router";

@Injectable({
  providedIn: "root",
})
export class LoadingService {
  #loadingSignal = signal(false);
  #loadingCounter = 0; // Track number of active requests
  loading = this.#loadingSignal.asReadonly();

  router = inject(Router);

  loadingOn() {
    this.#loadingCounter++;
    console.log(`Loading counter increased to: ${this.#loadingCounter}`);
    
    // Only set loading to true if it's not already true
    if (!this.#loadingSignal()) {
      console.log("Loading turned ON");
      this.#loadingSignal.set(true);
    }
  }

  loadingOff() {
    if (this.#loadingCounter > 0) {
      this.#loadingCounter--;
    }
    console.log(`Loading counter decreased to: ${this.#loadingCounter}`);
    
    // Only turn off loading when ALL requests are complete
    if (this.#loadingCounter === 0) {
      console.log("Loading turned OFF");
      this.#loadingSignal.set(false);
    }
  }

  // Optional: Method to reset loading state (useful for error recovery)
  resetLoading() {
    this.#loadingCounter = 0;
    this.#loadingSignal.set(false);
    console.log("Loading state reset");
  }

  // Optional: Get current counter value for debugging
  getLoadingCounter() {
    return this.#loadingCounter;
  }
}

