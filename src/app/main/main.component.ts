import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { MatDialog, MatDialogRef } from "@angular/material/dialog";
import { MatDatepickerInputEvent } from "@angular/material/datepicker";
import { ConfigService } from "../services/config.service";
import { RoomService } from "../services/room.service";
import { HelperService } from "../services/helper.service";
import { HoursService } from "../services/hours.service";
import { TimeDisplay } from "../models/time-display.model";
import { NgxSpinnerService } from "ngx-spinner";
import { DialogSelectTimesComponent } from '../dialog-select-times/dialog-select-times.component';
import { DialogBrowseRoomsComponent } from '../dialog-browse-rooms/dialog-browse-rooms.component';
import { DialogDescriptionComponent } from '../dialog-description/dialog-description.component';

@Component({
  selector: "app-main",
  templateUrl: "./main.component.html",
  styleUrls: ["./main.component.css"]
})
export class MainComponent implements OnInit {
  uid: string = "";
  status = "available";
  time: Date;
  minDate = new Date();
  minDateString = this.minDate.toISOString();
  maxDate = new Date(new Date().setMonth(new Date().getMonth() + 3));
  maxDateString = this.maxDate.toISOString();
  setDate = new Date();
  countDate = 0;
  private openingHours = {};
  displayTime: TimeDisplay[];
  availableTime: string[];
  roomName = "";
  roomDescription = "";
  roomCapacity = 0;
  spaceId = sessionStorage.getItem('space_id');
  constructor(
    private route: ActivatedRoute,
    private dialog: MatDialog,
    private helperService: HelperService,
    private hoursService: HoursService,
    private roomService: RoomService,
    private configService: ConfigService,
    private spinner: NgxSpinnerService
  ) {
    setInterval(() => {
      this.time = new Date();
    }, 1000);
  }

  ngOnInit() {
    // this.uid = this.route.snapshot.params.uid;
    // if (
    //   !sessionStorage.getItem("location_id") ||
    //   !sessionStorage.getItem("space_id") ||
    //   !sessionStorage.getItem("hours_view_id") ||
    //   !sessionStorage.getItem("libcal_token")
    // ) {
    //   this.configService.setConfig(this.uid);
    // }
    // this.spinner.show();
    this.displayTimeLine(this.setDate, this.spaceId);
    // this.configService.setToken();
    setTimeout(() => {
      this.spinner.hide();
    }, 2000);

    // setInterval(() => {
    //   this.displayTimeLine(this.setDate);
    // }, 5000);
  }

  trackByFn(index, item) {
    return index;
  }

  /**
   * Touch : Browse Room Button
   */
  onTouchBrowserRoom() {
    this.dialog.open(DialogBrowseRoomsComponent, {
      width: "75%",
      height: "85%",
      data: {
        roomName: this.roomName.trim()
      }
    });
  }

  /**
   * Touch : Information Icon
   */
  onTouchDescription() {
    this.dialog.open(DialogDescriptionComponent, {
      width: "65%",
      height: "70%",
      data: {
        description: this.roomDescription,
        roomName: this.roomName
      }
    });
  }

  displayTimeLine(date: Date, id: string): void {
    let dateString = this.helperService.formattedDate(date);

    // FIXME Need to break the subscribe , should not have subscribe inside subsribe
    this.hoursService.get().subscribe(res => {
      // GET OPENING HOURS
      this.openingHours = this.helperService.getBusinessHoursByDate(
        dateString,
        res.openingHours
      );
      this.roomService.getRoom(dateString, id).subscribe(resRoom => {
        this.roomName = resRoom.name;
        this.roomCapacity = resRoom.capacity;
        // TODO check if resRoom.description exists from libcal response
        this.roomDescription = resRoom.description;
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
        console.log(this.displayTime);
        if (this.isToday(this.setDate)) {
          let flag = true;
          let displayTimeToday = [];
          this.displayTime
            .slice()
            .reverse()
            .forEach(e => {
              if (flag) {
                displayTimeToday.push(e);
              }
              if (e.target === 1) {
                flag = false;
                if (e.status === 1) {
                  this.status = "inuse";
                } else {
                  this.status = "available";
                }
              }
            });
          this.displayTime = displayTimeToday.slice().reverse();
        }
      });
    });
  }

  /**
   * Touch : Reserve Button
   */
  onTouchReserve() {
    this.dialog.open(DialogSelectTimesComponent, {
      width: "65%",
      height: "70%",
      data: {
        selectedTime: null,
        date: this.setDate,
        roomName: this.roomName
      }
    });
  }


  /**
   * Touch: Time slot on main screen calendar
   * @param selectedTime
   */
  onTouchCalendarTimeSlot(selectedTime: TimeDisplay) {
    this.dialog.open(DialogSelectTimesComponent, {
      width: "65%",
      height: "70%",
      data: {
        selectedTime: selectedTime,
        date: this.setDate,
        roomName: this.roomName
      }
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
   * Touchs calendar event - touch dates on calendar
   * @param type
   * @param event
   */
  touchCalendarEvent(type: string, event: MatDatepickerInputEvent<Date>) {
    this.setDate = event.value;
    this.countDate = this.helperService.dateDiffInDays(this.minDate, this.setDate);
    this.displayTimeLine(this.setDate, this.spaceId);
  }

  isNext3months(date: Date): boolean {
    return this.helperService.isTheDay(date, this.maxDate);
  }

  isToday(date: Date) {
    return this.helperService.isTheDay(date, new Date());
  }
}