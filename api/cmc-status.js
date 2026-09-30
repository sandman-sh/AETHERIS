export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', '*');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const apiKey = (
    process.env.CMC_API_KEY ||
    process.env.COINMARKETCAP_API_KEY ||
    ''
  ).trim();

  const configured = Boolean(apiKey && apiKey.length > 0);

  res.setHeader('Content-Type', 'application/json');
  return res.status(200).json({
    configured,
    maskedKey: configured ? '••••••••' : null,
    source: configured ? 'Vercel Environment Variable' : 'Not Configured (Add CMC_API_KEY in Vercel)'
  });
}
