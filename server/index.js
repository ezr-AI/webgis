import express from "express";
import cors from "cors";
import fetch from "node-fetch";
import "dotenv/config";

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

/**
 * TEST SERVER
 */
app.get("/", (req, res) => {
  res.send("SERVER HIDUP");
});

/**
 * SEARCH GOOGLE PLACES (proxy aman)
 */
app.get("/search", async (req, res) => {
  const q = req.query.q;

  if (!q) {
    return res.status(400).json({ error: "query required" });
  }

  try {
    const url =
      "https://maps.googleapis.com/maps/api/place/textsearch/json?" +
      new URLSearchParams({
        query: q,
        region: "id",
        key: process.env.GOOGLE_API_KEY,
      });

    const r = await fetch(url);
    const data = await r.json();

    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "google api error" });
  }
});

app.listen(PORT, () => {
  console.log(`✅ API running on http://localhost:${PORT}`);
});
