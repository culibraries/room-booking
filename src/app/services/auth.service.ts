import { Injectable } from '@angular/core';
import { env } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { ApiService } from './api.service';
import { LoggingService } from './logging.service';
const userUrl = env.apiUrl + '/user/?format=json';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(
    private http: HttpClient,
    private apiService: ApiService,
    private log: LoggingService
  ) {}
  public isAuthenticated() {
    this.log.logDebug('Check Authentication');
    if (localStorage.hasOwnProperty('token')) {
      this.log.logDebug('token exists in localStorage');
      if (localStorage.hasOwnProperty('uid')) {
        this.apiService
          .get(
            env.apiUrl +
              '/catalog/data/catalog/roomBooking/?query={%22filter%22:{%22unique_id%22:%22' +
              localStorage.getItem('uid') +
              '%22}}'
          )
          .subscribe(res => {
            this.log.logDebug(
              'set location_id, space_id, hours_view_id into localStorage'
            );
            localStorage.setItem('location_id', res.results[0].location_id);
            localStorage.setItem('space_id', res.results[0].space_id);
            localStorage.setItem('hours_view_id', res.results[0].hours_view_id);
            return true;
          });
      }
    } else {
      this.log.logDebug('token does not exists in localStorage');
      return this.http.get(userUrl).subscribe(
        data => {
          this.log.logDebug('set token into localStorage');
          localStorage.setItem('token', data['authentication']['auth-token']);
          this.apiService
            .get(
              env.apiUrl +
                '/catalog/data/catalog/roomBooking/?query={%22filter%22:{%22unique_id%22:%22' +
                localStorage.getItem('uid') +
                '%22}}'
            )
            .subscribe(res => {
              this.log.logDebug(
                'set location_id, space_id, hours_view_id into localStorage'
              );
              localStorage.setItem('location_id', res.results[0].location_id);
              localStorage.setItem('space_id', res.results[0].space_id);
              localStorage.setItem(
                'hours_view_id',
                res.results[0].hours_view_id
              );
            });
        },
        err => this.login(),
        () => void 0
      );
    }
  }

  public getUserInformation() {
    return this.http.get(userUrl);
  }

  public login() {
    this.log.logDebug('redirect to login page');
    return (window.location.href =
      env.apiUrl + '/api-auth/login/?next=/room-booking/');
  }
}
