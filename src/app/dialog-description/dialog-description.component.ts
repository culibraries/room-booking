import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

@Component({
  selector: 'app-dialog-description',
  templateUrl: './dialog-description.component.html',
  styleUrls: ['../main/main.component.css']
})

export class DialogDescriptionComponent implements OnInit {
  description = "";
  constructor(
    private dialogRef: MatDialogRef<DialogDescriptionComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) { }

  ngOnInit() {
    this.description = this.data.description;
  }
  onClose() {
    this.dialogRef.close();
  }

}
