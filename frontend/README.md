# Frontend (Expo React Native)

A mobile application for managing micro-credit operations, built with React Native and Expo.

## Structure

```
frontend/
├── src/
│   ├── api/client.js - API client configuration
│   ├── context/AuthContext.js - Authentication context
│   ├── screens/ - All application screens
│   │   ├── auth/ - Login screen
│   │   ├── customers/ - Customer management
│   │   ├── loans/ - Loan management
│   │   ├── payments/ - Payment processing
│   │   ├── deposits/ - Bank deposit management
│   │   └── settings/ - Settings and bank accounts
│   └── theme/
│       ├── colors.js - Color theme
│       └── commonStyles.js - Reusable styles
├── App.js - Main app component with navigation
└── assets/ - Images and assets
```

## Setup & Run

1. Install dependencies:

   ```bash
   cd frontend
   npm install
   ```

2. Configure API endpoint:

   - Update `API_BASE` in `src/api/client.js` with your backend URL
   - For Android emulator: `http://10.0.2.2:4000/api`
   - For iOS simulator: `http://localhost:4000/api`
   - For physical device: `http://YOUR_COMPUTER_IP:4000/api`

3. Start the development server:
   ```bash
   npm start
   ```

## Features

- **Authentication**: Role-based login (Admin, Manager, Collector)
- **Customer Management**: Create, view, edit, and search customers
- **Loan Management**: Create loans, view loan details, payment plans, and history
- **Payment Processing**: Record payments and view payment history
- **Bank Deposits**: Manage unbanked payments and bank accounts
- **Dashboard**: Overview of active loans, overdue payments, and pending deposits

## Key Screens

1. **Home**: Dashboard with quick actions and system summary
2. **Customers**: List, search, and manage customers
3. **Loans**: View and manage all loans
4. **Payments**: Record and view payment history
5. **Bank Deposits**: Process bank deposits
6. **Settings**: Bank accounts and app settings
