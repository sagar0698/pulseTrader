/**
 * PulseTrader — Cloudflare Worker Proxy
 *
 * Setup steps:
 * 1. Go to workers.cloudflare.com → Create a Worker
 * 2. Paste this entire file into the editor
 * 3. Click "Settings" → "Variables" → "Add secret"
 *    Name: ANTHROPIC_API_KEY   Value: your sk-ant-... key
 * 4. Also add a plain variable:
 *    Name: SITE_PASSWORD       Value: whatever password you want visitors to use
 * 5. Deploy → copy your Worker URL (e.g. https://pulsetrader.yourname.workers.dev)
 * 6. Paste that URL into index.html where it says WORKER_URL_HERE
 */

export default {
  async fetch(request, env) {

    // ── CORS headers (allow your GitHub Pages domain) ──────────
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, X-Site-Password',
    };

    // Handle preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // Only accept POST
    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405, headers: corsHeaders });
    }

    // ── Password check ─────────────────────────────────────────
    const sitePassword = request.headers.get('X-Site-Password') || '';
    if (sitePassword !== env.SITE_PASSWORD) {
      return new Response(
        JSON.stringify({ error: { message: 'Invalid password' } }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ── Rate limiting (per IP, max 30 requests/hour) ───────────
    const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
    const rateLimitKey = `rate:${ip}:${new Date().toISOString().slice(0, 13)}`; // per hour bucket

    if (env.KV) { // Only if KV namespace is bound (optional)
      const count = parseInt(await env.KV.get(rateLimitKey) || '0');
      if (count >= 30) {
        return new Response(
          JSON.stringify({ error: { message: 'Rate limit reached. Try again in an hour.' } }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      await env.KV.put(rateLimitKey, String(count + 1), { expirationTtl: 3600 });
    }

    // ── Proxy to Anthropic ─────────────────────────────────────
    let body;
    try {
      body = await request.json();
    } catch (e) {
      return new Response(
        JSON.stringify({ error: { message: 'Invalid JSON body' } }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Force model to sonnet — prevent abuse of expensive models
    body.model = 'claude-sonnet-4-6';

    // Cap max_tokens at 4000
    if (!body.max_tokens || body.max_tokens > 4000) {
      body.max_tokens = 4000;
    }

    const anthropicRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify(body),
    });

    const responseBody = await anthropicRes.text();

    return new Response(responseBody, {
      status: anthropicRes.status,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
    });
  },
};
