# Portfolio Manager Feature - Integration Guide

## Summary

The standalone Vite+React Portfolio Lot Manager has been successfully refactored into a portable feature module at `features/portfolio-manager/`. This feature can now be integrated into your React Router application.

## What Was Done

### 1. Feature Module Structure Created

```
features/portfolio-manager/
├── index.ts                          ✓ Public API exports
├── PortfolioManagerPage.tsx          ✓ Main page component
├── README.md                         ✓ Full documentation
├── hooks/                            ✓ 5 custom hooks
│   ├── useAmplifyClient.ts
│   ├── useTickerLots.ts
│   ├── usePortfolios.ts
│   ├── useTickers.ts
│   └── usePortfolioData.ts
├── components/                       ✓ 6 UI components
│   ├── TickerSummarySpreadsheet.tsx
│   ├── TickerDetailModal.tsx
│   ├── TickerLotSpreadsheet.tsx
│   ├── NewTickerModal.tsx
│   ├── PortfolioManagerModal.tsx
│   └── ColumnCustomization.tsx
├── types/                            ✓ Type definitions
│   └── index.ts
└── utils/                            ✓ Business logic
    └── tickerCalculations.ts
```

**Total:** 16 files created

### 2. Data Logic Extracted into Custom Hooks

All Amplify client usage, real-time subscriptions, and CRUD operations have been centralized in custom hooks:

- **useAmplifyClient**: Memoized client creation
- **useTickerLots**: Lot management with real-time sync
- **usePortfolios**: Portfolio operations + default initialization
- **useTickers**: Ticker metadata management
- **usePortfolioData**: Orchestrator combining all hooks

### 3. Components Refactored

- **PortfolioManagerPage**: Main page component (transformed from App.tsx)
  - Accepts optional `user`, `onSignOut`, `className` props
  - Uses `usePortfolioData()` hook for all data
  - Keeps modal navigation state local

- **PortfolioManagerModal**: Refactored to accept operations as props
  - No longer creates its own Amplify client
  - Receives `onCreatePortfolio` and `onDeletePortfolio` callbacks

- All other components copied with correct import paths

### 4. Original App Preserved

The original standalone Vite app (`src/`, `index.html`, `vite.config.ts`) remains untouched. Both apps can run in parallel during transition.

---

## Integration Steps

### Step 1: Verify Dependencies

Ensure these are installed in your target app:

```bash
npm install aws-amplify @aws-amplify/ui-react lucide-react react-router-dom
```

### Step 2: Configure Amplify

In your target app's entry point (e.g., `main.tsx`):

```typescript
import { Amplify } from 'aws-amplify';
import outputs from './amplify_outputs.json';

Amplify.configure(outputs, { ssr: false });
```

**Important:** Use the same `amplify_outputs.json` from this project.

### Step 3: Update Tailwind Config

In `tailwind.config.js`:

```javascript
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
    './features/**/*.{js,ts,jsx,tsx}', // Add this
  ],
  // ... rest of config
}
```

### Step 4: Add Route

In your React Router configuration:

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

### Step 5: Integrate with Auth (Optional)

If your target app has authentication:

