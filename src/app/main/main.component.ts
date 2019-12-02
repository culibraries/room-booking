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
import { forkJoin, interval } from 'rxjs';
import {
  startWith,
  switchMap,
  debounceTime,
  distinctUntilChanged,
} from 'rxjs/operators';

// This is a fake ID for testing purpuses only
const testID = '428a4544-9b7d-403d-bd3b-ab902ea8c967';
const url =
  env.apiUrl +
  '/catalog/data/catalog/roomBooking/?query={%22filter%22:{%22unique_id%22:%22' +
  testID +
  '%22}}';
const libcalURL = env.apiUrl + '/room-booking/libcal/token';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css'],
})
export class MainComponent implements OnInit, OnDestroy {
  uid: string = '';
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
  spaceId = sessionStorage.getItem('space_id');
  isOpen = true;
  constructor(
    private dialog: MatDialog,
    private helperService: HelperService,
    private hoursService: HoursService,
    private roomService: RoomService,
    private spinner: NgxSpinnerService,
    private apiService: ApiService
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
    if (
      !sessionStorage.getItem('libcal_token') ||
      sessionStorage.getItem('libcal_token') === 'undefined'
    ) {
      forkJoin(
        this.apiService.get(url),
        this.apiService.post(libcalURL, {})
      ).subscribe(([config, libcal]) => {
        sessionStorage.setItem('libcal_token', libcal.access_token);
        if (config.results.length > 0) {
          sessionStorage.setItem(
            'hours_view_id',
            config.results[0].hours_view_id
          );
          sessionStorage.setItem('location_id', config.results[0].location_id);
          sessionStorage.setItem('space_id', config.results[0].space_id);
        } else {
          return alert(text.error_wrong_uid);
        }
        location.reload();
      });
    } else {
      interval(2700000)
        .pipe(
          startWith(0),
          switchMap(() => this.apiService.post(libcalURL, {}))
        )
        .subscribe(res => {
          sessionStorage.setItem('libcal_token', res.access_token);
          this.displayTimeLine(this.setDate, this.spaceId);
          this.roomService.getRoomInformation(this.spaceId).subscribe(res => {
            this.roomName = res.name;
            this.roomCapacity = res.capacity;
            this.roomDescription = res.description;
          });
        });
    }
  }

  updateLibcalToken() {
    return this.apiService.post(libcalURL, {}).subscribe(res => {
      sessionStorage.setItem('libcal_token', res.access_token);
    });
  }

  ngOnDestroy() {
    if (this.roomServiceInterval) {
      this.roomServiceInterval.unsubscribe();
    }
    clearInterval(this.timetInterval);
  }

  trackByFn(index, item) {
    return index;
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
      } else {
        this.isOpen = true;
        this.roomServiceInterval = interval(60000)
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
            this.status = this.displayTime[0].status ? 'available' : 'inuse';
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
        selectedTime: selectedTime,
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
    this.displayTimeLine(this.setDate, this.spaceId);
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
    this.displayTimeLine(this.setDate, this.spaceId);
  }

  /**
   * Touchs calendar event - touch dates on calendar
   * @param type
   * @param event
   */
  touchCalendarEvent(type: string, event: MatDatepickerInputEvent<Date>) {
    this.setDate = event.value;
    this.countDate = this.helperService.dateDiffInDays(
      this.minDate,
      this.setDate
    );
    this.displayTimeLine(this.setDate, this.spaceId);
  }

  isNext3months(date: Date): boolean {
    return this.helperService.isTheDay(date, this.maxDate);
  }

  isToday(date: Date) {
    return this.helperService.isTheDay(date, new Date());
  }
}
