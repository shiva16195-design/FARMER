import { CropPreset, MarketItem, HistoricalPricePoint } from '../types';

export const CROP_PRESETS: CropPreset[] = [
  {
    id: 'tomatoes',
    name: 'Tomatoes (Hybrid Red)',
    category: 'Vegetable',
    iconName: 'Cherry',
    defaultUnit: 'quintals',
    typicalYield: 150,
    typicalBasePrice: 28,
    shelfLifeWeeks: 3,
    defaultSpoilageRatePerWeek: 4.8,
    defaultStorageCostPerWeek: 1.2,
    defaultHandlingCost: 1.5,
    defaultTransportPerKm: 0.04,
    seasonalityHighMonths: ['October', 'November', 'March'],
    riskCharacteristics: 'High Perishability — Spoilage accelerates rapidly past week 2 without controlled atmosphere.',
    description: 'Fresh market produce with high price volatility. Holding beyond 2-3 weeks requires cold chain and incurs steep spoilage losses.'
  },
  {
    id: 'onions',
    name: 'Onions (Red Globe)',
    category: 'Vegetable',
    iconName: 'Layers',
    defaultUnit: 'quintals',
    typicalYield: 200,
    typicalBasePrice: 22,
    shelfLifeWeeks: 16,
    defaultSpoilageRatePerWeek: 1.2,
    defaultStorageCostPerWeek: 0.6,
    defaultHandlingCost: 1.0,
    defaultTransportPerKm: 0.035,
    seasonalityHighMonths: ['August', 'September', 'December'],
    riskCharacteristics: 'Moderate Storage Risk — Excellent candidate for wait strategies during off-season price spikes.',
    description: 'Durable bulb crop with strong holding viability in well-ventilated dry storage structures.'
  },
  {
    id: 'wheat',
    name: 'Wheat (Durum / Sharbati)',
    category: 'Grain',
    iconName: 'Wheat',
    defaultUnit: 'tonnes',
    typicalYield: 35,
    typicalBasePrice: 260,
    shelfLifeWeeks: 52,
    defaultSpoilageRatePerWeek: 0.25,
    defaultStorageCostPerWeek: 1.8,
    defaultHandlingCost: 6.0,
    defaultTransportPerKm: 0.30,
    seasonalityHighMonths: ['July', 'August', 'December'],
    riskCharacteristics: 'Low Perishability — High bulk transport cost sensitivity. Net profit driven heavily by distance.',
    description: 'Standard staple grain with negligible spoilage if kept dry. Transport and handling economics dominate market decisions.'
  },
  {
    id: 'potatoes',
    name: 'Potatoes (Table & Processing)',
    category: 'Tuber',
    iconName: 'CircleDot',
    defaultUnit: 'tonnes',
    typicalYield: 45,
    typicalBasePrice: 210,
    shelfLifeWeeks: 24,
    defaultSpoilageRatePerWeek: 0.8,
    defaultStorageCostPerWeek: 2.2,
    defaultHandlingCost: 5.5,
    defaultTransportPerKm: 0.28,
    seasonalityHighMonths: ['September', 'October', 'November'],
    riskCharacteristics: 'Cold Storage Dependent — High warehouse rental cost over time counterbalances future price gains.',
    description: 'High volume tuber requiring specialized cold storage. Substantial storage fees accumulate over multi-week holding.'
  },
  {
    id: 'apples',
    name: 'Apples (Royal Delicious)',
    category: 'Fruit',
    iconName: 'Apple',
    defaultUnit: 'tonnes',
    typicalYield: 25,
    typicalBasePrice: 850,
    shelfLifeWeeks: 12,
    defaultSpoilageRatePerWeek: 1.5,
    defaultStorageCostPerWeek: 4.5,
    defaultHandlingCost: 12.0,
    defaultTransportPerKm: 0.45,
    seasonalityHighMonths: ['November', 'December', 'January'],
    riskCharacteristics: 'Premium Metro Differential — Large price spreads between local orchard-gate and metropolitan hubs.',
    description: 'High-value fruit with wide price variations across regional terminal markets, but high packaging and transit sensitivity.'
  },
  {
    id: 'soybeans',
    name: 'Soybeans (Non-GMO Yellow)',
    category: 'Cash Crop',
    iconName: 'Sprout',
    defaultUnit: 'tonnes',
    typicalYield: 30,
    typicalBasePrice: 480,
    shelfLifeWeeks: 40,
    defaultSpoilageRatePerWeek: 0.35,
    defaultStorageCostPerWeek: 2.0,
    defaultHandlingCost: 7.0,
    defaultTransportPerKm: 0.32,
    seasonalityHighMonths: ['January', 'February', 'May'],
    riskCharacteristics: 'Futures Price Volatility — Tied to oilseed crushing demand and export shipment vessel schedules.',
    description: 'Oilseed commodity traded heavily with strong correlation to international processing margins and crushing mills.'
  },
  {
    id: 'rice',
    name: 'Rice (Basmati / Long Grain)',
    category: 'Grain',
    iconName: 'Box',
    defaultUnit: 'tonnes',
    typicalYield: 28,
    typicalBasePrice: 620,
    shelfLifeWeeks: 48,
    defaultSpoilageRatePerWeek: 0.3,
    defaultStorageCostPerWeek: 2.4,
    defaultHandlingCost: 8.0,
    defaultTransportPerKm: 0.35,
    seasonalityHighMonths: ['March', 'April', 'November'],
    riskCharacteristics: 'Aging Appreciation — Premium varieties actually increase in market quotation after controlled aging.',
    description: 'High value grain where export terminals often offer premium rates over domestic mandis, offsetting transport expenses.'
  },
  {
    id: 'strawberries',
    name: 'Strawberries (Sweet Charlie)',
    category: 'Fruit',
    iconName: 'Flame',
    defaultUnit: 'quintals',
    typicalYield: 60,
    typicalBasePrice: 140,
    shelfLifeWeeks: 1,
    defaultSpoilageRatePerWeek: 12.0,
    defaultStorageCostPerWeek: 5.0,
    defaultHandlingCost: 4.0,
    defaultTransportPerKm: 0.08,
    seasonalityHighMonths: ['December', 'January', 'February'],
    riskCharacteristics: 'Extreme Decay Velocity — Holding past 5-7 days leads to catastrophic spoilage loss.',
    description: 'Delicate soft fruit with rapid moisture loss. Selling immediately to the nearest accessible high-margin buyer is critical.'
  }
];

