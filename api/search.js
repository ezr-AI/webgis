export default async function handler(req, res) {
  const q = req.query.q;

  if (!q || q.length < 3) {
    return res.status(200).json({ results: [] });
  }

  const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(
    q,
  )}&key=${process.env.GOOGLE_API_KEY}`;

  const r = await fetch(url);
  const data = await r.json();

  res.status(200).json(data);
}
