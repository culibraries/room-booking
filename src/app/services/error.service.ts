import {
  Injectable,
  ErrorHandler,
  Injector,
  NgZone,
  Inject,
} from '@angular/core';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';

import { LoggingService } from './logging.service';
import { ApiService } from './api.service';
import { env } from '../../environments/environment';
import { LOCAL_STORAGE, StorageService } from 'ngx-webstorage-service';

const libcalTokenURL = env.apiUrl + '/room-booking/libcal/token';

@Injectable({
  providedIn: 'root',
})
export class ErrorService implements ErrorHandler {
  constructor(
    private injector: Injector,
    private ngZone: NgZone,
    private log: LoggingService,
    private apiService: ApiService,
    @Inject(LOCAL_STORAGE) private storage: StorageService
  ) {}
  handleError(error: Error | HttpErrorResponse) {
    const router = this.injector.get(Router);
    if (error instanceof HttpErrorResponse) {
      this.log.logError(error.status + ',' + error.message);
      let code = 0;
      if (!navigator.onLine) {
        code = 0;
      } else {
        code = error.status;
      }

      if (code !== 400 && code !== 401) {
        this.ngZone.run(() => router.navigate(['system-error/' + code]));
      }

      if (code === 401) {
        console.log('error here');
        // this.apiService.post(libcalTokenURL, {}).subscribe(res => {
        //   console.log(res.access_token);
        //   // this.storage.set('libcal_token', res.access_token);
        // });
      }
    }
  }
}
