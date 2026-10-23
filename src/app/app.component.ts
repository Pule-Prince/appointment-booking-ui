import { Component } from '@angular/core';
import { BookingStepperComponent } from './components/booking-stepper/booking-stepper.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [BookingStepperComponent],
  template: '<app-booking-stepper></app-booking-stepper>',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'appointment-booking-ui';
}
