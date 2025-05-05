import React, { useState } from 'react';
import { Feature, Geometry, GeoJsonProperties } from 'geojson';

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

interface InfoTableProps {
  data: Feature<Geometry, KmlProperties> | null;
  isVisible: boolean;
  onClose: () => void;
}

const InfoTable: React.FC<InfoTableProps> = ({ data, isVisible, onClose }) => {
  const [activeTab, setActiveTab] = useState('general');

  if (!isVisible || !data) return null;

  // Función para procesar los datos del KML
  const processKmlData = (data: Feature<Geometry, KmlProperties>) => {
    const properties = data.properties || {};
    const fieldMappings: { [key: string]: string } = {
      'Nombre Pre': properties.nombre_pre || 'SIN INFORMACIÓN',
      'Comuna': properties.Comunas_t || properties.Comuna || 'SIN INFORMACIÓN',
      'Hectáreas': properties.HA || 'SIN INFORMACIÓN',
      'Propietario': properties.titular__1 || 'SIN INFORMACIÓN',
      'DBA Mauro': properties.DBA_Mauro || 'SIN INFORMACIÓN',
      'Sitios Alternativos': properties.Sit_Alt || 'SIN INFORMACIÓN',
      'OP actual': properties.Op_Act || 'SIN INFORMACIÓN',
      'Nivel de Priorización': properties.Nivel_Priorizacion || 'SIN INFORMACIÓN',
      'Gestión Recomendada': properties.Gestion_Recomendada || 'SIN INFORMACIÓN',
      'Temporalidad de Gestión': properties.Temporalidad_Gestion || 'SIN INFORMACIÓN'
    };

    return fieldMappings;
  };

  const fieldMappings = processKmlData(data);

  const tabs = [
    { id: 'general', label: 'Descripción General' },
    { id: 'profundizar', label: 'Profundizar' },
    { id: 'dba', label: 'DBA' },
    { id: 'sit_alt', label: 'SIT ALT' },
    { id: 'obras_eu', label: 'OBRAS EU' }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'general':
        return (
          <div className="space-y-4">
            {Object.entries(fieldMappings).slice(0, 6).map(([key, value]) => (
              <div key={key} className="bg-gray-50 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow duration-200">
                <div className="text-sm font-medium text-[#186170] mb-1">{key}</div>
                <div className="text-base text-gray-900">{value}</div>
              </div>
            ))}
          </div>
        );
      case 'profundizar':
        return (
          <div className="space-y-4">
            {Object.entries(fieldMappings).slice(6, 9).map(([key, value]) => (
              <div key={key} className="bg-gray-50 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow duration-200">
                <div className="text-sm font-medium text-[#186170] mb-1">{key}</div>
                <div className="text-base text-gray-900">{value}</div>
              </div>
            ))}
          </div>
        );
      default:
        return (
          <div className="flex items-center justify-center h-40">
            <p className="text-[#186170]">Información no disponible</p>
          </div>
        );
    }
  };

  return (
    <div className="fixed left-0 top-16 h-[calc(100vh-4rem)] w-1/3 bg-white/95 backdrop-blur-sm shadow-xl overflow-y-auto p-6 z-20 border-r border-gray-200">
      <div className="sticky top-0 bg-white/95 backdrop-blur-sm pb-4 border-b border-gray-200">
        <div className="flex justify-between items-center mt-10">
          <h2 className="text-2xl font-bold text-[#186170]">
            {fieldMappings['Nombre Pre']}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors duration-200"
            aria-label="Cerrar"
          >
            <svg
              className="w-6 h-6 text-[#186170]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Tabs Grid */}
      <div className="mt-6 grid grid-cols-3 gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200
              ${activeTab === tab.id
                ? 'bg-[#186170] text-white shadow-md transform -translate-y-0.5'
                : 'bg-gray-100 text-[#186170] hover:bg-[#186170]/10 hover:shadow-sm'
              }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="mt-4">
        {renderTabContent()}
      </div>
    </div>
  );
};

export default InfoTable; 