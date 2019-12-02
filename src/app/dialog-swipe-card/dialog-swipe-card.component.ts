import { Component, HostListener, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material';
import { BookService } from '../services/book.service';
import { DialogSuccessComponent } from '../dialog-success/dialog-success.component';
import { TimeDisplay } from '../models/time-display.model';

@Component({
  selector: 'app-dialog-swipe-card',
  templateUrl: './dialog-swipe-card.component.html',
  styleUrls: ['../main/main.component.css'],
})
export class DialogSwipeCardComponent {
  valueAfterSwipe = '';
  identityKey = 'dutr5288';
  firstName = 'test';
  lastName = 'test';
  email = 'dutr5288@colorado.edu';
  body = [];
  constructor(
    private dialogRef: MatDialogRef<DialogSwipeCardComponent>,
    private dialog: MatDialog,
    private bookService: BookService,
    @Inject(MAT_DIALOG_DATA) private data: any
  ) {}

  /**
   * Hosts listener - handleKeyboardEvent
   * @param event
   */
  @HostListener('document:keypress', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (event.key !== 'Enter') {
      this.valueAfterSwipe += event.key;
    } else {
      this.reorganizeSubmittedTimes(this.data.submitedTime).forEach(e => {
        this.bookRoom(this.buildBodyPayload(e, this.data.date));
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
   * Books room
   * @param submittedTime
   * @param date
   */
  private bookRoom(body: any) {
    this.bookService.bookRoom(body).subscribe(data => {
      if (data.booking_id) {
        this.dialog.open(DialogSuccessComponent, {
          width: '65%',
          height: '70%',
        });
        this.dialogRef.close();
        this.dialog.open(DialogSuccessComponent, {
          width: '65%',
          height: '70%',
        });
      } else {
      }
    });
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
