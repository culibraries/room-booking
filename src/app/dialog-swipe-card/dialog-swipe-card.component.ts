import { Component, HostListener, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material';
import { BookService } from '../services/book.service';
import { DialogSuccessComponent } from '../dialog-success/dialog-success.component';

@Component({
  selector: 'app-dialog-swipe-card',
  templateUrl: './dialog-swipe-card.component.html',
  styleUrls: ['../main/main.component.css']
})
export class DialogSwipeCardComponent {
  valueAfterSwipe: string = "";
  identityKey = "";
  firstName = "";
  lastName = "";
  constructor(
    public dialogRef: MatDialogRef<DialogSwipeCardComponent>,
    public dialog: MatDialog,
    private bookService: BookService,
    @Inject(MAT_DIALOG_DATA) public data: any) { }

  @HostListener("document:keypress", ["$event"])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (event.key !== "Enter") {
      this.valueAfterSwipe += event.key;
    } else {

      this.bookService.getIDInformation(this.valueAfterSwipe).subscribe(data => {
        data["varFields"].forEach(e => {
          if (e["fieldTag"] === "q") {
            this.identityKey = e["content"].trim();
          }
          if (e["fieldTag"] === "n") {
            this.firstName = e["content"].split(",")[1].trim();
            this.lastName = e["content"].split(",")[0].trim();
          }

        });
        this.data.submitedTime.forEach(e => {
          this.bookRoom(e.value, this.data.date);
        });
      });

      this.dialog.open(DialogSuccessComponent, {
        width: "65%",
        height: "70%"
      });
      this.dialogRef.close();
    }
  }


  bookRoom(submittedTime: string, date: Date) {
    const formatedStart = this.getFormatedDate(submittedTime.split("-")[0], date);
    const formatedEnd = this.getFormatedDate(submittedTime.split("-")[1], date);


    const body = {
      start: formatedStart,
      fname: this.firstName,
      lname: this.lastName,
      q5253: "Other",
      email: this.identityKey + "@colorado.edu",
      bookings: [
        {
          id: sessionStorage.getItem("space_id"),
          to: formatedEnd
        }
      ]
    };

    this.bookService.bookRoom(body).subscribe(data => {
      /* !TODO if it returns a booking id => success */
      console.log(data);
    });
  }

  private getFormatedDate(time: string, date: Date) {
    date.setHours(Number(time.split(":")[0]));
    date.setMinutes(Number(time.split(":")[1]));
    date.setSeconds(0);
    return date.toISOString();
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
