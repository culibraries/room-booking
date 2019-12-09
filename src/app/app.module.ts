import { BrowserModule } from '@angular/platform-browser';
import { NgModule, ErrorHandler } from '@angular/core';
import {
  HttpClientModule,
  HttpClientJsonpModule,
  HTTP_INTERCEPTORS,
} from '@angular/common/http';

import { DatePipe } from '@angular/common';
import { NgxSpinnerModule } from 'ngx-spinner';
import { DeviceDetectorModule } from 'ngx-device-detector';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { MainComponent } from './main/main.component';
import { ConfigService } from './services/config.service';

// Material Module
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule, MatInputModule } from '@angular/material';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatListModule } from '@angular/material/list';
import { MatToolbarModule } from '@angular/material/toolbar';

// Dialog Component
import { DialogSelectTimesComponent } from './dialog-select-times/dialog-select-times.component';
import { DialogConfirmationComponent } from './dialog-confirmation/dialog-confirmation.component';
import { DialogSuccessComponent } from './dialog-success/dialog-success.component';
import { DialogSwipeCardComponent } from './dialog-swipe-card/dialog-swipe-card.component';
import { DialogDescriptionComponent } from './dialog-description/dialog-description.component';
import { DialogErrorComponent } from './dialog-error/dialog-error.component';
import { DialogBrowseRoomsComponent } from './dialog-browse-rooms/dialog-browse-rooms.component';

import { SystemErrorComponent } from './system-error/system-error.component';
import { HttpConfigInterceptor } from './httpconfig.interceptor';
import { DebounceClickDirective } from '../debounce-click.directive';

@NgModule({
  declarations: [
    AppComponent,
    MainComponent,
    DialogSelectTimesComponent,
    DialogConfirmationComponent,
    DialogSuccessComponent,
    DialogSwipeCardComponent,
    DialogDescriptionComponent,
    DialogErrorComponent,
    DialogBrowseRoomsComponent,
    SystemErrorComponent,
    DebounceClickDirective,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    NgxSpinnerModule,
    DeviceDetectorModule.forRoot(),
    HttpClientModule,
    HttpClientJsonpModule,
    MatSidenavModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatExpansionModule,
    MatListModule,
    MatToolbarModule,
  ],
  entryComponents: [
    DialogSelectTimesComponent,
    DialogConfirmationComponent,
    DialogSwipeCardComponent,
    DialogSuccessComponent,
    DialogBrowseRoomsComponent,
    DialogErrorComponent,
    DialogDescriptionComponent,
  ],
  providers: [
    DatePipe,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: HttpConfigInterceptor,
      multi: true,
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
