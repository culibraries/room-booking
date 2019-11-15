import { Component, OnInit, Inject } from '@angular/core';
import { RoomService } from '../services/room.service';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material';
import { TimeDisplay } from '../models/time-display.model';
import { HelperService } from '../services/helper.service';
import { HoursService } from '../services/hours.service';

@Component({
  selector: 'app-dialog-browse-rooms',
  templateUrl: './dialog-browse-rooms.component.html',
  styleUrls: ['../main/main.component.css']
})
export class DialogBrowseRoomsComponent implements OnInit {
  locationName = "";
  browseRoomsDisplay = [];

  setDateString = "";
  displayTime: TimeDisplay[] = [];
  isDisabledNextBtn = true;

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
    this.roomService.getAllCategories().subscribe(res => {
      this.locationName = res[0].name;
      res[0].categories.forEach(e => {
        this.roomService.getAllRooms(e.cid).subscribe(resEachRoom => {
          resEachRoom.forEach(room => {
            if (room.items.length > 0) {
              this.browseRoomsDisplay.push({ "name": e.name, "items": room.items })
            }
          });
        })
      });
      this.browseRoomsDisplay.sort((e) => e.name);
    });
    //Set Date on the header of the dialog
    this.setDateString = this.helperService.isTheDay(this.data.date, new Date()) ?
      this.setDateString = "TODAY" :
      this.helperService.formatedDisplayDate(this.data.date);

    //if user touch a time slot from main calendar then, Next button will be enable
    this.isDisabledNextBtn = this.data.selectedTime === null ? true : false;

    // Display Time Slots
    this.displayTimes(this.data.date);
  }

  /**
 * Times dialog select times component
 * @param date
 */
  private displayTimes(date: Date): void {
    const dateString = this.helperService.formattedDate(date);

    this.hoursService.get().subscribe(res => {
      // GET OPENING HOURS
      this.openingHours = this.helperService.getBusinessHoursByDate(
        dateString,
        res.openingHours
      );

      this.roomService.getRoom(dateString).subscribe(resRoom => {
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

        if (this.data.selectedTime !== null) {
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

}
