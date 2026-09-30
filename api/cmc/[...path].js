export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', '*');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    let cmcPath = '';
    if (Array.isArray(req.query?.path)) {
      cmcPath = req.query.path.join('/');
    } else if (typeof req.query?.path === 'string') {
      cmcPath = req.query.path;
    } else if (req.url && req.url.includes('/api/cmc/')) {
      cmcPath = req.url.split('/api/cmc/')[1].split('?')[0];
    }

    const host = req.headers.host || 'localhost';
    const parsed = new URL(req.url, `http://${host}`);
    parsed.searchParams.delete('path');
    const qs = parsed.searchParams.toString();

    const targetUrl = `https://pro-api.coinmarketcap.com/${cmcPath.replace(/^\//, '')}${qs ? `?${qs}` : ''}`;

    const serverKey = (
      process.env.CMC_API_KEY ||
      process.env.COINMARKETCAP_API_KEY ||
      ''
    ).trim();
    const clientKey = (req.headers['x-cmc-client-key'] || '').trim();
    const finalKey = serverKey || clientKey;

    if (!finalKey) {
      res.setHeader('Content-Type', 'application/json');
      return res.status(401).json({
        error: 'CMC_API_KEY is not configured in Vercel environment variables'
      });
    }

    const fetchHeaders = {
      'Accept': 'application/json',
      'Accept-Encoding': 'deflate, gzip',
      'X-CMC_PRO_API_KEY': finalKey
    };

    const cmcRes = await fetch(targetUrl, {
      method: req.method || 'GET',
      headers: fetchHeaders
    });

    const bodyText = await cmcRes.text();
    res.setHeader('Content-Type', 'application/json');
    res.status(cmcRes.status);
    return res.send(bodyText);
  } catch (err) {
    res.setHeader('Content-Type', 'application/json');
    return res.status(502).json({
      error: 'CoinMarketCap Gateway Proxy Error',
      message: err.message
    });
  }
}
