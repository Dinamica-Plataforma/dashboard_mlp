declare module 'leaflet-omnivore' {
  import { Layer } from 'leaflet';

  interface KmlLayer extends Layer {
    eachLayer(fn: (layer: Layer) => void): void;
    getBounds(): L.LatLngBounds;
  }

  const omnivore: {
    kml(url: string): KmlLayer;
  };
  export = omnivore;
} 