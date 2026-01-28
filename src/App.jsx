import {
  LayersControl,
  MapContainer,
  TileLayer,
  useMap,
  GeoJSON,
  Marker,
  Popup,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "./App.css";
import { useEffect, useState } from "react";
import output from "./assets/output.json";
import L from "leaflet";
import KmlUploader from "../component/KmlUploader";
import MarkerClusterGroup from "react-leaflet-cluster";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";

export default function App() {
  const [kmlData, setKmlData] = useState(null);

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

  const data = output.map((item) => {
    let lat = null;
    let lng = null;

    const geo = item["koordinat"];
    if (geo) {
      const [latStr, lngStr] = geo.split(",");
      lat = Number(latStr);
      lng = Number(lngStr);

      return {
        instansi: item["instansi"],
        lat,
        lng,
      };
    }
  });

  return (
    <div className="parent">
      {/* logo nusatracks */}
      {/* <img
        className="logo_nusatrack"
        src="https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Flookaside.fbsbx.com%2Flookaside%2Fcrawler%2Fmedia%2F%3Fmedia_id%3D100048608930478&f=1&nofb=1&ipt=c4a441410ff90309c7a2354e5a35c5431846f53483bad6df7082e8b6a840f019"
        alt="logonusa"
      /> */}
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
        <DisplayPosition />
        {kmlData && (
          <GeoJSON
            data={kmlData}
            pointToLayer={(feature, latlng) => L.marker(latlng)}
            onEachFeature={(feature, layer) => {
              if (feature.properties?.name) {
                layer.bindPopup(feature.properties.name);
              }
            }}
          />
        )}
        <MarkerClusterGroup chunkedLoading>
          {data.map(
            (item, idx) =>
              item && (
                <Marker key={idx} position={[item.lat, item.lng]}>
                  <Popup>{item.instansi}</Popup>
                </Marker>
              ),
          )}
        </MarkerClusterGroup>
      </MapContainer>
    </div>
  );
}
