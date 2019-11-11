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
  setDateString: string = "";
  private openingHours = {};
  public displayTime: TimeDisplay[] = [];
  toggleItem = false;
  private availableTime: string[] = [];
  selectedTimeDisplay: TimeDisplay;
  isDisabledSubmitBtn = true;

  constructor(
    private dialogRef: MatDialogRef<DialogSelectTimesComponent>,
    private dialog: MatDialog,
    private roomService: RoomService,
    private helperService: HelperService,
    private hoursService: HoursService,
    @Inject(MAT_DIALOG_DATA) public data: any) { }

  ngOnInit() {
    if (this.isToday(this.data.date)) {
      this.setDateString = "TODAY";
    } else {
      this.setDateString = this.helperService.formatedDisplayDate(
        this.data.date
      );
    }
    if (this.data.selectedTime === null) {
      this.isDisabledSubmitBtn = true;
    } else {
      this.isDisabledSubmitBtn = false;
    }

    this.displayTimeLine(this.data.date);
  }
  displayTimeLine(currentDate: Date): void {
    let dateString = this.helperService.formattedDate(currentDate);

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
          if (this.isToday(this.data.date)) {
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

  isToday(date: Date) {
    return this.helperService.isTheDay(date, new Date());
  }

  onSelectTime(timeDisplay: TimeDisplay) {
    timeDisplay.active = !timeDisplay.active;
    let flag = false;
    this.displayTime.forEach(e => {
      if (e.active === true) {
        flag = true;
      }
    });
    if (flag) {
      this.isDisabledSubmitBtn = false;
    } else {
      this.isDisabledSubmitBtn = true;
    }
  }

  onNextConfirm(): void {
    const selectedTime: TimeDisplay[] = [];
    this.displayTime.forEach(e => {
      if (e.active) {
        selectedTime.push(e);
      }
    });
    this.dialog.open(DialogConfirmationComponent, {
      width: "65%",
      height: "70%",
      data: {
        selectedTime: selectedTime,
        dateString: this.setDateString,
        date: this.data ? this.data.date : new Date(),
        roomName: this.data.roomName
      }
    });
  }
  onCancel(): void {
    this.dialogRef.close();
  }

}
