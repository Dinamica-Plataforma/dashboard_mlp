'use client'
import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, GeoJSON, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import * as toGeoJSON from '@mapbox/togeojson';

// Configuración de íconos predeterminados
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';
L.Icon.Default.mergeOptions({ iconUrl, iconRetinaUrl, shadowUrl });

type LatLng = [number, number];

interface MapComponentProps {
  kmlUrl: string;
  center?: LatLng;
  zoom?: number;
  style?: React.CSSProperties;
  tileUrl?: string;
  tileAttribution?: string;
}

const DefaultCenter: LatLng = [-33.45, -70.6667]; // Santiago de Chile
const DefaultStyle = { height: '100%', width: '100%' };

const KmlLayer: React.FC<{ url: string }> = ({ url }) => {
  const map = useMap();
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadKml() {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(url);
        if (!res.ok) {
          throw new Error(`Error al cargar el archivo KML: ${res.statusText}`);
        }
        const text = await res.text();
        const xml = new DOMParser().parseFromString(text, 'text/xml');
        const geojson = toGeoJSON.kml(xml);
        setData(geojson);

        const bounds = L.geoJSON(geojson).getBounds();
        if (bounds.isValid()) map.fitBounds(bounds);
      } catch (err) {
        console.error('Error al cargar KML:', err);
        setError(err instanceof Error ? err.message : 'Error desconocido al cargar el mapa');
      } finally {
        setLoading(false);
      }
    }
    loadKml();
  }, [url, map]);

  if (loading) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 z-10">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-2 text-gray-600">Cargando mapa...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 z-10">
        <div className="text-center text-red-500">
          <p className="text-lg font-semibold">Error al cargar el mapa</p>
          <p className="mt-2">{error}</p>
        </div>
      </div>
    );
  }

  return data ? <GeoJSON data={data} /> : null;
};

const MapComponent: React.FC<MapComponentProps> = ({
  kmlUrl,
  center = DefaultCenter,
  zoom = 13,
  style = DefaultStyle,
  tileUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  tileAttribution = '&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
}) => (
  <div style={{ height: style.height, width: style.width, position: 'relative' }} className="z-0">
    <MapContainer center={center} zoom={zoom} style={style}>
      <TileLayer attribution={tileAttribution} url={tileUrl} />
      <KmlLayer url={kmlUrl} />
    </MapContainer>
  </div>
);

export default MapComponent; 