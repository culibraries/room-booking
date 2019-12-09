import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material';
import { delay } from '../config/delay';

@Component({
  selector: 'app-dialog-error',
  templateUrl: './dialog-error.component.html',
  styleUrls: ['../main/main.component.css'],
})
export class DialogErrorComponent implements OnInit {
  timeOut: any;
  constructor(private dialogRef: MatDialogRef<DialogErrorComponent>) {}

  ngOnInit() {
    this.timeOut = setTimeout(() => {
      this.dialogRef.close();
    }, delay.inactivities_timeout);
  }

  onTouchClose() {
    clearTimeout(this.timeOut);
    this.dialogRef.close();
  }
}
