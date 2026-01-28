import JSZip from "jszip";
import { kml } from "@tmcw/togeojson";

export default function KmlUploader({ onLoad }) {
  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.name.endsWith(".kml")) {
      const text = await file.text();
      const dom = new DOMParser().parseFromString(text, "text/xml");
      const geojson = kml(dom);
      onLoad(geojson);
    }

    if (file.name.endsWith(".kmz")) {
      const zip = await JSZip.loadAsync(file);
      const kmlFile = Object.values(zip.files).find((f) =>
        f.name.endsWith(".kml"),
      );

      const text = await kmlFile.async("text");
      const dom = new DOMParser().parseFromString(text, "text/xml");
      const geojson = kml(dom);
      onLoad(geojson);
    }
  };

  return <input type="file" accept=".kml,.kmz" onChange={handleFile} />;
}
