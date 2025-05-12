'use client';

import React, { useState } from 'react';
import BaseMap, { InfoConfig, MapResizerWrapper as MapResizer } from '@/app/components/BaseMap';
import InfoTable from '@/app/components/InfoTable';
import type { Feature, Geometry } from 'geojson';

type KmlProperties = Record<string, string | number | boolean | null>;

interface DbaMapProps {
  config: InfoConfig;
  style?: React.CSSProperties;
}

export default function DbaMap({config, style }: DbaMapProps) {
  const [selectedFeature, setSelectedFeature] = useState<Feature<Geometry, KmlProperties> | null>(null);
  
  // Calcular estilos para el contenedor del mapa
  const containerStyle = {
    transition: 'all 0.5s cubic-bezier(0.34, 1.25, 0.64, 1)',
    transform: 'translate3d(0,0,0)',
    backfaceVisibility: 'hidden' as const,
    willChange: 'width, transform' as const,
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
