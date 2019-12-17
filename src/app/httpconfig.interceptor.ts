import { Injectable, Inject } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpResponse,
  HttpHandler,
  HttpErrorResponse,
  HttpSentEvent,
  HttpHeaderResponse,
  HttpProgressEvent,
  HttpUserEvent,
} from '@angular/common/http';
import { env } from '../environments/environment';

import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, switchMap, finalize, filter, take } from 'rxjs/operators';
import { LOCAL_STORAGE, StorageService } from 'ngx-webstorage-service';
import { ApiService } from './services/api.service';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material';
import { DialogErrorComponent } from './dialog-error/dialog-error.component';
import { LoggingService } from './services/logging.service';
const libcalTokenURL = env.apiUrl + '/room-booking/libcal/token';

@Injectable()
export class HttpConfigInterceptor implements HttpInterceptor {
  isRefreshingToken = false;
  tokenSubject: BehaviorSubject<string> = new BehaviorSubject<string>(null);
  constructor(
    @Inject(LOCAL_STORAGE) private storage: StorageService,
    private apiService: ApiService,
    private router: Router,
    private dialog: MatDialog,
    private log: LoggingService
  ) {}

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<
    | HttpSentEvent
    | HttpHeaderResponse
    | HttpProgressEvent
    | HttpResponse<any>
    | HttpUserEvent<any>
    | any
  > {
    {
      const token: string = this.storage.get('token');
      const libcal_token: string = this.storage.get('libcal_token');

      if (token && request.url.includes('libapps.colorado.edu/api')) {
        request = request.clone({
          headers: request.headers.set('Authorization', 'token ' + token),
        });
      }

      if (libcal_token && request.url.includes('colorado.libcal.com/1.1')) {
        request = request.clone({
          headers: request.headers.set(
            'Authorization',
            'Bearer ' + libcal_token
          ),
        });
      }

      if (!request.headers.has('Content-Type')) {
        request = request.clone({
          headers: request.headers.set('Content-Type', 'application/json'),
        });
      }

      request = request.clone({
        headers: request.headers.set('Accept', 'application/json'),
      });

      return next.handle(request).pipe(
        catchError(err => {
          if (err instanceof HttpErrorResponse) {
            switch (err.status) {
              case 401:
                this.log.logDebug(
                  'libcalToken Expired : Request new libcal token'
                );
                return this.handle401Error(request, next);
              case 400:
                this.dialog.closeAll();
                this.dialog.open(DialogErrorComponent, {
                  width: '65%',
                  height: 'auto',
                  data: {
                    code: 400,
                  },
                });
                return [];
              default:
                this.log.logError(err.message);
                return this.router.navigate(['system-error']);
            }
          } else {
            return throwError(err);
          }
        })
      );
    }
  }

  private handle401Error(request: HttpRequest<any>, next: HttpHandler) {
    if (!this.isRefreshingToken) {
      this.isRefreshingToken = true;

      this.tokenSubject.next(null);

      return this.apiService.post(libcalTokenURL, {}).pipe(
        switchMap((user: any) => {
          if (user) {
            this.tokenSubject.next(user.accessToken);
            this.storage.set('libcal_token', user.access_token);
            request = request.clone({
              headers: request.headers.set(
                'Authorization',
                'Bearer ' + user.access_token
              ),
            });
            return next.handle(request);
          }
          return;
        }),
        catchError(err => {
          return throwError;
        }),
        finalize(() => {
          this.isRefreshingToken = false;
        })
      );
    } else {
      this.isRefreshingToken = false;
      return this.tokenSubject.pipe(
        filter(token => token != null),
        take(1),
        switchMap(token => {
          request = request.clone({
            headers: request.headers.set('Authorization', 'Bearer ' + token),
          });
          return next.handle(request);
        })
      );
    }
  }
}
