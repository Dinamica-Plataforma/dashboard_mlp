'use client';

import React, { useState, useCallback, useEffect } from 'react';
import BaseMap, { InfoConfig, MapResizerWrapper as MapResizer } from '@/app/components/BaseMap';
import InfoTable from '@/app/components/InfoTable';
import type { Feature, Geometry } from 'geojson';
import { useMap } from 'react-leaflet';
import * as omnivore from 'leaflet-omnivore';
import type { Layer } from 'leaflet';

type KmlProperties = Record<string, string | number | boolean | null>;

interface CharacterizationMapProps {
  kmlUrl: string;
  config: InfoConfig;
  style?: React.CSSProperties;
}

// Capa KML con estilo uniforme para caracterización
const KmlLayer: React.FC<{ url: string; onFeatureClick: (f: Feature<Geometry, KmlProperties>) => void }> = ({ url, onFeatureClick }) => {
  const map = useMap();
  useEffect(() => {
    const layer = omnivore.kml(url);
    layer.on('ready', () => {
      layer.eachLayer((lyr: Layer) => {
        const feat: Feature<Geometry, KmlProperties> = (lyr as any).feature || (lyr as any).toGeoJSON();
        if ((lyr as any).setStyle) {
          (lyr as any).setStyle({
            color: '#186170',       // contorno
            fillColor: '#186170',   // relleno
            fillOpacity: 0.4,
            weight: 2
          });
        }
        lyr.on('click', () => onFeatureClick(feat));
      });
      // Ajustar vista a todos los polígonos
      const bounds = layer.getBounds();
      map.fitBounds(bounds, { padding: [20, 20], animate: true });
    });
    layer.addTo(map);
    return () => { map.removeLayer(layer); };
  }, [url, map, onFeatureClick]);
  return null;
};

export default function CharacterizationMap({ kmlUrl, config, style }: CharacterizationMapProps) {
  const [selectedFeature, setSelectedFeature] = useState<Feature<Geometry, KmlProperties> | null>(null);
  
  const handleFeatureClick = useCallback((feat: Feature<Geometry, KmlProperties>) => {
    setSelectedFeature(feat);
  }, []);

  // Calcular estilos para el contenedor del mapa
  const containerStyle = {
    transition: 'all 0.5s cubic-bezier(0.34, 1.25, 0.64, 1)',
    transform: 'translate3d(0,0,0)', // Activa aceleración por hardware
    backfaceVisibility: 'hidden' as const, // Mejora rendimiento
    willChange: 'width, transform' as const, // Indica al navegador que estas propiedades cambiarán
    ...(selectedFeature ? {
      position: 'absolute' as const,
      width: 'calc(67% - 1px)',
      right: 0,
      top: 0,
      bottom: 0,
      boxShadow: '-4px 0 10px rgba(0, 0, 0, 0.1)',
      borderRadius: '8px 0 0 8px',
    } : {
      position: 'absolute' as const,
      width: '100%',
      right: 0,
      top: 0,
      bottom: 0,
    })
  };

  return (
    <div className="relative" style={style}>
      <div style={containerStyle}>
        <BaseMap>
          <KmlLayer url={kmlUrl} onFeatureClick={handleFeatureClick} />
          <MapResizer featureSelected={!!selectedFeature} />
        </BaseMap>
      </div>

      <InfoTable
        data={selectedFeature}
        isVisible={!!selectedFeature}
        onClose={() => setSelectedFeature(null)}
        config={config}
      />
    </div>
  );
} 