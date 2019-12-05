import { Injectable } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
} from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { DeviceDetectorService } from 'ngx-device-detector';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(
    private auth: AuthService,
    private deviceService: DeviceDetectorService
  ) {}
  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    // if (
    //   this.deviceService.getDeviceInfo().device === 'Android' &&
    //   this.deviceService.getDeviceInfo().os === 'Android'
    // ) {
    if (this.auth.isAuthenticated()) {
      return true;
    } else {
      return false;
    }
    // } else {
    //   // error handle if this is not a tablet
    // }
  }
}
