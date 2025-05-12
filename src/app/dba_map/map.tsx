'use client';

import React, { useState, useCallback, useEffect } from 'react';
import BaseMap, { InfoConfig, MapResizerWrapper as MapResizer } from '@/app/components/BaseMap';
import InfoTable from '@/app/components/InfoTable';
import type { Feature, Geometry } from 'geojson';
import { useMap } from 'react-leaflet';
import * as omnivore from 'leaflet-omnivore';
import type { Layer, LeafletEvent } from 'leaflet';

type KmlProperties = Record<string, string | number | boolean | null>;

// Definir tipo para la configuración de filtro
interface KmlFilter {
  property: string;
  value: string | number | boolean;
}

// Definir tipo para la entrada KML
type KmlEntry = string | { url: string; filter?: KmlFilter };

interface DbaMapProps {
  config: InfoConfig;
  kmlUrl?: string | KmlEntry; // Para compatibilidad con versiones anteriores
  kmlUrls?: (string | KmlEntry)[]; // Soporte para múltiples URLs con posibles filtros
  style?: React.CSSProperties;
}

// Extraer URL del KML de una entrada
function getKmlUrl(entry: string | { url: string; filter?: KmlFilter }): string {
  return typeof entry === 'string' ? entry : entry.url;
}

// Extraer filtro de una entrada KML
function getKmlFilter(entry: string | { url: string; filter?: KmlFilter }): KmlFilter | undefined {
  return typeof entry === 'object' ? entry.filter : undefined;
}

// Función para verificar si una característica cumple con el criterio de filtro
function featureMatchesFilter(feat: Feature<Geometry, KmlProperties>, filter?: KmlFilter): boolean {
  if (!filter) return true; // Si no hay filtro, todas las características pasan

  const props = feat.properties;
  if (!props) return false;

  // Buscar en todas las propiedades por si la propiedad está en el contenido HTML
  for (const [key, value] of Object.entries(props)) {
    if (typeof value === 'string') {
      // Buscar si el valor contiene la propiedad y su valor en formato HTML
      const htmlPattern = new RegExp(`<td>${filter.property}</td>\\s*<td>${filter.value}</td>`, 'i');
      if (htmlPattern.test(value)) {
        console.log(`Encontrado match en propiedad ${key}:`, value);
        return true;
      }
    }
  }

  // También verificar directamente la propiedad por si está en el formato normal
  const propValue = props[filter.property];
  return propValue === filter.value;
}

// Capa KML con estilo uniforme para DBA
function KmlLayer({ entry, onFeatureClick, layerIndex = 0 }: { 
  entry: string | { url: string; filter?: KmlFilter }; 
  onFeatureClick: (f: Feature<Geometry, KmlProperties>) => void;
  layerIndex?: number; 
}) {
  const map = useMap();
  const url = getKmlUrl(entry);
  const filter = getKmlFilter(entry);
  
  useEffect(() => {
    console.log(`Cargando KML #${layerIndex} desde:`, url);
    if (filter) {
      console.log(`Aplicando filtro: ${filter.property} = ${filter.value}`);
    }
    
    // Función para manejar errores
    const handleError = (error: unknown) => {
      console.error(`Error al cargar el KML #${layerIndex}:`, error);
    };
    
    // Define el tipo para la capa
    let layer: ReturnType<typeof omnivore.kml> | null = null;
    try {
      layer = omnivore.kml(url)
        .on('ready', () => {
          console.log(`KML #${layerIndex} cargado correctamente`);
          try {
            // Estilo uniforme para todos los polígonos
            if (layer) {
              // Colores diferentes según el índice de la capa
              const colors = ['#186170', '#7a2548', '#258039', '#825a2c', '#32327a'];
              const color = colors[layerIndex % colors.length];
              
              let visibleFeaturesCount = 0;
              
              layer.eachLayer((lyr: Layer) => {
                try {
                  const feat: Feature<Geometry, KmlProperties> = (lyr as unknown as { feature: Feature<Geometry, KmlProperties> }).feature || 
                                                                (lyr as unknown as { toGeoJSON: () => Feature<Geometry, KmlProperties> }).toGeoJSON();
                  
                  // Verificar si la característica cumple con el filtro
                  if (!featureMatchesFilter(feat, filter)) {
                    // Si no cumple con el filtro, removemos la capa
                    if (map) {
                      map.removeLayer(lyr);
                    }
                    return;
                  }
                  
                  visibleFeaturesCount++;
                  
                  // Aplicar estilo con colores diferentes según la capa
                  if ('setStyle' in lyr) {
                    (lyr as { setStyle: (style: Record<string, unknown>) => void }).setStyle({
                      color: color,       // contorno
                      fillColor: color,   // relleno
                      fillOpacity: 0.3,   // Un poco más transparente para la capa filtrada si es la primera
                      weight: layerIndex === 0 ? 1 : 2 // Línea más delgada para la primera capa
                    });
                  }
                  lyr.on('click', () => onFeatureClick(feat));
                } catch (err) {
                  console.warn(`Error al procesar capa individual en KML #${layerIndex}:`, err);
                }
              });
              
              console.log(`Características visibles después del filtrado: ${visibleFeaturesCount}`);
              
              // Ajustar vista a todos los polígonos (solo en la primera capa)
              if (layerIndex === 0 && layer.getBounds && typeof layer.getBounds === 'function') {
                const bounds = layer.getBounds();
                if (bounds && bounds.isValid()) {
                  console.log('Ajustando vista a bounds:', bounds);
                  map.fitBounds(bounds, { padding: [20, 20], animate: true });
                }
              }
            }
          } catch (err) {
            handleError(err);
          }
        })
        .on('error', (event: LeafletEvent) => {
          handleError(event);
        });
        
      layer.addTo(map);
    } catch (err) {
      handleError(err);
      return () => {};
    }
    
    return () => { 
      if (layer && map) {
        try {
          map.removeLayer(layer);
        } catch (err) {
          console.warn(`Error al eliminar capa #${layerIndex}:`, err);
        }
      }
    };
  }, [url, map, onFeatureClick, layerIndex, filter]);
  
  return null;
}

export default function DbaMap({config, kmlUrl, kmlUrls, style }: DbaMapProps) {
  const [selectedFeature, setSelectedFeature] = useState<Feature<Geometry, KmlProperties> | null>(null);
  
  const handleFeatureClick = useCallback((feat: Feature<Geometry, KmlProperties>) => {
    setSelectedFeature(feat);
  }, []);
  
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

  // Crear una lista de URLs unificada
  const allKmlEntries: (string | { url: string; filter?: KmlFilter })[] = [];
  if (kmlUrl) allKmlEntries.push(kmlUrl);
  if (kmlUrls) allKmlEntries.push(...kmlUrls);

  return (
    <div className="relative" style={style}>
      <div style={containerStyle}>
        <BaseMap>
          {allKmlEntries.map((entry, index) => (
            <KmlLayer 
              key={`kml-${index}-${typeof entry === 'string' ? entry : entry.url}`} 
              entry={entry} 
              onFeatureClick={handleFeatureClick}
              layerIndex={index}
            />
          ))}
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
