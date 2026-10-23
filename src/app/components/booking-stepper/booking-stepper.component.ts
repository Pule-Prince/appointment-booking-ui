import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { MatRadioModule } from '@angular/material/radio';
import { MatListModule } from '@angular/material/list';

import { BookingService } from '../../services/booking.service';
import {
  ServiceCategory,
  Product,
  ServiceType,
  ServiceReason,
  Branch,
  AppointmentSlot,
  CreateAppointmentRequest,
  AppointmentResponse
} from '../../models/booking.models';

@Component({
  selector: 'app-booking-stepper',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatCheckboxModule,
    MatProgressSpinnerModule,
    MatCardModule,
    MatRadioModule,
    MatListModule
  ],
  templateUrl: './booking-stepper.component.html',
  styleUrls: ['./booking-stepper.component.css']
})
export class BookingStepperComponent implements OnInit {
  isLinear = true;
  currentStep = 0;
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  appointmentReference = '';

  // Form groups
  serviceSelectionForm!: FormGroup;
  customerDetailsForm!: FormGroup;
  appointmentDetailsForm!: FormGroup;

  // Data
  categories: ServiceCategory[] = [];
  products: Product[] = [];
  serviceTypes: ServiceType[] = [];
  serviceReasons: ServiceReason[] = [];
  branches: Branch[] = [];
  availableSlots: AppointmentSlot[] = [];
  documentGuidance: string = '';

  // Selection state
  selectedCategory: ServiceCategory | null = null;
  selectedProduct: Product | null = null;
  selectedServiceType: ServiceType | null = null;
  selectedServiceReason: ServiceReason | null = null;
  selectedBranch: Branch | null = null;
  selectedDate: Date | null = null;
  selectedSlot: AppointmentSlot | null = null;

  minDate = new Date();

  constructor(private fb: FormBuilder, private bookingService: BookingService) {
    this.minDate.setDate(this.minDate.getDate() + 1);
  }

  ngOnInit(): void {
    this.loadCategories();
    this.loadBranches();
    this.initializeForms();
  }

