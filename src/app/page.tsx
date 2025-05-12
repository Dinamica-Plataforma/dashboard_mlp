"use client";

import Image from "next/image";
import { MapIcon, DocumentTextIcon, MapPinIcon, DocumentCheckIcon, CogIcon } from '@heroicons/react/24/outline';

export default function Home() {
  const menuItems = [
    { 
      label: 'Caracterización', 
      href: '/caracterizacion_map',
      description: 'Análisis de las características del territorio.',
      icon: MapIcon,
      image: '/caracterizacion.png',
      ribbon: 'Análisis',
      ribbonColor: '#ec6e3d'
    },
    { 
      label: 'DBA', 
      href: '/dba_map',
      description: 'Gestión de DBA, desprendimiento del relave el mauro.',
      icon: DocumentTextIcon,
      image: '/dba.png',
      ribbon: 'Ambiental',
      ribbonColor: '#ec6e3d'
    },
    { 
      label: 'Sitios Alt.', 
      href: '/sitiosAlternativos_map',
      description: 'Exploración y evaluación de sitios alternativos.',
      icon: MapPinIcon,
      image: '/sitiosalt.png',
      ribbon: 'Exploración',
      ribbonColor: '#ec6e3d'
    },
    { 
      label: 'EVU', 
      href: '/evu_map',
      description: 'otra descripción',
      icon: DocumentCheckIcon,
      image: '/caracterizacion.png',
      ribbon: 'Evaluación',
      ribbonColor: '#ec6e3d'
    },
    { 
      label: 'Operaciones', 
      href: '/operaciones_map',
      description: 'otra descripción',
      icon: CogIcon,
      image: '/caracterizacion.png',
      ribbon: 'Gestión',
      ribbonColor: '#ec6e3d'
    }
  ];

  return (
      <main className="min-h-screen w-full bg-gradient-to-br from-[#eaf6f7] via-white to-[#186170]/10 flex flex-col justify-center items-center overflow-x-hidden">
        <div className="flex-1 w-full flex flex-col justify-center items-center p-2 md:p-4">
          <div className="w-full max-w-5xl flex flex-col justify-center items-center flex-1">
            {/* Cabecera centrada con título grande, línea divisora y logo proporcional */}
            <div className="flex flex-col items-center justify-center mt-17 mb-2 w-full">
              <div className="flex items-center justify-center gap-4 md:gap-6 mb-2">
                <h1 className="text-3xl md:text-5xl font-extrabold text-[#186170] text-center drop-shadow-lg tracking-tight">Sistema Aseguramiento Territorial</h1>
                <div className="h-12 md:h-16 w-px bg-[#ec6e3d] opacity-60 mx-2"></div>
                <div className="relative w-14 h-14 md:w-20 md:h-20">
                  <Image
                    src="/mlp_logo.svg"
                    alt="Logo MLP"
                    fill
                    className="object-contain"
                  />
                </div>
              </div>
              {/* Descripción simple */}
              <p className="text-[#186170] text-base md:text-lg text-center font-medium mt-2">
                Herramientas para visualizar, analizar y asegurar la gestión territorial de manera eficiente.
              </p>
            </div>

            <div className="flex-1 w-full flex flex-col gap-5 items-center justify-center ">
              {menuItems.map((item, i) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="group relative flex items-center rounded-xl border border-[#186170]/15 bg-white/70 backdrop-blur-md shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden h-20 md:h-24 hover:-translate-y-1 w-full max-w-4xl"
                  style={{ boxShadow: '0 4px 16px 0 rgba(24,97,112,0.10), 0 1.5px 6px 0 rgba(24,97,112,0.08)' }}
                >
                  {/* Ribbon decorativo */}
                  <div className="absolute left-0 top-0 z-30">
                    <div style={{background: item.ribbonColor}} className="text-white text-xs font-bold px-2 py-1 rounded-br-xl rounded-tl-xl shadow-md shadow-[#186170]/10">
                      {item.ribbon}
                    </div>
                  </div>
                  {/* Ícono y título siempre visibles y centrados */}
                  <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-3 transition-all duration-300 group-hover:left-6 group-hover:translate-x-0 z-10">
                    <div className="w-10 h-10 flex items-center justify-center rounded-full bg-[#186170]/90 text-white shadow-md ring-2 ring-[#ec6e3d]/10 group-hover:scale-110 transition-transform duration-300">
                      <item.icon className="w-6 h-6 drop-shadow-sm" />
                    </div>
                    <h2 className="text-lg md:text-xl font-semibold text-[#186170] tracking-wide drop-shadow-sm">
                      {item.label}
                    </h2>
                  </div>
                  {/* Contenedor principal de línea y descripción en hover */}
                  <div className="absolute left-0 top-0 w-[65%] h-full flex items-center opacity-0 group-hover:opacity-100 transition-all duration-300 pl-4 pr-2 z-20">
                    {/* Espacio para ícono y título (invisible, solo para mantener alineación) */}
                    <div className="flex items-center gap-3 flex-shrink-0 opacity-0">
                      <div className="w-10 h-10" />
                      <h2 className="text-lg md:text-xl font-semibold">{item.label}</h2>
                    </div>
                    {/* Línea divisoria */}
                    <div className="mx-6 h-[60%] w-[2px] bg-[#ec6e3d] opacity-60"></div>
                    {/* Descripción */}
                    <div className="flex-1">
                      <p className="text-[#186170] text-base md:text-lg font-medium drop-shadow-sm">{item.description}</p>
                    </div>
                  </div>
                  {/* Contenedor de la imagen con línea vertical delimitadora */}
                  <div className="absolute right-0 top-0 h-full w-[35%] opacity-0 group-hover:opacity-90 transition-all duration-300 overflow-hidden">
                    <div className="relative w-full h-full">
                      <div className="absolute left-0 top-0 h-full w-[2px] bg-[#186170] z-10 opacity-50"></div>
                      <Image
                        src={item.image}
                        alt={item.label}
                        fill
                        className="object-cover"
                      />
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>
      </main>
  );
}
