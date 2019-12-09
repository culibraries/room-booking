import { Component, OnInit, OnDestroy, Inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { LOCAL_STORAGE, StorageService } from 'ngx-webstorage-service';

import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import { RoomService } from '../services/room.service';
import { HelperService } from '../services/helper.service';
import { HoursService } from '../services/hours.service';
import { TimeDisplay } from '../models/time-display.model';
import { NgxSpinnerService } from 'ngx-spinner';
import { DialogSelectTimesComponent } from '../dialog-select-times/dialog-select-times.component';
import { DialogBrowseRoomsComponent } from '../dialog-browse-rooms/dialog-browse-rooms.component';
import { DialogDescriptionComponent } from '../dialog-description/dialog-description.component';
import { interval } from 'rxjs';
import { delay } from '../config/delay';
import {
  startWith,
  switchMap,
  debounceTime,
  distinctUntilChanged,
} from 'rxjs/operators';
import { LoggingService } from '../services/logging.service';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css'],
})
export class MainComponent implements OnInit, OnDestroy {
  status = 'available';
  spaceId = this.storage.get('space_id');
  hours_view_id = this.storage.get('hours_view_id');
  time: Date;
  minDate = new Date();
  minDateString = this.minDate.toISOString();
  maxDate = new Date();
  maxDateString = '';
  setDate = new Date();
  dateNow = new Date();
  countDate = 0;
  displayTime: TimeDisplay[];
  availableTime: string[];
  roomName = '';
  roomDescription = '';
  roomCapacity = 0;
  roomServiceInterval: any;
  timetInterval: any;
  timeOut: any;
  isOpen = true;
  closedMessage = 'The library is closed';

  constructor(
    private dialog: MatDialog,
    @Inject(LOCAL_STORAGE) private storage: StorageService,
    private helperService: HelperService,
    private hoursService: HoursService,
    private roomService: RoomService,
    private spinner: NgxSpinnerService,
    private log: LoggingService
  ) {
    this.timetInterval = setInterval(() => {
      this.time = new Date();
      if (this.dateNow.getDate() !== this.time.getDate()) {
        location.reload();
      }
    }, 4000);

    this.spinner.show();
    setTimeout(() => {
      this.spinner.hide();
    }, delay.spinner_timeout);
  }

  ngOnInit() {
    this.log.logDebug('Initilize Main component');
    this.roomService.getRoomInformation(this.spaceId).subscribe(res => {
      this.roomName = res.name;
      this.roomCapacity = res.capacity;
      this.roomDescription = res.description;
      this.displayTimeLine(this.setDate, this.spaceId);
    });
  }

  ngOnDestroy() {
    if (this.roomServiceInterval) {
      this.roomServiceInterval.unsubscribe();
    }
    clearInterval(this.timetInterval);
    clearTimeout(this.timeOut);
  }

  displayTimeLine(date: Date, id: string): void {
    if (this.roomServiceInterval) {
      this.roomServiceInterval.unsubscribe();
    }
    const dateString = this.helperService.formattedDate(date);
    this.hoursService.getLocationHours(this.hours_view_id).subscribe(res => {
      console.log(res);

      this.maxDate = new Date(
        res['openingHours'][res['openingHours'].length - 1]['validFrom']
      );
      this.maxDateString = this.maxDate.toISOString();
      // Get Opens/Closes Hours on a specific day
      const hours = this.helperService.getBusinessHoursByDate(
        dateString,
        res.openingHours
      );

      // Check if the library is close/open
      if (
        hours.opens === '00:00' &&
        hours.closes === '00:00' &&
        this.isToday(date)
      ) {
        this.isOpen = false;
        this.status = 'inuse';
        if (this.roomServiceInterval) {
          this.roomServiceInterval.unsubscribe();
        }
      } else {
        this.isOpen = true;
        this.roomServiceInterval = interval(delay.update_libcal_time)
          .pipe(
            startWith(0),
            distinctUntilChanged(),
            debounceTime(500),
            switchMap(() => this.roomService.getRoom(dateString, id))
          )
          .subscribe(resRoom => {
            this.availableTime = this.helperService.convertRangeAvailabilityTime(
              resRoom.availability
            );
            if (this.availableTime.length === 0 && this.isToday(date)) {
              this.isOpen = false;
              this.status = 'inuse';
              this.roomServiceInterval.unsubscribe();
              this.closedMessage = 'Unavailable';
              return;
            }
            if (this.availableTime.length === 0 && !this.isToday(date)) {
              this.isOpen = false;
              this.roomServiceInterval.unsubscribe();
              this.closedMessage = 'Unavailable';
              return;
            }
            const intervals = this.helperService.getTimeIntervals(
              dateString,
              res.openingHours
            );

            this.displayTime = this.helperService.process(
              date,
              this.availableTime,
              intervals
            );

            if (this.isToday(date)) {
              this.status = this.displayTime[0].status ? 'available' : 'inuse';
            }
          });
      }
    });
  }

