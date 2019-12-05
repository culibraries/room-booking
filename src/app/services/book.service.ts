import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { env } from '../../environments/environment';
import { map } from 'rxjs/operators';
import { HttpHeaders } from '@angular/common/http';
import { of } from 'rxjs';
import { catchError } from 'rxjs/operators';
@Injectable({
  providedIn: 'root',
})
export class BookService {
  constructor(private apiService: ApiService) {}

  getIDInformation(id: string): any {
    return this.apiService
      .get(env.apiUrl + '/room-booking/sierra/search?format=json&key=' + id)
      .pipe(map(data => data));
  }

  bookRoom(body: {}): any {
    return this.apiService
      .postLIBCAL('/space/reserve', body)
      .pipe(map(data => data));
  }
}
