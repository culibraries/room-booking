import { Component, OnInit, Inject } from '@angular/core';
import { RoomService } from '../services/room.service';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material';
import { TimeDisplay } from '../models/time-display.model';
import { HelperService } from '../services/helper.service';
import { HoursService } from '../services/hours.service';
import { DialogConfirmationComponent } from '../dialog-confirmation/dialog-confirmation.component';

@Component({
  selector: 'app-dialog-browse-rooms',
  templateUrl: './dialog-browse-rooms.component.html',
  styleUrls: ['../main/main.component.css']
})
export class DialogBrowseRoomsComponent implements OnInit {
  locationName = "";
  browseRoomsDisplay = [];
  setDate = new Date();
  countDate = 0;

  setDateString = "";
  displayTime: TimeDisplay[] = [];
  isDisabledNextBtn = true;
  currentRoom: any;
  minDate = new Date();
  minDateString = this.minDate.toISOString();
  maxDate = new Date(new Date().setMonth(new Date().getMonth() + 3));
  maxDateString = this.maxDate.toISOString();
  spaceId = sessionStorage.getItem('space_id');
  private openingHours = {};
  private availableTime = [];

  constructor(
    private roomService: RoomService,
    private dialogRef: MatDialogRef<DialogBrowseRoomsComponent>,
    private dialog: MatDialog,
    private helperService: HelperService,
    private hoursService: HoursService,
    @Inject(MAT_DIALOG_DATA) private data: any
  ) { }

  ngOnInit() {
    this.setDateString = "TODAY";
    this.currentRoom = this.data.roomName;
    this.roomService.getAllCategories().subscribe(res => {
      this.locationName = res[0].name;
      res[0].categories.forEach(e => {
        this.roomService.getAllRooms(e.cid).subscribe(resEachRoom => {
          resEachRoom.forEach(room => {
            if (room.items.length > 0) {
              this.browseRoomsDisplay.push({ "name": e.name, "items": room.items })
            }
          });

          this.browseRoomsDisplay.sort(this.helperService.sortByProperty('name'));

        })
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

    this.hoursService.get().subscribe(res => {
      // GET OPENING HOURS
      this.openingHours = this.helperService.getBusinessHoursByDate(
        dateString,
        res.openingHours
      );

      this.roomService.getRoom(dateString, id).subscribe(resRoom => {
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
      });
    });
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
    if (time.status) {
      return;
    }
    // Toggle
    time.active = !time.active;
    // Only enable the next button if there are selected times
    this.isDisabledNextBtn = this.displayTime.find(function (e) { return e.active === true; }) ? false : true;
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
      width: "75%",
      height: "85%",
      data: {
        selectedTime: this.displayTime.filter(e => { return e.active }),
        dateString: this.setDateString,
        date: this.data ? this.data.date : new Date(),
        roomName: this.currentRoom
      }
    });
  }
}
