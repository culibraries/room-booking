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
  styleUrls: ['../main/main.component.css']
})
export class DialogSelectTimesComponent implements OnInit {
  setDateString = "";
  displayTime: TimeDisplay[] = [];
  isDisabledNextBtn = true;

  private openingHours = {};
  private availableTime = [];

  constructor(
    private dialogRef: MatDialogRef<DialogSelectTimesComponent>,
    private dialog: MatDialog,
    private roomService: RoomService,
    private helperService: HelperService,
    private hoursService: HoursService,
    @Inject(MAT_DIALOG_DATA) private data: any) { }

  ngOnInit() {

    //Set Date on the header of the dialog
    this.setDateString = this.helperService.isTheDay(this.data.date, new Date()) ?
      this.setDateString = "TODAY" :
      this.helperService.formatedDisplayDate(this.data.date);

    //if user touch a time slot from main calendar then, Next button will be enable
    this.isDisabledNextBtn = this.data.selectedTime === null ? true : false;

    // Display time slots
    this.times(this.data.date);
  }


  /**
   * Times dialog select times component
   * @param date
   */
  private times(date: Date): void {
    const dateString = this.helperService.formattedDate(date);

    this.hoursService.get().subscribe(res => {
      // GET OPENING HOURS
      this.openingHours = this.helperService.getBusinessHoursByDate(
        dateString,
        res.openingHours
      );

      this.roomService.get(dateString).subscribe(resRoom => {
        // GET AVAILABILITY TIME

        this.availableTime = this.helperService.convertRangeAvailabilityTime(
          resRoom.availability
        );

        // GET INTERVAL TIME
        const intervals = this.helperService.getTimeIntervals(
          new Date(this.helperService.getNewDate(this.openingHours["opens"])),
          new Date(this.helperService.getNewDate(this.openingHours["closes"]))
        );

        // DISPLAY TIMELINE
        this.displayTime = this.helperService.convertToDisplayTime(
          this.availableTime,
          this.helperService.upgradeIntervalTime(intervals)
        );

        if (this.data) {
          if (this.helperService.isTheDay(this.data.date, new Date())) {
            let flag = true;
            const displayTimeToday = [];
            this.displayTime
              .slice()
              .reverse()
              .forEach(e => {
                if (flag) {
                  displayTimeToday.push(e);
                  if (this.data.selectedTime !== null) {
                    if (this.data.selectedTime.value === e.value) {
                      e.active = true;
                    }
                  }
                }
                if (e.target === 1) {
                  flag = false;
                }
              });
            this.displayTime = displayTimeToday.slice().reverse();
          } else {
            this.displayTime.forEach(e => {
              if (this.data) {
                if (this.data.selectedTime.value === e.value) {
                  e.active = true;
                }
              }
            });
          }
        } else {
          let flag = true;
          const displayTimeToday = [];
          this.displayTime
            .slice()
            .reverse()
            .forEach(e => {
              if (flag) {
                displayTimeToday.push(e);
              }
              if (e.target === 1) {
                flag = false;
              }
            });
          this.displayTime = displayTimeToday.slice().reverse();
        }
      });
    });
  }

  /**
   * Touch : Toggle time between AVAILABLE - SELECTED
   * @param time
   */
  onTouchSelectTime(time: TimeDisplay) {
    // Toggle
    time.active = !time.active;

    // Only enable the next button if there are selected times
    this.isDisabledNextBtn = (this.displayTime.find(e => { return e.active === true; })) ? true : false;

  }

  /**
   * Touch : Next - go to confirmation component
   */
  onTouchNextConfirm(): void {
    // TODO need to revise this update
    // const selectedTime: TimeDisplay[] = [];
    // this.displayTime.forEach(e => {
    //   if (e.active) {
    //     selectedTime.push(e);
    //   }
    // });
    this.dialog.open(DialogConfirmationComponent, {
      width: "65%",
      height: "70%",
      data: {
        selectedTime: this.displayTime.map(e => { return e.active }),
        dateString: this.setDateString,
        date: this.data ? this.data.date : new Date(),
        roomName: this.data.roomName
      }
    });
  }

  /**
   * Touch : Cancel
   */
  onTouchCancel(): void {
    this.dialogRef.close();
  }

}
