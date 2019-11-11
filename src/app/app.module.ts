import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule, HttpClientJsonpModule } from '@angular/common/http';

import { DatePipe } from '@angular/common';
import { NgxSpinnerModule } from 'ngx-spinner';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MainComponent } from './main/main.component';
import { ConfigService } from './services/config.service';

// Material Module
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule, MatInputModule } from '@angular/material';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material';

// Dialog Component
import { DialogSelectTimesComponent } from './dialog-select-times/dialog-select-times.component';
import { DialogConfirmationComponent } from './dialog-confirmation/dialog-confirmation.component';
import { DialogSuccessComponent } from './dialog-success/dialog-success.component';
import { DialogSwipeCardComponent } from './dialog-swipe-card/dialog-swipe-card.component';
import { DialogDescriptionComponent } from './dialog-description/dialog-description.component';
import { DialogErrorComponent } from './dialog-error/dialog-error.component';
import { DialogBrowseRoomsComponent } from './dialog-browse-rooms/dialog-browse-rooms.component';

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
    DialogBrowseRoomsComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    NoopAnimationsModule,
    NgxSpinnerModule,
    HttpClientModule,
    HttpClientJsonpModule,
    MatSidenavModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule
  ],
  entryComponents: [
    DialogSelectTimesComponent,
    DialogConfirmationComponent,
    DialogSwipeCardComponent,
    DialogSuccessComponent,
    DialogBrowseRoomsComponent,
    DialogErrorComponent,
    DialogDescriptionComponent
  ],
  providers: [
    DatePipe,
    ConfigService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
