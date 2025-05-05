'use client'
import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, GeoJSON, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import * as toGeoJSON from '@mapbox/togeojson';
import InfoTable from './InfoTable';
import { Feature, FeatureCollection, Geometry, GeoJsonProperties } from 'geojson';

// Configuración de íconos predeterminados
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';
L.Icon.Default.mergeOptions({ iconUrl, iconRetinaUrl, shadowUrl });

type LatLng = [number, number];

type KmlProperties = GeoJsonProperties & {
  nombre_pre?: string;
  Comunas_t?: string;
  Comuna?: string;
  HA?: string;
  titular__1?: string;
  DBA_Mauro?: string;
  Sit_Alt?: string;
  Op_Act?: string;
  Nivel_Priorizacion?: string;
  Gestion_Recomendada?: string;
  Temporalidad_Gestion?: string;
};

interface MapComponentProps {
  kmlUrl: string;
  center?: LatLng;
  zoom?: number;
  style?: React.CSSProperties;
  tileUrl?: string;
  tileAttribution?: string;
}

interface GeoJSONFeature {
  id: string;
  properties: {
    description?: string;
    [key: string]: string | undefined;
  };
  geometry: {
    type: string;
    coordinates: number[][];
  };
}

interface KmlLayerProps {
  url: string;
  onPolygonClick: (data: Feature<Geometry, KmlProperties>) => void;
}

const DefaultCenter: LatLng = [-33.45, -70.6667]; // Santiago de Chile
const DefaultStyle = { height: '100%', width: '100%' };
const DefaultZoom = 170; // Aumentamos significativamente el zoom por defecto

// Función para extraer datos de la descripción HTML
const extractDataFromDescription = (description: string) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(description, 'text/html');
  const rows = doc.getElementsByTagName('tr');
  const data: { [key: string]: string } = {};

  for (let i = 0; i < rows.length; i++) {
    const cells = rows[i].getElementsByTagName('td');
    if (cells.length >= 2) {
      const key = cells[0].textContent?.trim();
      const value = cells[1].textContent?.trim();
      if (key && value) {
        data[key] = value;
      }
    }
  }

  return data;
};

const KmlLayer: React.FC<KmlLayerProps> = ({ url, onPolygonClick }) => {
  const map = useMap();
  const [data, setData] = useState<FeatureCollection<Geometry, KmlProperties> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedFeatureId, setSelectedFeatureId] = useState<string | null>(null);

  const defaultStyle = {
    weight: 1,
    color: '#186170',
    fillOpacity: 0.5
  };

  const selectedStyle = {
    weight: 3,
    color: '#186170',
    fillOpacity: 0.7,
    fillColor: '#186170'
  };

  const hoverStyle = {
    weight: 2,
    color: '#186170',
    fillOpacity: 0.6
  };

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
        const geojson = toGeoJSON.kml(xml) as FeatureCollection<Geometry, KmlProperties>;

        if (geojson.features) {
          geojson.features = geojson.features.map(feature => {
            if (feature.properties && feature.properties.description) {
              const extractedData = extractDataFromDescription(feature.properties.description);
              feature.properties = {
                ...feature.properties,
                ...extractedData
              };
            }
            return feature;
          });
        }

        setData(geojson);

        const bounds = L.geoJSON(geojson).getBounds();
        if (bounds.isValid()) {
          map.fitBounds(bounds, {
            padding: [20, 20],
            animate: true
          });
        }
      } catch (err) {
        console.error('Error al cargar KML:', err);
        setError(err instanceof Error ? err.message : 'Error desconocido al cargar el mapa');
      } finally {
        setLoading(false);
      }
    }
    loadKml();
  }, [url, map]);

  const getStyle = (feature: Feature<Geometry, KmlProperties> | undefined) => {
    if (!feature) return defaultStyle;
    if (feature.id === selectedFeatureId) {
      return selectedStyle;
    }
    return defaultStyle;
  };

  const onEachFeature = (feature: Feature<Geometry, KmlProperties>, layer: L.Path) => {
    layer.on({
      click: () => {
        setSelectedFeatureId(feature.id as string);
        layer.setStyle(selectedStyle);
        layer.bringToFront();
        onPolygonClick(feature);
      },
      mouseover: (e) => {
        const layer = e.target as L.Path;
        if (feature.id !== selectedFeatureId) {
          layer.setStyle(hoverStyle);
        }
      },
      mouseout: (e) => {
        const layer = e.target as L.Path;
        if (feature.id !== selectedFeatureId) {
          layer.setStyle(defaultStyle);
        }
      }
    });
  };

  if (loading) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 z-10">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#186170] mx-auto"></div>
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

  return data ? (
    <GeoJSON 
      data={data} 
      onEachFeature={onEachFeature}
      style={getStyle}
    />
  ) : null;
};

