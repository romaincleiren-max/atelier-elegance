/**
 * Keepalive — ping hebdomadaire pour maintenir Supabase actif (free tier).
 * Déclenché par le cron Vercel tous les lundis à 8h UTC.
 */
export default async function handler(req, res) {
  try {
    const url  = process.env.VITE_SUPABASE_URL
    const key  = process.env.VITE_SUPABASE_ANON_KEY

    if (!url || !key) {
      return res.status(200).json({ ok: true, note: 'No Supabase env vars' })
    }

    const r = await fetch(`${url}/rest/v1/site_settings?select=setting_key&limit=1`, {
      headers: { apikey: key, Authorization: `Bearer ${key}` }
    })

    return res.status(200).json({
      ok: true,
      supabase: r.ok,
      status: r.status,
      ts: new Date().toISOString()
    })
  } catch (err) {
    // On renvoie 200 quand même pour que Vercel ne marque pas la tâche en échec
    return res.status(200).json({ ok: false, error: err.message })
  }
}
