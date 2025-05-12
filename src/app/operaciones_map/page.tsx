"use client";
import Header from "@/app/components/Header";
import BaseMap from "@/app/components/BaseMap";

export default function OperacionesMap() {
  return (
    <main className="h-screen bg-gradient-to-br from-[#eaf6f7] via-white to-[#186170]/10 grid grid-rows-[auto_1fr]">
      <div>
      <Header sections={[
        { label: 'Inicio', href: '/' },
        { label: 'Caracterización', href: '/caracterizacion_map' },
        { label: 'DBA', href: '/dba_map' },
        { label: 'Sitios Alt.', href: '/sitiosAlternativos_map' },
        { label: 'EVU', href: '/evu_map' },
        { label: 'Operaciones', href: '/operaciones_map' }
      ]}/>
      </div>
      <div>
      <BaseMap style={{ height: '100%', width: '100%' }} /* resto de props */ />

      </div>
    </main>
);
}
