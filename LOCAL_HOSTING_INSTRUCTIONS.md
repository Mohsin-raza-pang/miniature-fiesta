# Madani Notes - Local Hosting Instructions

This document provides step-by-step instructions for setting up and running the Madani Notes application on your local machine.

## Prerequisites

Before you begin, make sure you have the following installed:

1. **Node.js** (v18 or later) - [Download Node.js](https://nodejs.org/)
2. **PostgreSQL** database - [Download PostgreSQL](https://www.postgresql.org/download/)
3. **Git** (optional) - [Download Git](https://git-scm.com/downloads)

## Setup Instructions

### 1. Extract the ZIP File

Extract the `madani-notes.zip` file to a folder on your local machine.

### 2. Install Dependencies

Open a terminal or command prompt, navigate to the extracted folder, and run:

```bash
npm install
```

This will install all the required dependencies for the project.

### 3. Set Up the Database

1. Create a new PostgreSQL database for the application.
2. Create a `.env` file in the root directory with the following content:

```
DATABASE_URL=postgresql://username:password@localhost:5432/your_database_name
```

Replace `username`, `password`, and `your_database_name` with your PostgreSQL credentials and database name.

### 4. Initialize the Database Schema

Run the following command to create the necessary tables in your database:

```bash
npm run db:push
```

### 5. Seed the Database (Optional)

If you want to populate the database with initial data, run:

```bash
npm run db:seed
```

### 6. Start the Development Server

To start the application in development mode, run:

```bash
npm run dev
```

The application will be available at http://localhost:5000

### 7. Build for Production (Optional)

To create a production build, run:

```bash
npm run build
```

Then, to start the production server:

```bash
npm start
```

## Project Structure

- `client/src` - Frontend React application
- `server` - Backend Express API
- `shared` - Shared database schema
- `db` - Database configuration
- `public` - Static assets

## Key Features

1. **Category Management**: Create, edit, and delete note categories with custom icons and colors
2. **Rich Text Notes**: Create and edit notes with rich text formatting
3. **Image Support**: Upload and embed images directly in notes
4. **Organization**: Pin and favorite notes for better organization
5. **Responsive Design**: Works on desktop and mobile devices
6. **Dark Mode**: Supports both light and dark themes

## Troubleshooting

### Database Connection Issues

- Make sure PostgreSQL is running
- Verify your database credentials in the `.env` file
- Try connecting to the database using a tool like pgAdmin to confirm access

### Application Won't Start

- Check for errors in the console
- Make sure all dependencies are installed with `npm install`
- Verify that ports 5000 is available and not in use by another application

### Image Upload Problems

- Check that your browser supports the File API
- Verify that the application has sufficient permissions to handle file operations

## Resources

- Documentation: See the `MADANI_NOTES_IMPLEMENTATION.md` file for detailed documentation
- Code details: See the `CODE_IMPLEMENTATION_DETAILS.md` file for specific code implementations

For any additional help or questions, please refer to the documentation or create an issue in the project repository.