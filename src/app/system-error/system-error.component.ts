import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
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
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private dialog: MatDialog,
    private spinner: NgxSpinnerService
  ) {}

  ngOnInit() {
    this.spinner.show();
    setTimeout(() => {
      this.spinner.hide();
    }, 1000);

    this.dialog.closeAll();
    this.route.params.subscribe(params => {
      if (params.code === '0') {
        this.errorMessage = text.no_internet_error + text.assistance_message;
      } else {
        this.errorMessage = text.system_error + text.assistance_message;
      }
      setTimeout(() => {
        this.router.navigate(['/']);
      }, delay.reload_if_getting_error_time);
    });
  }

  onReload() {
    this.router.navigate(['/']);
  }
}
