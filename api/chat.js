export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', '*');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    res.setHeader('Content-Type', 'application/json');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  let body = req.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch {}
  } else if (!body && req.readable) {
    body = await new Promise((resolve) => {
      let data = '';
      req.on('data', (chunk) => {
        data += chunk;
      });
      req.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch {
          resolve({});
        }
      });
    });
  }

  const { messages = [], context = {} } = body || {};

  const openRouterKey = (process.env.OPENROUTER_API_KEY || '').trim();
  const openRouterModel = (process.env.OPENROUTER_MODEL || 'deepseek/deepseek-v4-flash').trim();

  if (!openRouterKey) {
    res.setHeader('Content-Type', 'application/json');
    return res.status(400).json({
      error: 'OPENROUTER_API_KEY is not configured in Vercel environment variables'
    });
  }

  const systemPrompt = `You are KIMO, an elite institutional financial intelligence AI copilot directly embedded into the Aetheris Terminal.
You have direct programmatic control over the terminal workstation, financial risk models, window manager, themes, simulations, and navigation.

You are mathematically rigorous, institutional, helpful, and concise.

When the user asks you to perform an action or change something in the application, ALWAYS append a JSON action block at the VERY END of your response inside a \`\`\`json:action ... \`\`\` code block.

Available Action Types:
- OPEN_WINDOW: { "type": "OPEN_WINDOW", "windowId": "veritas" | "cascade" | "basis" | "parity" | "ghost" | "telemetry" }
- CLOSE_WINDOW: { "type": "CLOSE_WINDOW", "windowId": "veritas" | "cascade" | "basis" | "parity" | "ghost" | "telemetry" }
- MINIMIZE_WINDOW: { "type": "MINIMIZE_WINDOW", "windowId": ... }
- MAXIMIZE_WINDOW: { "type": "MAXIMIZE_WINDOW", "windowId": ... }
- FOCUS_WINDOW: { "type": "FOCUS_WINDOW", "windowId": ... }
- CLOSE_ALL: { "type": "CLOSE_ALL" }
- RESET_WORKSPACE: { "type": "RESET_WORKSPACE" }
- APPLY_PRESET: { "type": "APPLY_PRESET", "preset": "default" | "split-duo" | "tiled-quad" | "full-focus" }
- SET_THEME: { "type": "SET_THEME", "theme": "dark" | "light" }
- NAVIGATE: { "type": "NAVIGATE", "route": "terminal" | "landing" }
- SET_RWA_ASSET: { "type": "SET_RWA_ASSET", "symbol": "USDY" | "BUIDL" | "USDM" | "bNVDA" | "bAAPL" | "XAUT" | "STBT" }
- SET_RWA_FILTER: { "type": "SET_RWA_FILTER", "filter": "all" | "government_security" | "stock" | "commodity" }
- SET_EXIT_ORDER: { "type": "SET_EXIT_ORDER", "amount": 500000 }
- TRIGGER_REFRESH: { "type": "TRIGGER_REFRESH" }
- OPEN_TELEMETRY: { "type": "OPEN_TELEMETRY" }
- OPEN_ALERTS: { "type": "OPEN_ALERTS" }

Window IDs reference:
- veritas = VeritasRWA (Solvency & Exit Liquidity Stress-Tester)
- cascade = CascadeRadar (Derivative Liquidation Spiral Scanner & CFI)
- basis = BasisVerse (Macro Yield-Curve & Basis Navigator)
- parity = ParityGuard (24/7 Tokenized Equity Spread Engine)
- ghost = GhostWhale (Multi-Chain DEX Smart Money Sentinel)
- telemetry = CMC API Telemetry & Proof Stream

Live Terminal Context:
${context ? JSON.stringify(context, null, 2) : 'Standard mode'}

Formatting rule:
Provide clean, direct answers. Do NOT produce broken or unescaped markdown asterisks. Ensure all bold text and bullet points are clean.`;

  try {
    const openRouterPayload = {
      model: openRouterModel,
      max_tokens: 850,
      temperature: 0.3,
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages
      ]
    };

    const aiRes = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${openRouterKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://0xaetheris.vercel.app',
        'X-Title': 'Aetheris KIMO Copilot'
      },
      body: JSON.stringify(openRouterPayload)
    });

    const aiData = await aiRes.json();
    res.setHeader('Content-Type', 'application/json');
    return res.status(aiRes.status).json(aiData);
  } catch (err) {
    res.setHeader('Content-Type', 'application/json');
    return res.status(500).json({ error: err.message });
  }
}
