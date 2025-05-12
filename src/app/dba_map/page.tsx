"use client";
import Header from "@/app/components/Header";
import DbaMapComponent from "./map";
import config_json from "./InfoTable.json";

// URLs de los archivos KML para el mapa DBA
const DBA_KML_URLS = [
  // La capa de caracterización debe ir primero (por debajo) con su filtro específico
  { url: "/kmz/caract.kml", filter: { property: "DBA_Mauro", value: "Si" } },
  // Luego las demás capas sin filtro
  "/kmz/dba_river.kml", 
  "/kmz/dba_lines.kml"
  // Añade aquí otras capas que necesites
];

export default function DbaMap() {
  return (
    <main className="h-screen bg-gradient-to-br from-[#eaf6f7] via-white to-[#186170]/10 grid grid-rows-[auto_1fr]">
      <div>
      <Header sections={[
        { label: 'Inicio', href: '/' },
        { label: 'Caracterización', href: '/caracterizacion_map' },
        { label: 'DBA', href: '/dba_map' },
        { label: 'Sitios Alt.', href: '/sitiosAlternativos_map' },
        { label: 'EVU', href: '/evu_map' },
        { label: 'Operaciones', href: '/operaciones_map' }
      ]}/>
      </div>
      <div>
      <DbaMapComponent style={{ height: '100%', width: '100%' }} config={config_json} kmlUrls={DBA_KML_URLS} />
      </div>
    </main>
);
}


