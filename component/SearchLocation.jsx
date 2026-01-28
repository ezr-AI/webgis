import { useState } from "react";
import { useMap } from "react-leaflet";

export default function SearchLocation() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const map = useMap();

  const search = async (q) => {
    setQuery(q);

    if (q.length < 3) {
      setResults([]);
      return;
    }

    const res = await fetch(
      `http://localhost:3001/search?q=${encodeURIComponent(q)}`,
    );
    const data = await res.json();
    setResults(data.results || []);
  };

  return (
    <div className="windy-search">
      <input
        value={query}
        onChange={(e) => search(e.target.value)}
        placeholder="Search location"
      />

      {results.length > 0 && (
        <div className="windy-results">
          {results.slice(0, 5).map((r) => (
            <div
              key={r.place_id}
              className="windy-item"
              onClick={() => {
                const loc = r.geometry.location;
                map.flyTo([loc.lat, loc.lng], 15);
                setResults([]);
              }}
            >
              {r.name}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
