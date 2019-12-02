import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material';

@Component({
  selector: 'app-dialog-error',
  templateUrl: './dialog-error.component.html',
  styleUrls: ['../main/main.component.css'],
})
export class DialogErrorComponent implements OnInit {
  constructor(private dialogRef: MatDialogRef<DialogErrorComponent>) {}

  ngOnInit() {}

  onTouchClose() {
    this.dialogRef.close();
  }
}
