import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

function getCmcApiKey(mode: string): string {
  const env = loadEnv(mode, process.cwd(), '')
  return (
    env.CMC_API_KEY ||
    env.COINMARKETCAP_API_KEY ||
    process.env.CMC_API_KEY ||
    process.env.COINMARKETCAP_API_KEY ||
    ''
  ).trim()
}

function getOpenRouterApiKey(mode: string): string {
  const env = loadEnv(mode, process.cwd(), '')
  return (env.OPENROUTER_API_KEY || process.env.OPENROUTER_API_KEY || '').trim()
}

function getOpenRouterModel(mode: string): string {
  const env = loadEnv(mode, process.cwd(), '')
  return (env.OPENROUTER_MODEL || process.env.OPENROUTER_MODEL || 'deepseek/deepseek-v4-flash').trim()
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  return {
    plugins: [
      react(),
      tailwindcss(),
      {
        name: 'kimo-chat-and-cmc-middleware',
        configureServer(server) {
          // Status endpoint: Reports CMC key status without leaking key
          server.middlewares.use('/api/cmc-status', (_req, res) => {
            const apiKey = getCmcApiKey(mode)
            const configured = Boolean(apiKey && apiKey.length > 0)
            res.setHeader('Content-Type', 'application/json')
            res.end(
              JSON.stringify({
                configured,
                maskedKey: configured ? '••••••••' : null,
                source: configured ? '.env (server-side secured)' : 'none'
              })
            )
          })

          // KIMO AI Copilot Chat Endpoint: Proxies to OpenRouter DeepSeek Flash securely
          server.middlewares.use('/api/chat', (req, res) => {
            if (req.method !== 'POST') {
              res.statusCode = 405
              res.setHeader('Content-Type', 'application/json')
              return res.end(JSON.stringify({ error: 'Method Not Allowed' }))
            }

            let body = ''
            req.on('data', (chunk) => {
              body += chunk
            })
            req.on('end', async () => {
              try {
                const { messages = [], context = {} } = JSON.parse(body || '{}')
                const openRouterKey = getOpenRouterApiKey(mode)
                const openRouterModel = getOpenRouterModel(mode)

                if (!openRouterKey) {
                  res.setHeader('Content-Type', 'application/json')
                  res.statusCode = 400
                  return res.end(
                    JSON.stringify({
                      error: 'OPENROUTER_API_KEY is not configured in .env'
                    })
                  )
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
Provide clean, direct answers. Do NOT produce broken or unescaped markdown asterisks. Ensure all bold text and bullet points are clean.`

                const openRouterPayload = {
                  model: openRouterModel,
                  max_tokens: 850,
                  temperature: 0.3,
                  messages: [
                    { role: 'system', content: systemPrompt },
                    ...messages
                  ]
                }

                const aiRes = await fetch('https://openrouter.ai/api/v1/chat/completions', {
                  method: 'POST',
                  headers: {
                    Authorization: `Bearer ${openRouterKey}`,
                    'Content-Type': 'application/json',
                    'HTTP-Referer': 'http://localhost:5173',
                    'X-Title': 'Aetheris KIMO Copilot'
                  },
                  body: JSON.stringify(openRouterPayload)
                })

                const aiData = await aiRes.json()
                res.setHeader('Content-Type', 'application/json')
                res.statusCode = aiRes.status
                res.end(JSON.stringify(aiData))
              } catch (err: any) {
                res.setHeader('Content-Type', 'application/json')
                res.statusCode = 500
                res.end(JSON.stringify({ error: err.message }))
              }
            })
          })
        }
      }
    ],
    server: {
      host: true,
      port: 5173,
      proxy: {
        '/api/cmc': {
          target: 'https://pro-api.coinmarketcap.com',
          changeOrigin: true,
          secure: true,
          rewrite: (path) => path.replace(/^\/api\/cmc/, ''),
          configure: (proxy) => {
            proxy.on('proxyReq', (proxyReq, req) => {
              // Read server-side key from .env so client never needs to know or transmit secrets
              const serverKey = getCmcApiKey(mode)
              const clientKey = (req.headers['x-cmc-client-key'] as string) || ''
              const finalKey = serverKey || clientKey

              if (finalKey) {
                proxyReq.setHeader('X-CMC_PRO_API_KEY', finalKey)
              }

              // Strip client tester header before upstream request
              proxyReq.removeHeader('x-cmc-client-key')
              proxyReq.setHeader('Accept', 'application/json')
            })
            proxy.on('error', (err, _req, res: any) => {
              if (res && typeof res.writeHead === 'function' && !res.headersSent) {
                res.writeHead(502, { 'Content-Type': 'application/json' })
                res.end(JSON.stringify({ error: 'Proxy Gateway Error', message: err.message }))
              }
            })
          }
        }
      }
    }
  }
})

