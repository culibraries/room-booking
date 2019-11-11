import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material';

@Component({
  selector: 'app-dialog-success',
  templateUrl: './dialog-success.component.html',
  styleUrls: ['../main/main.component.css']
})
export class DialogSuccessComponent implements OnInit {

  constructor(private dialogRef: MatDialogRef<DialogSuccessComponent>) { }

  ngOnInit(): void {
    // setTimeout(() => {
    //   this.dialogRef.close();
    // }, 20000);
  }

  onTouchClose(): void {
    this.dialogRef.close();
  }

}
