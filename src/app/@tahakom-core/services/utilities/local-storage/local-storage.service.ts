import { Injectable } from "@angular/core";
import { of, Observable } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class LocalStorageService {
  /**
   * Save items to local storage
   * By key, value pairs
   * @param key the name of property
   * @param value the value we need to store
   */
  setItem(key: string, value: string): void {
    return localStorage.setItem(key, value);
  }
  /**
   * Save items to local storage
   * By key, value pairs
   * @param key the name of property
   * @param value the value we need to store
   */
  setItemObservable(key: string, value: string): Observable<void> {
    return of(localStorage.setItem(key, value));
  }
  /**
   * Get the value from local storage for a given property
   * @param key the key of the item we need
   * @returns  the value of the given key
   */
  getItem(key: string): string | null {
    return localStorage.getItem(key);
  }
  /**
   * Get the value from local storage for a given property
   * @param key the key of the item we need
   * @returns  the value of the given key
   */
  getItemObservable(key: string): Observable<string | null> {
    return of(localStorage.getItem(key));
  }
  /**
   * Saves token to local storage
   * @param token token value to be saved
   */
  setToken(token: string): void {
    return localStorage.setItem("token", token);
  }
  /**
   * Get the token for the current active user
   * @returns User Token
   */
  getToken(): string | null {
    return localStorage.getItem("token");
  }
  /**
   * Get the token for the current active user
   * @returns User Token
   */
  getTokenObservable(): Observable<string | null> {
    return of(localStorage.getItem("token"));
  }
  /**
   * Clear the localStorage and active variables
   */
  clearStorage(): void {
    return localStorage.clear();
  }
  /**
   * Clear the localStorage and active variables
   */
  clearStorageObservable(): Observable<void> {
    return of(localStorage.clear());
  }
  /**
   * Removes item from local storage
   */
  removeItem(key: string): void {
    localStorage.removeItem(key);
  }
  // /**
  //  * @description Get the current language for the user
  //  * @returns Current Language
  //  */
  getLang(): string {
    return localStorage.getItem("lang") ?? "en";
  }
  // /**
  //  * @description Get the current language for the user
  //  * @returns Current Language
  //  */
  getLangObservable(): Observable<string> {
    return of(localStorage.getItem("lang") ?? "en");
  }
}
