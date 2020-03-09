import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Hours } from '../models/hours.model';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class HoursService {
  constructor(private http: HttpClient) {}

  getLocationHours(hours_view_id: string): Observable<Hours> {
    return this.http
      .jsonp(
        'https://colorado.libcal.com/widget/hours/grid?format=jsonld&iid=3251&lid=' +
          hours_view_id,
        'callback'
      )
      .pipe(
        map((data: any) => {
          if (typeof data === 'object') {
            return new Hours(data.name, data.openingHoursSpecification);
          }
          return new Hours(
            JSON.parse(data).name,
            JSON.parse(data).openingHoursSpecification
          );
        })
      );
  }
}
