import {
  LayersControl,
  MapContainer,
  TileLayer,
  useMap,
  Marker,
  Popup,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "./App.css";
import { useEffect, useState } from "react";
import output from "./assets/output.json";
import MarkerClusterGroup from "react-leaflet-cluster";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import SearchLocation from "../component/SearchLocation";

export default function App() {
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

  return (
    <div className="parent">
      <img
        src="https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Flookaside.fbsbx.com%2Flookaside%2Fcrawler%2Fmedia%2F%3Fmedia_id%3D100048608930478&f=1&nofb=1&ipt=c4a441410ff90309c7a2354e5a35c5431846f53483bad6df7082e8b6a840f019"
        alt="logonusa"
        className="logo-nusatrack"
      />
      <MapContainer
        center={[-6.5531206049425395, 106.77974654029336]}
        zoom={17}
      >
        <LayersControl position="topright">
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
        </LayersControl>
        <SearchLocation />
        <MarkerClusterGroup chunkedLoading>
          {output.map(
            (item, idx) =>
              item && (
                <Marker key={idx} position={[item.lat, item.lng]}>
                  <Popup>
                    <p>Instansi: {item.instansi[0]}</p>
                    <p>Pembelian: </p>
                    <ul>
                      {item.data.map((data, idx) => (
                        <li className="table-info" key={idx}>
                          <span>{data["TANGGAL PENAWARAN"]} </span>
                          <span>{data.PEMBELIAN}</span>
                        </li>
                      ))}
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
                      {(total[idx] / 1_000_000).toLocaleString("id-ID")} juta
                    </p>
                  </Popup>
                </Marker>
              ),
          )}
        </MarkerClusterGroup>
        <DisplayPosition />
      </MapContainer>
    </div>
  );
}
