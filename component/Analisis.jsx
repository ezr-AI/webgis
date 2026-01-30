export default function Analisis({ geoData, filter, setFilter, onSelectCity }) {
  if (!geoData) {
    return (
      <div className="analisis">
        <h3>Analisis</h3>
        <p>Loading data...</p>
      </div>
    );
  }

  // bikin ranking dari geoData
  const ranking = geoData.features
    .map((f) => ({
      kota: f.properties.NAME_2,
      jumlah: f.properties.jumlahKlien || 0,
    }))
    .filter((d) => d.jumlah > 0)
    .sort((a, b) => b.jumlah - a.jumlah);

  return (
    <div className="analisis">
      <h3>Analisis Klien</h3>

      {/* FILTER */}
      <div className="filter">
        <label>Filter Kategori</label>
        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="ALL">Semua</option>
          <option value="GPS">GPS</option>
          <option value="DRONE">DRONE</option>
          <option value="RENTAL">RENTAL</option>
          <option value="AKSESORIS">AKSESORIS</option>
          <option value="JASA">JASA</option>
        </select>
      </div>

      <hr />

      {/* RANKING */}
      <h4>Ranking Kota</h4>

      {ranking.length === 0 ? (
        <p>Tidak ada data</p>
      ) : (
        <ul>
          {ranking.map((r, i) => (
            <li
              key={r.kota}
              style={{ cursor: "pointer" }}
              onClick={() => onSelectCity && onSelectCity(r.kota)}
            >
              {i + 1}. {r.kota} – {r.jumlah} klien
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