```typescript
import { PortfolioManagerPage } from '@/features/portfolio-manager';
import { useAuth } from '@/lib/auth'; // Your auth hook

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

---

## Testing the Feature

### Quick Test

1. Start your target app's dev server
2. Navigate to `/portfolio` route
3. Verify:
   - Page renders without errors
   - Real-time data loads
   - All CRUD operations work
   - Modals open/close correctly

### Full Test Checklist

- [ ] Feature renders without errors
- [ ] Real-time subscriptions work
- [ ] Create new lot
- [ ] Edit existing lot
- [ ] Delete lot
- [ ] Bulk delete lots
- [ ] Create portfolio
- [ ] Delete portfolio
- [ ] Update ticker metadata (company name, base yield)
- [ ] Column customization works
- [ ] Ticker summary displays correctly
- [ ] Ticker detail modal shows all lots
- [ ] New ticker modal creates first lot
- [ ] Portfolio manager modal CRUD works
- [ ] Styling matches expected appearance
- [ ] No console errors

---

## File Migration Reference

### Created Files (New in Feature)

| File | Purpose |
|------|---------|
| `features/portfolio-manager/index.ts` | Public API exports |
| `features/portfolio-manager/PortfolioManagerPage.tsx` | Main page (from App.tsx MainApp) |
| `features/portfolio-manager/hooks/useAmplifyClient.ts` | Client hook |
| `features/portfolio-manager/hooks/useTickerLots.ts` | Lot operations (from App.tsx lines 32, 48-74, 206-302) |
| `features/portfolio-manager/hooks/usePortfolios.ts` | Portfolio operations (from App.tsx lines 38, 76-90, 123-180) |
| `features/portfolio-manager/hooks/useTickers.ts` | Ticker operations (from App.tsx lines 33, 93-109, 182-204, 304-333) |
| `features/portfolio-manager/hooks/usePortfolioData.ts` | Orchestrator hook |
| `features/portfolio-manager/README.md` | Feature documentation |

### Copied Files (from src/)

| Original | New Location |
|----------|--------------|
| `src/components/TickerSummarySpreadsheet.tsx` | `features/portfolio-manager/components/` |
| `src/components/TickerDetailModal.tsx` | `features/portfolio-manager/components/` |
| `src/components/TickerLotSpreadsheet.tsx` | `features/portfolio-manager/components/` |
| `src/components/NewTickerModal.tsx` | `features/portfolio-manager/components/` |
| `src/components/ColumnCustomization.tsx` | `features/portfolio-manager/components/` |
| `src/components/PortfolioManager.tsx` | `features/portfolio-manager/components/PortfolioManagerModal.tsx` (refactored) |
| `src/types/index.ts` | `features/portfolio-manager/types/` |
| `src/utils/tickerCalculations.ts` | `features/portfolio-manager/utils/` |

### Unchanged Files (Original App)

- `src/App.tsx` - Original app (kept for reference)
- `src/main.tsx` - Vite entry point
- `index.html` - HTML template
- `amplify/` - Backend configuration (stays in root)
- `amplify_outputs.json` - Amplify config (shared)

---

## Key Architecture Changes

### Before (Standalone App)

```typescript
// App.tsx
function MainApp() {
  const client = generateClient<Schema>();
  const [lots, setLots] = useState<TickerLot[]>([]);
  const [tickers, setTickers] = useState<Ticker[]>([]);
  // ... more state

  useEffect(() => {
    // subscription setup
    const subscription = client.models.TickerLot.observeQuery()...
  }, []);

  const handleSaveLot = async (data) => {
    await client.models.TickerLot.create(...)
  };

  // ... more handlers

  return <div>...</div>;
}
```

### After (Feature Module)

```typescript
// PortfolioManagerPage.tsx
function PortfolioManagerPage({ user, onSignOut }) {
  const {
    lots,
    tickers,
    summaries,
    portfolios,
    saveLot,
    deleteLot,
    updateTicker,
    // ... all data and operations
  } = usePortfolioData(); // Single hook provides everything!

  // Only modal state is local
  const [selectedTicker, setSelectedTicker] = useState(null);

  return <div>...</div>;
}

// hooks/usePortfolioData.ts
function usePortfolioData() {
  const { lots, saveLot, deleteLot } = useTickerLots();
  const { portfolios, createPortfolio } = usePortfolios();
  const { tickers, updateTicker } = useTickers();

  return { lots, tickers, portfolios, saveLot, ... };
}
```

**Benefits:**
- Clean separation of concerns
- Reusable hooks
- Testable in isolation
- Easy to integrate with global state later

---

## Next Steps

1. **Copy `amplify_outputs.json`** to your target app's root (if not already there)

2. **Copy `amplify/` directory** to your target app's root (if not already there)

3. **Test the standalone app** one more time to ensure it still works:
   ```bash
   npm run dev
   ```

4. **Test in target app** following integration steps above

5. **Validate all functionality** using test checklist

6. **Decommission standalone app** (optional, after validation)

---

## Troubleshooting

### "Cannot find module '@/features/portfolio-manager'"

Ensure your TypeScript/bundler config has path alias:

```json
// tsconfig.json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

Or use relative imports:

```typescript
import { PortfolioManagerPage } from '../features/portfolio-manager';
```

### Styles Not Rendering

1. Verify Tailwind config includes `features/**`
2. Rebuild: `npm run build`
3. Clear cache and restart dev server

### Amplify Subscription Errors

1. Check network tab for WebSocket connections
2. Verify Amplify is configured before component mounts
3. Check browser console for specific errors

### "User is not authenticated"

Ensure Amplify auth is configured and user is signed in before accessing the route.

---

## Support

- **Feature Documentation**: `features/portfolio-manager/README.md`
- **Implementation Plan**: `.claude/plans/stateless-floating-cherny.md`
- **Original App**: Still functional in `src/` for reference

---

## Summary

✅ Feature module created with 16 files
✅ All data logic extracted into 5 custom hooks
✅ All components refactored for portability
✅ Public API defined in `index.ts`
✅ Original app preserved for parallel operation
✅ Comprehensive documentation provided

The Portfolio Manager is now ready to be integrated into your React Router application!
