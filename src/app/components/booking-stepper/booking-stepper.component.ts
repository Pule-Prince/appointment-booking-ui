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
import { MatIconModule } from '@angular/material/icon';

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
    MatListModule,
    MatIconModule
  ],
  templateUrl: './booking-stepper.component.html',
  styleUrls: ['./booking-stepper.component.css']
})
export class BookingStepperComponent implements OnInit {
  isLinear = true;
  currentStep = 0;
  currentSubStep = 0; // 0: categories, 1: products, 2: service types, 3: service reasons
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

  futureDateValidator = (control: any) => {
    if (!control.value) {
      return null;
    }
    const selectedDate = new Date(control.value);
    selectedDate.setHours(0, 0, 0, 0);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    return selectedDate >= tomorrow ? null : { pastDate: true };
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
      email: ['', [Validators.required, Validators.email]],
      isCapitecUser: [false, Validators.required]
    });

    this.appointmentDetailsForm = this.fb.group({
      branch: [null, Validators.required],
      date: [null, [Validators.required, this.futureDateValidator]],
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
        this.currentSubStep = 1;
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
        this.currentSubStep = 2;
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
        if (data.length > 0) {
          this.currentSubStep = 3;
        } else {
          this.proceedToCustomerDetails();
        }
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

    // Format date as YYYY-MM-DD using local timezone (not UTC)
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;

    this.bookingService.getAvailableSlots(this.selectedBranch.branchId, dateStr).subscribe({
      next: (data) => {
        this.availableSlots = data.sort((a, b) =>
          new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
        );
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
      email: this.customerDetailsForm.get('email')?.value,
      isCapitecUser: this.customerDetailsForm.get('isCapitecUser')?.value,
      serviceTypeId: this.selectedServiceType!.typeId,
      serviceReasonId: this.selectedServiceReason?.reasonId || null,
      slotId: this.selectedSlot!.slotId
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

  getCategoryIcon(categoryName: string): string {
    const iconMap: { [key: string]: string } = {
      'Insure': 'verified',
      'Transact': 'account_balance',
      'Credit': 'credit_card',
      'Save': 'savings',
      'Business Inquiry': 'business'
    };
    return iconMap[categoryName] || 'help';
  }

  getCategoryDescription(categoryName: string): string {
    const descriptionMap: { [key: string]: string } = {
      'Insure': 'Life and funeral cover',
      'Transact': 'Account and transaction queries',
      'Credit': 'Credit products and applications',
      'Save': 'Savings products and queries',
      'Business Inquiry': 'Business banking assistance'
    };
    return descriptionMap[categoryName] || '';
  }

  goBackInServiceSelection(): void {
    if (this.currentSubStep === 3) {
      this.currentSubStep = 2;
      this.selectedServiceReason = null;
    } else if (this.currentSubStep === 2) {
      this.currentSubStep = 1;
      this.selectedServiceType = null;
    } else if (this.currentSubStep === 1) {
      this.currentSubStep = 0;
      this.selectedProduct = null;
    }
    this.errorMessage = '';
  }
}