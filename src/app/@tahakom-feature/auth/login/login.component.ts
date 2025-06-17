import { Component, computed, effect, inject, OnInit } from "@angular/core";
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { Router, RouterLink } from "@angular/router";
import { AuthService } from "@services/modules/auth/auth.service";
import loginComponentsImports from "./login.component.imports";
import { CommonModule } from "@angular/common";
import { ValidationService } from "@services/utilities/validation/validation.service";

@Component({
  selector: "app-login",
  templateUrl: "./login.component.html",
  styleUrls: ["./login.component.scss"],
  imports: [
    loginComponentsImports,
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    RouterLink,
  ],
  standalone: true,
})
export class LoginComponent implements OnInit {
  _formBuilder = inject(FormBuilder);
  _authService = inject(AuthService);
  _validationService = inject(ValidationService);
  _router = inject(Router);

  // In LoginComponent class
  authStatus = this._authService.status;
  authError = this._authService.error;
  isAuthenticated = this._authService.isAuthenticated;

  rememberMe = false;
  showPassword = false;

  _loginForm!: FormGroup;

  _formErrors = {} as any;

  _validationMessages: any = {
    username: {
      required: "Username is required.",
    },
    password: {
      required: "Password is required.",
    },
  };

  logValidationErrors() {
    this._formErrors = this._validationService.getValidationErrors(
      this._loginForm,
      this._validationMessages
    );
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }
  constructor() {
    this._loginForm = this._formBuilder.group({
      username: ["", [Validators.required]],
      password: ["", [Validators.required]],
    });
  }

  async onSubmit() {
    if (this._loginForm.invalid) {
      this._loginForm.markAllAsTouched();
      this.logValidationErrors();
      return;
    }
    try {
      const success = await this._authService.login(
        this._loginForm.value as { username: string; password: string },
        this.rememberMe // Pass rememberMe to the service
      );
      if (success) {
        this._router.navigate(["/install-cameras"]);
      }
    } catch (error) {
      // Error is already handled by AuthService
      this._loginForm.reset();
      this._loginForm.get("password")?.setErrors(null);
    }
  }

  ngOnInit() {
    if (this.isAuthenticated()) {
      // User is already logged in, redirect to dashboard
      this._router.navigate(["/install-cameras"]);
    }
  }
}
