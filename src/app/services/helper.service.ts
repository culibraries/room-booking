import { Injectable } from '@angular/core';
import { DatePipe } from '@angular/common';
import { TimeDisplay } from '../models/time-display.model';
@Injectable({
  providedIn: 'root'
})
export class HelperService {
  constructor(private datePipe: DatePipe) { }

  public getBusinessHoursByDate(
    dateString: string,
    openingHours: []
  ): any {
    return openingHours.find(function (e) {
      return e['validFrom'] === dateString;
    });
  }

  public getNewDate(time: string): any {
    const date = new Date();
    date.setHours(Number(time.split(':')[0]));
    date.setMinutes(Number(time.split(':')[1]));
    return this.datePipe.transform(date, 'yyyy-MM-dd HH:mm:ss');
  }

  // Input : LibCal availablity Time : {from: "2019-09-19T12:30:00-06:00", to: "2019-09-19T13:00:00-06:00"}
  // Output : Standard Hour : {"12:30 - 1:00"}
  public convertRangeAvailabilityTime(availableTimes: []): string[] {
    if (availableTimes.length > 0) {
      return availableTimes.map(e => {
        return this.datePipe.transform(e['from'], 'HH:mm') +
          '-' +
          this.datePipe.transform(e['to'], 'HH:mm')
      });
    } else {
      return [];
    }
  }

  // Input: From : 2019-09-19 8:00:00 - To : 2019-09-19 23:00:00
  // Output: ["08:00", "08:30", "09:00", "09:30", .... "22:00", "22:30", "23:00"]
  public getTimeIntervals(from: Date, to: Date): string[] {
    const arr = [];
    while (from <= to) {
      arr.push(from.toTimeString().substring(0, 5));
      from.setMinutes(from.getMinutes() + 30);
    }
    return arr;
  }

  // Input:
  // Output:
  public upgradeIntervalTime(intervalTime: string[]): any {
    let output = [];
    intervalTime.forEach((e, i, arr) => {
      if (arr[i + 1]) {
        output.push(
          {
            status: 0,
            value: arr[i] + '-' + arr[i + 1],
            displayValue:
              this.convertTo24Hour(this.getPeriod(arr[i])) +
              ' - ' +
              this.convertTo24Hour(this.getPeriod(arr[i + 1])),
            target: 0,
            active: false
          });
      }
    })
    return output;

  }

  // Input: 13:00, 14:00
  // Output: 01:00, 02:00
  private convertTo24Hour(longHours: string): string {
    let n = Number(longHours.split(':')[0]);
    let convertedN = n;
    if (n > 12) {
      convertedN -= 12;
      return longHours.replace(n.toString(), this.addZeroBefore(convertedN));
    }
    return longHours.replace(n.toString(), convertedN.toString());
  }

  // Input:
  // Output:
  public convertToDisplayTime(
    availableTime: string[],
    intervalTime: TimeDisplay[]
  ): any {
    const date = new Date();
    const getCurrentTime =
      this.addZeroBefore(date.getHours()) + ':' + date.getMinutes();
    let j = 0;
    return intervalTime.map((e, i, arr) => {
      if (!availableTime.includes(e.value)) {
        e.status = 1;
        e.active = false;
      }
      if (e.value.split('-')[0] > getCurrentTime) {
        j++;
        if (j === 1) {
          if (i === 0) {
            arr[i].target = 1;
          } else {
            arr[i - 1].target = 1;
          }
        }
      }
      return e;
    })
  }

  // Input: 23:00
  // Output: 23:00 PM
  private getPeriod(displayTime: string): string {
    return displayTime >= '12:00' ? displayTime + ' PM' : displayTime + ' AM';
  }

  // Input: Date
  // Output: '2019-09-12'
  public formattedDate(date: Date): string {
    return this.datePipe.transform(date, 'yyyy-MM-dd');
  }
  // Input: 9
  // Output : 09
  private addZeroBefore(n: number) {
    return (n < 10 ? '0' : '') + n;
  }

  public formatedDisplayDate(date: Date): string {
    return this.datePipe.transform(date, 'E, MMM dd');
  }
  public isTheDay(date1: Date, date2: Date): boolean {
    return (
      date1.getDate() === date2.getDate() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getFullYear() === date2.getFullYear()
    );
  }
  public dateDiffInDays(a: Date, b: Date): number {
    const _MS_PER_DAY = 1000 * 60 * 60 * 24;
    // Discard the time and time-zone information.
    const utc1 = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
    const utc2 = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());
    return Math.floor((utc2 - utc1) / _MS_PER_DAY);
  }

  /**
* Generic array sorting
*
* @param property
* @returns {Function}
*/
  public sortByProperty(property): any {
    return function (x: any, y: any) {
      return ((x[property] === y[property]) ? 0 : ((x[property] > y[property]) ? 1 : -1));
    };
  };
}
