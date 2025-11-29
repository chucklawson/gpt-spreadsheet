# Portfolio Manager Feature

Standalone portfolio lot tracking feature with AWS Amplify backend. Track ticker lots across multiple portfolios with real-time synchronization, detailed analytics, and ticker-level metadata management.

## Features

- Real-time data synchronization via AWS Amplify subscriptions
- Portfolio management (create, delete, assign lots to multiple portfolios)
- Ticker lot tracking (purchase date, shares, cost basis, notes)
- Ticker-level metadata (company name, base yield)
- Aggregated ticker summaries with calculated statistics
- Column customization for spreadsheet views
- Modal-based detail views for individual tickers
- Bulk lot operations

## Prerequisites

- React 18+ or 19+
- React Router DOM
- AWS Amplify configured
- Tailwind CSS
- TypeScript (recommended)

## Installation

### 1. Ensure Dependencies

```bash
npm install aws-amplify @aws-amplify/ui-react lucide-react react-router-dom
```

### 2. Configure Amplify

Ensure Amplify is configured in your app's entry point (e.g., `main.tsx` or `App.tsx`):

```typescript
import { Amplify } from 'aws-amplify';
import outputs from './amplify_outputs.json';

Amplify.configure(outputs, { ssr: false });
```

**Note:** The `amplify_outputs.json` file and `amplify/` directory should remain in your project root, as they are shared backend infrastructure.

### 3. Add Route to React Router

```typescript
import { createBrowserRouter } from 'react-router-dom';
import { PortfolioManagerPage } from '@/features/portfolio-manager';

const router = createBrowserRouter([
  {
    path: '/portfolio',
    element: <PortfolioManagerPage />,
  },
  // ... other routes
]);
```

### 4. Update Tailwind Config

Ensure your `tailwind.config.js` includes the feature directory:

```javascript
// tailwind.config.js
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
    './features/**/*.{js,ts,jsx,tsx}', // Add this line
  ],
  // ... rest of config
}
```

## Usage

### Basic Usage

```typescript
import { PortfolioManagerPage } from '@/features/portfolio-manager';

export default function PortfolioRoute() {
  return <PortfolioManagerPage />;
}
```

### With Authentication

```typescript
import { PortfolioManagerPage } from '@/features/portfolio-manager';
import { useAuth } from '@/lib/auth'; // Your app's auth hook

export default function PortfolioRoute() {
  const { user, signOut } = useAuth();

  return (
    <PortfolioManagerPage
      user={user}
      onSignOut={signOut}
    />
  );
}
```

### Custom Styling

```typescript
import { PortfolioManagerPage } from '@/features/portfolio-manager';

export default function PortfolioRoute() {
  return (
    <PortfolioManagerPage
      className="min-h-screen bg-gray-100 p-4"
    />
  );
}
```

### Using Individual Hooks

For advanced use cases, you can use the individual hooks to build custom UIs:

```typescript
import { usePortfolioData } from '@/features/portfolio-manager';

function CustomPortfolioView() {
  const { summaries, loading, error } = usePortfolioData();

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {summaries.map(s => (
        <div key={s.ticker}>
          {s.ticker}: ${s.totalCost.toFixed(2)} ({s.totalShares} shares)
        </div>
      ))}
    </div>
  );
}
```

## API Reference

### Components

#### PortfolioManagerPage

Main page component for portfolio management.

**Props:**

| Prop | Type | Description |
|------|------|-------------|
| `user` | `{ email?: string; username?: string }` | Optional user info for display in header |
| `onSignOut` | `() => void` | Optional sign out callback. If provided, sign out button will be shown |
| `className` | `string` | Optional CSS classes to customize the container |

**Example:**

```typescript
<PortfolioManagerPage
  user={{ email: 'user@example.com' }}
  onSignOut={() => console.log('Sign out')}
  className="h-screen"
/>
```

### Hooks

#### usePortfolioData()

Orchestrator hook providing all portfolio data and operations. This is the primary hook for accessing portfolio functionality.

**Returns:**

```typescript
{
  // Data
  lots: TickerLot[];
  tickers: Ticker[];
  summaries: TickerSummary[];
  portfolios: Portfolio[];
  loading: boolean;
  error: string | null;

  // Lot operations
  saveLot: (data: LotFormData, id?: string) => Promise<void>;
  deleteLot: (id: string) => Promise<void>;
  deleteSelected: (ids: string[]) => Promise<void>;
  refresh: () => Promise<void>;

  // Ticker operations
  updateTicker: (ticker: Ticker) => Promise<void>;

  // Portfolio operations
  createPortfolio: (name: string, description: string) => Promise<void>;
  deletePortfolio: (id: string, name: string) => Promise<void>;
}
```

#### useTickerLots()

Hook for managing ticker lots with real-time synchronization.

**Returns:**

```typescript
{
  lots: TickerLot[];
  loading: boolean;
  error: string | null;
  saveLot: (data: LotFormData, id?: string) => Promise<void>;
  deleteLot: (id: string) => Promise<void>;
  deleteSelected: (ids: string[]) => Promise<void>;
  refresh: () => Promise<void>;
}
```

#### usePortfolios()

Hook for managing portfolios.

**Returns:**

```typescript
{
  portfolios: Portfolio[];
  initializeDefault: () => Promise<void>;
  loadPortfolios: () => Promise<void>;
  createPortfolio: (name: string, description: string) => Promise<void>;
  deletePortfolio: (id: string, name: string) => Promise<void>;
}
```

