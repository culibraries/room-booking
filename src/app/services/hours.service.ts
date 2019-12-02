import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map, debounceTime } from 'rxjs/operators';
import { Hours } from '../models/hours.model';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class HoursService {
  constructor(private http: HttpClient) {}

  // getLocationHours(hoursViewId: string, date: string): Observable<Hours> {
  //   return this.apiService
  //     .getLIBCAL('/hours/' + hoursViewId + '?&from=' + date + '&to=' + date)
  //     .pipe(map((data: any) => new Hours(data[0].name, data[0].dates)));
  // }

  getLocationHours(): Observable<Hours> {
    return this.http
      .jsonp(
        'https://api3.libcal.com/api_hours_grid.php?format=jsonld&iid=3251&lid=' +
          sessionStorage.getItem('hours_view_id'),
        'callback'
      )
      .pipe(
        map((data: any) => new Hours(data.name, data.openingHoursSpecification))
      );
  }
}
