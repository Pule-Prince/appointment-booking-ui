import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  ServiceCategory,
  Product,
  ServiceType,
  ServiceReason,
  Branch,
  AppointmentSlot,
  CreateAppointmentRequest,
  AppointmentResponse
} from '../models/booking.models';

@Injectable({
  providedIn: 'root'
})
export class BookingService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getCategories(): Observable<ServiceCategory[]> {
    return this.http.get<ServiceCategory[]>(`${this.apiUrl}/service-categories`);
  }

  getProductsByCategory(categoryId: number): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}/service-categories/${categoryId}/products`);
  }

  getServiceTypesByProduct(productId: number): Observable<ServiceType[]> {
    return this.http.get<ServiceType[]>(`${this.apiUrl}/products/${productId}/service-types`);
  }

  getServiceReasonsByType(serviceTypeId: number): Observable<ServiceReason[]> {
    return this.http.get<ServiceReason[]>(`${this.apiUrl}/service-types/${serviceTypeId}/reasons`);
  }

  getDocumentGuidance(serviceTypeId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/service-types/${serviceTypeId}/guidance`);
  }

  getBranches(): Observable<Branch[]> {
    return this.http.get<Branch[]>(`${this.apiUrl}/branches`);
  }

  getAvailableSlots(branchId: number, date: string): Observable<AppointmentSlot[]> {
    return this.http.get<AppointmentSlot[]>(
      `${this.apiUrl}/branches/${branchId}/slots`,
      { params: { date } }
    );
  }

  createAppointment(request: CreateAppointmentRequest): Observable<AppointmentResponse> {
    return this.http.post<AppointmentResponse>(`${this.apiUrl}/appointments`, request);
  }

  getAppointmentByReference(referenceNumber: string): Observable<AppointmentResponse> {
    return this.http.get<AppointmentResponse>(`${this.apiUrl}/appointments/${referenceNumber}`);
  }

  cancelAppointment(referenceNumber: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/appointments/${referenceNumber}/cancel`, {});
  }

  getAppointmentsByDate(date: string): Observable<AppointmentResponse[]> {
    return this.http.get<AppointmentResponse[]>(`${this.apiUrl}/appointments`, {
      params: { date }
    });
  }
}