import { Component, OnInit } from '@angular/core';
import { text } from '../config/text';
import { MatDialog } from '@angular/material';
import { delay } from '../config/delay';

@Component({
  selector: 'app-system-error',
  templateUrl: './system-error.component.html',
})
export class SystemErrorComponent implements OnInit {
  errorMessage: string;
  isLoadComponent = true;
  constructor(private dialog: MatDialog) {}

  ngOnInit() {
    setTimeout(() => {
      this.isLoadComponent = false;
    }, 2000);

    this.dialog.closeAll();
    this.errorMessage = text.system_error + text.assistance_message;

    setTimeout(() => {
      location.replace('/room-booking');
    }, delay.reload_if_getting_error_time);
  }

  onReload() {
    location.replace('/room-booking');
  }
}
