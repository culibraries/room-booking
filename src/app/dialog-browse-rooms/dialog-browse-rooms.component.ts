import { Component, OnInit, Inject, OnDestroy } from '@angular/core';
import { RoomService } from '../services/room.service';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material';
import { TimeDisplay } from '../models/time-display.model';
import { HelperService } from '../services/helper.service';
import { HoursService } from '../services/hours.service';
import { DialogConfirmationComponent } from '../dialog-confirmation/dialog-confirmation.component';
import { debounceTime } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { LOCAL_STORAGE, StorageService } from 'ngx-webstorage-service';

@Component({
  selector: 'app-dialog-browse-rooms',
  templateUrl: './dialog-browse-rooms.component.html',
})
export class DialogBrowseRoomsComponent implements OnInit, OnDestroy {
  locationName = '';
  browseRoomsDisplay = [];
  setDate = new Date();
  countDate = 0;

  setDateString = '';
  displayTime: TimeDisplay[] = [];
  isDisabledNextBtn = true;
  currentRoom: any;
  minDate = new Date();
  minDateString = this.minDate.toISOString();
  maxDate = new Date(new Date().setMonth(new Date().getMonth() + 3));
  maxDateString = this.maxDate.toISOString();
  spaceId: string;
  locationId: string;
  isOpen = true;
  isLoading = true;
  roomServiceInterval: Subscription;
  hoursServiceInterval: Subscription;
  private availableTime = [];

  constructor(
    private roomService: RoomService,
    @Inject(LOCAL_STORAGE) private storage: StorageService,
    private dialogRef: MatDialogRef<DialogBrowseRoomsComponent>,
    private dialog: MatDialog,
    private helperService: HelperService,
    private hoursService: HoursService,
    @Inject(MAT_DIALOG_DATA) private data: any
  ) {}

  ngOnInit() {
    this.setDateString = 'TODAY';
    this.currentRoom = this.data.roomName;
    this.spaceId = this.storage.get('space_id');
    this.locationId = this.storage.get('location_id');
    this.roomService.getAllCategories(this.locationId).subscribe(res => {
      this.locationName = res[0].name;
      res[0].categories.forEach(e => {
        this.roomService.getAllRooms(e.cid).subscribe(resEachRoom => {
          resEachRoom.forEach(room => {
            if (room.items.length > 0) {
              this.browseRoomsDisplay.push({ name: e.name, items: room.items });
            }
          });

          this.browseRoomsDisplay.sort(
            this.helperService.sortByProperty('name')
          );
        });
      });
    });

    // Display Time Slots
    this.displayTimes(this.setDate, this.spaceId);
  }

  /**
   * Times dialog select times component
   * @param date
   */
  private displayTimes(date: Date, id: string): void {
    const dateString = this.helperService.formattedDate(date);
    this.hoursServiceInterval = this.hoursService
      .getLocationHours(this.data.hours_view_id)
      .subscribe(res => {
        // Get Opens/Closes Hours on a specific day
        const hours = this.helperService.getBusinessHoursByDate(
          dateString,
          res.openingHours
        );
        // Check if the library is close/open
        if (hours.opens === '00:00' && hours.closes === '00:00') {
          this.isLoading = false;
          this.isOpen = false;
        } else {
          this.isOpen = true;

          this.roomServiceInterval = this.roomService
            .getRoom(dateString, id)
            .pipe(debounceTime(500))
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

              this.isLoading = false;
            });
        }
      });
  }

  ngOnDestroy() {
    if (this.roomServiceInterval) {
      this.roomServiceInterval.unsubscribe();
    }

    if (this.hoursServiceInterval) {
      this.hoursServiceInterval.unsubscribe();
    }
  }

  onSelectRoom(room: any) {
    this.isDisabledNextBtn = true;
    this.currentRoom = room.name;
    this.spaceId = room.id;
    this.displayTimes(this.setDate, this.spaceId);
  }

  /**
   * Touch : Previous dates on main screen calendar
   */
  onTouchPreDate() {
    if (this.roomServiceInterval) {
      this.roomServiceInterval.unsubscribe();
    }
    this.isDisabledNextBtn = true;
    this.countDate--;
    const date = new Date();
    date.setDate(date.getDate() + this.countDate);
    this.setDate = date;
    this.setDateString = this.helperService.formatedDisplayDate(this.setDate);
    this.displayTimes(this.setDate, this.spaceId);
  }

  /**
   * Touch : Next dates on main screen calendar
   */
  onTouchNextDate() {
    if (this.roomServiceInterval) {
      this.roomServiceInterval.unsubscribe();
    }
    this.isDisabledNextBtn = true;
    this.countDate++;
    const date = new Date();
    date.setDate(date.getDate() + this.countDate);
    this.setDate = date;
    this.setDateString = this.helperService.formatedDisplayDate(this.setDate);
    this.displayTimes(this.setDate, this.spaceId);
  }

  isNext3months(date: Date): boolean {
    return this.helperService.isTheDay(date, this.maxDate);
  }

  isToday(date: Date) {
    return this.helperService.isTheDay(date, new Date());
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

  onTouchClose() {
    this.dialogRef.close();
  }

  trackByFn(index, item) {
    return index;
  }

  /**
   * Touch : Next - go to confirmation component
   */
  onTouchNextConfirm(): void {
    this.dialog.open(DialogConfirmationComponent, {
      width: '75%',
      height: '85%',
      data: {
        selectedTime: this.displayTime.filter(e => {
          return e.active;
        }),
        dateString: this.setDateString,
        date: this.setDate,
        roomName: this.currentRoom,
        roomId: this.spaceId,
      },
    });
  }
}
