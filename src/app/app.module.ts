import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import {
  DateTimeRangePickerModule,
  DTRPTranslationService
} from 'projects/date-time-range-picker/src/public_api';
import { AppComponent } from './app.component';
import { TranslationService } from './translation.service';

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, DateTimeRangePickerModule],
  providers: [{ provide: DTRPTranslationService, useClass: TranslationService }],
  bootstrap: [AppComponent]
})
export class AppModule {}
