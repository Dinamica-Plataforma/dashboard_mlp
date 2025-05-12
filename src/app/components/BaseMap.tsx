'use client';

import React, { useEffect } from 'react';
import dynamic from 'next/dynamic';
import 'leaflet/dist/leaflet.css';
import type { Feature, Geometry } from 'geojson';

// Dynamic imports para evitar SSR
const MapContainer           = dynamic(() => import('react-leaflet').then(m => m.MapContainer),           { ssr: false });
const TileLayer              = dynamic(() => import('react-leaflet').then(m => m.TileLayer),              { ssr: false });
const LayersControl          = dynamic(() => import('react-leaflet').then(m => m.LayersControl),          { ssr: false });
const LayersControlBaseLayer = dynamic(() => import('react-leaflet').then(m => m.LayersControl.BaseLayer), { ssr: false });

// Tipos de configuración común
export interface SubcategoryConfig { nombre: string; contenido: Record<string, string>; }
export interface CategoryConfig    { nombre: string; subcategorias: SubcategoryConfig[]; }
export interface InfoConfig        { nombre: string; categorias: CategoryConfig[]; }

export type LatLng = [number, number];
export interface BaseMapProps {
  center?: LatLng;
  zoom?: number;
  style?: React.CSSProperties;
  tileUrl?: string;
  tileAttribution?: string;
  children?: React.ReactNode;
}

// Componente para redimensionar el mapa cuando cambia el tamaño del contenedor
export const MapResizer: React.FC<{ featureSelected?: boolean }> = ({ featureSelected }) => {
  const map = require('react-leaflet').useMap();
  
  useEffect(() => {
    // Dar tiempo para que la transición CSS termine
    const timeoutId = setTimeout(() => {
      // Invalidar tamaño para que el mapa se ajuste correctamente
      map.invalidateSize({ animate: true, pan: false });
      
      // Aplicar un efecto suave de "pan" para mejorar la experiencia visual
      if (map._lastCenter) {
        map.panTo(map._lastCenter, { 
          duration: 0.4, 
          easeLinearity: 0.25 
        });
      }
    }, 400);
    
    return () => clearTimeout(timeoutId);
  }, [featureSelected, map]);
  
  return null;
};

const BaseMap: React.FC<BaseMapProps> = ({
  center = [-31.768607717576884, -71.0190652636791],
  zoom = 10,
  style = { height: '100%', width: '100%' },
  tileUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  tileAttribution = '&copy; OpenStreetMap contributors',
  children
}) => {
  useEffect(() => {
    // Configurar iconos y atribuciones
    const L = require('leaflet');
    const iconUrl       = require('leaflet/dist/images/marker-icon.png');
    const iconRetinaUrl = require('leaflet/dist/images/marker-icon-2x.png');
    const shadowUrl     = require('leaflet/dist/images/marker-shadow.png');
    L.Icon.Default.mergeOptions({ iconUrl, iconRetinaUrl, shadowUrl });
    L.Control.Attribution.prototype.options.prefix = '';
  }, []);

  return (
    <div style={{...style, position: 'relative'}}>
      <MapContainer center={center} zoom={zoom} style={{ height: '100%', width: '100%' }}>
        <LayersControl position="topright">
          <LayersControlBaseLayer name="Mapa" checked>
            <TileLayer url={tileUrl} attribution={tileAttribution} />
          </LayersControlBaseLayer>
          <LayersControlBaseLayer name="Satelital">
            <TileLayer
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              attribution="Tiles © Esri — Source: Esri, Earthstar Geographics, NOAA"
            />
          </LayersControlBaseLayer>
        </LayersControl>

        {children}
      </MapContainer>
    </div>
  );
};

export default BaseMap;
