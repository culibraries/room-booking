import { Injectable, Inject } from '@angular/core';
import { ApiService } from './api.service';
import { env } from '../../environments/environment';
import { LOCAL_STORAGE, StorageService } from 'ngx-webstorage-service';
import { EMPTY } from 'rxjs';
import { retry, catchError } from 'rxjs/operators';
@Injectable({
  providedIn: 'root',
})
export class LoggingService {
  constructor(
    private apiService: ApiService,
    @Inject(LOCAL_STORAGE) private storage: StorageService
  ) {}
  logError(message: string) {
    this.log(message, 'ERROR');
  }

  logInfo(message: string) {
    this.log(message, 'INFO');
  }

  logDebug(message: string) {
    this.log(message, 'DEBUG');
  }
  private log(message: string, type: string) {
    const now = new Date();
    const envType = env.production ? 'production' : 'dev';
    message =
      '[' +
      now.toLocaleString() +
      '], ' +
      envType +
      '.' +
      type +
      ', ' +
      this.storage.get('location_id') +
      '-' +
      this.storage.get('space_id') +
      ', ' +
      message;
    const body = {
      type,
      message,
    };
    if (env.production) {
      this.apiService.post(env.apiUrl + '/s3-logging/log', body).subscribe();
    } else {
      console.log(message);
    }
  }
  uploadLog() {
    if (env.production) {
      this.logDebug('upload log to S3');
      this.apiService.post(env.apiUrl + '/s3-logging/upload', {}).subscribe();
    }
  }
}
