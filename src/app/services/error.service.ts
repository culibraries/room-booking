import { Injectable, ErrorHandler, Injector, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { MatDialog } from '@angular/material';
import { DialogErrorComponent } from '../dialog-error/dialog-error.component';
import { DialogDescriptionComponent } from '../dialog-description/dialog-description.component';
import { DialogConfirmationComponent } from '../dialog-confirmation/dialog-confirmation.component';
import { LoggingService } from './logging.service';

@Injectable({
  providedIn: 'root',
})
export class ErrorService implements ErrorHandler {
  constructor(
    private injector: Injector,
    private ngZone: NgZone,
    private log: LoggingService
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
      if (code !== 400) {
        this.ngZone.run(() => router.navigate(['system-error/' + code]));
      }
    }
  }
}
