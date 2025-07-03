# Disaster Response Coordination Platform

A simple web application for coordinating disaster response efforts. This platform allows users to report disasters and manage available resources.

## Features

- **Disaster Management**: Create and view disaster reports with location, description, and tags
- **Resource Management**: Add and track available resources with location coordinates
- **Real-time Updates**: Live updates using WebSocket connections
- **Simple Interface**: Clean, user-friendly interface built with React

## Tech Stack

### Frontend
- React 18
- Socket.IO Client
- Axios for API calls
- Basic CSS styling

### Backend
- Node.js with Express
- Socket.IO for real-time communication
- Supabase for database
- Basic error handling

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Supabase account

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the backend directory with your Supabase credentials:
```
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
PORT=5000
```

4. Start the backend server:
```bash
npm start
```

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the frontend directory:
```
REACT_APP_API_URL=http://localhost:5000
```

4. Start the frontend development server:
```bash
npm start
```

## Database Schema

### Disasters Table
- `id` (UUID, Primary Key)
- `title` (Text)
- `location_name` (Text)
- `description` (Text)
- `tags` (Array)
- `created_at` (Timestamp)

### Resources Table
- `id` (UUID, Primary Key)
- `name` (Text)
- `location_name` (Text)
- `type` (Text)
- `lat` (Numeric)
- `lon` (Numeric)
- `created_at` (Timestamp)

## API Endpoints

### Disasters
- `GET /api/disasters` - Get all disasters
- `POST /api/disasters` - Create a new disaster
- `PUT /api/disasters/:id` - Update a disaster
- `DELETE /api/disasters/:id` - Delete a disaster

### Resources
- `GET /api/resources` - Get all resources
- `POST /api/resources` - Add a new resource
- `PUT /api/resources/:id` - Update a resource
- `DELETE /api/resources/:id` - Delete a resource

## Usage

1. **Creating a Disaster Report**:
   - Navigate to the "Disasters" tab
   - Fill in the title, location, description, and tags
   - Click "Create Disaster"

2. **Adding Resources**:
   - Navigate to the "Resources" tab
   - Fill in the resource details including coordinates
   - Click "Add Resource"

3. **Viewing Data**:
   - All disasters and resources are displayed in real-time
   - Data updates automatically when changes are made

## Development

This is a simple project suitable for learning purposes. The code is intentionally kept basic and readable, making it easy to understand and modify.

## License

This project is open source and available under the MIT License. 