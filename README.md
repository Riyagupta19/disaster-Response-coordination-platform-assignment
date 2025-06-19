# Disaster Response Coordination Platform

A MERN stack application for coordinating disaster response efforts by aggregating real-time data from various sources.

## Features

- Disaster Data Management: CRUD operations for disaster records with audit trail
- Location Extraction and Geocoding: Using Google Gemini API and mapping services
- Real-Time Social Media Monitoring: Integration with Twitter/Bluesky API
- Geospatial Resource Mapping: Using Supabase's PostGIS capabilities
- Official Updates Aggregation: Fetching from government/relief websites
- Image Verification: Using Google Gemini API for authenticity checks
- Real-time Updates: WebSocket integration for live data updates

## Tech Stack

- Backend: Node.js, Express.js
- Database: Supabase (PostgreSQL with PostGIS)
- Real-time: Socket.IO
- AI/ML: Google Gemini API
- Mapping: Google Maps API
- Frontend: React.js (minimal implementation)

## Prerequisites

- Node.js (v14 or higher)
- Supabase account
- Google Cloud account (for Gemini API and Maps API)
- Twitter API access (optional)

## Environment Variables

Create a `.env` file in the backend directory with the following variables:

```env
# Server Configuration
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# Supabase Configuration
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key

# Google Gemini API
GEMINI_API_KEY=your_gemini_api_key

# Google Maps API
GOOGLE_MAPS_API_KEY=your_google_maps_api_key

# Twitter API (optional)
TWITTER_API_KEY=your_twitter_api_key
TWITTER_API_SECRET=your_twitter_api_secret
TWITTER_ACCESS_TOKEN=your_twitter_access_token
TWITTER_ACCESS_SECRET=your_twitter_access_secret
```

## Setup

1. Clone the repository:
```bash
git clone [repository-url]
cd disaster-response-platform
```

2. Install backend dependencies:
```bash
cd backend
npm install
```

3. Install frontend dependencies:
```bash
cd ../frontend
npm install
```

4. Set up Supabase:
   - Create a new project in Supabase
   - Run the SQL migrations in `backend/src/db/migrations/001_initial_schema.sql`
   - Copy the project URL and anon key to your `.env` file

5. Start the development servers:

Backend:
```bash
cd backend
npm run dev
```

Frontend:
```bash
cd frontend
npm start
```

## API Endpoints

### Disasters
- `POST /api/disasters` - Create a new disaster
- `GET /api/disasters` - Get all disasters (with optional tag filter)
- `PUT /api/disasters/:id` - Update a disaster
- `DELETE /api/disasters/:id` - Delete a disaster

### Social Media
- `GET /api/disasters/:id/social-media` - Get social media reports for a disaster
- `POST /api/disasters/:id/social-media` - Add a new social media report

### Resources
- `GET /api/resources/nearby` - Get resources near a location
- `POST /api/resources` - Add a new resource
- `GET /api/resources/disaster/:disasterId` - Get resources for a disaster
- `PUT /api/resources/:id` - Update a resource

### Geocoding
- `POST /api/geocode` - Extract location and get coordinates

### Image Verification
- `POST /api/disasters/:id/verify-image` - Verify image authenticity

## WebSocket Events

- `disaster_updated` - Emitted when a disaster is created/updated/deleted
- `social_media_updated` - Emitted when new social media reports are received
- `resources_updated` - Emitted when resources are updated

## Database Schema

### Disasters
- id (UUID)
- title (TEXT)
- location_name (TEXT)
- location (GEOGRAPHY)
- description (TEXT)
- tags (TEXT[])
- owner_id (TEXT)
- created_at (TIMESTAMPTZ)
- updated_at (TIMESTAMPTZ)
- audit_trail (JSONB)

### Reports
- id (UUID)
- disaster_id (UUID)
- user_id (TEXT)
- content (TEXT)
- image_url (TEXT)
- verification_status (TEXT)
- created_at (TIMESTAMPTZ)
- updated_at (TIMESTAMPTZ)

### Resources
- id (UUID)
- disaster_id (UUID)
- name (TEXT)
- location_name (TEXT)
- location (GEOGRAPHY)
- type (TEXT)
- created_at (TIMESTAMPTZ)
- updated_at (TIMESTAMPTZ)

### Cache
- key (TEXT)
- value (JSONB)
- expires_at (TIMESTAMPTZ)
- created_at (TIMESTAMPTZ)

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Google Gemini API for AI capabilities
- Supabase for database and real-time features
- Twitter/Bluesky for social media integration
- PostGIS for geospatial functionality 