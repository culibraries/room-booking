import {
  Component,
  HostListener,
  Inject,
  OnInit,
  OnDestroy,
} from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material';
import { BookService } from '../services/book.service';
import { DialogSuccessComponent } from '../dialog-success/dialog-success.component';
import { TimeDisplay } from '../models/time-display.model';
import { forkJoin } from 'rxjs';
import { DialogErrorComponent } from '../dialog-error/dialog-error.component';
import { LoggingService } from '../services/logging.service';
import { ApiService } from '../services/api.service';
import { env } from '../../environments/environment';
import { LOCAL_STORAGE, StorageService } from 'ngx-webstorage-service';
import { DialogEnterStudentInfoComponent } from '../dialog-enter-student-info/dialog-enter-student-info.component';

const libcalTokenURL = env.apiUrl + '/room-booking/libcal/token';
const PATRON_TYPE_UNDERGRADUATE = env.undergraduatePType;
@Component({
  selector: 'app-dialog-swipe-card',
  templateUrl: './dialog-swipe-card.component.html',
})
export class DialogSwipeCardComponent implements OnInit, OnDestroy {
  valueAfterSwipe = '';
  identityKey = '';
  firstName = '';
  lastName = '';
  email = '';
  body = [];
  isLoading;
  title = '';

  constructor(
    private dialog: MatDialog,
    private bookService: BookService,
    private log: LoggingService,
    private apiService: ApiService,
    private dialogRef: MatDialogRef<DialogSwipeCardComponent>,
    @Inject(MAT_DIALOG_DATA) private data: any,
    @Inject(LOCAL_STORAGE) private storage: StorageService
  ) {}

  ngOnInit() {
    this.isLoading = false;
    this.title = 'SWIPE BUFF ONECARD TO COMPLETE RESERVATION';
  }

  ngOnDestroy() {}
  /**
   * Hosts listener - handleKeyboardEvent
   * @param event
   */
  @HostListener('document:keypress', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (event.key !== 'Enter') {
      this.valueAfterSwipe += event.key;
    } else {
      this.isLoading = true;
      event.preventDefault();
      this.log.logDebug('card: ' + this.valueAfterSwipe);
      this.bookService.getIDInformation(this.valueAfterSwipe, 'u').subscribe(
        data => {
          try {
            if (!data.patronType) {
              this.log.logDebug(
                'this card value does not recognized in the system.'
              );
              this.dialogRef.close();
              this.dialog.open(DialogEnterStudentInfoComponent, {
                width: '65%',
                height: '84%',
                data: {
                  submitedTime: this.data.submitedTime,
                  date: this.data.date,
                  roomName: this.data.roomName,
                  roomId: this.data.roomId,
                },
              });
              return;
            }
            this.log.logDebug('PType: ' + data.patronType);
            // If patronType is NOT an undergraduate student
            if (data.patronType !== PATRON_TYPE_UNDERGRADUATE) {
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

            // If patronType is an undergraduate student
            if (data.varFields && data.varFields.length > 0) {
              data.varFields.forEach(e => {
                if (e.fieldTag === 'q') {
                  this.identityKey = e.content.trim();
                  this.email = this.identityKey + '@colorado.edu';
                }
                if (e.fieldTag === 'n') {
                  this.firstName = e.content.split(',')[1].trim();
                  this.lastName = e.content.split(',')[0].trim();
                }
              });
              const bookingObservableHolder = [];
              this.reorganizeSubmittedTimes(this.data.submitedTime).forEach(
                e => {
                  bookingObservableHolder.push(
                    this.bookService.bookRoom(
                      this.buildBodyPayload(e, this.data.date)
                    )
                  );
                }
              );
              forkJoin(bookingObservableHolder).subscribe(
                res => {
                  this.apiService.post(libcalTokenURL, {}).subscribe(user => {
                    this.storage.set('libcal_token', user.access_token);
                  });

                  this.log.logInfo(
                    this.data.roomName +
                      ',' +
                      this.email +
                      ',' +
                      this.reorganizeSubmittedTimes(
                        this.data.submitedTime
                      ).join('|')
                  );
                  this.dialog.open(DialogSuccessComponent, {
                    width: '65%',
                    height: '70%',
                    data: {
                      email: this.email,
                    },
                  });
                },
                err => {
                  this.log.logError(
                    this.data.roomName +
                      ',' +
                      this.email +
                      ',' +
                      this.reorganizeSubmittedTimes(
                        this.data.submitedTime
                      ).join('|')
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
              this.dialogRef.close();
              this.dialog.open(DialogEnterStudentInfoComponent, {
                width: '65%',
                height: '84%',
                data: {
                  submitedTime: this.data.submitedTime,
                  date: this.data.date,
                  roomName: this.data.roomName,
                  roomId: this.data.roomId,
                },
              });
              return;
            }
          } catch (e) {
            this.dialogRef.close();
            this.dialog.open(DialogEnterStudentInfoComponent, {
              width: '65%',
              height: '84%',
              data: {
                submitedTime: this.data.submitedTime,
                date: this.data.date,
                roomName: this.data.roomName,
                roomId: this.data.roomId,
              },
            });
            return;
          }
        },
        err => {
          this.dialogRef.close();
          this.dialog.open(DialogEnterStudentInfoComponent, {
            width: '65%',
            height: '84%',
            data: {
              submitedTime: this.data.submitedTime,
              date: this.data.date,
              roomName: this.data.roomName,
              roomId: this.data.roomId,
            },
          });
        }
      );
    }
  }

  private buildBodyPayload(dateString, date): any {
    const formatedStart = this.getFormatedDate(dateString.split('-')[0], date);
    const formatedEnd = this.getFormatedDate(dateString.split('-')[1], date);

    return {
      start: formatedStart,
      fname: this.firstName,
      lname: this.lastName,
      q5253: 'Other',
      email: this.email,
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
