import Header from "@/components/Header";
import KmlMap from "@/components/DashboardMap";

export default function Home() {
  return (
    <main className="flex flex-col h-screen">
      <div className="z-50">
        <Header sections={[
          { label: 'Dashboard', href: '/' }
        ]}/>
      </div>
      <div className="flex-1 relative mt-[88px]">
        <KmlMap 
          kmlUrl="/kmz/doc.kml" 
          style={{ height: '100%', width: '100%' }}
        />
      </div>
    </main>
  );
}
