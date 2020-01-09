import { Injectable, Inject } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router,
} from '@angular/router';
import { Observable } from 'rxjs';
import { DeviceDetectorService } from 'ngx-device-detector';
import { LOCAL_STORAGE, StorageService } from 'ngx-webstorage-service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(
    private deviceService: DeviceDetectorService,
    @Inject(LOCAL_STORAGE) private storage: StorageService,
    private router: Router
  ) {}
  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    if (
      this.deviceService.getDeviceInfo().device === 'Android' &&
      this.deviceService.getDeviceInfo().os === 'Android' &&
      this.storage.has('token') &&
      this.storage.has('uid') &&
      this.storage.has('location_id') &&
      this.storage.has('space_id') &&
      this.storage.has('hours_view_id') &&
      this.storage.has('libcal_token')
    ) {
      return true;
    } else {
      this.router.navigate(['system-error']);
      return false;
    }
  }
}
