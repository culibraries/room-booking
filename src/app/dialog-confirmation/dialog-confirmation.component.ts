import { Component, OnInit, Inject } from '@angular/core';
import { TimeDisplay } from '../models/time-display.model';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material';
import { DialogSwipeCardComponent } from '../dialog-swipe-card/dialog-swipe-card.component';

@Component({
  selector: 'app-dialog-confirmation',
  templateUrl: './dialog-confirmation.component.html',
  styleUrls: ['../main/main.component.css'],
})
export class DialogConfirmationComponent implements OnInit {
  selectedTime: TimeDisplay[] = [];
  roomName = '';
  dateString = '';
  constructor(
    private dialogRef: MatDialogRef<DialogConfirmationComponent>,
    private dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) private data: any
  ) {}

  ngOnInit(): void {
    this.roomName = this.data.roomName;
    this.selectedTime = this.data.selectedTime;
    this.dateString = this.data.dateString;
  }

  /**
   * Touch : Next - go to swipe-card component
   */
  onTouchNextSwipe(): void {
    this.dialog.closeAll();
    this.dialog.open(DialogSwipeCardComponent, {
      width: '65%',
      height: '70%',
      data: {
        submitedTime: this.selectedTime,
        date: this.data.date,
        roomId: this.data.roomId,
      },
    });
    this.dialogRef.close();
  }

  /**
   * Touch : Back - go to select-times component
   */
  onTouchBackSelectTimes(): void {
    this.dialogRef.close();
  }

  /**
   * Touch : Cancel - Close the dialog
   */
  onTouchCancel(): void {
    this.dialog.closeAll();
  }

  trackByFn(index: any) {
    return index;
  }
}
