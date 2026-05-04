# Electricity Demand Prediction 

A modern, interactive web application for predicting electricity demand across Indian states using machine learning. Built with React, Next.js, and Recharts for real-time analytics and forecasting.

## Features

- **Dashboard**: Real-time electricity demand metrics, demand vs forecast comparisons, and state-specific analysis
- **Prediction Form**: Interactive interface to predict electricity demand based on multiple parameters
- **Analytics**: Historical data visualization, accuracy distribution, and comprehensive prediction history
- **State Selection**: Easy switching between Indian states with specific demand insights
- **Data Visualization**: Professional charts and graphs for trend analysis
- **Responsive Design**: Fully responsive UI that works on desktop and mobile devices

## Tech Stack

- **Frontend Framework**: Next.js 16 (React 19.2)
- **Styling**: Tailwind CSS v4, shadcn/ui components
- **State Management**: Zustand
- **Data Visualization**: Recharts
- **Form Handling**: React Hook Form with Zod validation
- **UI Components**: Radix UI primitives
- **Date Handling**: date-fns
- **Type Safety**: TypeScript

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **npm** (v9 or higher) or **yarn** (v3 or higher)
- **Git** - [Download](https://git-scm.com/)

Verify installations by running:
\`\`\`bash
node --version
npm --version
\`\`\`

## Installation

### 1. Clone the Repository

\`\`\`bash
git clone <your-repository-url>
cd electricity-demand-prediction
\`\`\`

### 2. Install Dependencies

Using npm:
\`\`\`bash
npm install
\`\`\`

Or using yarn:
\`\`\`bash
yarn install
\`\`\`

Or using pnpm:
\`\`\`bash
pnpm install
\`\`\`

### 3. Environment Setup (Optional)

The app works without environment variables out of the box for development. If you plan to integrate with a backend API:

Create a `.env.local` file in the root directory:
\`\`\`bash
cp .env.example .env.local  # If an example file exists
\`\`\`

Add your backend API endpoint:
\`\`\`
NEXT_PUBLIC_API_URL=http://localhost:5000/api
\`\`\`

**Note**: Environment variables prefixed with `NEXT_PUBLIC_` are accessible in the browser.

## Running the Application

### Development Mode

Start the development server:

\`\`\`bash
npm run dev
\`\`\`

Or with yarn:
\`\`\`bash
yarn dev
\`\`\`

The application will be available at:
- **URL**: http://localhost:3000
- **API Routes**: http://localhost:3000/api

The server will automatically reload when you make code changes (hot reload enabled).

### Production Build

Build the application for production:

\`\`\`bash
npm run build
\`\`\`

Start the production server:

\`\`\`bash
npm start
\`\`\`

### Linting

Check code quality:

\`\`\`bash
npm run lint
\`\`\`

## Project Structure

\`\`\`
electricity-demand-prediction/
├── app/
│   ├── layout.tsx              # Root layout with navigation
│   ├── page.tsx                # Dashboard (home page)
│   ├── globals.css             # Global styles and design tokens
│   ├── predict/
│   │   └── page.tsx            # Prediction form page
│   └── analytics/
│       └── page.tsx            # Analytics and history page
├── components/
│   ├── navigation.tsx          # Main navigation component
│   ├── dashboard.tsx           # Dashboard layout component
│   ├── prediction-form.tsx     # Prediction form component
│   ├── analytics.tsx           # Analytics component
│   ├── demand-chart.tsx        # Demand visualization chart
│   ├── metric-card.tsx         # Metric display card
│   ├── state-selector.tsx      # State selection dropdown
│   ├── status-badge.tsx        # Status indicator badge
│   ├── data-table.tsx          # Data display table
│   └── ui/                     # shadcn/ui components
├── hooks/
│   ├── use-prediction-context.ts  # Zustand store hook
│   └── use-mobile.ts           # Mobile detection hook
├── lib/
│   ├── types.ts                # TypeScript type definitions
│   ├── constants.ts            # App constants and configuration
│   ├── utils.ts                # Utility functions
│   └── prediction-store.ts     # Zustand store definition
├── public/                     # Static assets
├── next.config.mjs             # Next.js configuration
├── tailwind.config.ts          # Tailwind CSS configuration
├── tsconfig.json               # TypeScript configuration
├── package.json                # Dependencies and scripts
└── README.md                   # This file
\`\`\`

## Usage

### Dashboard (Home Page)

1. Open http://localhost:3000
2. View real-time electricity demand metrics
3. See demand vs forecast comparisons
4. Select different states to view state-specific data
5. Analyze peak hours and demand patterns

### Prediction Page

1. Navigate to `/predict`
2. Fill in the prediction form:
   - **State**: Select an Indian state
   - **Date**: Choose a date for prediction
   - **Temperature**: Enter temperature in Celsius
   - **Humidity**: Enter humidity percentage
   - **Season**: Select the current season
   - **Day Type**: Choose weekend or weekday
   - **Industrial Load**: Specify industrial load percentage
3. Click "Get Prediction"
4. View the predicted demand with confidence levels and recommendations

### Analytics Page

1. Navigate to `/analytics`
2. View prediction history with filtering options
3. Analyze model accuracy and error distribution
4. Compare monthly demand trends
5. Review state-specific performance metrics

## API Integration (Backend Ready)

This frontend is ready to connect to a FastAPI backend. To integrate:

1. **Set your backend API URL** in `.env.local`:
   \`\`\`
   NEXT_PUBLIC_API_URL=http://localhost:5000/api
   \`\`\`

2. **Create API routes** in `app/api/` directory to proxy requests to your backend

3. **Update components** to fetch from the API instead of using mock data

Example modification for `components/prediction-form.tsx`:
\`\`\`tsx
// Replace mock prediction with API call
const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/predict`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(formData)
});
const prediction = await response.json();
\`\`\`

## Customization

### Add New States

Edit `lib/constants.ts`:
\`\`\`tsx
export const STATES = [
  { name: "New State", code: "NS" },
  // ... existing states
];
\`\`\`

### Modify Color Scheme

Update design tokens in `app/globals.css`:
\`\`\`css
@theme {
  --color-primary: #your-primary-color;
  --color-secondary: #your-secondary-color;
  /* ... other tokens */
}
\`\`\`

### Adjust Form Parameters

Edit `components/prediction-form.tsx` to add or remove fields.

## Troubleshooting

### Port 3000 Already in Use

\`\`\`bash
# On macOS/Linux
lsof -i :3000
kill -9 <PID>

# On Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F
\`\`\`

### Dependencies Installation Issues

Clear cache and reinstall:
\`\`\`bash
rm -rf node_modules package-lock.json
npm install
\`\`\`

### Build Errors

Ensure TypeScript types are correct:
\`\`\`bash
npx tsc --noEmit
\`\`\`

### Hot Reload Not Working

Restart the development server:
\`\`\`bash
# Stop the server (Ctrl+C)
npm run dev
\`\`\`

## Performance Tips

- The app uses client-side data with Zustand for state management
- Charts are lazy-loaded with Recharts
- Images are optimized with Next.js Image component
- Use the production build for better performance

## Browser Support

- Chrome/Edge (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Future Enhancements

- Backend API integration with FastAPI
- Real-time data fetching from electricity boards
- User authentication and profiles
- Export predictions to CSV/PDF
- Email notifications for high demand alerts
- Advanced filtering and search capabilities

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server on http://localhost:3000 |
| `npm run build` | Create optimized production build |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint code quality checks |

## Deployment

### Deploy to Vercel (Recommended)

1. Push your code to GitHub
2. Go to [Vercel](https://vercel.com)
3. Import your repository
4. Click "Deploy"
5. Set environment variables if needed
6. Your app will be live!

### Deploy to Other Platforms

The app can be deployed to any platform that supports Node.js:
- **AWS**, **Azure**, **Google Cloud**, **Heroku**, **Railway**, **Render**, etc.

Follow platform-specific deployment guides.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License. See the LICENSE file for details.

## Support

For issues or questions:
1. Check existing issues on GitHub
2. Create a new issue with detailed description
3. Include reproduction steps and environment details

## Contact

- **Project Repository**: [GitHub Link]
- **Issues**: [GitHub Issues]
- **Discussions**: [GitHub Discussions]

---

**Happy Predicting! 🔌⚡**
