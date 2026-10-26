import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

import { BookingService } from '../../services/booking.service';
import { AppointmentResponse } from '../../models/booking.models';

@Component({
  selector: 'app-appointments-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatTableModule,
    MatProgressSpinnerModule,
    MatCardModule,
    MatIconModule
  ],
  templateUrl: './appointments-dashboard.component.html',
  styleUrls: ['./appointments-dashboard.component.css']
})
export class AppointmentsDashboardComponent implements OnInit {
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  searchForm!: FormGroup;
  appointments: AppointmentResponse[] = [];
  displayedColumns: string[] = ['referenceNumber', 'customerName', 'serviceType', 'dateTime', 'branch', 'status'];

  selectedDate: Date | null = null;
  selectedBranchCode: string = '';
  minDate = new Date(new Date().setFullYear(new Date().getFullYear() - 1));
  maxDate = new Date(new Date().setFullYear(new Date().getFullYear() + 1));

  constructor(private fb: FormBuilder, private bookingService: BookingService) {}

  ngOnInit(): void {
    this.initializeForms();
    this.selectedDate = new Date();
    this.loadAppointmentsByDate(this.selectedDate);
  }

  initializeForms(): void {
    this.searchForm = this.fb.group({
      referenceNumber: ['', Validators.required]
    });
  }

  loadAppointmentsByDate(date: Date): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;

    this.bookingService.getAppointmentsByDate(dateStr).subscribe({
      next: (data) => {
        this.appointments = data;
        this.isLoading = false;
        if (data.length === 0) {
          this.successMessage = `No appointments found for ${dateStr}`;
        }
      },
      error: (error) => {
        this.errorMessage = 'Failed to load appointments. Please try again.';
        this.isLoading = false;
      }
    });
  }

  onDateChange(date: Date): void {
    this.selectedDate = date;
    this.loadAppointmentsByDateAndBranch();
  }

  onBranchCodeChange(): void {
    if (this.selectedDate) {
      this.loadAppointmentsByDateAndBranch();
    }
  }

  loadAppointmentsByDateAndBranch(): void {
    if (!this.selectedDate) return;

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const year = this.selectedDate.getFullYear();
    const month = String(this.selectedDate.getMonth() + 1).padStart(2, '0');
    const day = String(this.selectedDate.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;

    this.bookingService.getAppointmentsByDate(dateStr).subscribe({
      next: (data) => {
        // Filter by branch code if provided
        if (this.selectedBranchCode.trim()) {
          this.appointments = data.filter(apt =>
            apt.slot.branch.code.toUpperCase() === this.selectedBranchCode.toUpperCase()
          );
        } else {
          this.appointments = data;
        }
        this.isLoading = false;
        if (this.appointments.length === 0) {
          this.successMessage = `No appointments found for ${dateStr}` +
            (this.selectedBranchCode ? ` at branch ${this.selectedBranchCode}` : '');
        }
      },
      error: (error) => {
        this.errorMessage = 'Failed to load appointments. Please try again.';
        this.isLoading = false;
      }
    });
  }

  searchAppointment(): void {
    const referenceNumber = this.searchForm.get('referenceNumber')?.value;

    if (!referenceNumber.trim()) {
      this.errorMessage = 'Please enter a reference number';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.bookingService.getAppointmentByReference(referenceNumber).subscribe({
      next: (data) => {
        this.appointments = [data];
        this.isLoading = false;
        this.successMessage = 'Appointment found!';
      },
      error: (error) => {
        this.appointments = [];
        this.errorMessage = 'Appointment not found. Please check the reference number.';
        this.isLoading = false;
      }
    });
  }

  resetSearch(): void {
    this.searchForm.reset();
    this.errorMessage = '';
    this.successMessage = '';
    if (this.selectedDate) {
      this.loadAppointmentsByDate(this.selectedDate);
    }
  }

  formatDateTime(dateTime: string | Date): string {
    const date = new Date(dateTime);
    return date.toLocaleString('en-ZA', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getStatusColor(status: string): string {
    if (status === 'CONFIRMED') {
      return 'confirmed';
    } else if (status === 'CANCELLED') {
      return 'cancelled';
    }
    return '';
  }
}
