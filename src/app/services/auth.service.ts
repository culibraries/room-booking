import { Injectable } from '@angular/core';
import { env } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { ApiService } from './api.service';
const userUrl = env.apiUrl + '/user/?format=json';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(private http: HttpClient, private apiService: ApiService) {}
  public isAuthenticated() {
    if (localStorage.hasOwnProperty('token')) {
      this.setUpRoomInformation();
      return true;
    } else {
      return this.http.get(userUrl).subscribe(
        data => {
          localStorage.setItem('token', data['authentication']['auth-token']);
          this.setUpRoomInformation();
        },
        err => this.login(),
        () => void 0
      );
    }
  }

  setUpRoomInformation() {
    if (localStorage.hasOwnProperty('uid')) {
      this.apiService
        .get(
          env.apiUrl +
            '/catalog/data/catalog/roomBooking/?query={%22filter%22:{%22unique_id%22:%22' +
            localStorage.getItem('uid') +
            '%22}}'
        )
        .subscribe(res => {
          localStorage.setItem('location_id', res.results[0].location_id);
          localStorage.setItem('space_id', res.results[0].space_id);
          localStorage.setItem('hours_view_id', res.results[0].hours_view_id);
        });
    }
  }

  public getUserInformation() {
    return this.http.get(userUrl);
  }

  public login() {
    return (window.location.href =
      env.apiUrl + '/api-auth/login/?next=/room-booking/');
  }
}
