export type YieldUnit = 'tonnes' | 'quintals' | 'kg' | 'bushels';

export type Currency = 'USD' | 'INR' | 'EUR' | 'GBP' | 'BRL';

export interface MarketItem {
  id: string;
  name: string;
  location: string;
  distanceKm: number;
  currentPricePerUnit: number;
  predictedFuturePricePerUnit: number;
  isAvailable: boolean;
  unavailabilityReason?: string;
  handlingCostModifier?: number; // e.g. 1.0 (standard) or 1.2 (premium market handling)
  qualityGradingBonusPct?: number; // e.g. 5% bonus for export grade
}

export interface MLFactors {
  seasonalDemandIndex: number; // 0.8 to 1.5
  regionalSupplyIndex: number; // 0.8 to 1.5 (lower supply = higher price)
  fuelLogisticsTrend: number; // 0.8 to 1.5
  rainfallWeatherRisk: number; // 0.8 to 1.5
  exportDemandSurge: number; // 0.8 to 1.5
}

export interface HistoricalPricePoint {
  date: string;
  label: string;
  price: number;
  volume: number;
}

export interface FarmerInputState {
  farmLocation: string;
  cropType: string;
  customCropName?: string;
  yieldAmount: number;
  yieldUnit: YieldUnit;
  currency: Currency;
  transportCostPerKmPerUnit: number; // e.g. $0.05 per km per quintal/tonne
  handlingCostPerUnit: number; // e.g. $2.00 per unit for packaging/loading
  storageCostPerUnitPerWeek: number; // e.g. $0.80 per unit/week in cold/dry warehouse
  storageCapacityUnits: number; // e.g. 120 units limit
  spoilageRatePerWeekPct: number; // e.g. 2.5% decay per week
  waitDurationWeeks: number; // e.g. 3 weeks
  markets: MarketItem[];
  historicalPrices: HistoricalPricePoint[];
  mlFactors: MLFactors;
  mlModelType: 'random_forest' | 'gradient_boost' | 'linear_trend';
}

export interface MarketCalculationItem {
  marketId: string;
  marketName: string;
  location: string;
  distanceKm: number;
  isAvailable: boolean;
  unavailabilityReason?: string;
  
  sellNow: {
    pricePerUnit: number;
    sellableYield: number;
    grossRevenue: number;
    transportCost: number;
    handlingCost: number;
    storageCost: number;
    spoilageLoss: number;
    totalCost: number;
    netProfit: number;
    netProfitPerUnit: number;
    profitMarginPct: number;
  };
  
  wait: {
    pricePerUnit: number;
    storedYield: number;
    overflowYield: number; // yield beyond storage capacity forced to sell now or spoil
    spoilageUnits: number;
    sellableYield: number;
    grossRevenue: number;
    transportCost: number;
    handlingCost: number;
    storageCost: number;
    spoilageLoss: number;
    totalCost: number;
    netProfit: number;
    netProfitPerUnit: number;
    profitMarginPct: number;
  };

  deltaNetProfit: number; // wait.netProfit - sellNow.netProfit
  deltaProfitPct: number;
  isBestSellNow: boolean;
  isBestWait: boolean;
  isOverallBest: boolean;
}

export interface OverallRecommendation {
  action: 'SELL_NOW' | 'WAIT';
  bestMarket: MarketItem;
  expectedNetProfit: number;
  grossRevenue: number;
  totalExpenses: number;
  netProfitDelta: number; // profit advantage over alternative action / second best
  deltaPercent: number;
  optimalWaitWeeks: number;
  riskLevel: 'LOW' | 'MODERATE' | 'HIGH';
  riskScore: number; // 0 to 100
  riskFactors: string[];
  summaryHeadline: string;
  primaryReason: string;
  detailedPoints: string[];
  whyNotHighestPriceMarket?: string;
  storageWarning?: string;
}

export interface HoldingTimePoint {
  week: number;
  predictedPrice: number;
  cumulativeSpoilagePct: number;
  sellableYield: number;
  grossRevenue: number;
  storageCost: number;
  spoilageLoss: number;
  transportCost: number;
  handlingCost: number;
  totalCost: number;
  netProfit: number;
  isOptimal: boolean;
}

export interface MLPredictionOutput {
  predictedFuturePrice: number;
  currentBasePrice: number;
  confidenceLower: number;
  confidenceUpper: number;
  expectedChangePct: number;
  featureImportances: Array<{
    feature: string;
    importance: number;
    impact: 'positive' | 'negative' | 'neutral';
    description: string;
  }>;
  forecastPoints: Array<{
    week: number;
    dateLabel: string;
    predictedPrice: number;
    lowerBound: number;
    upperBound: number;
    historical?: boolean;
  }>;
}

export interface DecisionCalculationOutput {
  markets: MarketCalculationItem[];
  recommendation: OverallRecommendation;
  bestSellNowMarket: MarketCalculationItem | null;
  bestWaitMarket: MarketCalculationItem | null;
  highestQuotedPriceMarket: MarketCalculationItem | null;
  highestPriceWasChosen: boolean;
  holdingTimeline: HoldingTimePoint[];
  mlPrediction: MLPredictionOutput;
  calculationTimestamp: string;
}

export interface DecisionHistoryRecord {
  id: string;
  timestamp: string;
  cropType: string;
  yieldAmount: number;
  yieldUnit: YieldUnit;
  currency: Currency;
  recommendedAction: 'SELL_NOW' | 'WAIT';
  recommendedMarket: string;
  expectedNetProfit: number;
  riskLevel: 'LOW' | 'MODERATE' | 'HIGH';
  waitWeeks: number;
  farmLocation: string;
  fullInput: FarmerInputState;
}

export interface CropPreset {
  id: string;
  name: string;
  category: 'Vegetable' | 'Grain' | 'Fruit' | 'Cash Crop' | 'Pulse' | 'Tuber';
  iconName: string;
  defaultUnit: YieldUnit;
  typicalYield: number;
  typicalBasePrice: number;
  shelfLifeWeeks: number;
  defaultSpoilageRatePerWeek: number;
  defaultStorageCostPerWeek: number;
  defaultHandlingCost: number;
  defaultTransportPerKm: number;
  seasonalityHighMonths: string[];
  riskCharacteristics: string;
  description: string;
}
