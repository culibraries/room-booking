import { Injectable, Inject } from '@angular/core';
import { env } from '../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, interval, throwError, of } from 'rxjs';
import { LOCAL_STORAGE, StorageService } from 'ngx-webstorage-service';
import { retry, retryWhen, map, scan, flatMap } from 'rxjs/operators';

const LIBCAL_API_URL = env.libcalApiUrl;
const libcalTokenURL = env.apiUrl + '/room-booking/libcal/token';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  // headers = new HttpHeaders({
  //   Authorization: 'token ' + this.storage.get('token'),
  // });

  // libcalHeaders = new HttpHeaders({
  //   'Content-Type': 'application/json',
  //   Authorization: 'Bearer' + ' ' + this.storage.get('libcal_token'),
  // });

  constructor(
    private httpClient: HttpClient,
    private apiService: ApiService,

    @Inject(LOCAL_STORAGE) private storage: StorageService
  ) {}

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
