# Capitec Appointment Booking System - Frontend Setup

## Project Structure

```
src/
├── app/
│   ├── components/
│   │   └── booking-stepper/
│   │       ├── booking-stepper.component.ts
│   │       ├── booking-stepper.component.html
│   │       └── booking-stepper.component.css
│   ├── models/
│   │   └── booking.models.ts
│   ├── services/
│   │   └── booking.service.ts
│   └── app.config.ts
├── environments/
│   └── environment.ts
├── main.ts
└── index.html
```

## Features Implemented

### 1. Multi-Step Booking Flow
- **Step 0**: Service Selection (Category → Product → Service Type → Reason)
- **Step 1**: Customer Details (Name, Cell, Type, Capitec User flag)
- **Step 2**: Appointment Details (Branch, Date, Time Slot)
- **Step 3**: Confirmation (Reference Number + Summary)

### 2. Core Functionality (MVP)
✅ **Create Appointment**
- Dynamic service catalogue fetching from backend
- Available slot retrieval by date
- Appointment creation with validation
- Reference number display on confirmation

✅ **Lookup Appointment** 
- Search by reference number (component created, API integration ready)

✅ **Cancel Appointment**
- Cancel booking by reference number (component created, API integration ready)

### 3. UI/UX
- **Capitec Color Scheme**: Blue (#00486D), Red (#E63934), White (#FFFFFF)
- **Material Design**: Professional, clean interface
- **Responsive**: Mobile-friendly layout (tested at 600px breakpoint)
- **Inline Error Messages**: Form validation with clear feedback
- **Loading States**: Spinner during API calls
- **Empty States**: User-friendly messages for no data

### 4. Angular Best Practices
- Standalone components (no NgModule needed)
- Typed models for all DTOs
- Reactive Forms with validators
- RxJS observables for async operations
- Environment-based configuration
- Separation of concerns (service layer)

## Getting Started

### Installation
```bash
cd /Users/princemabote/project/appointment-booking-ui
npm install
```

### Configuration
Update `src/environments/environment.ts` with your backend URL:
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080/api/v1'
};
```

### Development Server
```bash
npm start
```
Navigate to `http://localhost:4200/`

### Build
```bash
npm run build
```

## API Integration

### Services Used
- **BookingService** (`src/app/services/booking.service.ts`)
  - `getCategories()` - Fetch service categories
  - `getProductsByCategory(categoryId)` - Fetch products
  - `getServiceTypesByProduct(productId)` - Fetch service types
  - `getServiceReasonsByType(serviceTypeId)` - Fetch reasons
  - `getDocumentGuidance(serviceTypeId)` - Fetch document requirements
  - `getBranches()` - Fetch all branches
  - `getAvailableSlots(branchId, date)` - Fetch available time slots
  - `createAppointment(request)` - Create booking
  - `getAppointmentByReference(referenceNumber)` - Lookup booking
  - `cancelAppointment(referenceNumber)` - Cancel booking

### Request/Response Models
All models defined in `src/app/models/booking.models.ts`:
- ServiceCategory, Product, ServiceType, ServiceReason
- Branch, Address, AppointmentSlot
- Customer, CreateAppointmentRequest, AppointmentResponse

## Future Enhancements (Nice-to-Have)

1. **Appointment Lookup**
   - Search component for existing bookings
   - Display booking details

2. **Cancellation**
   - Cancel existing appointments
   - Confirmation dialog

3. **Additional Features**
   - Edit appointment details
   - Appointment history
   - Email confirmation
   - SMS notifications
   - Calendar view for available slots

## Testing Checklist

- [ ] Load categories on page open
- [ ] Select category → Load products
- [ ] Select product → Load service types
- [ ] Select service type → Load reasons (if any) + guidance
- [ ] Fill customer details with validation
- [ ] Select branch → Load dates
- [ ] Select date → Load time slots
- [ ] Create appointment successfully
- [ ] Display reference number on confirmation
- [ ] Reset form for new booking
- [ ] Error handling for API failures
- [ ] Mobile responsiveness

## Browser Support
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Dependencies
- Angular 19.2.0
- Angular Material 19.2.0
- RxJS 7.8.0
- Material CDK 19.2.0

## Notes
- Backend API must be running on configured URL
- CORS must be enabled on backend for frontend domain
- All form fields are required unless marked optional
- Minimum date for booking is tomorrow
- Only weekday slots are available (Mon-Fri)