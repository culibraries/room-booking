import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { map, retryWhen, delay, take } from 'rxjs/operators';
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
        retryWhen(errors => errors.pipe(delay(1000), take(10))),
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
    return this.apiService.getLIBCAL('/space/item/' + id).pipe(
      retryWhen(errors => errors.pipe(delay(1000), take(10))),
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

  getAllCategories(location_id: string): Observable<any> {
    return this.apiService.getLIBCAL('/space/categories/' + location_id).pipe(
      retryWhen(errors => errors.pipe(delay(1000), take(10))),
      map(data => data)
    );
  }

  getAllRooms(category_id: number): Observable<any> {
    return this.apiService
      .getLIBCAL('/space/category/' + category_id + '?details=1')
      .pipe(
        retryWhen(errors => errors.pipe(delay(1000), take(10))),
        map(data => data)
      );
  }
}
