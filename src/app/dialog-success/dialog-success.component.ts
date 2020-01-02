import { Component, OnInit, OnDestroy, Inject } from '@angular/core';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material';
import { delay } from '../config/delay';
@Component({
  selector: 'app-dialog-success',
  templateUrl: './dialog-success.component.html',
})
export class DialogSuccessComponent implements OnInit, OnDestroy {
  counter = delay.success_back_to_main_screen / 1000;
  runner: any;
  email = '';
  constructor(
    private dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) private data: any
  ) {}

  ngOnInit(): void {
    this.email = this.data.email;
    this.runner = setInterval(() => {
      this.counter -= 1;
      if (this.counter === 0) {
        clearInterval(this.runner);
        location.reload();
      }
    }, 1000);
  }

  onTouchClose(): void {
    this.dialog.closeAll();
  }

  ngOnDestroy(): void {
    this.dialog.closeAll();
    clearInterval(this.runner);
    location.reload();
  }
}
