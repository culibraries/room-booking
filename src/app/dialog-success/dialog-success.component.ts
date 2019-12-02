import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatDialogRef, MatDialog } from '@angular/material';
import { interval } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-dialog-success',
  templateUrl: './dialog-success.component.html',
  styleUrls: ['../main/main.component.css'],
})
export class DialogSuccessComponent implements OnInit, OnDestroy {
  counter = 5;
  runner: any;
  constructor(
    private dialogRef: MatDialogRef<DialogSuccessComponent>,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
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
    clearInterval(this.runner);
  }
}
