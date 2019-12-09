import { Injectable, Inject } from '@angular/core';
import { env } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { ApiService } from './api.service';
import { LoggingService } from './logging.service';
import { LOCAL_STORAGE, StorageService } from 'ngx-webstorage-service';

const userUrl = env.apiUrl + '/user/?format=json';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(
    private http: HttpClient,
    private apiService: ApiService,
    private log: LoggingService,
    @Inject(LOCAL_STORAGE) private storage: StorageService
  ) {}
  public isAuthenticated() {
    this.log.logDebug('Check Authentication');
    if (this.storage.has('token')) {
      this.log.logDebug('token exists in localStorage');
      if (this.storage.has('uid')) {
        this.log.logDebug('uid exists in localStorage');

        return this.apiService
          .get(
            env.apiUrl +
              '/catalog/data/catalog/roomBooking/?query={%22filter%22:{%22unique_id%22:%22' +
              this.storage.get('uid') +
              '%22}}'
          )
          .subscribe(res => {
            this.log.logDebug(
              'set location_id, space_id, hours_view_id into localStorage'
            );
            this.storage.set('location_id', res.results[0].location_id);
            this.storage.set('space_id', res.results[0].space_id);
            this.storage.set('hours_view_id', res.results[0].hours_view_id);
            return true;
          });
      } else {
      }
    } else {
      this.log.logDebug('token does not exists in localStorage');
      return this.http.get(userUrl).subscribe(
        data => {
          this.log.logDebug('set token into localStorage');
          this.storage.set('token', data['authentication']['auth-token']);
          this.apiService
            .get(
              env.apiUrl +
                '/catalog/data/catalog/roomBooking/?query={%22filter%22:{%22unique_id%22:%22' +
                this.storage.get('uid') +
                '%22}}'
            )
            .subscribe(res => {
              this.log.logDebug(
                'set location_id, space_id, hours_view_id into localStorage'
              );
              this.storage.set('location_id', res.results[0].location_id);
              this.storage.set('space_id', res.results[0].space_id);
              this.storage.set('hours_view_id', res.results[0].hours_view_id);
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
    // this.log.logDebug('redirect to login page');
    return (window.location.href =
      env.apiUrl + '/api-auth/login/?next=/room-booking/');
  }
}
