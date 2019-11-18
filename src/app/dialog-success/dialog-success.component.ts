import { Component, OnInit } from '@angular/core';
import { MatDialogRef, MatDialog } from '@angular/material';
import { interval } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-dialog-success',
  templateUrl: './dialog-success.component.html',
  styleUrls: ['../main/main.component.css']
})
export class DialogSuccessComponent implements OnInit {
  counter = 10;
  constructor(
    private dialogRef: MatDialogRef<DialogSuccessComponent>,
    private dialog: MatDialog,
  ) { }

  ngOnInit(): void {
    setTimeout(() => {
      this.dialogRef.close();
    }, 10000);
  }


  onTouchClose(): void {
    this.dialog.closeAll();
  }
}
