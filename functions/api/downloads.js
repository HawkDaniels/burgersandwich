// Cloudflare Pages Function — save as: functions/api/downloads.js
// Serves:  GET  /api/downloads  -> { "luffy-acapella": 12, ... }
//          POST /api/downloads  body {"id":"luffy-acapella"} -> increments that count
//
// Requires a D1 binding named DB (Pages project > Settings > Bindings).

// Any tag is accepted and gets its own row on first download.
// Tags must be 1–64 characters of lowercase letters, numbers and hyphens.
const VALID_ID = /^[a-z0-9-]{1,64}$/;

export async function onRequestGet({ env }) {
  const { results } = await env.bs-counter
    .prepare('SELECT id, count FROM downloads')
    .all();

  const counts = Object.fromEntries(results.map(r => [r.id, r.count]));
  return Response.json(counts, { headers: { 'Cache-Control': 'no-store' } });
}

export async function onRequestPost({ request, env }) {
  let id;
  try {
    // sendBeacon sends the body as text/plain, so parse it manually
    ({ id } = JSON.parse(await request.text()));
  } catch {
    return new Response('Bad request', { status: 400 });
  }

  if (typeof id !== 'string' || !VALID_ID.test(id)) {
    return new Response('Invalid download id', { status: 400 });
  }

  const row = await env.bs-counter
    .prepare(
      `INSERT INTO downloads (id, count) VALUES (?1, 1)
       ON CONFLICT(id) DO UPDATE SET count = count + 1
       RETURNING count`
    )
    .bind(id)
    .first();

  return Response.json({ id, count: row.count });
}