  /**
   * Touch : Reserve Button
   */
  onTouchReserve() {
    this.dialog.open(DialogSelectTimesComponent, {
      width: '65%',
      height: '70%',
      data: {
        selectedTime: null,
        date: this.setDate,
        roomName: this.roomName,
        roomId: this.spaceId,
        hours_view_id: this.hours_view_id,
      },
    });
  }

  /**
   * Touch: Time slot on main screen calendar
   * param selectedTime
   */
  onTouchCalendarTimeSlot(selectedTime: TimeDisplay) {
    this.dialog.open(DialogSelectTimesComponent, {
      width: '65%',
      height: '70%',
      data: {
        selectedTime,
        date: this.setDate,
        roomName: this.roomName,
        roomId: this.spaceId,
        hours_view_id: this.hours_view_id,
      },
    });
  }

  /**
   * Touch : Previous dates on main screen calendar
   */
  onTouchPreDate() {
    if (this.timeOut) {
      clearTimeout(this.timeOut);
    }
    this.countDate--;
    const date = new Date();
    date.setDate(date.getDate() + this.countDate);
    this.setDate = date;
    this.displayTimeLine(this.setDate, this.spaceId);
    if (this.countDate > 0) {
      this.timeOut = setTimeout(() => {
        this.countDate = 0;
        this.setDate = new Date();
        this.displayTimeLine(this.setDate, this.spaceId);
      }, delay.inactivities_timeout);
    }
  }

  /**
   * Touch : Next dates on main screen calendar
   */
  onTouchNextDate() {
    if (this.timeOut) {
      clearTimeout(this.timeOut);
    }
    this.countDate++;
    const date = new Date();
    date.setDate(date.getDate() + this.countDate);
    this.setDate = date;
    this.displayTimeLine(this.setDate, this.spaceId);
    this.timeOut = setTimeout(() => {
      this.countDate = 0;
      this.setDate = new Date();
      this.displayTimeLine(this.setDate, this.spaceId);
    }, delay.inactivities_timeout);
  }

  /**
   * Touch : Browse Room Button
   */
  onTouchBrowserRoom() {
    this.dialog.open(DialogBrowseRoomsComponent, {
      width: '75%',
      height: '85%',
      data: {
        roomName: this.roomName.trim(),
        hours_view_id: this.hours_view_id,
      },
    });
  }

  /**
   * Touch : Information Icon
   */
  onTouchDescription() {
    this.dialog.open(DialogDescriptionComponent, {
      width: '65%',
      height: '70%',
      data: {
        description: this.roomDescription,
        roomName: this.roomName,
      },
    });
  }

  /**
   * Touchs calendar event - touch dates on calendar
   * @param type
   * @param event
   */
  touchCalendarEvent(type: string, event: MatDatepickerInputEvent<Date>) {
    if (this.timeOut) {
      clearTimeout(this.timeOut);
    }
    this.setDate = event.value;
    this.countDate = this.helperService.dateDiffInDays(
      this.minDate,
      this.setDate
    );
    this.displayTimeLine(this.setDate, this.spaceId);
    this.timeOut = setTimeout(() => {
      this.countDate = 0;
      this.setDate = new Date();
      this.displayTimeLine(this.setDate, this.spaceId);
    }, delay.inactivities_timeout);
  }

  isNext3months(date: Date): boolean {
    return this.helperService.isTheDay(date, this.maxDate);
  }

  isToday(date: Date) {
    return this.helperService.isTheDay(date, new Date());
  }

  trackByFn(index, item) {
    return index;
  }
}
