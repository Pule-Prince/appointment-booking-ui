import { Routes } from '@angular/router';
import { BookingStepperComponent } from './components/booking-stepper/booking-stepper.component';
import { AppointmentsDashboardComponent } from './components/appointments-dashboard/appointments-dashboard.component';

export const routes: Routes = [
  { path: '', redirectTo: '/book', pathMatch: 'full' },
  { path: 'book', component: BookingStepperComponent },
  { path: 'appointments', component: AppointmentsDashboardComponent }
];
