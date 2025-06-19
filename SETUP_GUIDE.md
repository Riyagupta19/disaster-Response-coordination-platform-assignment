# Setup Guide for Disaster Response Platform

## Google Maps API Setup

### 1. Create a Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable billing for your project (required for API usage)

### 2. Enable Required APIs
1. Go to "APIs & Services" > "Library"
2. Search for and enable the following APIs:
   - **Geocoding API** - For converting addresses to coordinates
   - **Maps JavaScript API** - For displaying maps (optional)
   - **Places API** - For location search (optional)

### 3. Create API Key
1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "API Key"
3. Copy the generated API key

### 4. Restrict API Key (Recommended)
1. Click on the created API key
2. Under "Application restrictions", select "HTTP referrers" or "IP addresses"
3. Under "API restrictions", select "Restrict key" and choose:
   - Geocoding API
   - Maps JavaScript API (if using)
   - Places API (if using)

### 5. Add API Key to Environment Variables
Add the following to your `.env` file:
```env
GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

## Google Gemini API Setup

### 1. Enable Gemini API
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the generated API key

### 2. Add API Key to Environment Variables
Add the following to your `.env` file:
```env
GEMINI_API_KEY=your_gemini_api_key
```

## Supabase Setup

### 1. Create Supabase Project
1. Go to [Supabase](https://supabase.com/)
2. Create a new project
3. Wait for the project to be created

### 2. Get Project Credentials
1. Go to "Settings" > "API"
2. Copy the following:
   - Project URL
   - Anon public key

### 3. Run Database Migrations
1. Go to "SQL Editor" in your Supabase dashboard
2. Copy and paste the contents of `backend/src/db/migrations/001_initial_schema.sql`
3. Click "Run" to execute the migration

### 4. Add Credentials to Environment Variables
Add the following to your `.env` file:
```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Complete Environment Variables Example

Create a `.env` file in the `backend` directory with the following:

```env
# Server Configuration
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# Supabase Configuration
SUPABASE_URL=https://your-project-id.supabase.co
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

## Testing the Setup

### 1. Test Backend
```bash
cd backend
npm run dev
```

### 2. Test Frontend
```bash
cd frontend
npm start
```

### 3. Test API Endpoints
```bash
# Test health endpoint
curl http://localhost:5000/health

# Test location extraction
curl -X POST http://localhost:5000/api/geocode \
  -H "Content-Type: application/json" \
  -d '{"text": "There is a flood in Manhattan, NYC"}'

# Test image verification
curl -X POST http://localhost:5000/api/verify-image \
  -H "Content-Type: application/json" \
  -d '{"imageUrl": "https://example.com/image.jpg", "disasterContext": "Flood in Manhattan"}'
```

## Troubleshooting

### Google Maps API Issues
- **REQUEST_DENIED**: Check if API key is correct and APIs are enabled
- **OVER_QUERY_LIMIT**: You've exceeded the free tier limit
- **ZERO_RESULTS**: The address couldn't be found

### Gemini API Issues
- **404 Not Found**: Check if the API is enabled in Google AI Studio
- **Invalid API Key**: Verify the API key is correct
- **Rate Limit Exceeded**: Wait and try again

### Supabase Issues
- **Connection Error**: Check if the URL and API key are correct
- **Migration Errors**: Ensure PostGIS extension is enabled
- **Permission Denied**: Check if the anon key has proper permissions

## Cost Considerations

### Google Maps API
- Free tier: $200 credit per month
- Geocoding: $5 per 1000 requests
- Maps JavaScript: $7 per 1000 loads

### Google Gemini API
- Free tier: 15 requests per minute
- Paid tier: $0.00025 per 1K characters input, $0.0005 per 1K characters output

### Supabase
- Free tier: 500MB database, 2GB bandwidth
- Paid tier: Starts at $25/month

## Security Best Practices

1. **Never commit API keys to version control**
2. **Use environment variables for all sensitive data**
3. **Restrict API keys to specific domains/IPs**
4. **Monitor API usage regularly**
5. **Set up billing alerts**
6. **Use the principle of least privilege for database permissions** 