// components/KmlMap.tsx
// 🚀 Componente React genérico en TSX para cargar y mostrar un archivo KML con Leaflet
'use client'
import dynamic from 'next/dynamic';
import React from 'react';

const MapComponent = dynamic(() => import('@/components/MapComponent'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-2 text-gray-600">Cargando mapa...</p>
      </div>
    </div>
  )
});

type LatLng = [number, number];

export interface KmlMapProps {
  /** URL o ruta relativa del archivo KML */
  kmlUrl: string;
  /** Centro inicial del mapa (latitud, longitud) */
  center?: LatLng;
  /** Nivel de zoom inicial */
  zoom?: number;
  /** Estilos CSS para el contenedor del mapa */
  style?: React.CSSProperties;
  /** URL de teselas (tile) de fondo */
  tileUrl?: string;
  /** Texto de atribución para las teselas */
  tileAttribution?: string;
}

const KmlMap: React.FC<KmlMapProps> = (props) => {
  return <MapComponent {...props} />;
};

export default KmlMap;

/*
  📦 Instalar dependencias:
    npm install leaflet react-leaflet togeojson @types/geojson

  📂 Uso:
    Coloca tu KML en `/public/kml/archivo.kml` o sirvelo desde tu servidor.

    import KmlMap from '@/components/KmlMap';

    <KmlMap
      kmlUrl='/kml/archivo.kml'
      center={[lat, lng]}
      zoom={12}
      style={{ height: '80vh' }}
    />
*/
