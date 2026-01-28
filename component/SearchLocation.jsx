import { useState } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";

export default function SearchLocation() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [marker, setMarker] = useState(null);
  const map = useMap();
  const redIcon = new L.Icon({
    iconUrl:
      "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
    shadowUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });

  const clearMarker = () => {
    if (marker) {
      map.removeLayer(marker);
      setMarker(null);
    }
  };

  const dropPin = (lat, lng) => {
    clearMarker();

    const m = L.marker([lat, lng], {
      icon: redIcon,
    }).addTo(map);

    setMarker(m);

    map.flyTo([lat, lng], 15, {
      animate: true,
      duration: 1.2,
    });
  };

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

  const goToTopResult = () => {
    if (!results.length) return;

    const r = results[0];
    const loc = r.geometry.location;

    dropPin(loc.lat, loc.lng);
    setResults([]);
  };

  return (
    <div className="windy-search">
      <input
        value={query}
        onChange={(e) => search(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") goToTopResult();
          if (e.key === "Escape") {
            clearMarker();
            setQuery("");
            setResults([]);
          }
        }}
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
                dropPin(loc.lat, loc.lng);
                setResults([]);
              }}
            >
              {r.name}
            </div>
          ))}
        </div>
      )}

      {marker && (
        <button
          className="cancel-search"
          onClick={() => {
            clearMarker();
            setQuery("");
            setResults([]);
          }}
        >
          ✕
        </button>
      )}
    </div>
  );
}