export const DEFAULT_MARKETS: MarketItem[] = [
  {
    id: 'mkt-local',
    name: 'Local Village Mandi / Farmgate Buyer',
    location: 'District Center (Zone A)',
    distanceKm: 12,
    currentPricePerUnit: 28,
    predictedFuturePricePerUnit: 30,
    isAvailable: true,
    handlingCostModifier: 0.85, // cheaper local handling
    qualityGradingBonusPct: 0
  },
  {
    id: 'mkt-regional',
    name: 'Regional Wholesale Agricultural Market',
    location: 'North Agri Hub (City B)',
    distanceKm: 65,
    currentPricePerUnit: 34,
    predictedFuturePricePerUnit: 41,
    isAvailable: true,
    handlingCostModifier: 1.0,
    qualityGradingBonusPct: 3
  },
  {
    id: 'mkt-metro',
    name: 'Metropolitan Mega Terminal Market',
    location: 'Capital Metro Wholesale Yard',
    distanceKm: 210,
    currentPricePerUnit: 42,
    predictedFuturePricePerUnit: 52,
    isAvailable: true,
    handlingCostModifier: 1.25, // higher labor & gate fee in metro
    qualityGradingBonusPct: 8
  },
  {
    id: 'mkt-processing',
    name: 'Agro-Processing Cooperative Plant',
    location: 'Industrial Agro Park West',
    distanceKm: 95,
    currentPricePerUnit: 36,
    predictedFuturePricePerUnit: 38,
    isAvailable: true,
    handlingCostModifier: 0.9,
    qualityGradingBonusPct: 5
  },
  {
    id: 'mkt-export',
    name: 'Coastal Export Terminal Logistics Hub',
    location: 'Seaport Agro Dock (Zone E)',
    distanceKm: 340,
    currentPricePerUnit: 48,
    predictedFuturePricePerUnit: 58,
    isAvailable: false,
    unavailabilityReason: 'Export customs quota locked / Port inspection delay',
    handlingCostModifier: 1.4,
    qualityGradingBonusPct: 12
  }
];

export const generateHistoricalPriceSeries = (basePrice: number): HistoricalPricePoint[] => {
  const points: HistoricalPricePoint[] = [];
  const weeks = 12;
  
  for (let i = weeks; i >= 1; i--) {
    // Generate realistic fluctuating history leading up to current
    const dateObj = new Date();
    dateObj.setDate(dateObj.getDate() - i * 7);
    const dateStr = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    
    // Slight random walk with cyclical wave
    const wave = Math.sin((12 - i) * 0.6) * (basePrice * 0.12);
    const noise = (Math.random() - 0.5) * (basePrice * 0.08);
    const price = Math.max(basePrice * 0.6, Number((basePrice + wave + noise - (i * 0.5)).toFixed(2)));
    const volume = Math.round(500 + Math.random() * 800);
    
    points.push({
      date: dateStr,
      label: `W-${i}`,
      price,
      volume
    });
  }
  
  // Add current week point
  points.push({
    date: 'Current',
    label: 'Now',
    price: Number(basePrice.toFixed(2)),
    volume: 1200
  });

  return points;
};
