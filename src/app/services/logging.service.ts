import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { env } from '../../environments/environment';
@Injectable({
  providedIn: 'root',
})
export class LoggingService {
  constructor(private apiService: ApiService) {}
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
      message;
    const body = {
      type,
      message,
    };
    if (env.production) {
      this.apiService
        .post(env.apiUrl + '/api/s3-logging/log', body)
        .subscribe();
    } else {
      console.log(message);
    }
  }
}
