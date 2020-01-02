import { Injectable } from '@angular/core';
import { env } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

const LIBCAL_API_URL = env.libcalApiUrl;

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  constructor(private httpClient: HttpClient) {}

  // API: GET
  public get(url: string): Observable<any> {
    return this.httpClient.get(url);
  }

  // API: POST
  public post(url: string, body: {}): Observable<any> {
    return this.httpClient.post(url, body);
  }

  // API: GET LIBCAL
  public getLIBCAL(path: string): Observable<any> {
    return this.httpClient.get(LIBCAL_API_URL + path);
  }

  // API: POST LIBCAL
  public postLIBCAL(path: string, body: {}): Observable<any> {
    return this.httpClient.post(LIBCAL_API_URL + path, body);
  }
}
