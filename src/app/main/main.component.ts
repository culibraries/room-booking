import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import { RoomService } from '../services/room.service';
import { HelperService } from '../services/helper.service';
import { HoursService } from '../services/hours.service';
import { TimeDisplay } from '../models/time-display.model';
import { NgxSpinnerService } from 'ngx-spinner';
import { DialogSelectTimesComponent } from '../dialog-select-times/dialog-select-times.component';
import { DialogBrowseRoomsComponent } from '../dialog-browse-rooms/dialog-browse-rooms.component';
import { DialogDescriptionComponent } from '../dialog-description/dialog-description.component';
import { ApiService } from '../services/api.service';
import { env } from '../../environments/environment';
import { text } from '../config/text';
import { forkJoin, interval, Subscription } from 'rxjs';
import {
  startWith,
  switchMap,
  debounceTime,
  distinctUntilChanged,
} from 'rxjs/operators';
import { LoggingService } from '../services/logging.service';

const spaceId = localStorage.getItem('space_id');
const libcalTokenURL = env.apiUrl + '/room-booking/libcal/token';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css'],
})
export class MainComponent implements OnInit, OnDestroy {
  uid = '';
  status = 'available';
  time: Date;
  minDate = new Date();
  minDateString = this.minDate.toISOString();
  maxDate = new Date(new Date().setMonth(new Date().getMonth() + 3));
  maxDateString = this.maxDate.toISOString();
  setDate = new Date();
  countDate = 0;
  displayTime: TimeDisplay[];
  availableTime: string[];
  roomName = '';
  roomDescription = '';
  roomCapacity = 0;
  roomServiceInterval: any;
  timetInterval: any;
  isOpen = true;
  loadTimeLine: Subscription;
  constructor(
    private dialog: MatDialog,
    private helperService: HelperService,
    private hoursService: HoursService,
    private roomService: RoomService,
    private spinner: NgxSpinnerService,
    private apiService: ApiService,
    private log: LoggingService
  ) {
    this.timetInterval = setInterval(() => {
      this.time = new Date();
    }, 1000);

    this.spinner.show();
    setTimeout(() => {
      this.spinner.hide();
    }, 3000);
  }

  ngOnInit() {
    this.log.logDebug('Initilize Main component');
    // Reload libcal token after 45 minutes
    this.loadTimeLine = interval(2700000)
      .pipe(
        startWith(0),
        switchMap(() => this.apiService.post(libcalTokenURL, {}))
      )
      .subscribe(res => {
        this.log.logDebug('libcal_token is set');
        localStorage.setItem('libcal_token', res.access_token);
        this.displayTimeLine(this.setDate, spaceId);
        this.roomService.getRoomInformation(spaceId).subscribe(res => {
          this.roomName = res.name;
          this.roomCapacity = res.capacity;
          this.roomDescription = res.description;
        });
      });
  }

  ngOnDestroy() {
    if (this.roomServiceInterval) {
      this.roomServiceInterval.unsubscribe();
    }
    clearInterval(this.timetInterval);
  }

  displayTimeLine(date: Date, id: string): void {
    const dateString = this.helperService.formattedDate(date);
    this.hoursService.getLocationHours().subscribe(res => {
      // Get Opens/Closes Hours on a specific day
      const hours = this.helperService.getBusinessHoursByDate(
        dateString,
        res.openingHours
      );

      // Check if the library is close/open
      if (hours.opens === '00:00' && hours.closes === '00:00') {
        this.isOpen = false;
        this.status = 'inuse';
        this.loadTimeLine.unsubscribe();
        this.roomServiceInterval.unsubscribe();
      } else {
        this.isOpen = true;
        this.roomServiceInterval = interval(45000)
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
      },
    });
  }

  /**
   * Touch: Time slot on main screen calendar
   * @param selectedTime
   */
  onTouchCalendarTimeSlot(selectedTime: TimeDisplay) {
    this.dialog.open(DialogSelectTimesComponent, {
      width: '65%',
      height: '70%',
      data: {
        selectedTime,
        date: this.setDate,
        roomName: this.roomName,
      },
    });
  }

  /**
   * Touch : Previous dates on main screen calendar
   */
  onTouchPreDate() {
    if (this.roomServiceInterval) {
      this.roomServiceInterval.unsubscribe();
    }
    this.countDate--;
    const date = new Date();
    date.setDate(date.getDate() + this.countDate);
    this.setDate = date;
    this.displayTimeLine(this.setDate, spaceId);
  }

  /**
   * Touch : Next dates on main screen calendar
   */
  onTouchNextDate() {
    if (this.roomServiceInterval) {
      this.roomServiceInterval.unsubscribe();
    }
    this.countDate++;
    const date = new Date();
    date.setDate(date.getDate() + this.countDate);
    this.setDate = date;
    this.displayTimeLine(this.setDate, spaceId);
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
    if (this.roomServiceInterval) {
      this.roomServiceInterval.unsubscribe();
    }
    this.setDate = event.value;
    this.countDate = this.helperService.dateDiffInDays(
      this.minDate,
      this.setDate
    );
    this.displayTimeLine(this.setDate, spaceId);
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
