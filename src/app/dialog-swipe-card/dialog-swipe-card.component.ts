import { Component, HostListener, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material';
import { BookService } from '../services/book.service';
import { DialogSuccessComponent } from '../dialog-success/dialog-success.component';
import { TimeDisplay } from '../models/time-display.model';
import { forkJoin } from 'rxjs';
import { DialogErrorComponent } from '../dialog-error/dialog-error.component';
import { LoggingService } from '../services/logging.service';

@Component({
  selector: 'app-dialog-swipe-card',
  templateUrl: './dialog-swipe-card.component.html',
  styleUrls: ['../main/main.component.css'],
})
export class DialogSwipeCardComponent implements OnInit {
  valueAfterSwipe = '';
  identityKey = '';
  firstName = '';
  lastName = '';
  email = '';
  body = [];
  constructor(
    private dialogRef: MatDialogRef<DialogSwipeCardComponent>,
    private dialog: MatDialog,
    private bookService: BookService,
    private log: LoggingService,
    @Inject(MAT_DIALOG_DATA) private data: any
  ) {}

  ngOnInit() {}
  /**
   * Hosts listener - handleKeyboardEvent
   * @param event
   */
  @HostListener('document:keypress', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (event.key !== 'Enter') {
      this.valueAfterSwipe += event.key;
    } else {
      event.preventDefault();
      this.bookService.getIDInformation('000331466').subscribe(data => {
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
        this.reorganizeSubmittedTimes(this.data.submitedTime).forEach(e => {
          bookingObservableHolder.push(
            this.bookService.bookRoom(this.buildBodyPayload(e, this.data.date))
          );
        });
        forkJoin(bookingObservableHolder).subscribe(
          res => {
            this.log.logInfo(
              this.data.roomName +
                ',' +
                this.email +
                ',' +
                this.reorganizeSubmittedTimes(this.data.submitedTime).join('|')
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
            this.log.logInfo(
              this.data.roomName +
                ',' +
                this.email +
                ',' +
                this.reorganizeSubmittedTimes(this.data.submitedTime).join('|')
            );
            this.dialog.open(DialogErrorComponent, {
              width: '60%',
              height: '45%',
              panelClass: 'dialog-error',
            });
          }
        );
      });
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
