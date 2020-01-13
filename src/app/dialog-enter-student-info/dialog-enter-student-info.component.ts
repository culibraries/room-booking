import { Component, OnInit, Inject, HostListener } from '@angular/core';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material';
import { BookService } from '../services/book.service';
import { LoggingService } from '../services/logging.service';
import { TimeDisplay } from '../models/time-display.model';
import { ApiService } from '../services/api.service';
import { LOCAL_STORAGE, StorageService } from 'ngx-webstorage-service';
import { DialogSuccessComponent } from '../dialog-success/dialog-success.component';
import { DialogErrorComponent } from '../dialog-error/dialog-error.component';
import { forkJoin } from 'rxjs';
import { env } from '../../environments/environment';
import { FormGroup, Validators, FormControl } from '@angular/forms';

const libcalTokenURL = env.apiUrl + '/room-booking/libcal/token';
const PATRON_TYPE_UNDERGRADUATE = 2;

@Component({
  selector: 'app-dialog-enter-student-info',
  templateUrl: './dialog-enter-student-info.component.html',
})
export class DialogEnterStudentInfoComponent implements OnInit {
  firstName = '';
  lastName = '';
  identikey = '';
  isLoading;
  title = 'Please Enter Your information below to continue';
  formStudent = new FormGroup({
    firstName: new FormControl('', Validators.required),
    lastName: new FormControl('', Validators.required),
    identikey: new FormControl('', [
      Validators.required,
      Validators.pattern('^[a-z0-9]{4,10}$'),
    ]),
  });
  constructor(
    private dialog: MatDialog,
    private bookService: BookService,
    private log: LoggingService,
    private apiService: ApiService,
    @Inject(MAT_DIALOG_DATA) private data: any,
    @Inject(LOCAL_STORAGE) private storage: StorageService
  ) {}

  ngOnInit() {
    this.log.logDebug('enter studen information');
    this.isLoading = false;
  }

  @HostListener('document:keypress', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      this.onSubmit(this.formStudent);
    }
  }

  onSubmit(formGroup) {
    if (formGroup.valid) {
      this.isLoading = true;

      this.firstName = formGroup.value.firstName;
      this.lastName = formGroup.value.lastName;
      this.identikey = formGroup.value.identikey;

      const bookingObservableHolder = [];

      this.bookService
        .getIDInformation(this.identikey, 'q')
        .subscribe(resPatron => {
          if (resPatron.varFields && resPatron.varFields.length > 0) {
            if (resPatron.patronType !== PATRON_TYPE_UNDERGRADUATE) {
              this.log.logDebug('you are not undergraduate student.');
              this.dialog.closeAll();
              this.dialog.open(DialogErrorComponent, {
                width: '50%',
                height: 'auto',
                data: {
                  code: 0,
                },
              });
              return;
            }

            const email = this.identikey + '@colorado.edu';
            this.reorganizeSubmittedTimes(this.data.submitedTime).forEach(e => {
              bookingObservableHolder.push(
                this.bookService.bookRoom(
                  this.buildBodyPayload(e, this.data.date, email)
                )
              );
            });
            forkJoin(bookingObservableHolder).subscribe(
              res => {
                this.apiService.post(libcalTokenURL, {}).subscribe(user => {
                  this.storage.set('libcal_token', user.access_token);
                });

                this.log.logInfo(
                  this.data.roomName +
                    ',' +
                    email +
                    ',' +
                    this.reorganizeSubmittedTimes(this.data.submitedTime).join(
                      '|'
                    )
                );
                this.dialog.open(DialogSuccessComponent, {
                  width: '65%',
                  height: '70%',
                  data: {
                    email: email,
                  },
                });
              },
              err => {
                this.log.logInfo(
                  this.data.roomName +
                    ',' +
                    email +
                    ',' +
                    this.reorganizeSubmittedTimes(this.data.submitedTime).join(
                      '|'
                    )
                );
                this.dialog.open(DialogErrorComponent, {
                  width: '50%',
                  height: 'auto',
                  data: {
                    code: 1,
                  },
                });
                return;
              }
            );
          } else {
            this.dialog.closeAll();
            this.dialog.open(DialogErrorComponent, {
              width: '50%',
              height: 'auto',
              data: {
                code: 2,
              },
            });
            return;
          }
        });
    }
  }

  private buildBodyPayload(dateString, date, email): any {
    const formatedStart = this.getFormatedDate(dateString.split('-')[0], date);
    const formatedEnd = this.getFormatedDate(dateString.split('-')[1], date);

    return {
      start: formatedStart,
      fname: this.firstName,
      lname: this.lastName,
      q5253: 'Other',
      email: email,
      bookings: [
        {
          id: this.data.roomId,
          to: formatedEnd,
        },
      ],
    };
  }
  /**
   * Gets formated date
   * @param time
   * @param date
   * @returns
   */
  private getFormatedDate(time: string, date: Date) {
    date.setHours(Number(time.split(':')[0]));
    date.setMinutes(Number(time.split(':')[1]));
    date.setSeconds(0);
    return date.toISOString();
  }

  /**
   * Reorganiaze Submitted Times
   * @param submitedTimes
   * @returns
   */
  private reorganizeSubmittedTimes(submitedTimes: TimeDisplay[]) {
    const timesArray = submitedTimes.map(e => {
      return e.value;
    });
    const solution = timesArray.sort().reduce((acc, item, index) => {
      if (index === 0) {
        acc.push(item);
        return acc;
      }
      const currentValueParsed = acc[acc.length - 1].split('-');
      const newValueParsed = item.split('-');
      if (currentValueParsed[1] === newValueParsed[0]) {
        acc[acc.length - 1] = `${currentValueParsed[0]}-${newValueParsed[1]}`;
        return acc;
      }
      acc.push(item);
      return acc;
    }, []);

    return solution;
  }

  /**
   * Touch - Cancel
   */
  onTouchCancel(): void {
    this.dialog.closeAll();
  }
}
