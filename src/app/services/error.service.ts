import { Injectable, ErrorHandler, Injector, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { MatDialog } from '@angular/material';
import { DialogErrorComponent } from '../dialog-error/dialog-error.component';
import { DialogDescriptionComponent } from '../dialog-description/dialog-description.component';
import { DialogConfirmationComponent } from '../dialog-confirmation/dialog-confirmation.component';

@Injectable({
  providedIn: 'root',
})
export class ErrorService implements ErrorHandler {
  constructor(
    private injector: Injector,
    private ngZone: NgZone,
    private dialog: MatDialog
  ) {}
  handleError(error: Error | HttpErrorResponse) {
    const router = this.injector.get(Router);
    if (error instanceof HttpErrorResponse) {
      let code = 0;
      if (!navigator.onLine) {
        code = 0;
      }
      if (error.status === 400) {
        this.dialog.closeAll();
        this.ngZone.run(() =>
          this.dialog.open(DialogErrorComponent, {
            width: '60%',
            height: '45%',
            panelClass: 'dialog-error',
          })
        );
      } else {
        code = error.status;
        this.ngZone.run(() => router.navigate(['system-error/' + code]));
      }
    } else {
    }
  }
}
