import { openai } from '../../lib/openai';

const VERTICAL_PROMPTS: Record<string, string> = {
  food: `Extract: { ingredients: [{name, qty, unit}], steps: string[], calories: number, prepTime: number, difficulty: "easy"|"medium"|"hard", cuisine: string }`,
  travel: `Extract: { locations: [{name, coords: {lat, lng}, type, tips: string, cost?: string, timestamp?: number}], totalBudget?: string, duration?: string, transport?: string[] }`,
  fitness: `Extract: { exercises: [{name, sets: number, reps: number|string, rest: number, muscleGroup: string, notes?: string}], programName?: string, level: "beginner"|"intermediate"|"advanced", totalDuration: number }`,
  finance: `Extract: { tickers: [{symbol, context, sentiment: "bullish"|"bearish"|"neutral"}], strategies: string[], riskLevel: "low"|"medium"|"high", timeHorizon?: string }`,
  music: `Extract: { chords: [{name, timestamp: number, tab?: string}], bpm?: number, key?: string, genre?: string, techniques?: string[] }`,
  sport: `Extract: { events: [{time: number, type: string, player?: string, detail: string}], score?: string, stats: Record<string, string> }`,
};

export async function extractStructuredData(
  transcript: string,
  vertical: string,
  visualContext?: string
): Promise<Record<string, unknown>> {
  const prompt = VERTICAL_PROMPTS[vertical] ?? `Extract key information as structured JSON.`;
  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: `You are a structured data extractor. ${prompt} Return ONLY valid JSON, no markdown.` },
      { role: 'user', content: `TRANSCRIPT:\n${transcript}\n\nVISUAL CONTEXT:\n${visualContext ?? 'N/A'}` },
    ],
    temperature: 0.1,
    response_format: { type: 'json_object' },
  });
  try {
    return JSON.parse(response.choices[0]?.message?.content ?? '{}') as Record<string, unknown>;
  } catch {
    return {};
  }
}

export async function buildBotSystemPrompt(videoTitle: string, vertical: string, aiData: Record<string, unknown>): Promise<string> {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content: 'Create a concise, effective system prompt for a video assistant bot. The prompt should make the bot seem like it has watched the entire video and knows every detail.',
      },
      {
        role: 'user',
        content: `Video: "${videoTitle}" | Vertical: ${vertical} | Extracted data: ${JSON.stringify(aiData)}`,
      },
    ],
    max_tokens: 500,
  });
  return response.choices[0]?.message?.content ?? '';
}
