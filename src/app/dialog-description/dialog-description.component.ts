import { Component, OnInit, Inject, HostListener } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { Subject } from 'rxjs';
import { delay } from '../config/delay';

@Component({
  selector: 'app-dialog-description',
  templateUrl: './dialog-description.component.html',
  styleUrls: ['../main/main.component.css'],
})
export class DialogDescriptionComponent implements OnInit {
  description = '';
  userActivity: any;
  userInactive: Subject<any> = new Subject();
  constructor(
    private dialogRef: MatDialogRef<DialogDescriptionComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.setTimeout();
    this.userInactive.subscribe(() => {
      this.dialogRef.close();
    });
  }

  setTimeout() {
    this.userActivity = setTimeout(
      () => this.userInactive.next(undefined),
      delay.inactivities_timeout
    );
  }

  @HostListener('window:click') refreshUserState() {
    clearTimeout(this.userActivity);
    this.setTimeout();
  }

  ngOnInit() {
    this.description = this.data.description;
  }
  onClose() {
    this.dialogRef.close();
  }
}