const AttributionControl: React.FC = () => {
  const map = useMap();

  useEffect(() => {
    // Crear un elemento div para la atribución
    const attributionDiv = document.createElement('div');
    attributionDiv.className = 'leaflet-control-attribution';
    attributionDiv.style.position = 'absolute';
    attributionDiv.style.bottom = '20px';
    attributionDiv.style.right = '20px';
    attributionDiv.style.padding = '5px 10px';
    attributionDiv.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
    attributionDiv.style.borderRadius = '4px';
    attributionDiv.style.fontSize = '12px';
    attributionDiv.style.color = '#186170';
    attributionDiv.style.zIndex = '1000';
    attributionDiv.innerHTML = 'Dinámica Plataforma';

    // Agregar el elemento al contenedor del mapa
    const mapContainer = map.getContainer();
    mapContainer.appendChild(attributionDiv);

    return () => {
      mapContainer.removeChild(attributionDiv);
    };
  }, [map]);

  return null;
};

const MapComponent: React.FC<MapComponentProps> = ({
  kmlUrl,
  center = DefaultCenter,
  zoom = DefaultZoom,
  style = DefaultStyle,
  tileUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  tileAttribution = ''
}) => {
  const [selectedPolygon, setSelectedPolygon] = useState<Feature<Geometry, KmlProperties> | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const [mapCenter, setMapCenter] = useState<L.LatLng | null>(null);
  const isInfoVisibleRef = useRef(false);

  const adjustMapCenter = (showInfo: boolean) => {
    if (mapRef.current) {
      const mapWidth = mapRef.current.getSize().x;
      const offsetX = showInfo ? mapWidth * 0.1665 : 0;
      const newCenter = mapRef.current.containerPointToLatLng([
        mapWidth/2 + offsetX,
        mapRef.current.getSize().y/2
      ]);
      
      mapRef.current.setView(newCenter, mapRef.current.getZoom());
    }
  };

  const handlePolygonClick = (data: Feature<Geometry, KmlProperties>) => {
    if (!isInfoVisibleRef.current) {
      if (mapRef.current) {
        setMapCenter(mapRef.current.getCenter());
        adjustMapCenter(true);
      }
      isInfoVisibleRef.current = true;
    }
    setSelectedPolygon(data);
  };

  const handleCloseInfo = () => {
    if (mapRef.current && mapCenter) {
      adjustMapCenter(false);
      mapRef.current.setView(mapCenter, mapRef.current.getZoom());
    }
    setSelectedPolygon(null);
    isInfoVisibleRef.current = false;
  };

  // Componente para manejar el mapa
  const MapHandler: React.FC = () => {
    const map = useMap();

    useEffect(() => {
      mapRef.current = map;
    }, [map]);

    return null;
  };

  return (
    <div className="map-wrapper overflow-hidden">
      <InfoTable 
        data={selectedPolygon} 
        isVisible={!!selectedPolygon} 
        onClose={handleCloseInfo}
      />
      <div 
        style={{ 
          transitionProperty: 'margin-left', 
          transitionDuration: '300ms',
          height: '100%'
        }} 
        className={selectedPolygon ? 'ml-[33.333%]' : 'ml-0'}
      >
        <MapContainer 
          center={center} 
          zoom={zoom} 
          style={style}
          className="h-full w-full"
          keyboard={false}
        >
          <TileLayer attribution={tileAttribution} url={tileUrl} />
          <KmlLayer url={kmlUrl} onPolygonClick={handlePolygonClick} />
          <AttributionControl />
          <MapHandler />
        </MapContainer>
      </div>
    </div>
  );
};

export default MapComponent; 