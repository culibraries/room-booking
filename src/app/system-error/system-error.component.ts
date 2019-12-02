import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { text } from '../config/text';
import { MatDialog } from '@angular/material';

@Component({
  selector: 'app-system-error',
  templateUrl: './system-error.component.html',
})
export class SystemErrorComponent implements OnInit {
  errorMessage: string;
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.dialog.closeAll();
    this.route.params.subscribe(params => {
      if (params.code === '0') {
        this.errorMessage = text.no_internet_error + text.assistance_message;
      } else {
        this.errorMessage = text.system_error + text.assistance_message;
      }
      setTimeout(() => {
        this.router.navigate(['/']);
      }, 3600000);
    });
  }
}
