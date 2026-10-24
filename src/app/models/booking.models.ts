export interface ServiceCategory {
  categoryId: number;
  name: string;
}

export interface Product {
  productId: number;
  name: string;
}

export interface ServiceType {
  typeId: number;
  name: string;
}

export interface ServiceReason {
  reasonId: number;
  description: string;
}

export interface Address {
  id: number;
  addressLine: string;
  suburb: string;
  postalCode: string;
}

export interface Branch {
  branchId: number;
  code: string;
  active: boolean;
  address: Address;
}

export interface AppointmentSlot {
  slotId: number;
  branch: Branch;
  startTime: string;
  endTime: string;
  capacity: number;
  bookedCount: number;
}

export interface Customer {
  id?: number;
  firstName: string;
  lastName: string;
  email: string;
  isCapitecUser: boolean;
}

export interface CreateAppointmentRequest {
  firstName: string;
  lastName: string;
  email: string;
  isCapitecUser: boolean;
  serviceTypeId: number;
  serviceReasonId: number | null;
  slotId: number;
}

export interface AppointmentResponse {
  id: number;
  referenceNumber: string;
  customer: Customer;
  serviceType: ServiceType;
  serviceReason?: ServiceReason;
  slot: AppointmentSlot;
  status: string;
  createdAt: string;
}
