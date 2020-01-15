import { Component, OnInit, Inject, OnDestroy } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { LoggingService } from '../services/logging.service';

@Component({
  selector: 'app-dialog-error',
  templateUrl: './dialog-error.component.html',
})
export class DialogErrorComponent implements OnInit, OnDestroy {
  code: number;
  constructor(
    private dialogRef: MatDialogRef<DialogErrorComponent>,
    @Inject(MAT_DIALOG_DATA) private data: any,
    private log: LoggingService
  ) {}

  ngOnInit() {
    this.code = this.data.code;
    if (this.code === 400) {
      this.log.logDebug(
        'you are unable to book the room : exceeded limit or room has been booked.'
      );
    }
    if (this.code === 0) {
      this.log.logDebug(
        'you are unable to book the room : not undergraduate student.'
      );
    }
    if (this.code === 1) {
      this.log.logDebug('you are unable to book the room : system down');
    }
    if (this.code === 2) {
      this.log.logDebug(
        'you are unable to book the room : identikey is not recoginzed in the system.'
      );
    }
  }
  ngOnDestroy() {
    location.replace('/room-booking');
  }

  onClickOk() {
    this.dialogRef.close();
  }
}
