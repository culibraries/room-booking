import { Component, OnInit } from '@angular/core';
import { text } from '../config/text';
import { MatDialog } from '@angular/material';
import { NgxSpinnerService } from 'ngx-spinner';
import { delay } from '../config/delay';

@Component({
  selector: 'app-system-error',
  templateUrl: './system-error.component.html',
})
export class SystemErrorComponent implements OnInit {
  errorMessage: string;
  constructor(private dialog: MatDialog, private spinner: NgxSpinnerService) {}

  ngOnInit() {
    this.spinner.show();
    setTimeout(() => {
      this.spinner.hide();
    }, delay.spinner_timeout);

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
