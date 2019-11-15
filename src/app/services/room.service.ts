import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { map } from 'rxjs/operators';
import { HttpHeaders } from '@angular/common/http';
import { Room } from '../models/room.model';

@Injectable({
  providedIn: 'root'
})
export class RoomService {
  constructor(private apiService: ApiService) { }
  getRoom(date: string): Observable<Room> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: 'Bearer' + ' ' + sessionStorage.getItem('libcal_token')
    });
    return this.apiService
      .getLIBCAL(
        '/space/item/' +
        sessionStorage.getItem('space_id') +
        '?availability=' +
        date,
        headers
      )
      .pipe(
        map(
          (data: any) =>
            new Room(
              data[0].id,
              data[0].name,
              data[0].capacity,
              data[0].description,
              data[0].availability
            )
        )
      );
  }

  getAllCategories(): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: 'Bearer' + ' ' + sessionStorage.getItem('libcal_token')
    });

    return this.apiService
      .getLIBCAL('/space/categories/' + sessionStorage.getItem('location_id'), headers)
      .pipe(map(data => data));
  }

  getAllRooms(category_id: number): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: 'Bearer' + ' ' + sessionStorage.getItem('libcal_token')
    });
    return this.apiService
      .getLIBCAL('/space/category/' + category_id + '?details=1', headers)
      .pipe(map(data => data));
  }
}
