import { Component, HostListener, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material';
import { BookService } from '../services/book.service';
import { DialogSuccessComponent } from '../dialog-success/dialog-success.component';
import { TimeDisplay } from '../models/time-display.model';

@Component({
  selector: 'app-dialog-swipe-card',
  templateUrl: './dialog-swipe-card.component.html',
  styleUrls: ['../main/main.component.css']
})
export class DialogSwipeCardComponent {
  valueAfterSwipe = "";
  identityKey = "";
  firstName = "";
  lastName = "";
  email = "";
  constructor(
    private dialogRef: MatDialogRef<DialogSwipeCardComponent>,
    private dialog: MatDialog,
    private bookService: BookService,
    @Inject(MAT_DIALOG_DATA) private data: any) { }

  /**
   * Hosts listener - handleKeyboardEvent
   * @param event
   */
  @HostListener("document:keypress", ["$event"])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (event.key !== "Enter") {
      this.valueAfterSwipe += event.key;
    } else {

      this.bookService.getIDInformation(this.valueAfterSwipe).subscribe(data => {
        // TODO Convert this forEach to array.find()
        data["varFields"].forEach(e => {
          if (e["fieldTag"] === "q") {
            this.identityKey = e["content"].trim();
            this.email = this.identityKey + "@colorado.edu";
          }
          if (e["fieldTag"] === "n") {
            this.firstName = e["content"].split(",")[1].trim();
            this.lastName = e["content"].split(",")[0].trim();
          }
        });

        this.reorganizeSubmittedTimes(this.data.submitedTime).forEach(e => {
          this.bookRoom(e, this.data.date);
        });
      });

      this.dialog.open(DialogSuccessComponent, {
        width: "65%",
        height: "70%"
      });
      this.dialogRef.close();
    }
  }

  /**
   * Books room
   * @param submittedTime
   * @param date
   */
  private bookRoom(submittedTime: string, date: Date) {
    const formatedStart = this.getFormatedDate(submittedTime.split("-")[0], date);
    const formatedEnd = this.getFormatedDate(submittedTime.split("-")[1], date);


    const body = {
      start: formatedStart,
      fname: this.firstName,
      lname: this.lastName,
      q5253: "Other",
      email: this.email,
      bookings: [
        {
          id: sessionStorage.getItem("space_id"),
          to: formatedEnd
        }
      ]
    };

    this.bookService.bookRoom(body).subscribe(data => {
      /* TODO if it returns a booking id => success */
      console.log(data);
    });
  }

  /**
   * Gets formated date
   * @param time
   * @param date
   * @returns
   */
  private getFormatedDate(time: string, date: Date) {
    date.setHours(Number(time.split(":")[0]));
    date.setMinutes(Number(time.split(":")[1]));
    date.setSeconds(0);
    return date.toISOString();
  }

  /**
   * Reorganizes submitted times
   * @param submitedTimes
   * @returns
   */
  private reorganizeSubmittedTimes(submitedTimes: TimeDisplay[]) {
    this.convertSubmittedTimesValueToArray(submitedTimes).forEach((e, i, arr) => {
      if (i % 2 === 0 && arr[i] === arr[i + 1]) {
        delete (arr[i]);
        delete (arr[i + 1]);
      }
    });

    // TODO return new submitted array
    return [];
  }

  /**
   * Converts submitted times value to array
   * @param submitedTimes
   * @returns
   */
  private convertSubmittedTimesValueToArray(submitedTimes: TimeDisplay[]) {
    const timesArray = [];
    submitedTimes.forEach(e => {
      timesArray.push(e.value.split("-")[0].trim());
      timesArray.push(e.value.split("-")[1].trim());
    });
    return timesArray;
  }

  /**
   * Touch - Cancel
   */
  onTouchCancel(): void {
    this.dialogRef.close();
  }
}
