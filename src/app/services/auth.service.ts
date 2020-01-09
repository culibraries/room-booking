import { Injectable } from '@angular/core';
import { env } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
const userUrl = env.apiUrl + '/user/?format=json';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(private http: HttpClient) {}
  public isAuthenticated() {
    return this.http.get(userUrl).subscribe(
      data => {
        if (!data['groups'].includes('study-room-admin')) {
          alert('You are not authenticated !');
          return false;
        } else {
          if (
            !sessionStorage.getItem('token') ||
            sessionStorage.getItem('token') === 'undefined'
          ) {
            sessionStorage.setItem(
              'token',
              data['authentication']['auth-token']
            );
            location.replace('/room-booking-accessibility-testing/');
          }
        }
      },
      err => this.login(),
      () => void 0
    );
  }

  public getUserInformation() {
    return this.http.get(userUrl);
  }

  public login() {
    return (window.location.href =
      env.apiUrl + '/api-auth/login/?next=/room-booking-accessibility-testing');
  }
}
