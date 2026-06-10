# Indy Voting Guide - IndTimes.news

A non-partisan voter guide that helps independent voters compare major party candidates side-by-side for the November 2026 Election.

## Setup Instructions

### Step 1 - Install Dependencies
```bash
npm install
```

### Step 2 - Get API Keys

**Google Civic Information API:**
1. Go to https://console.cloud.google.com
2. Create a new project called "Indy Voting Guide"
3. Search for "Google Civic Information API" and enable it
4. Go to Credentials > Create Credentials > API Key
5. Copy the API key

**Google Gemini API:**
1. Go to https://aistudio.google.com
2. Click "Get API Key"
3. Create a new API key
4. Copy the API key

### Step 3 - Add API Keys
Open the `.env` file and replace the placeholder values:
```
REACT_APP_CIVIC_API_KEY=paste_your_civic_api_key_here
REACT_APP_GEMINI_API_KEY=paste_your_gemini_api_key_here
```

### Step 4 - Run Locally
```bash
npm start
```
App runs at http://localhost:3000

### Step 5 - Build for Production
```bash
npm run build
```
This creates a `build` folder ready for AWS deployment.

## AWS Deployment (S3 + CloudFront)

1. Create an S3 bucket named `vote.independenttimes.news`
2. Enable static website hosting
3. Upload the `build` folder contents
4. Create a CloudFront distribution pointing to the S3 bucket
5. Add a CNAME record in Lisa's domain DNS: `vote` → CloudFront URL

## Project Structure

```
src/
  App.js          - Main app with page routing
  App.css         - Global styles
  pages/
    Page1.js      - Zip code + email form
    Page1.css
    Page2.js      - Race selection (House, Senate, Governor)
    Page2.css
    Page3.js      - Side-by-side candidate comparison with AI
    Page3.css
```

## Features

- Zip code lookup via Google Civic API
- Dynamic district identification
- AI-powered candidate position summaries (30 issues)
- Side-by-side comparison table
- Error handling for missing races
- Mobile responsive
- Patriotic red/white/blue theme
- Email capture for newsletter

## Tech Stack
- React 18
- Google Civic Information API
- Google Gemini Flash API
- AWS S3 + CloudFront hosting
