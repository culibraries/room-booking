import { Component, OnInit, Inject } from '@angular/core';
import { TimeDisplay } from '../models/time-display.model';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material';
import { DialogSwipeCardComponent } from '../dialog-swipe-card/dialog-swipe-card.component';

@Component({
  selector: 'app-dialog-confirmation',
  templateUrl: './dialog-confirmation.component.html',
  styleUrls: ['../main/main.component.css']
})
export class DialogConfirmationComponent implements OnInit {
  selectedTime: TimeDisplay[] = [];
  roomName = "";
  dateString = "";
  constructor(
    private dialogRef: MatDialogRef<DialogConfirmationComponent>,
    private dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) private data: any) { }

  ngOnInit(): void {
    this.roomName = this.data.roomName;
    this.selectedTime = this.data.selectedTime;
    this.dateString = this.data.dateString;
  }
  /**
   * Next - go to swipe-card component
   */
  onNextSwipe(): void {
    this.dialog.open(DialogSwipeCardComponent, {
      width: "65%",
      height: "70%",
      data: {
        submitedTime: this.selectedTime,
        date: this.data.date
      }
    });
    this.dialogRef.close();
  }

  /**
   * Back - go to select-times component
   */
  onBackSelectTimes(): void {
    this.dialogRef.close();
  }

  /**
   * Cancel - Close the dialog
   */
  onCancel(): void {
    this.dialogRef.close();
  }

  trackByFn(index: any) {
    return index;
  }
}