#### useTickers()

Hook for managing ticker metadata.

**Returns:**

```typescript
{
  tickers: Ticker[];
  loadTickers: () => Promise<void>;
  updateTicker: (ticker: Ticker) => Promise<void>;
}
```

#### useAmplifyClient()

Hook for creating a memoized Amplify Data client.

**Returns:** `GeneratedClient<Schema>`

### Types

```typescript
interface Portfolio {
  id: string;
  name: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
  owner?: string;
}

interface Ticker {
  id: string;
  symbol: string;
  companyName?: string;
  baseYield: number;
  createdAt?: string;
  updatedAt?: string;
  owner?: string;
}

interface TickerLot {
  id: string;
  ticker: string;
  shares: number;
  costPerShare: number;
  purchaseDate: string;
  portfolios: string[];
  calculateAccumulatedProfitLoss: boolean;
  baseYield: number;
  notes?: string;
  totalCost: number;
  createdAt?: string;
  updatedAt?: string;
  owner?: string;
}

interface TickerSummary {
  ticker: string;
  companyName?: string;
  baseYield: number;
  totalShares: number;
  totalCost: number;
  averageCostPerShare: number;
  lotCount: number;
  earliestPurchase: string;
  latestPurchase: string;
  portfolios: string[];
}

interface LotFormData {
  ticker: string;
  shares: number;
  costPerShare: number;
  purchaseDate: string;
  portfolios: string[];
  calculateAccumulatedProfitLoss: boolean;
  notes: string;
}
```

### Utilities

#### calculateTickerSummaries(lots, tickers)

Calculates aggregated ticker summaries from lot data.

**Parameters:**
- `lots: TickerLot[]` - Array of ticker lots
- `tickers: Ticker[]` - Array of ticker metadata

**Returns:** `TickerSummary[]` - Sorted by total cost (descending)

#### getLotsForTicker(lots, ticker)

Filters and sorts lots for a specific ticker.

**Parameters:**
- `lots: TickerLot[]` - Array of ticker lots
- `ticker: string` - Ticker symbol to filter by

**Returns:** `TickerLot[]` - Sorted by purchase date (newest first)

## Architecture

### Hooks-Based Architecture

The feature uses a hooks-based architecture for clean separation of concerns:

- **Data Layer (hooks/)**: Manages Amplify client, real-time subscriptions, and CRUD operations
- **UI Layer (components/)**: Pure presentation components that receive data via props
- **Business Logic (utils/)**: Pure functions for calculations and transformations
- **Types (types/)**: Shared TypeScript interfaces

### State Management

Uses React's built-in `useState` for local component state. All data is synchronized via AWS Amplify subscriptions, ensuring real-time updates across all connected clients.

### Modal Navigation

All navigation within the feature is modal-based (no routing), making it completely self-contained and compatible with any routing system.

## Data Models

The feature uses three AWS Amplify data models:

1. **Portfolio** - Named collection of lots
2. **Ticker** - Ticker-level metadata (company name, base yield)
3. **TickerLot** - Individual purchase lots with shares, cost basis, and notes

All models use Amplify's `owner` authorization, ensuring data is user-scoped.

## Troubleshooting

### Styles Not Rendering

Ensure Tailwind config includes the feature directory and rebuild:

```bash
npm run build
```

### Amplify Errors

Ensure Amplify is configured before the component renders. Configuration should happen in your app's entry point.

### Real-Time Updates Not Working

1. Check network connectivity
2. Verify Amplify subscription configuration
3. Check browser console for subscription errors

### Import Errors

Ensure you're importing from the feature's public API:

```typescript
// Good
import { PortfolioManagerPage } from '@/features/portfolio-manager';

// Bad - internal imports not supported
import { useTickerLots } from '@/features/portfolio-manager/hooks/useTickerLots';
```

Use the public exports from `index.ts` for stable API compatibility.

## Development

### File Structure

```
features/portfolio-manager/
├── index.ts                          # Public API
├── PortfolioManagerPage.tsx          # Main page component
├── hooks/
│   ├── useAmplifyClient.ts          # Client hook
│   ├── useTickerLots.ts             # Lot management
│   ├── usePortfolios.ts             # Portfolio management
│   ├── useTickers.ts                # Ticker metadata
│   └── usePortfolioData.ts          # Orchestrator
├── components/
│   ├── TickerSummarySpreadsheet.tsx # Summary grid
│   ├── TickerDetailModal.tsx        # Detail view
│   ├── TickerLotSpreadsheet.tsx     # Lot grid
│   ├── NewTickerModal.tsx           # Quick add form
│   ├── PortfolioManagerModal.tsx    # Portfolio CRUD
│   └── ColumnCustomization.tsx      # Column config
├── types/
│   └── index.ts                     # Type definitions
├── utils/
│   └── tickerCalculations.ts       # Business logic
└── README.md                        # This file
```

### Testing

The feature is designed for easy testing:

1. **Unit Tests**: Test hooks and utilities independently
2. **Component Tests**: Test UI components with mocked data
3. **Integration Tests**: Test with real Amplify backend

### Future Enhancements

Potential improvements:

- Global state integration (Redux/Zustand)
- Server-side rendering support (if migrating to Next.js)
- Export to CSV/Excel
- Advanced filtering and sorting
- Performance metrics and charts
- Multi-currency support

## Support

For issues or questions:

1. Check this README first
2. Review the plan file at `.claude/plans/stateless-floating-cherny.md`
3. Check the original standalone app for reference

## License

Same as parent project.
