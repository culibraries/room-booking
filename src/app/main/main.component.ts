import { Component, OnInit, OnDestroy, Inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { LOCAL_STORAGE, StorageService } from 'ngx-webstorage-service';
import { env } from '../../environments/environment';

import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import { RoomService } from '../services/room.service';
import { HelperService } from '../services/helper.service';
import { HoursService } from '../services/hours.service';
import { TimeDisplay } from '../models/time-display.model';
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
import { ApiService } from '../services/api.service';

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
  dateNext3Day = new Date(new Date().setDate(new Date().getDate() + 3));
  countDate = 0;
  displayTime: TimeDisplay[];
  availableTime: string[];
  roomName = '';
  roomDescription = '';
  roomCapacity = 0;
  roomServiceInterval: any;
  timetInterval: any;
  isOpen = true;
  isDone: boolean;
  isLoadComponent = true;
  closedMessage = 'The library is closed';

  constructor(
    private dialog: MatDialog,
    @Inject(LOCAL_STORAGE) private storage: StorageService,
    private helperService: HelperService,
    private hoursService: HoursService,
    private roomService: RoomService,
    private log: LoggingService,
    private apiService: ApiService
  ) {
    this.timetInterval = setInterval(() => {
      this.time = new Date();
      if (this.dateNow.getDate() !== this.time.getDate()) {
        this.log.logDebug('new day: reload the app...');
        this.apiService
          .get(
            env.apiUrl +
              '/catalog/data/catalog/roomBooking/?query={%22filter%22:{%22unique_id%22:%22' +
              this.storage.get('uid') +
              '%22}}'
          )
          .subscribe(res => {
            this.log.logDebug(
              'new day : set location_id space_id hours_view_id into localStorage'
            );
            this.storage.set('location_id', res.results[0].location_id);
            this.storage.set('space_id', res.results[0].space_id);
            this.storage.set('hours_view_id', res.results[0].hours_view_id);

            // Upload log to S3
            this.log.uploadLog();

            location.reload();
          });
      }
    }, 3000);
  }

  ngOnInit() {
    this.log.logDebug('app starting...');
    setTimeout(() => {
      this.isLoadComponent = false;
    }, 2000);
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
  }

  displayTimeLine(date: Date, id: string): void {
    this.isDone = false;
    if (this.roomServiceInterval) {
      this.roomServiceInterval.unsubscribe();
    }
    const dateString = this.helperService.formattedDate(date);
    this.hoursService.getLocationHours(this.hours_view_id).subscribe(res => {
      // Get latest opening hours to set to the calendar
      this.maxDate = new Date(
        res['openingHours'][res['openingHours'].length - 1]['validFrom']
      );
      this.maxDateString = this.maxDate.toISOString();

      // Get Opens/Closes Hours on a specific day
      const hours = this.helperService.getBusinessHoursByDate(
        dateString,
        res.openingHours
      );
      //  If the library is close
      if (hours.opens === '00:00' && hours.closes === '00:00') {
        this.isOpen = false;
        this.isDone = true;

        // Only set current status of the room for today
        if (this.isToday(date)) {
          this.status = 'closed';
        }

        if (this.roomServiceInterval) {
          this.roomServiceInterval.unsubscribe();
        }
        return;
      }

      // If the library is Open
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
            if (this.displayTime.length > 0) {
              this.status = this.displayTime[0].status ? 'available' : 'inuse';
            } else {
              this.log.logDebug('the library is closed.');
              this.status = 'closed';
              this.isOpen = false;
              this.roomServiceInterval.unsubscribe();
            }
          }
          this.isDone = true;
        });
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
    this.countDate--;
    const date = new Date();
    date.setDate(date.getDate() + this.countDate);
    this.setDate = date;
    this.displayTimeLine(this.setDate, this.spaceId);
  }

  /**
   * Touch : Next dates on main screen calendar
   */
  onTouchNextDate() {
    this.countDate++;
    const date = new Date();
    date.setDate(date.getDate() + this.countDate);
    this.setDate = date;
    this.displayTimeLine(this.setDate, this.spaceId);
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
   */
  touchCalendarEvent(type: string, event: MatDatepickerInputEvent<Date>) {
    this.setDate = event.value;
    this.countDate = this.helperService.dateDiffInDays(
      this.minDate,
      this.setDate
    );
    this.displayTimeLine(this.setDate, this.spaceId);
  }

  isMaxDate(date: Date): boolean {
    return this.helperService.isTheDay(date, this.maxDate);
  }

  isToday(date: Date) {
    return this.helperService.isTheDay(date, new Date());
  }

  trackByFn(index, item) {
    return index;
  }
}
