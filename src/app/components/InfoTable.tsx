'use client';

import React, { useState } from 'react';
import { Feature, Geometry } from 'geojson';
import type { InfoConfig, CategoryConfig, SubcategoryConfig } from '@/app/components/BaseMap';

// Tipos genéricos para propiedades del KML
type KmlProperties = Record<string, any>;

interface InfoTableProps {
  data: Feature<Geometry, KmlProperties> | null;
  isVisible: boolean;
  onClose: () => void;
  config: InfoConfig;
}

const InfoTable: React.FC<InfoTableProps> = ({ data, isVisible, onClose, config }) => {
  const [activeCategoryIndex, setActiveCategoryIndex] = useState(0);
  if (!isVisible || !data) return null;

  // Extraer propiedades simples y parsear tabla HTML en 'description'
  const rawProps = data.properties || {};
  const propsMap: Record<string, string> = {};
  Object.entries(rawProps).forEach(([key, val]) => {
    if (key !== 'description') propsMap[key] = String(val);
  });
  if (typeof rawProps.description === 'string') {
    const parser = new DOMParser();
    const doc = parser.parseFromString(rawProps.description, 'text/html');
    doc.querySelectorAll('tr').forEach(tr => {
      const tds = tr.querySelectorAll('td');
      if (tds.length >= 2) {
        const k = tds[0].textContent?.trim() || '';
        const v = tds[1].textContent?.trim() || '';
        if (k) propsMap[k] = v;
      }
    });
  }

  // Determinar título usando la clave 'nombre' del config
  const headerKey = config.nombre;
  const title = propsMap[headerKey] || 'SIN INFORMACIÓN';

  const { categorias } = config;
  const activeCategory = categorias[activeCategoryIndex];

  return (
    <div className="absolute inset-y-0 left-0 w-1/3 bg-white/95 backdrop-blur-sm shadow-xl overflow-y-auto p-6 z-20 border-r border-gray-200">
      {/* Encabezado con título y botón cerrar */}
      <div className="sticky top-0 bg-white/95 backdrop-blur-sm pb-4 mb-4 border-b border-gray-200 flex justify-between items-start">
        <h2 className="text-2xl font-bold text-[#186170] whitespace-normal break-words">
          {title}
        </h2>
        <button onClick={onClose} aria-label="Cerrar" className="p-2 ml-2 rounded-full hover:bg-gray-100 transition">
          <svg className="w-6 h-6 text-[#186170]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Botones de categoría */}
      <div className="flex space-x-2 mb-6">
        {categorias.map((cat, idx) => (
          <button
            key={cat.nombre}
            onClick={() => setActiveCategoryIndex(idx)}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200
              ${idx === activeCategoryIndex
                ? 'bg-[#186170] text-white shadow-md'
                : 'bg-gray-100 text-[#186170] hover:bg-[#186170]/10'
              }`}
          >
            {cat.nombre}
          </button>
        ))}
      </div>

      {/* Contenido de la categoría activa */}
      {activeCategory.subcategorias.map(subcat => (
        <div key={subcat.nombre} className="mb-6">
          <h3 className="text-lg font-semibold text-[#186170] mb-2">
            {subcat.nombre}
          </h3>
          <div className="space-y-4">
            {Object.entries(subcat.contenido).map(([label, propKey]) => {
              if (!propKey) return null;
              const val = propsMap[propKey] || 'SIN INFORMACIÓN';
              return (
                <div key={label} className="bg-gray-50 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow duration-200">
                  <div className="text-sm font-medium text-[#186170] mb-1">{label}</div>
                  <div className="text-base text-gray-900 break-words">{val}</div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

export default InfoTable;
