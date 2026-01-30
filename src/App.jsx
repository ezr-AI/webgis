import {
  LayersControl,
  MapContainer,
  TileLayer,
  useMap,
  Marker,
  Popup,
  GeoJSON,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "./App.css";
import { useEffect, useMemo, useRef, useState } from "react";
import output from "./assets/output.json";
import MarkerClusterGroup from "react-leaflet-cluster";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import SearchLocation from "../component/SearchLocation";
import nusatrackLogo from "./assets/nusatracks.png";
import * as turf from "@turf/turf";
import { FiMenu, FiX } from "react-icons/fi";

import L from "leaflet";
import Analisis from "../component/Analisis";

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

export default function App() {
  const [indonesia, setIndonesia] = useState(null);
  const [geoData, setGeoData] = useState(null);
  const [filter, setFilter] = useState("ALL");
  const mapRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [geoDataFiltered, setGeoDataFiltered] = useState(null);

  const getColor = (d) => {
    return d > 30
      ? "#800026"
      : d > 25
        ? "#BD0026"
        : d > 20
          ? "#E31A1C"
          : d > 15
            ? "#FC4E2A"
            : d > 10
              ? "#FD8D3C"
              : d > 5
                ? "#FEB24C"
                : d > 0
                  ? "#FED976"
                  : "#EEEEEE";
  };

  const filteredOutput = useMemo(() => {
    if (filter === "ALL") return output;

    return output.filter((item) =>
      item.data.some((d) => d.KATEGORI?.trim() === filter),
    );
  }, [filter]);

  const ranking = geoData
    ? geoData.features
        .map((f) => ({
          kota: f.properties.NAME_2,
          jumlah: f.properties.jumlahKlien || 0,
        }))
        .filter((d) => d.jumlah > 0) // buang yang 0
        .sort((a, b) => b.jumlah - a.jumlah) // urut desc
    : [];

  useEffect(() => {
    fetch("/indonesia.json")
      .then((res) => res.json())
      .then((data) => setIndonesia(data));
  }, []);
  function DisplayPosition() {
    const map = useMap();
    const [position, setPosition] = useState(map.getCenter());

    useEffect(() => {
      const onMove = () => {
        setPosition(map.getCenter());
      };
      map.on("move", onMove);
      return () => {
        console.log("jancoook");
        map.off("move", onMove);
      };
    }, [map]);

    return (
      <div className="map-info">
        lat: {position.lat.toFixed(6)} | lng: {position.lng.toFixed(6)}
      </div>
    );
  }

  const total = output.map((item) =>
    item.data.reduce((sum, d) => sum + (Number(d.NILAI) || 0), 0),
  );

  useEffect(() => {
    if (!indonesia) return;

    const kelompok = {};

    filteredOutput.forEach((p) => {
      const pt = turf.point([p.lng, p.lat]);

      for (const feature of indonesia.features) {
        if (turf.booleanPointInPolygon(pt, feature)) {
          const kota = feature.properties.NAME_2;
          kelompok[kota] = (kelompok[kota] || 0) + 1;
          break;
        }
      }
    });

    const features = indonesia.features.map((f) => ({
      ...f,
      properties: {
        ...f.properties,
        jumlahKlien: kelompok[f.properties.NAME_2] || 0,
      },
    }));

    setGeoDataFiltered({
      type: "FeatureCollection",
      features,
    });
  }, [indonesia, filteredOutput]);

  const zoomToCity = (cityName) => {
    if (!geoDataFiltered) return;

    const feature = geoDataFiltered.features.find(
      (f) => f.properties.NAME_2 === cityName,
    );
    if (!feature) return;

    const bounds = L.geoJSON(feature).getBounds();
    mapRef.current.fitBounds(bounds);
  };

  return (
    <div className="parent">
      <button
        className="burgir"
        onClick={() => setOpen(!open)}
        style={{ left: open ? "250px" : "10px" }}
      >
        {open ? <FiX /> : <FiMenu />}
      </button>
      <img src={nusatrackLogo} className="logo-nusatrack" />
      {open && (
        <Analisis
          geoData={geoDataFiltered}
          filter={filter}
          setFilter={setFilter}
          onSelectCity={zoomToCity}
        />
      )}
      <MapContainer
        ref={mapRef}
        center={[-6.5531206049425395, 106.77974654029336]}
        zoom={17}
      >
        <LayersControl position="topright">
          {geoDataFiltered && (
            <LayersControl.Overlay name="Choropleth Kota" checked>
              <GeoJSON
                key={JSON.stringify(geoDataFiltered)}
                data={geoDataFiltered}
                style={(feature) => ({
                  fillColor: getColor(feature.properties.jumlahKlien),
                  weight: 1,
                  color: "#555",
                  fillOpacity: 0.7,
                })}
                onEachFeature={(feature, layer) => {
                  const name =
                    feature.properties?.NAME_2 ||
                    feature.properties?.KAB_KOTA ||
                    feature.properties?.name ||
                    "Tanpa nama";
                  const jumlah = feature.properties.jumlahKlien || 0;
                  console.log(jumlah);

                  if (jumlah > 0) {
                    layer.bindPopup(`
                  <b>${name}</b><br/>
                  Jumlah klien: ${jumlah}
                  `);
                  }

                  layer.on({
                    mouseover: (e) => {
                      e.target.setStyle({
                        weight: 2,
                        fillOpacity: 0.9,
                      });
                    },
                    mouseout: (e) => {
                      e.target.setStyle({
                        weight: 1,
                        fillOpacity: 0.7,
                      });
                    },
                  });
                }}
              />
            </LayersControl.Overlay>
          )}

          <LayersControl.BaseLayer name="streetmap" checked>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
          </LayersControl.BaseLayer>
          <LayersControl.BaseLayer name="satellite">
            {" "}
            <TileLayer
              attribution="satellite"
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            />
          </LayersControl.BaseLayer>

          <SearchLocation />
          <LayersControl.Overlay name="Marker Klien" checked>
            <MarkerClusterGroup chunkedLoading>
              {filteredOutput.map(
                (item, idx) =>
                  item && (
                    <Marker key={idx} position={[item.lat, item.lng]}>
                      <Popup>
                        <p>Instansi: {item.instansi[0]}</p>
                        <p>Pembelian: </p>
                        <ul>
                          <ul>
                            {item.data.map((data, idx) => (
                              <li className="table-info" key={idx}>
                                <span>{data["TANGGAL PENAWARAN"]} </span>
                                <span>{data.PEMBELIAN}</span>
                              </li>
                            ))}
                          </ul>
                        </ul>
                        {(() => {
                          const namaPIC = [
                            ...new Set(
                              item.data
                                .map((d) => d["NAMA PIC"]?.trim())
                                .filter(Boolean),
                            ),
                          ];

                          return (
                            namaPIC.length > 0 && (
                              <p>Nama PIC: {namaPIC.join(", ")}</p>
                            )
                          );
                        })()}

                        {(() => {
                          const owner = [
                            ...new Set(
                              item.data
                                .map((d) => d["OWNER.1"]?.trim())
                                .filter(Boolean),
                            ),
                          ];

                          return <p>Owner: {owner.join(", ")}</p>;
                        })()}

                        {(() => {
                          const kategori = [
                            ...new Set(
                              item.data
                                .map((d) => d.KATEGORI?.trim())
                                .filter(Boolean),
                            ),
                          ];

                          return kategori && <p>Kategori: {kategori}</p>;
                        })()}

                        <p>
                          Total Nilai:{" "}
                          {(total[idx] / 1_000_000).toLocaleString("id-ID")}{" "}
                          juta
                        </p>
                      </Popup>
                    </Marker>
                  ),
              )}
            </MarkerClusterGroup>
          </LayersControl.Overlay>
        </LayersControl>
        <DisplayPosition />
      </MapContainer>
    </div>
  );
}
