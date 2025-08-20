# VETSTOR - Veterinary Records Application

A React + TypeScript application for extracting and displaying vaccination records from veterinary health data.

## Features

- **Vaccination Data Extraction**: Intelligent parsing of Czech veterinary records
- **Animal List View**: Shows all animals with their latest vaccination dates
- **Detailed History**: Complete vaccination history for each animal
- **Search & Filter**: Find animals by ID
- **Confidence Scoring**: Displays extraction confidence for transparency
- **Modern UI**: Built with shadcn/ui components

## Technology Stack

- **Frontend**: Next.js 15 + React 19 + TypeScript
- **API Layer**: tRPC for type-safe API calls
- **Data Fetching**: TanStack Query for caching and state management
- **Database**: Supabase PostgreSQL (read-only access)
- **UI Components**: shadcn/ui + Tailwind CSS
- **Validation**: Zod for runtime type checking

## Installation

1. **Install dependencies**:
   ```bash
   npm install @trpc/server @trpc/client @trpc/react-query @trpc/next @tanstack/react-query@latest @supabase/supabase-js zod
   ```

2. **Run the development server**:
   ```bash
   npm run dev
   ```

3. **Open the application**:
   Visit [http://localhost:3000](http://localhost:3000)

## How It Works

### Data Processing Pipeline

1. **Raw Data**: Reads health records from Supabase `raw_records` table
2. **Text Analysis**: Extracts vaccination information from Czech medical text
3. **Confidence Scoring**: Assigns confidence levels to extracted data
4. **Caching**: Stores processed data in memory for performance
5. **API**: Serves data through type-safe tRPC endpoints
6. **Frontend**: Displays data in responsive React components

### Vaccination Extraction Algorithm

The system identifies vaccinations using:
- Czech medical terms: "vakcinace", "očkování", "vakcinoval"
- Vaccine names: Tricat, Nobivac, Feligen, Canigen, Biocan, DHPPI, Rabies
- Compound vaccines: "Nobivac DHPPI+L4", "Biocan Novel DHPPi/L4"
- Fuzzy matching for typos and abbreviations

### Confidence Scoring

Each extracted vaccination includes a confidence score (0-100%) based on:
- Presence of vaccination terminology
- Specific vaccine name matches
- Text quality and length
- Medical context validation

## API Endpoints

- `GET /api/trpc/getAnimalsWithLatestVaccination` - List all animals with latest vaccination
- `GET /api/trpc/getAnimalVaccinationHistory` - Get full vaccination history for an animal
- `POST /api/trpc/processAllRecords` - Process all records (admin function)
- `POST /api/trpc/clearCache` - Clear data cache (admin function)

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/trpc/          # tRPC API routes
│   ├── animal/[id]/       # Animal detail pages
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── animals-list.tsx  # Animal list component
│   └── animal-detail.tsx # Animal detail component
├── providers/            # React providers
│   └── trpc-provider.tsx # tRPC client setup
├── server/               # Backend logic
│   ├── routers/          # tRPC routers
│   ├── services/         # Business logic
│   ├── types.ts          # Type definitions
│   └── trpc.ts           # tRPC setup
└── utils/                # Utilities
    └── trpc.ts           # tRPC client config
```

## Usage

### Main Features

1. **View All Animals**: Home page shows all animals with vaccination status
2. **Search Animals**: Use the search box to find specific animal IDs
3. **View Details**: Click on any animal to see their complete vaccination history
4. **Update Data**: Use the "Aktualizovat data" button to refresh from database

### Data Processing

- The app processes data on-demand with 5-minute caching
- Use "Aktualizovat data" to force refresh all records
- Confidence scores help identify extraction quality

## Deployment

### Vercel (Recommended)

1. Push code to GitHub repository
2. Connect to Vercel
3. Deploy automatically with default settings
4. Environment variables are already configured for the assignment

### Other Platforms

The app can be deployed to any platform supporting Next.js:
- Netlify
- Railway
- Render
- AWS Amplify

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run Biome linter
- `npm run format` - Format code with Biome

### Environment

The app uses the provided Supabase credentials from the assignment:
- Database URL: `https://vmmbjfycdefakulnyzhl.supabase.co`
- Anon Key: Already configured in the code

## Implementation Notes

### Czech Language Support

The vaccination extraction algorithm specifically handles Czech veterinary terminology and common medical abbreviations used by Czech veterinarians.

### Performance Optimization

- In-memory caching reduces database calls
- React Query provides background refetching
- Optimistic updates for better user experience
- Lazy loading for large datasets

### Error Handling

- Comprehensive error boundaries
- Graceful fallbacks for missing data
- User-friendly error messages in Czech
- Retry mechanisms for failed requests

## Future Enhancements

- Machine learning for better text extraction
- Real-time data synchronization
- Advanced filtering and search
- Data export functionality
- Mobile application
- User authentication and authorization

## Assignment Completion

✅ **Part 1**: Developer-ready tickets in `Task_1_result.md`
✅ **Part 2**: Working React + TypeScript app with vaccination extraction
✅ **Must-haves**: Supabase integration, React + TypeScript, data processing, UI presentation
✅ **Documentation**: Implementation decisions in `Task_2_comments.md`

The application demonstrates a focused slice showing the technical approach and can be extended with additional features as outlined in the planning documentation.