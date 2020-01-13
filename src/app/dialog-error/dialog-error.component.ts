import { Component, OnInit, Inject, OnDestroy } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

@Component({
  selector: 'app-dialog-error',
  templateUrl: './dialog-error.component.html',
})
export class DialogErrorComponent implements OnInit, OnDestroy {
  code: number;
  constructor(
    private dialogRef: MatDialogRef<DialogErrorComponent>,
    @Inject(MAT_DIALOG_DATA) private data: any
  ) {}

  ngOnInit() {
    this.code = this.data.code;
  }
  ngOnDestroy() {
    location.replace('/room-booking');
  }

  onClickOk() {
    this.dialogRef.close();
  }
}
