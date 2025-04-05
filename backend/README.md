# Dhanvantri Healthcare Platform - Backend

Backend services for the Dhanvantri Healthcare Platform, a comprehensive healthcare management system.

## Features

- Patient, Doctor, and Hospital management
- Appointment scheduling and management
- Medical records and prescriptions
- Laboratory reports
- Notifications system
- Health metrics tracking
- Emergency medical card with QR code access

## Tech Stack

- Node.js & Express.js
- MongoDB with Mongoose ODM
- JWT Authentication
- RESTful API architecture
- Swagger API documentation

## Setup Instructions

### Prerequisites
- Node.js (v14+)
- MongoDB

### Installation

1. Clone the repository
   ```
   git clone https://github.com/yourusername/dhanvantri.git
   ```

2. Navigate to the backend directory
   ```
   cd dhanvantri/backend
   ```

3. Install dependencies
   ```
   npm install
   ```

4. Create a `.env` file with the following variables:
   ```
   PORT=3000
   MONGODB_URI=mongodb://localhost:27017/dhanvantri
   JWT_SECRET=yourSecretKey
   NODE_ENV=development
   API_URL=http://localhost:3000/api/v1
   ```

5. Start the development server
   ```
   npm run dev
   ```

6. Access the API documentation at `http://localhost:3000/api-docs`

### Automated Setup

Alternatively, you can use the provided setup script:

```
bash setup-backend.sh
```

## API Overview

- **Authentication**: User registration, login, password reset
- **Patients**: Profile management, medical history
- **Doctors**: Profile management, availability settings
- **Hospitals**: Profile management, affiliated doctors
- **Appointments**: Scheduling, rescheduling, cancellation
- **Medical Records**: Creation, update, access control
- **Prescriptions**: Creation, renewal, history
- **Lab Reports**: Upload, view, share
- **Notifications**: System and user-generated alerts
- **Health Metrics**: Track vital signs and health parameters
- **Emergency Card**: QR-code based emergency medical information access

## License

MIT 