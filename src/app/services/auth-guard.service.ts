import { Injectable, Inject } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
} from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { DeviceDetectorService } from 'ngx-device-detector';
import { LOCAL_STORAGE, StorageService } from 'ngx-webstorage-service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(
    private auth: AuthService,
    private deviceService: DeviceDetectorService,
    @Inject(LOCAL_STORAGE) private storage: StorageService
  ) {}
  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    return true;
    // if (
    //   this.deviceService.getDeviceInfo().device === 'Android' &&
    //   this.deviceService.getDeviceInfo().os === 'Android'
    // ) {

    // if (this.storage.has('token') && this.storage.has('uid') && this.storage.has('space_id') && this.storage.has('hours_view_id') && this.storage.has('locatin_id'))

    // } else {
    //   // error handle if this is not a tablet
    // }
  }
}
