import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';


@Injectable({
  providedIn: 'root'
})
export class GraphService {
  private readonly graphEndpoint = 'https://graph.microsoft.com/v1.0';
  
  private http = inject(HttpClient);

  /**
   * Get user profile information from Microsoft Graph
   */
  getUserProfile(): Observable<any> {
    return this.callGraphAPI('/me');
  }

  /**
   * Get user's photo from Microsoft Graph
   */
  getUserPhoto(): Observable<Blob> {
    const headers = this.getAuthHeaders();
    return this.http.get(`${this.graphEndpoint}/me/photo/$value`, {
      headers,
      responseType: 'blob'
    }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Get user's manager information
   */
  getUserManager(): Observable<any> {
    return this.callGraphAPI('/me/manager');
  }

  /**
   * Get user's direct reports
   */
  getUserDirectReports(): Observable<any> {
    return this.callGraphAPI('/me/directReports');
  }

  /**
   * Get user's calendar events
   */
  getUserCalendarEvents(top: number = 10): Observable<any> {
    return this.callGraphAPI(`/me/events?$top=${top}&$orderby=start/dateTime`);
  }

  /**
   * Generic method to call Microsoft Graph API
   */
  private callGraphAPI(endpoint: string): Observable<any> {
    const headers = this.getAuthHeaders();
    
    return this.http.get(`${this.graphEndpoint}${endpoint}`, { headers })
      .pipe(
        map(response => response),
        catchError(this.handleError)
      );
  }

  /**
   * Get authentication headers with access token
   */
  private getAuthHeaders(): HttpHeaders {
    // MSAL removido: Retorna apenas Content-Type
    return new HttpHeaders({
      'Content-Type': 'application/json'
    });
  }

  /**
   * Acquire access token silently for Microsoft Graph
   */
  // getAccessToken removido (MSAL)

  /**
   * Handle HTTP errors
   */
  private handleError(error: any): Observable<never> {
    let errorMessage = 'An error occurred';
    
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side error
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    
    console.error('GraphService Error:', errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}
