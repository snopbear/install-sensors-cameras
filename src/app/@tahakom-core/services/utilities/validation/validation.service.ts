/**
 * A service that provides form validation utilities including:
 * - Recursive validation error extraction
 * - Custom validator functions
 * - Form control comparison
 */

import { Injectable } from "@angular/core";
import { AbstractControl, FormArray, FormGroup, ValidationErrors, ValidatorFn } from "@angular/forms";

@Injectable({
  providedIn: "root",
})
export class ValidationService {
  constructor() {}

  /**
   * Recursively extracts validation errors from a FormGroup or FormArray
   * and formats them according to the provided validation messages.
   *
   * @param {FormGroup} group - The form group to validate
   * @param {object} validationMessages - Validation message configuration object
   * @returns {object} An object containing all validation errors in the form structure
   *
   * @example
   * const errors = validationService.getValidationErrors(myFormGroup, {
   *   username: {
   *     required: 'Username is required',
   *     minlength: 'Username must be at least 3 characters'
   *   }
   * });
   */
  getValidationErrors(group: FormGroup, validationMessages: any): any {
    let formErrors = {} as any;

    Object.keys(group.controls).forEach((key: string) => {
      const abstractControl = group.get(key);

      formErrors[key] = "";
      if (
        abstractControl &&
        !abstractControl.valid &&
        (abstractControl.touched || abstractControl.dirty)
      ) {
        const messages = validationMessages[key];

        for (const errorKey in abstractControl.errors) {
          if (errorKey) {
            formErrors[key] += messages[errorKey] + " ";
          }
        }
      }

      if (abstractControl instanceof FormGroup) {
        const groupError = this.getValidationErrors(
          abstractControl,
          validationMessages
        );
        formErrors = { ...formErrors, ...groupError };
      }

      if (abstractControl instanceof FormArray) {
        for (const control of abstractControl.controls) {
          if (control instanceof FormGroup) {
            const groupError = this.getValidationErrors(
              control,
              validationMessages
            );
            formErrors = { ...formErrors, ...groupError };
          }
        }
      }
    });
    return formErrors;
  }

  /**
   * Creates a custom validator function that checks if an email belongs to a specific domain
   *
   * @param {string} domainName - The required domain name (without @)
   * @returns {ValidatorFn} A validator function that returns null if valid or { emailDomain: true } if invalid
   *
   * @example
   * this.form = new FormGroup({
   *   email: new FormControl('', [this.validationService.emailDomain('example.com')])
   * });
   */
  emailDomain(domainName: string): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const email: string = control.value;
      if (!email) return null;

      const domain = email.substring(email.lastIndexOf("@") + 1);
      if (email === "" || domain.toLowerCase() === domainName.toLowerCase()) {
        return null;
      } else {
        return { emailDomain: true };
      }
    };
  }

  /**
   * Validator function that checks if two email fields in a FormGroup match
   *
   * @param {AbstractControl} group - The form group containing email and confirmEmail controls
   * @returns {ValidationErrors | null} Returns null if emails match or { emailMismatch: true } if they don't
   *
   * @example
   * this.form = new FormGroup({
   *   email: new FormControl(''),
   *   confirmEmail: new FormControl('')
   * }, { validators: [this.validationService.matchEmails] });
   */
  matchEmails(group: AbstractControl): ValidationErrors | null {
    const emailControl = group.get("email");
    const confirmEmailControl = group.get("confirmEmail");

    if (
      emailControl?.value === confirmEmailControl?.value ||
      confirmEmailControl?.pristine
    ) {
      return null;
    } else {
      return { emailMismatch: true };
    }
  }
}
