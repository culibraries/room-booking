import {
  Component,
  OnInit,
  Inject,
  AfterViewInit,
  OnDestroy,
} from '@angular/core';
import { TimeDisplay } from '../models/time-display.model';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material';
import { RoomService } from '../services/room.service';
import { HelperService } from '../services/helper.service';
import { HoursService } from '../services/hours.service';
import { DialogConfirmationComponent } from '../dialog-confirmation/dialog-confirmation.component';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-dialog-select-times',
  templateUrl: './dialog-select-times.component.html',
  styleUrls: ['./dialog-select-times.component.css'],
})
export class DialogSelectTimesComponent
  implements OnInit, AfterViewInit, OnDestroy {
  setDateString = '';
  roomName = '';
  displayTime: TimeDisplay[] = [];
  isDisabledNextBtn = true;
  loading = true;
  isOpen = true;
  checkTargetInterval: any;
  roomSubscribe: Subscription;
  hoursSubscribe: Subscription;
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
    this.roomName = this.data.roomName;
    // Set Date on the header of the dialog
    this.setDateString = this.helperService.isTheDay(this.data.date, new Date())
      ? (this.setDateString = 'TODAY')
      : this.helperService.formatedDisplayDate(this.data.date);

    // if user touch a time slot from main calendar then, Next button will be enable
    this.isDisabledNextBtn = this.data.selectedTime === null ? true : false;

    // Display Time Slots
    this.displayTimes(this.data.date, this.data.roomId);
  }

  ngAfterViewInit() {
    let i = 0;
    this.checkTargetInterval = setInterval(() => {
      i++;
      if (i === 30) {
        clearInterval(this.checkTargetInterval);
      }
      if (document.getElementById('target')) {
        document.getElementById('target').scrollIntoView({
          behavior: 'auto',
          block: 'center',
          inline: 'center',
        });
        clearInterval(this.checkTargetInterval);
      }
    }, 100);
  }

  /**
   * Times dialog select times component
   * @param date
   */
  private displayTimes(date: Date, id: string): void {
    const dateString = this.helperService.formattedDate(date);
    this.hoursSubscribe = this.hoursService
      .getLocationHours(this.data.hours_view_id)
      .subscribe(res => {
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

          this.roomSubscribe = this.roomService
            .getRoom(dateString, id)
            .subscribe(resRoom => {
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
    if (time.status === 0 || time.status === 2) {
      return;
    }
    // Toggle
    time.active = !time.active;
    // Only enable the next button if there are selected times
    this.isDisabledNextBtn = this.displayTime.find(e => {
      return e.active === true;
    })
      ? false
      : true;
  }

  ngOnDestroy() {
    if (this.checkTargetInterval) {
      clearInterval(this.checkTargetInterval);
    }
    if (this.hoursSubscribe) {
      this.hoursSubscribe.unsubscribe();
    }
    if (this.roomSubscribe) {
      this.roomSubscribe.unsubscribe();
    }
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
        roomId: this.data.roomId,
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
