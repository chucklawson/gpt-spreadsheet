import type { TickerLot, TickerSummary } from '../types/index';

export function calculateTickerSummaries(lots: TickerLot[]): TickerSummary[] {
  const grouped = lots.reduce((acc, lot) => {
    if (!acc[lot.ticker]) {
      acc[lot.ticker] = [];
    }
    acc[lot.ticker].push(lot);
    return acc;
  }, {} as Record<string, TickerLot[]>);

  return Object.entries(grouped).map(([ticker, tickerLots]) => {
    const totalShares = tickerLots.reduce((sum, lot) => sum + lot.shares, 0);
    const totalCost = tickerLots.reduce((sum, lot) => sum + lot.totalCost, 0);
    const dates = tickerLots.map(lot => lot.purchaseDate).sort();

    return {
      ticker,
      totalShares,
      totalCost,
      averageCostPerShare: totalCost / totalShares,
      lotCount: tickerLots.length,
      earliestPurchase: dates[0],
      latestPurchase: dates[dates.length - 1],
    };
  }).sort((a, b) => b.totalCost - a.totalCost);
}

export function getLotsForTicker(lots: TickerLot[], ticker: string): TickerLot[] {
  return lots
    .filter(lot => lot.ticker === ticker)
    .sort((a, b) => new Date(b.purchaseDate).getTime() - new Date(a.purchaseDate).getTime());
}