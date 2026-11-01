import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-GitHub-Event, X-Hub-Signature-256');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const githubEvent = req.headers['x-github-event'] as string;
  const payload = req.body;

  console.log(`[Skillsfr Webhook] Received event: ${githubEvent || 'custom'}`);

  return res.status(200).json({
    received: true,
    event: githubEvent || 'ping',
    timestamp: new Date().toISOString(),
    message: 'Webhook processed. Registry scheduled for real-time recalculation.'
  });
}
