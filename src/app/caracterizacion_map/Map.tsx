'use client';

import React, { useState, useCallback, useEffect } from 'react';
import BaseMap, { MapResizer, InfoConfig } from '@/app/components/BaseMap';
import InfoTable from '@/app/components/InfoTable';
import type { Feature, Geometry } from 'geojson';

interface CharacterizationMapProps {
  kmlUrl: string;
  config: InfoConfig;
  style?: React.CSSProperties;
}

// Capa KML con estilo uniforme para caracterización
const KmlLayer: React.FC<{ url: string; onFeatureClick: (f: Feature<Geometry, any>) => void }> = ({ url, onFeatureClick }) => {
  const map = require('react-leaflet').useMap();
  useEffect(() => {
    const omnivore = require('leaflet-omnivore');
    const layer = omnivore.kml(url);
    layer.on('ready', () => {
      // Estilo uniforme para todos los polígonos
      layer.eachLayer((lyr: any) => {
        const feat: Feature<Geometry, any> = lyr.feature || lyr.toGeoJSON();
        // Aplicar estilo con colores específicos para caracterización
        if (lyr.setStyle) {
          lyr.setStyle({
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
  const [selectedFeature, setSelectedFeature] = useState<Feature<Geometry, any> | null>(null);
  
  const handleFeatureClick = useCallback((feat: Feature<Geometry, any>) => {
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