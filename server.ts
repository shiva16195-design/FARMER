import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { calculateDecisionMetrics } from './src/utils/calculations';
import { CROP_PRESETS } from './src/data/cropPresets';
import { DecisionHistoryRecord, FarmerInputState } from './src/types';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// In-memory decision history storage with persistent sample seeds
let decisionHistory: DecisionHistoryRecord[] = [
  {
    id: 'hist-1',
    timestamp: new Date(Date.now() - 86400000 * 2).toISOString(),
    cropType: 'tomatoes',
    yieldAmount: 150,
    yieldUnit: 'quintals',
    currency: 'USD',
    recommendedAction: 'SELL_NOW',
    recommendedMarket: 'Local Village Mandi / Farmgate Buyer',
    expectedNetProfit: 3820,
    riskLevel: 'LOW',
    waitWeeks: 3,
    farmLocation: 'Green Valley Farm, Sector 4',
    fullInput: {} as any
  },
  {
    id: 'hist-2',
    timestamp: new Date(Date.now() - 86400000 * 5).toISOString(),
    cropType: 'onions',
    yieldAmount: 200,
    yieldUnit: 'quintals',
    currency: 'USD',
    recommendedAction: 'WAIT',
    recommendedMarket: 'Regional Wholesale Agricultural Market',
    expectedNetProfit: 6480,
    riskLevel: 'MODERATE',
    waitWeeks: 4,
    farmLocation: 'Hillview Agro Acres',
    fullInput: {} as any
  }
];

// --- API Endpoints ---

// 1. Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'Smart Farm Harvest & Market Price Decision System' });
});

// 2. Crop Presets
app.get('/api/crops', (req, res) => {
  res.json({ crops: CROP_PRESETS });
});

// 3. Calculation & Decision Engine
app.post('/api/calculate', (req, res) => {
  try {
    const input: FarmerInputState = req.body;
    if (!input || !input.yieldAmount || !input.markets) {
      return res.status(400).json({ error: 'Invalid input payload. Yield and markets are required.' });
    }
    const result = calculateDecisionMetrics(input);
    res.json(result);
  } catch (err: any) {
    console.error('Calculation Error:', err);
    res.status(500).json({ error: err.message || 'Calculation failed' });
  }
});

// 4. Decision History CRUD
app.get('/api/history', (req, res) => {
  res.json({ history: decisionHistory });
});

app.post('/api/history', (req, res) => {
  try {
    const record: DecisionHistoryRecord = req.body;
    if (!record.id) {
      record.id = `hist-${Date.now()}`;
    }
    if (!record.timestamp) {
      record.timestamp = new Date().toISOString();
    }
    decisionHistory.unshift(record);
    // Keep max 50 items
    if (decisionHistory.length > 50) {
      decisionHistory = decisionHistory.slice(0, 50);
    }
    res.json({ success: true, record });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/history/:id', (req, res) => {
  const { id } = req.params;
  decisionHistory = decisionHistory.filter(h => h.id !== id);
  res.json({ success: true });
});

// 5. Gemini AI Agronomic & Market Risk Advisory
app.post('/api/ai-advisory', async (req, res) => {
  try {
    const { input, calculationResult } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    const cropName = input?.customCropName || input?.cropType || 'Produce';
    const rec = calculationResult?.recommendation;
    const currency = input?.currency || '$';

    if (!apiKey) {
      // Return structured agronomic intelligence fallback
      return res.json({
        source: 'system_heuristic_advisor',
        advice: {
          executiveSummary: `Based on quantitative net profit optimization, the recommended strategy is to **${rec?.action === 'WAIT' ? `WAIT ${rec?.optimalWaitWeeks} weeks and sell to ${rec?.bestMarket?.name}` : `SELL NOW to ${rec?.bestMarket?.name}`}**, unlocking an expected net return of **${currency} ${rec?.expectedNetProfit?.toLocaleString()}**.`,
          keyDrivers: [
            `Net Profit Advantage: ${currency} ${rec?.netProfitDelta?.toLocaleString()} (+${rec?.deltaPercent}%) higher than alternative strategies.`,
            `Logistics Optimization: Accounts for ${rec?.bestMarket?.distanceKm} km transit radius and handling overheads.`,
            `Perishability Risk: ${rec?.riskLevel} risk tier considering weekly spoilage decay and cold-chain resilience.`
          ],
          actionableTips: [
            'Inspect harvest grading before dispatch; sorting into Grade-A lots can capture up to 8-12% higher spot premiums.',
            'Confirm truck booking 48 hours prior to transport to avoid last-minute spot diesel surcharges.',
            rec?.action === 'WAIT' 
              ? 'Maintain warehouse humidity and ventilation; verify air circulation fans to prevent fungal dampness.'
              : 'Execute farmgate loading directly to avoid secondary handling friction and moisture evaporation loss.'
          ],
          riskMitigation: rec?.riskFactors?.length ? rec.riskFactors : ['Standard market price fluctuations and transit delays.']
        }
      });
    }

    const ai = new GoogleGenAI({ apiKey });
    const prompt = `You are a senior agricultural economist and agronomic supply chain expert advising a commercial farmer.
Analyze the following harvest decision data and provide a concise, high-impact tactical advisory for the farmer:

Crop: ${cropName}
Location: ${input?.farmLocation || 'Commercial Farm'}
Harvest Yield: ${input?.yieldAmount} ${input?.yieldUnit}
Storage Capacity: ${input?.storageCapacityUnits} ${input?.yieldUnit}
Spoilage Rate: ${input?.spoilageRatePerWeekPct}% per week
Wait Duration Evaluated: ${input?.waitDurationWeeks} weeks
Recommended Action: ${rec?.action}
Target Market: ${rec?.bestMarket?.name} (${rec?.bestMarket?.distanceKm} km away)
Expected Net Profit: ${currency} ${rec?.expectedNetProfit?.toLocaleString()}
Net Profit Delta: ${currency} ${rec?.netProfitDelta?.toLocaleString()} (+${rec?.deltaPercent}%)
Risk Level: ${rec?.riskLevel}
Why Highest Quoted Price Market Was or Was Not Picked: ${rec?.whyNotHighestPriceMarket || 'Selected market delivers the highest net profit after all freight, handling, and spoilage losses.'}

Provide your response in JSON format matching this schema:
{
  "executiveSummary": "1-2 crisp sentences giving the bottom line directive",
  "keyDrivers": ["bullet 1", "bullet 2", "bullet 3"],
  "actionableTips": ["practical harvest/logistics tip 1", "practical storage/negotiation tip 2", "tip 3"],
  "riskMitigation": ["how to hedge downside risk 1", "how to manage weather or market shock 2"]
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json'
      }
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json({
      source: 'gemini_ai',
      advice: parsed
    });
  } catch (err: any) {
    console.error('Gemini Advisory Error:', err);
    res.status(500).json({ error: err.message || 'AI advisory generation failed' });
  }
});

// Vite middleware in development vs static file serving in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Smart Farm Decision System running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
