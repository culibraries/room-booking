import { Component, OnInit, Inject } from '@angular/core';
import { TimeDisplay } from '../models/time-display.model';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material';
import { RoomService } from '../services/room.service';
import { HelperService } from '../services/helper.service';
import { HoursService } from '../services/hours.service';
import { DialogConfirmationComponent } from '../dialog-confirmation/dialog-confirmation.component';

@Component({
  selector: 'app-dialog-select-times',
  templateUrl: './dialog-select-times.component.html',
  styleUrls: ['../main/main.component.css'],
})
export class DialogSelectTimesComponent implements OnInit {
  setDateString = '';
  displayTime: TimeDisplay[] = [];
  isDisabledNextBtn = true;
  loading = true;
  isOpen = true;

  private openingHours = {};
  private availableTime = [];

  constructor(
    private dialogRef: MatDialogRef<DialogSelectTimesComponent>,
    private dialog: MatDialog,
    private roomService: RoomService,
    private helperService: HelperService,
    private hoursService: HoursService,
    @Inject(MAT_DIALOG_DATA) private data: any
  ) {}

  ngOnInit() {
    // Set Date on the header of the dialog
    this.setDateString = this.helperService.isTheDay(this.data.date, new Date())
      ? (this.setDateString = 'TODAY')
      : this.helperService.formatedDisplayDate(this.data.date);

    // if user touch a time slot from main calendar then, Next button will be enable
    this.isDisabledNextBtn = this.data.selectedTime === null ? true : false;

    // Display Time Slots
    this.displayTimes(this.data.date, sessionStorage.getItem('space_id'));
  }

  /**
   * Times dialog select times component
   * @param date
   */
  private displayTimes(date: Date, id: string): void {
    const dateString = this.helperService.formattedDate(date);
    this.hoursService.getLocationHours().subscribe(res => {
      // Get Opens/Closes Hours on a specific day
      const hours = this.helperService.getBusinessHoursByDate(
        dateString,
        res.openingHours
      );
      // Check if the library is close/open
      if (hours.opens === '00:00' && hours.closes === '00:00') {
        this.loading = false;
        this.isOpen = false;
      } else {
        this.isOpen = true;

        this.roomService.getRoom(dateString, id).subscribe(resRoom => {
          this.availableTime = this.helperService.convertRangeAvailabilityTime(
            resRoom.availability
          );

          const intervals = this.helperService.getTimeIntervals(
            dateString,
            res.openingHours
          );

          this.displayTime = this.helperService.process(
            date,
            this.availableTime,
            intervals
          );
          if (this.data.selectedTime) {
            this.displayTime.find((e, i) => {
              if (e.value === this.data.selectedTime.value) {
                this.displayTime[i].active = true;
              }
            });
          }
          this.loading = false;
        });
      }
    });
  }

  /**
   * Touch : Toggle time between AVAILABLE - SELECTED
   * @param time
   */
  onTouchSelectTime(time: TimeDisplay) {
    if (!time.status) {
      return;
    }
    // Toggle
    time.active = !time.active;
    // Only enable the next button if there are selected times
    this.isDisabledNextBtn = this.displayTime.find(function(e) {
      return e.active === true;
    })
      ? false
      : true;
  }

  /**
   * Touch : Next - go to confirmation component
   */
  onTouchNextConfirm(): void {
    this.dialog.open(DialogConfirmationComponent, {
      width: '65%',
      height: '70%',
      data: {
        selectedTime: this.displayTime.filter(e => {
          return e.active;
        }),
        dateString: this.setDateString,
        date: this.data ? this.data.date : new Date(),
        roomName: this.data.roomName,
        roomId: sessionStorage.getItem('space_id'),
      },
    });
  }

  /**
   * Touch : Cancel
   */
  onTouchCancel(): void {
    this.dialogRef.close();
  }
}
