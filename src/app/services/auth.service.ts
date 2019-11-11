import { Injectable } from '@angular/core';
import { env } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

const userUrl = env.apiUrl + '/user/?format=json';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor(private http: HttpClient, private router: Router) { }
  public isAuthenticated(uid: string) {
    return this.http.get(userUrl).subscribe(
      data => {
        if (!data['groups'].includes('study-room-admin')) {
          this.router.navigate(['/error']);
          return false;
        } else {
          if (!localStorage.getItem('token') || localStorage.getItem('token') === 'undefined'
          ) {
            localStorage.setItem('token', data['authentication']['auth-token']);
          }
        }
      },
      err => this.login(uid),
      () => void 0
    );
  }

  public getUserInformation() {
    return this.http.get(userUrl);
  }

  public login(uid: string) {
    return (window.location.href =
      env.apiUrl + '/api-saml/sso/saml?next=room-booking/main/' + uid);
  }
}
