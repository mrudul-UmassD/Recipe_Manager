# Recipe Manager

A full-stack application for managing your favorite recipes. Users can add, view, edit, and delete recipes, including ingredients, instructions, and images.

## Features

- Add new recipes with title, description, ingredients, instructions, and images
- View all recipes in a clean, organized manner
- Edit existing recipes
- Delete recipes
- Filter recipes by category/tags
- Responsive design for mobile and desktop

## Tech Stack

- **Frontend**: React, React Router, CSS Modules
- **Backend**: Node.js, Express
- **Database**: SQLite
- **Image Storage**: Local file system with file uploads

## Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

### Installation

1. Clone the repository
2. Navigate to the project directory

### Backend Setup

```bash
cd backend
npm install
npm start
```

The backend server will start on port 5000.

### Frontend Setup

```bash
cd frontend
npm install
npm start
```

The frontend development server will start on port 3000.

## Project Structure

```
recipe-manager/
├── backend/             # Node.js/Express backend
│   ├── controllers/     # Route controllers
│   ├── models/          # Database models
│   ├── routes/          # API routes
│   ├── uploads/         # Recipe images storage
│   ├── database.js      # Database configuration
│   ├── server.js        # Server entry point
│   └── package.json     # Backend dependencies
├── frontend/            # React frontend
│   ├── public/          # Static files
│   ├── src/             # React components and styles
│   └── package.json     # Frontend dependencies
└── README.md            # Project documentation
```

## API Endpoints

- `GET /api/recipes` - Get all recipes
- `GET /api/recipes/:id` - Get a specific recipe
- `POST /api/recipes` - Create a new recipe
- `PUT /api/recipes/:id` - Update a recipe
- `DELETE /api/recipes/:id` - Delete a recipe 