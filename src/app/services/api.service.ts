import { Injectable } from '@angular/core';
import { env } from '../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

const LIBCAL_API_URL = env.libcalApiUrl;
const headers = new HttpHeaders({
  Authorization: 'token ' + localStorage.getItem('token')
});

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  constructor(private httpClient: HttpClient) { }

  // API: GET
  public get(url: string): Observable<any> {
    return this.httpClient.get(url, { headers });
  }

  // API: POST
  public post(url: string, body: {}): Observable<any> {
    return this.httpClient.post(url, body, { headers });
  }

  // API: GET LIBCAL
  public getLIBCAL(
    path: string,
    header: HttpHeaders = new HttpHeaders()
  ): Observable<any> {
    return this.httpClient.get(LIBCAL_API_URL + path, { headers: header });
  }

  // API: POST LIBCAL
  public postLIBCAL(
    path: string,
    body: {},
    header: HttpHeaders = new HttpHeaders()
  ): Observable<any> {
    return this.httpClient.post(LIBCAL_API_URL + path, body, {
      headers: header
    });
  }


}
