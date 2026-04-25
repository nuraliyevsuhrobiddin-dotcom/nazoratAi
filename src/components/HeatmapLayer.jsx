import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet.heat';

export default function HeatmapLayer({ places }) {
  const map = useMap();

  useEffect(() => {
    if (!places || places.length === 0) return;

    // Convert places to heat points: [lat, lng, intensity]
    // Intensity is normalized based on score (0 to 1)
    const heatData = places.map(place => [
      place.lat, 
      place.lng, 
      place.score / 100 // Intensity based on score
    ]);

    // Create heat layer with premium gradient
    const heatLayer = L.heatLayer(heatData, {
      radius: 40,
      blur: 25,
      maxZoom: 14,
      gradient: {
        0.2: '#22c55e', // Green for low risk
        0.5: '#eab308', // Yellow for medium
        0.8: '#ef4444', // Red for high
        1.0: '#991b1b'  // Dark red for extreme
      }
    });

    heatLayer.addTo(map);

    return () => {
      map.removeLayer(heatLayer);
    };
  }, [map, places]);

  return null;
}