  initializeForms(): void {
    this.serviceSelectionForm = this.fb.group({
      category: [null, Validators.required],
      product: [null, Validators.required],
      serviceType: [null, Validators.required],
      serviceReason: [null]
    });

    this.customerDetailsForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      cellNumber: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
      isCapitecUser: [false, Validators.required]
    });

    this.appointmentDetailsForm = this.fb.group({
      branch: [null, Validators.required],
      date: [null, Validators.required],
      slot: [null, Validators.required]
    });
  }

  loadCategories(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.bookingService.getCategories().subscribe({
      next: (data) => {
        this.categories = data;
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Failed to load service categories';
        this.isLoading = false;
      }
    });
  }

  loadBranches(): void {
    this.bookingService.getBranches().subscribe({
      next: (data) => {
        this.branches = data;
      },
      error: (error) => {
        this.errorMessage = 'Failed to load branches';
      }
    });
  }

  onCategorySelected(category: ServiceCategory): void {
    this.selectedCategory = category;
    this.selectedProduct = null;
    this.selectedServiceType = null;
    this.selectedServiceReason = null;
    this.products = [];
    this.serviceTypes = [];
    this.serviceReasons = [];
    this.documentGuidance = '';

    this.isLoading = true;
    this.errorMessage = '';
    this.bookingService.getProductsByCategory(category.categoryId).subscribe({
      next: (data) => {
        this.products = data;
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Failed to load products';
        this.isLoading = false;
      }
    });
  }

  onProductSelected(product: Product): void {
    this.selectedProduct = product;
    this.selectedServiceType = null;
    this.selectedServiceReason = null;
    this.serviceTypes = [];
    this.serviceReasons = [];
    this.documentGuidance = '';

    this.isLoading = true;
    this.errorMessage = '';
    this.bookingService.getServiceTypesByProduct(product.productId).subscribe({
      next: (data) => {
        this.serviceTypes = data;
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Failed to load service types';
        this.isLoading = false;
      }
    });
  }

  onServiceTypeSelected(serviceType: ServiceType): void {
    this.selectedServiceType = serviceType;
    this.selectedServiceReason = null;
    this.serviceReasons = [];
    this.documentGuidance = '';

    this.isLoading = true;
    this.errorMessage = '';

    this.bookingService.getServiceReasonsByType(serviceType.typeId).subscribe({
      next: (data) => {
        this.serviceReasons = data;
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Failed to load service reasons';
        this.isLoading = false;
      }
    });

    this.bookingService.getDocumentGuidance(serviceType.typeId).subscribe({
      next: (data) => {
        this.documentGuidance = data?.guidance || '';
      },
      error: (error) => {
        // Guidance is optional
      }
    });
  }

  onServiceReasonSelected(reason: ServiceReason): void {
    this.selectedServiceReason = reason;
  }

  onBranchSelected(branch: Branch): void {
    this.selectedBranch = branch;
    this.selectedDate = null;
    this.selectedSlot = null;
    this.availableSlots = [];
  }

  onDateSelected(date: Date): void {
    this.selectedDate = date;
    this.selectedSlot = null;
    this.availableSlots = [];

    if (!this.selectedBranch) return;

    this.isLoading = true;
    this.errorMessage = '';

    const dateStr = date.toISOString().split('T')[0];
    this.bookingService.getAvailableSlots(this.selectedBranch.id, dateStr).subscribe({
      next: (data) => {
        this.availableSlots = data;
        this.isLoading = false;
        if (data.length === 0) {
          this.errorMessage = 'No available slots for this date';
        }
      },
      error: (error) => {
        this.errorMessage = 'Failed to load available slots';
        this.isLoading = false;
      }
    });
  }

  onSlotSelected(slot: AppointmentSlot): void {
    this.selectedSlot = slot;
  }

  proceedToCustomerDetails(): void {
    if (!this.selectedServiceType || (this.serviceReasons.length > 0 && !this.selectedServiceReason)) {
      this.errorMessage = 'Please select all required service information';
      return;
    }
    this.currentStep = 1;
    this.errorMessage = '';
  }

  proceedToAppointmentDetails(): void {
    if (this.customerDetailsForm.invalid) {
      this.errorMessage = 'Please fill in all customer details correctly';
      return;
    }
    this.currentStep = 2;
    this.errorMessage = '';
  }

  proceedToConfirmation(): void {
    if (this.appointmentDetailsForm.invalid) {
      this.errorMessage = 'Please select all appointment details';
      return;
    }

    if (!this.selectedServiceType || !this.selectedSlot) {
      this.errorMessage = 'Missing appointment details';
      return;
    }

    this.createAppointment();
  }

  createAppointment(): void {
    this.isLoading = true;
    this.errorMessage = '';

    const request: CreateAppointmentRequest = {
      firstName: this.customerDetailsForm.get('firstName')?.value,
      lastName: this.customerDetailsForm.get('lastName')?.value,
      cellNumber: this.customerDetailsForm.get('cellNumber')?.value,
      isCapitecUser: this.customerDetailsForm.get('isCapitecUser')?.value,
      serviceTypeId: this.selectedServiceType!.typeId,
      serviceReasonId: this.selectedServiceReason?.reasonId || null,
      slotId: this.selectedSlot!.id
    };

    this.bookingService.createAppointment(request).subscribe({
      next: (response) => {
        this.appointmentReference = response.referenceNumber;
        this.currentStep = 3;
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = error.error?.message || 'Failed to create appointment. Please try again.';
        this.isLoading = false;
      }
    });
  }

  resetBooking(): void {
    this.currentStep = 0;
    this.selectedCategory = null;
    this.selectedProduct = null;
    this.selectedServiceType = null;
    this.selectedServiceReason = null;
    this.selectedBranch = null;
    this.selectedDate = null;
    this.selectedSlot = null;
    this.appointmentReference = '';
    this.errorMessage = '';
    this.successMessage = '';
    this.initializeForms();
  }

  goBack(): void {
    this.currentStep--;
    this.errorMessage = '';
  }

  formatTime(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit' });
  }
}