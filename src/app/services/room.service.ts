import { Injectable } from '@angular/core';
import { Observable, interval } from 'rxjs';
import { ApiService } from './api.service';
import { map, startWith, switchMap } from 'rxjs/operators';
import { HttpHeaders } from '@angular/common/http';
import { Room } from '../models/room.model';

@Injectable({
  providedIn: 'root',
})
export class RoomService {
  constructor(private apiService: ApiService) {}
  getRoom(date: string, id: string): Observable<Room> {
    return this.apiService
      .getLIBCAL('/space/item/' + id + '?availability=' + date)
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

  getRoomInformation(id: string): Observable<Room> {
    return this.apiService
      .getLIBCAL('/space/item/' + id)
      .pipe(
        map(
          (data: any) =>
            new Room(
              data[0].id,
              data[0].name,
              data[0].capacity,
              data[0].description,
              []
            )
        )
      );
  }

  getAllCategories(): Observable<any> {
    return this.apiService
      .getLIBCAL('/space/categories/' + sessionStorage.getItem('location_id'))
      .pipe(map(data => data));
  }

  getAllRooms(category_id: number): Observable<any> {
    return this.apiService
      .getLIBCAL('/space/category/' + category_id + '?details=1')
      .pipe(map(data => data));
  }
}
