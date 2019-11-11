import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { env } from '../../environments/environment';
import { text } from '../config/text';
@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  constructor(private apiService: ApiService) {}
  setConfig(uid: string): any {
    const url =
      env.apiUrl +
      '/catalog/data/catalog/roomBooking/?query={%22filter%22:{%22unique_id%22:%22' +
      uid +
      '%22}}';

    this.apiService.get(url).subscribe(res => {
      if (res.results.length > 0) {
        if (!res.results[0].active) {
          return alert(text.error_inactivate);
        }
        sessionStorage.setItem('hours_view_id', res.results[0].hours_view_id);
        sessionStorage.setItem('location_id', res.results[0].location_id);
        sessionStorage.setItem('space_id', res.results[0].space_id);
      } else {
        return alert(text.error_wrong_uid);
      }
    });
  }
  setToken(): any {
    const libcalURL = env.apiUrl + '/room-booking/libcal/token';
    this.apiService.post(libcalURL, {}).subscribe(res => {
      sessionStorage.setItem('libcal_token', res.access_token);
    });
  }
}
