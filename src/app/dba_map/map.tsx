'use client';

import React, { useState, useEffect } from 'react';
import BaseMap, { MapResizer, InfoConfig } from '@/app/components/BaseMap';
import InfoTable from '@/app/components/InfoTable';
import type { Feature, Geometry } from 'geojson';
import { useMap } from 'react-leaflet';

interface DbaMapProps {
  config: InfoConfig;
  style?: React.CSSProperties;
}

// Manager de capas con panes para controlar el orden de dibujo
const LayerControlManager: React.FC<{
  dbaLinesUrl: string;
  dbaRiverUrl: string;
  caractUrl: string;
  setSelectedFeature: (f: Feature<Geometry, any> | null) => void;
}> = ({ dbaLinesUrl, dbaRiverUrl, caractUrl, setSelectedFeature }) => {
  const map = useMap();

  useEffect(() => {
    const omnivore = require('leaflet-omnivore');
    const L = require('leaflet');

    // 1️⃣ Crear panes con z-index escalonado
    const panes = [
      { name: 'paneCaract', zIndex: 200 },
      { name: 'paneRiver',  zIndex: 400 },
      { name: 'paneLines',  zIndex: 500 },
    ];
    panes.forEach(({ name, zIndex }) => {
      if (!map.getPane(name)) {
        map.createPane(name);
        map.getPane(name)!.style.zIndex = String(zIndex);
      }
    });

    // … dentro de useEffect …
    const initLayer = (
      url: string,
      pane: string,
      styleOpts: L.PathOptions,
      filterFn?: (lyr: any) => boolean
    ) => {
      const raw = omnivore.kml(url);
      const group = L.featureGroup().addTo(map); // agrego solo EL FEATUREGROUP
      raw.on('ready', () => {
        raw.eachLayer((lyr: any) => {
          // asignar al pane
          lyr.options = { ...lyr.options, pane };
          // filtrar si corresponde
          if (filterFn && !filterFn(lyr)) return;
          lyr.setStyle?.(styleOpts);
          lyr.on('click', () => setSelectedFeature(lyr.feature || lyr.toGeoJSON()));
          group.addLayer(lyr);  // aquí sí añado la geometría al grupo, NO al mapa directo
        });
      });
      return group;  // devuelvo el grupo, no el raw layer
    };


    // Líneas DBA
    const lines = initLayer(
      dbaLinesUrl,
      'paneLines',
      { color: '#e77742', weight: 3 }
    );

    // Río DBA
    const river = initLayer(
      dbaRiverUrl,
      'paneRiver',
      { color: '#417D87', weight: 3, fillOpacity: 0.5 }
    );

    // Caracterización filtrada
    const caract = initLayer(
      caractUrl,
      'paneCaract',
      { color: '#d6bd51', fillColor: '#e6d071', fillOpacity: 0.2, weight: 2 },
      (lyr: any) => {
        const feat = lyr.feature || lyr.toGeoJSON();
        const props = feat.properties || {};
        if (!props.description) return false;
        const parser = new DOMParser();
        const doc = parser.parseFromString(props.description, 'text/html');
        const cells = doc.getElementsByTagName('td');
        for (let i = 0; i < cells.length; i++) {
          if (cells[i].textContent?.trim() === 'DBA_Mauro') {
            return cells[i + 1]?.textContent?.trim() === 'Si';
          }
        }
        return false;
      }
    );

    // Control de overlays
    const control = L.control
      .layers(
        {},
        {
          'DBA Líneas': lines,
          'DBA Río': river,
          'Caracterización DBA': caract,
        },
        { collapsed: true }
      )
      .addTo(map);

    // Limpieza
    return () => {
      [lines, river, caract].forEach(layer => map.removeLayer(layer));
      map.removeControl(control);
    };
  }, [dbaLinesUrl, dbaRiverUrl, caractUrl, map, setSelectedFeature]);

  return null;
};

// Componente principal
export default function DbaMapComponent({config, style }: DbaMapProps) {
  const [selectedFeature, setSelectedFeature] = useState<Feature<Geometry, any> | null>(null);

  // Rutas KML
  const dbaLinesUrl = '/kmz/dba_lines.kml';
  const dbaRiverUrl = '/kmz/dba_river.kml';
  const caractUrl    = '/kmz/caract.kml';

  // Estilos contenedor
  const containerStyle: React.CSSProperties = selectedFeature
    ? {
        position: 'absolute',
        width: 'calc(67% - 1px)',
        right: 0,
        top: 0,
        bottom: 0,
        boxShadow: '-4px 0 10px rgba(0,0,0,0.1)',
        borderRadius: '8px 0 0 8px',
      }
    : { position: 'absolute', width: '100%', right: 0, top: 0, bottom: 0 };

  return (
    <div className="relative" style={style}>
      <div style={containerStyle}>
        <BaseMap>
          <LayerControlManager
            dbaLinesUrl={dbaLinesUrl}
            dbaRiverUrl={dbaRiverUrl}
            caractUrl={caractUrl}
            setSelectedFeature={setSelectedFeature}
          />
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
