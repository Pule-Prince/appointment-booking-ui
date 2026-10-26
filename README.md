# Capitec Appointment Booking System - Frontend

## Overview

Angular 19 project for booking and managing appointments with real-time slot availability, form validation, and email confirmations.

---

## Quick Start

### Clone Repository
```bash
git clone https://github.com/Pule-Prince/appointment-booking-ui.git
cd into the directory where you cloned the project
```

### Environment Requirements

**Required:**
- Node.js 20.18.0+
- npm 10.8.2+
- Angular 19.2.25

**Verify:**
```command
node --version
npm --version
```

---

## Setup Project

### Install Dependencies (node modules)
```bash
npm install
```

---

## Running the Development Server

```bash
# Start development server
ng serve

# Or
npm start

# Application runs on: http://localhost:4200
```

**Auto-reload:** Changes are automatically reflected in the browser.

## Technology Stack

- **Angular 19** - Framework
- **TypeScript 5+** - Language
- **Angular Material 19.2.0** - UI Components
- **RxJS 7+** - Reactive Programming
- **Reactive Forms** - Form Management

---

## Project Structure

```
src/app/
├── components/
│   ├── booking-stepper/           # Booking workflow
│   └── appointments-dashboard/    # Appointment lookup
├── services/
│   ├── booking.service.ts
│   ├── branch.service.ts
│   └── service-catalog.service.ts
├── models/
│   └── booking.models.ts
└── app.component.ts
```

**Application runs on browser:**
```
http://localhost:4200
```
