import {
  FarmerInputState,
  DecisionCalculationOutput,
  MarketCalculationItem,
  OverallRecommendation,
  HoldingTimePoint,
  MarketItem
} from '../types';
import { predictCommodityPriceWithML } from './mlPredictor';

export function calculateDecisionMetrics(input: FarmerInputState): DecisionCalculationOutput {
  const {
    yieldAmount,
    storageCapacityUnits,
    spoilageRatePerWeekPct,
    waitDurationWeeks,
    transportCostPerKmPerUnit,
    handlingCostPerUnit,
    storageCostPerUnitPerWeek,
    markets,
    historicalPrices,
    mlFactors,
    mlModelType
  } = input;

  const basePrice = historicalPrices[historicalPrices.length - 1]?.price || 30;

  // Run ML Price Prediction
  const mlPrediction = predictCommodityPriceWithML(
    basePrice,
    waitDurationWeeks,
    historicalPrices,
    mlFactors,
    mlModelType
  );

  // Future price multiplier based on ML output vs current baseline
  const priceMultiplier = mlPrediction.predictedFuturePrice / (mlPrediction.currentBasePrice || 1);

  // Storage constraint logic
  const effectiveStoredYield = Math.min(yieldAmount, storageCapacityUnits);
  const overflowYield = Math.max(0, yieldAmount - storageCapacityUnits);

  // Spoilage calculation: exponential or linear holding decay
  // Decay formula: 1 - (1 - rate)^weeks
  const weeklyRateDecimal = Math.max(0, spoilageRatePerWeekPct / 100);
  const cumulativeSpoilagePct = Math.min(0.95, 1 - Math.pow(1 - weeklyRateDecimal, waitDurationWeeks));
  const spoilageUnits = effectiveStoredYield * cumulativeSpoilagePct;
  const sellableStoredYield = effectiveStoredYield - spoilageUnits;

  // Process all markets
  const marketResults: MarketCalculationItem[] = markets.map((m: MarketItem) => {
    const isAvailable = m.isAvailable;
    const distance = m.distanceKm;
    const handlingModifier = m.handlingCostModifier || 1.0;
    const qualityBonus = 1 + (m.qualityGradingBonusPct || 0) / 100;

    // Prices
    const unitPriceNow = m.currentPricePerUnit * qualityBonus;
    
    // Future price incorporates market-specific base and ML trajectory
    const futurePriceEstimate = m.predictedFuturePricePerUnit 
      ? (m.predictedFuturePricePerUnit * (0.4 + 0.6 * priceMultiplier) * qualityBonus)
      : (unitPriceNow * priceMultiplier);

    // --- SELL NOW ---
    const sellNowGrossRevenue = isAvailable ? yieldAmount * unitPriceNow : 0;
    const sellNowTransportCost = isAvailable ? yieldAmount * distance * transportCostPerKmPerUnit : 0;
    const sellNowHandlingCost = isAvailable ? yieldAmount * handlingCostPerUnit * handlingModifier : 0;
    const sellNowStorageCost = 0;
    const sellNowSpoilageLoss = 0;
    const sellNowTotalCost = sellNowTransportCost + sellNowHandlingCost + sellNowStorageCost + sellNowSpoilageLoss;
    const sellNowNetProfit = isAvailable ? (sellNowGrossRevenue - sellNowTotalCost) : -Infinity;
    const sellNowNetProfitPerUnit = isAvailable && yieldAmount > 0 ? sellNowNetProfit / yieldAmount : 0;
    const sellNowMarginPct = isAvailable && sellNowGrossRevenue > 0 ? (sellNowNetProfit / sellNowGrossRevenue) * 100 : 0;

    // --- WAIT ---
    // If there is overflow beyond storage capacity, overflow must be sold immediately (or suffers 3x spoilage)
    // Here we treat overflow as sold now at current market price minus standard immediate transit
    const overflowGrossRevenue = overflowYield > 0 && isAvailable ? overflowYield * unitPriceNow : 0;
    const overflowTransportCost = overflowYield > 0 && isAvailable ? overflowYield * distance * transportCostPerKmPerUnit : 0;
    const overflowHandlingCost = overflowYield > 0 && isAvailable ? overflowYield * handlingCostPerUnit * handlingModifier : 0;

    const storedGrossRevenue = isAvailable ? sellableStoredYield * futurePriceEstimate : 0;
    const waitStoredTransportCost = isAvailable ? sellableStoredYield * distance * transportCostPerKmPerUnit : 0;
    const waitStoredHandlingCost = isAvailable ? effectiveStoredYield * handlingCostPerUnit * handlingModifier : 0;
    const waitStorageCost = isAvailable ? effectiveStoredYield * storageCostPerUnitPerWeek * waitDurationWeeks : 0;
    const waitSpoilageLoss = isAvailable ? spoilageUnits * futurePriceEstimate : 0;

    const waitGrossRevenue = storedGrossRevenue + overflowGrossRevenue;
    const waitTransportCost = waitStoredTransportCost + overflowTransportCost;
    const waitHandlingCost = waitStoredHandlingCost + overflowHandlingCost;
    const waitTotalCost = waitTransportCost + waitHandlingCost + waitStorageCost + waitSpoilageLoss;
    
    // Net profit for Wait
    const waitNetProfit = isAvailable ? (waitGrossRevenue - (waitTransportCost + waitHandlingCost + waitStorageCost)) : -Infinity;
    const waitNetProfitPerUnit = isAvailable && yieldAmount > 0 ? waitNetProfit / yieldAmount : 0;
    const waitMarginPct = isAvailable && waitGrossRevenue > 0 ? (waitNetProfit / waitGrossRevenue) * 100 : 0;

    const deltaNetProfit = isAvailable ? (waitNetProfit - sellNowNetProfit) : 0;
    const deltaProfitPct = isAvailable && Math.abs(sellNowNetProfit) > 0 
      ? (deltaNetProfit / Math.abs(sellNowNetProfit)) * 100 
      : 0;

    return {
      marketId: m.id,
      marketName: m.name,
      location: m.location,
      distanceKm: m.distanceKm,
      isAvailable,
      unavailabilityReason: m.unavailabilityReason,
      sellNow: {
        pricePerUnit: Number(unitPriceNow.toFixed(2)),
        sellableYield: yieldAmount,
        grossRevenue: Number(sellNowGrossRevenue.toFixed(2)),
        transportCost: Number(sellNowTransportCost.toFixed(2)),
        handlingCost: Number(sellNowHandlingCost.toFixed(2)),
        storageCost: Number(sellNowStorageCost.toFixed(2)),
        spoilageLoss: Number(sellNowSpoilageLoss.toFixed(2)),
        totalCost: Number(sellNowTotalCost.toFixed(2)),
        netProfit: Number(sellNowNetProfit.toFixed(2)),
        netProfitPerUnit: Number(sellNowNetProfitPerUnit.toFixed(2)),
        profitMarginPct: Number(sellNowMarginPct.toFixed(1))
      },
      wait: {
        pricePerUnit: Number(futurePriceEstimate.toFixed(2)),
        storedYield: effectiveStoredYield,
        overflowYield,
        spoilageUnits: Number(spoilageUnits.toFixed(2)),
        sellableYield: Number((sellableStoredYield + overflowYield).toFixed(2)),
        grossRevenue: Number(waitGrossRevenue.toFixed(2)),
        transportCost: Number(waitTransportCost.toFixed(2)),
        handlingCost: Number(waitHandlingCost.toFixed(2)),
        storageCost: Number(waitStorageCost.toFixed(2)),
        spoilageLoss: Number(waitSpoilageLoss.toFixed(2)),
        totalCost: Number(waitTotalCost.toFixed(2)),
        netProfit: Number(waitNetProfit.toFixed(2)),
        netProfitPerUnit: Number(waitNetProfitPerUnit.toFixed(2)),
        profitMarginPct: Number(waitMarginPct.toFixed(1))
      },
      deltaNetProfit: Number(deltaNetProfit.toFixed(2)),
      deltaProfitPct: Number(deltaProfitPct.toFixed(1)),
      isBestSellNow: false,
      isBestWait: false,
      isOverallBest: false
    };
  });

  // Identify Best Markets
  const availableResults = marketResults.filter(r => r.isAvailable);

  let bestSellNowMarket: MarketCalculationItem | null = null;
  let bestWaitMarket: MarketCalculationItem | null = null;
  let highestQuotedPriceMarket: MarketCalculationItem | null = null;

  if (availableResults.length > 0) {
    bestSellNowMarket = [...availableResults].sort((a, b) => b.sellNow.netProfit - a.sellNow.netProfit)[0];
    bestWaitMarket = [...availableResults].sort((a, b) => b.wait.netProfit - a.wait.netProfit)[0];
    highestQuotedPriceMarket = [...availableResults].sort((a, b) => b.sellNow.pricePerUnit - a.sellNow.pricePerUnit)[0];

    // Mark tags
    if (bestSellNowMarket) {
      const idx = marketResults.findIndex(m => m.marketId === bestSellNowMarket!.marketId);
      if (idx !== -1) marketResults[idx].isBestSellNow = true;
    }
    if (bestWaitMarket) {
      const idx = marketResults.findIndex(m => m.marketId === bestWaitMarket!.marketId);
      if (idx !== -1) marketResults[idx].isBestWait = true;
    }
  }

  // Determine Overall Action: SELL_NOW or WAIT
  const bestSellNowProfit = bestSellNowMarket ? bestSellNowMarket.sellNow.netProfit : 0;
  const bestWaitProfit = bestWaitMarket ? bestWaitMarket.wait.netProfit : 0;

  const shouldWait = bestWaitProfit > bestSellNowProfit && bestWaitMarket !== null;
  const recommendedAction = shouldWait ? 'WAIT' : 'SELL_NOW';
  const winningCalculation = shouldWait ? bestWaitMarket! : bestSellNowMarket!;

  if (winningCalculation) {
    const idx = marketResults.findIndex(m => m.marketId === winningCalculation.marketId);
    if (idx !== -1) marketResults[idx].isOverallBest = true;
  }

  const winningMarketObj = markets.find(m => m.id === winningCalculation?.marketId) || markets[0];
  const expectedNetProfit = shouldWait ? winningCalculation.wait.netProfit : winningCalculation.sellNow.netProfit;
  const grossRevenue = shouldWait ? winningCalculation.wait.grossRevenue : winningCalculation.sellNow.grossRevenue;
  const totalExpenses = shouldWait ? winningCalculation.wait.totalCost : winningCalculation.sellNow.totalCost;

  const netProfitDelta = shouldWait 
    ? (bestWaitProfit - bestSellNowProfit)
    : (bestSellNowProfit - (bestWaitProfit > -Infinity ? bestWaitProfit : 0));
  
  const baselineForPct = shouldWait ? bestSellNowProfit : (bestWaitProfit > 0 ? bestWaitProfit : bestSellNowProfit);
  const deltaPercent = baselineForPct > 0 ? Number(((netProfitDelta / baselineForPct) * 100).toFixed(1)) : 0;

  // Evaluate Risk Level
  let riskScore = 20; // baseline
  const riskFactors: string[] = [];

  // Spoilage risk
  if (spoilageRatePerWeekPct * waitDurationWeeks > 8) {
    riskScore += 25;
    riskFactors.push(`High cumulative spoilage decay (${(spoilageRatePerWeekPct * waitDurationWeeks).toFixed(1)}%) threatens inventory.`);
  } else if (spoilageRatePerWeekPct * waitDurationWeeks > 4) {
    riskScore += 12;
    riskFactors.push(`Moderate produce decay (${(spoilageRatePerWeekPct * waitDurationWeeks).toFixed(1)}%) requires strict storage climate.`);
  }

  // Transport distance risk
  if (winningCalculation && winningCalculation.distanceKm > 150) {
    riskScore += 20;
    riskFactors.push(`High transit distance (${winningCalculation.distanceKm} km) exposes profit to fuel surcharges and transit delays.`);
  }

  // Storage capacity risk
  if (overflowYield > 0) {
    riskScore += 15;
    riskFactors.push(`Yield exceeds storage capacity by ${overflowYield.toFixed(0)} units. Excess must be liquidated immediately.`);
  }

  // Market volatility / ML confidence band
  const priceConfidenceSpread = mlPrediction.confidenceUpper - mlPrediction.confidenceLower;
  if (priceConfidenceSpread > mlPrediction.currentBasePrice * 0.3) {
    riskScore += 15;
    riskFactors.push(`High market price volatility detected with a ${input.currency} ${priceConfidenceSpread.toFixed(2)} forecast spread.`);
  }

  const riskLevel: 'LOW' | 'MODERATE' | 'HIGH' = riskScore < 40 ? 'LOW' : riskScore < 70 ? 'MODERATE' : 'HIGH';

  // Construct Detailed Recommendation Justification
  const detailedPoints: string[] = [];
  let summaryHeadline = '';
  let primaryReason = '';
  let whyNotHighestPriceMarket: string | undefined;

  const highestPriceWasChosen = highestQuotedPriceMarket?.marketId === winningCalculation?.marketId;

  if (highestQuotedPriceMarket && !highestPriceWasChosen && highestQuotedPriceMarket.isAvailable) {
    const highMktDistance = highestQuotedPriceMarket.distanceKm;
    const highMktTransport = highestQuotedPriceMarket.sellNow.transportCost;
    const winTransport = winningCalculation.sellNow.transportCost;
    const profitDiff = (shouldWait ? winningCalculation.wait.netProfit : winningCalculation.sellNow.netProfit) - highestQuotedPriceMarket.sellNow.netProfit;

    whyNotHighestPriceMarket = `Although ${highestQuotedPriceMarket.marketName} quotes the highest gross price (${input.currency} ${highestQuotedPriceMarket.sellNow.pricePerUnit}/unit), its distance of ${highMktDistance} km results in ${input.currency} ${highMktTransport.toLocaleString()} in transit and handling expenses. Choosing ${winningMarketObj.name} generates ${input.currency} ${profitDiff.toLocaleString()} MORE true net profit.`;
  }

  if (shouldWait) {
    summaryHeadline = `Hold Harvest & Sell to ${winningMarketObj.name} in ${waitDurationWeeks} Weeks`;
    primaryReason = `Predicted future price rise of +${mlPrediction.expectedChangePct}% at ${winningMarketObj.name} comfortably outpaces total holding costs (${input.currency} ${winningCalculation.wait.storageCost.toLocaleString()} storage + ${input.currency} ${winningCalculation.wait.spoilageLoss.toLocaleString()} spoilage), unlocking an extra ${input.currency} ${netProfitDelta.toLocaleString()} (+${deltaPercent}%) net profit.`;
    
    detailedPoints.push(
      `Net Profit Advantage: Generating ${input.currency} ${winningCalculation.wait.netProfit.toLocaleString()} by waiting vs ${input.currency} ${bestSellNowProfit.toLocaleString()} if sold today (+${deltaPercent}% gain).`,
      `Storage Economics: Warehouse cost is ${input.currency} ${winningCalculation.wait.storageCost.toLocaleString()} (${input.currency} ${storageCostPerUnitPerWeek}/unit/week across ${waitDurationWeeks} weeks).`,
      `Spoilage Mitigation: Estimated physical spoilage is ${(cumulativeSpoilagePct * 100).toFixed(1)}% (${spoilageUnits.toFixed(1)} units), which is fully absorbed by the expected ${mlPrediction.expectedChangePct}% price appreciation.`,
      `Logistics Efficiency: Transit to ${winningMarketObj.name} (${winningMarketObj.distanceKm} km) costs ${input.currency} ${winningCalculation.wait.transportCost.toLocaleString()}, maintaining a healthy profit margin of ${winningCalculation.wait.profitMarginPct}%.`
    );
  } else {
    summaryHeadline = `Sell Immediately to ${winningMarketObj.name}`;
    primaryReason = `Immediate liquidation locks in guaranteed profit and prevents severe storage expenses (${input.currency} ${(effectiveStoredYield * storageCostPerUnitPerWeek * waitDurationWeeks).toLocaleString()}) and spoilage degradation from eroding farmer returns.`;

    detailedPoints.push(
      `Zero Spoilage & Zero Storage Fees: Selling now protects 100% of the ${yieldAmount} ${input.yieldUnit} harvest without warehouse storage or rotting loss.`,
      `Cost Advantage: Total logistics expenses are limited to ${input.currency} ${winningCalculation.sellNow.totalCost.toLocaleString()}, delivering a strong net profit of ${input.currency} ${winningCalculation.sellNow.netProfit.toLocaleString()} (${winningCalculation.sellNow.profitMarginPct}% profit margin).`,
      `Holding Penalty: Waiting ${waitDurationWeeks} weeks would generate lower net returns after deducting accumulating warehouse fees and ${(cumulativeSpoilagePct * 100).toFixed(1)}% spoilage.`
    );
  }

  if (overflowYield > 0) {
    detailedPoints.push(`Storage Alert: ${overflowYield.toFixed(0)} units exceed your ${storageCapacityUnits} unit storage capacity and should be sold at farmgate immediately.`);
  }

  const recommendation: OverallRecommendation = {
    action: recommendedAction,
    bestMarket: winningMarketObj,
    expectedNetProfit: Number(expectedNetProfit.toFixed(2)),
    grossRevenue: Number(grossRevenue.toFixed(2)),
    totalExpenses: Number(totalExpenses.toFixed(2)),
    netProfitDelta: Number(netProfitDelta.toFixed(2)),
    deltaPercent,
    optimalWaitWeeks: shouldWait ? waitDurationWeeks : 0,
    riskLevel,
    riskScore,
    riskFactors,
    summaryHeadline,
    primaryReason,
    detailedPoints,
    whyNotHighestPriceMarket,
    storageWarning: overflowYield > 0 ? `Storage Capacity Exceeded by ${overflowYield.toFixed(0)} ${input.yieldUnit}` : undefined
  };

  // Generate Optimal Holding Timeline (0 to 8 weeks) to find mathematical apex
  const holdingTimeline: HoldingTimePoint[] = [];
  const targetMarket = winningMarketObj;
  const qBonus = 1 + (targetMarket.qualityGradingBonusPct || 0) / 100;
  const hMod = targetMarket.handlingCostModifier || 1.0;

  let optimalWeek = 0;
  let maxTimelineProfit = -Infinity;

  for (let w = 0; w <= 8; w++) {
    const wSpoilagePct = w === 0 ? 0 : Math.min(0.95, 1 - Math.pow(1 - weeklyRateDecimal, w));
    const wSpoilageUnits = effectiveStoredYield * wSpoilagePct;
    const wSellable = effectiveStoredYield - wSpoilageUnits + overflowYield;
    
    // Future price at week w
    const fPrice = w === 0 
      ? targetMarket.currentPricePerUnit * qBonus
      : (targetMarket.predictedFuturePricePerUnit || (targetMarket.currentPricePerUnit * (1 + (w * 0.045)))) * qBonus;

    const wRevenue = (effectiveStoredYield - wSpoilageUnits) * fPrice + (overflowYield * targetMarket.currentPricePerUnit * qBonus);
    const wTransport = (effectiveStoredYield - wSpoilageUnits + overflowYield) * targetMarket.distanceKm * transportCostPerKmPerUnit;
    const wHandling = yieldAmount * handlingCostPerUnit * hMod;
    const wStorage = effectiveStoredYield * storageCostPerUnitPerWeek * w;
    const wSpoilageCost = wSpoilageUnits * fPrice;
    const wTotalCost = wTransport + wHandling + wStorage + wSpoilageCost;
    const wNetProfit = wRevenue - (wTransport + wHandling + wStorage);

    if (wNetProfit > maxTimelineProfit) {
      maxTimelineProfit = wNetProfit;
      optimalWeek = w;
    }

    holdingTimeline.push({
      week: w,
      predictedPrice: Number(fPrice.toFixed(2)),
      cumulativeSpoilagePct: Number((wSpoilagePct * 100).toFixed(1)),
      sellableYield: Number(wSellable.toFixed(1)),
      grossRevenue: Number(wRevenue.toFixed(2)),
      storageCost: Number(wStorage.toFixed(2)),
      spoilageLoss: Number(wSpoilageCost.toFixed(2)),
      transportCost: Number(wTransport.toFixed(2)),
      handlingCost: Number(wHandling.toFixed(2)),
      totalCost: Number(wTotalCost.toFixed(2)),
      netProfit: Number(wNetProfit.toFixed(2)),
      isOptimal: false
    });
  }

  // Tag optimal week
  if (holdingTimeline[optimalWeek]) {
    holdingTimeline[optimalWeek].isOptimal = true;
  }

  return {
    markets: marketResults,
    recommendation,
    bestSellNowMarket,
    bestWaitMarket,
    highestQuotedPriceMarket,
    highestPriceWasChosen,
    holdingTimeline,
    mlPrediction,
    calculationTimestamp: new Date().toISOString()
  };
}
