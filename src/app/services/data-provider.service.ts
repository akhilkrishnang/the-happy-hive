import { Injectable, inject } from '@angular/core';
import {
  HttpClient,
  HttpHeaders,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import {
  HiveItem,
  CreateHiveItemRequest,
  UpdateHiveItemRequest,
  Spotlight,
  CreateSpotlightRequest,
  UpdateSpotlightRequest,
  ApiResponse,
} from '../types/api.types';

/**
 * DataProviderService
 *
 * A centralized service for making HTTP requests to the Happy-Hive API.
 * Handles all communication with both happy-hive and spotlight endpoints.
 *
 * The server is expected to be running at http://localhost:3000
 */
@Injectable({
  providedIn: 'root',
})
export class DataProviderService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiBaseUrl;
  private readonly happyHiveEndpoint = `${this.baseUrl}/happy-hive`;
  private readonly spotlightEndpoint = `${this.baseUrl}/spotlight`;

  private readonly httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
    }),
  };

  /**
   * HAPPY-HIVE ENDPOINTS
   */

  /**
   * Get all hive items
   */
  getHiveItems(): Observable<HiveItem[]> {
    // Add cache-busting parameter to force fresh data
    const url = `${this.happyHiveEndpoint}?t=${Date.now()}`;
    return this.http
      .get<ApiResponse<HiveItem[]>>(url, this.httpOptions)
      .pipe(
        map(response => response.data || []),
        catchError(this.handleError)
      );
  }

  /**
   * Get a single hive item by ID
   */
  getHiveItem(id: number): Observable<HiveItem> {
    const url = `${this.happyHiveEndpoint}/${id}?t=${Date.now()}`;
    return this.http
      .get<ApiResponse<HiveItem>>(
        url,
        this.httpOptions
      )
      .pipe(
        map(response => response.data!),
        catchError(this.handleError)
      );
  }

  /**
   * Create a new hive item
   */
  createHiveItem(item: CreateHiveItemRequest): Observable<HiveItem> {
    return this.http
      .post<ApiResponse<HiveItem>>(
        this.happyHiveEndpoint,
        item,
        this.httpOptions
      )
      .pipe(
        map(response => response.data!),
        catchError(this.handleError)
      );
  }

  /**
   * Update an existing hive item
   */
  updateHiveItem(
    id: number,
    item: UpdateHiveItemRequest
  ): Observable<HiveItem> {
    return this.http
      .put<ApiResponse<HiveItem>>(
        `${this.happyHiveEndpoint}/${id}`,
        item,
        this.httpOptions
      )
      .pipe(
        map(response => response.data!),
        catchError(this.handleError)
      );
  }

  /**
   * Delete a hive item
   */
  deleteHiveItem(id: number): Observable<void> {
    return this.http
      .delete<ApiResponse<void>>(
        `${this.happyHiveEndpoint}/${id}`,
        this.httpOptions
      )
      .pipe(
        map(() => undefined),
        catchError(this.handleError)
      );
  }

  /**
   * SPOTLIGHT ENDPOINTS
   */

  /**
   * Get all non-expired spotlights
   */
  getSpotlights(): Observable<Spotlight[]> {
    const url = `${this.spotlightEndpoint}?t=${Date.now()}`;
    return this.http
      .get<ApiResponse<Spotlight[]>>(url, this.httpOptions)
      .pipe(
        map(response => response.data || []),
        catchError(this.handleError)
      );
  }

  /**
   * Get all spotlights including expired (admin)
   */
  getAllSpotlightsAdmin(): Observable<Spotlight[]> {
    const url = `${this.spotlightEndpoint}/admin/all?t=${Date.now()}`;
    return this.http
      .get<ApiResponse<Spotlight[]>>(
        url,
        this.httpOptions
      )
      .pipe(
        map(response => response.data || []),
        catchError(this.handleError)
      );
  }

  /**
   * Get spotlights by type
   */
  getSpotlightsByType(type: string): Observable<Spotlight[]> {
    const url = `${this.spotlightEndpoint}/type/${encodeURIComponent(type)}?t=${Date.now()}`;
    return this.http
      .get<ApiResponse<Spotlight[]>>(
        url,
        this.httpOptions
      )
      .pipe(
        map(response => response.data || []),
        catchError(this.handleError)
      );
  }

  /**
   * Get a single spotlight by ID
   */
  getSpotlight(id: number): Observable<Spotlight> {
    const url = `${this.spotlightEndpoint}/${id}?t=${Date.now()}`;
    return this.http
      .get<ApiResponse<Spotlight>>(
        url,
        this.httpOptions
      )
      .pipe(
        map(response => response.data!),
        catchError(this.handleError)
      );
  }

  /**
   * Create a new spotlight
   */
  createSpotlight(
    spotlight: CreateSpotlightRequest
  ): Observable<Spotlight> {
    return this.http
      .post<ApiResponse<Spotlight>>(
        this.spotlightEndpoint,
        spotlight,
        this.httpOptions
      )
      .pipe(
        map(response => response.data!),
        catchError(this.handleError)
      );
  }

  /**
   * Update an existing spotlight
   */
  updateSpotlight(
    id: number,
    spotlight: UpdateSpotlightRequest
  ): Observable<Spotlight> {
    return this.http
      .put<ApiResponse<Spotlight>>(
        `${this.spotlightEndpoint}/${id}`,
        spotlight,
        this.httpOptions
      )
      .pipe(
        map(response => response.data!),
        catchError(this.handleError)
      );
  }

  /**
   * Delete a spotlight
   */
  deleteSpotlight(id: number): Observable<void> {
    return this.http
      .delete<ApiResponse<void>>(
        `${this.spotlightEndpoint}/${id}`,
        this.httpOptions
      )
      .pipe(
        map(() => undefined),
        catchError(this.handleError)
      );
  }

  /**
   * Error handling
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An unknown error occurred';

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side error
      errorMessage =
        error.error?.error ||
        `Server returned code ${error.status}: ${error.statusText}`;
    }

    console.error('API Error:', errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}
