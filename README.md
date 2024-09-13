# Scheduling App

This is a comprehensive scheduling application designed for team owners to manage bookings and contractors. It provides a robust system for creating, managing, and tracking appointments, as well as integrating with Google Calendar for improved scheduling efficiency.

## Features

### User Authentication and Authorization
- Secure login system using JWT tokens
- Role-based access control (user, admin, team_owner, employee, contractor)
- Password hashing for enhanced security

### User Management
- Create new users with specified roles
- Retrieve user information by email or ID
- Update user profiles, including Google Calendar integration

### Booking Management
- Create new bookings with detailed customer and service information
- Assign contractors to bookings
- View bookings by team owner or contractor
- Email notifications for new bookings

### Calendar Integration
- Display and manage events using FullCalendar
- Create, update, and delete events
- Sync with Google Calendar (planned feature)

### Team Owner Dashboard
- Overview of all bookings and contractors
- Ability to create new bookings
- View contractor availability

### Contractor/Employee Features
- View assigned bookings
- Manage personal calendar and availability

### API Endpoints
- RESTful API for bookings and events
- Secure endpoints with authentication middleware

### Responsive UI
- User-friendly interface for desktop and mobile devices
- Interactive calendar view
- Modal forms for event and booking creation/editing

## Planned Features

### Google Calendar Integration
- Sync contractor availability with their Google Calendar
- Two-way synchronization of events

### Advanced Scheduling
- Conflict detection when scheduling appointments
- Automated scheduling suggestions based on availability

### Customer Management
- Store and manage customer information
- View booking history for each customer

### Reporting and Analytics
- Generate reports on booking trends, popular services, etc.
- Dashboard with key performance indicators

### Mobile App
- Native mobile application for iOS and Android

### Payment Integration
- Process payments for bookings
- Generate invoices automatically

### Service Catalog
- Manage a list of services offered
- Associate services with specific contractors/employees

### Automated Reminders
- Send SMS or email reminders to customers and contractors

### Multi-language Support
- Localization for multiple languages

### Team Collaboration Tools
- Internal messaging system
- Task assignment and tracking

This scheduling app aims to provide a comprehensive solution for businesses managing a team of contractors or employees, streamlining the booking process, and improving overall operational efficiency.

## Development

Run the dev server:

```shellscript
npm run dev
```

## Deployment

First, build your app for production:

```sh
npm run build
```

Then run the app in production mode:

```sh
npm start
```

Now you'll need to pick a host to deploy it to.

### DIY

If you're familiar with deploying Node applications, the built-in Remix app server is production-ready.

Make sure to deploy the output of `npm run build`

- `build/server`
- `build/client`

## Styling

This template comes with [Tailwind CSS](https://tailwindcss.com/) already configured for a simple default starting experience. You can use whatever css framework you prefer. See the [Vite docs on css](https://vitejs.dev/guide/features.html#css) for more information.

## Running with Docker Compose

To run the application using Docker Compose, follow these steps:

1. Make sure you have Docker and Docker Compose installed on your system.

2. Clone the repository and navigate to the project directory.

3. Build and start the containers:

   ```
   docker-compose up --build
   ```

4. The application will be available at `http://localhost:3000`.

5. To access the MailHog web interface for email testing, go to `http://localhost:8025`.

6. To stop the containers, press `Ctrl+C` in the terminal where docker-compose is running, or run:

   ```
   docker-compose down
   ```
