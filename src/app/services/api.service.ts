import { Injectable } from '@angular/core';
import { env } from '../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

const API_URL = env.apiUrl;
const LIBCAL_API_URL = env.libcalApiUrl;
const headers = new HttpHeaders({
  Authorization: 'token ' + localStorage.getItem('token')
});
@Injectable({
  providedIn: 'root'
})
export class ApiService {
  constructor(private httpClient: HttpClient) {}

  // API: GET
  public get(path: string): Observable<any> {
    return this.httpClient.get(LIBCAL_API_URL + path, { headers });
  }

  // API: POST
  public post(path: string, body: {}): Observable<any> {
    return this.httpClient.post(LIBCAL_API_URL + path, body, { headers });
  }

  // API: DELETE
  public delete(path: string): Observable<any> {
    return this.httpClient.delete(API_URL + path);
  }

  // API: PUT
  public put(path: string, body: {}): Observable<any> {
    return this.httpClient.put(API_URL + path, body);
  }

  // API: GET WITHOUT DEFAULT URL
  public getWODURL(
    path: string,
    header: HttpHeaders = new HttpHeaders()
  ): Observable<any> {
    return this.httpClient.get(path, { headers: header });
  }

  // API: POST WITHOUT DEFAULT URL
  public postWODURL(path: string, body: {}): Observable<any> {
    return this.httpClient.post(path, body);
  }
}
