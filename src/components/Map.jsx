import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import MarkerPopup from './MarkerPopup';
import HeatmapLayer from './HeatmapLayer';

// Custom icons based on score
const createIcon = (color) => {
  return new L.DivIcon({
    className: 'custom-div-icon',
    html: `<div style="background-color: ${color}; width: 22px; height: 22px; border-radius: 50%; border: 3px solid rgba(255,255,255,0.9); box-shadow: 0 0 15px ${color}; transition: transform 0.2s hover:scale-125;"></div>`,
    iconSize: [22, 22],
    iconAnchor: [11, 11]
  });
};

const getMarkerColor = (score) => {
  if (score < 50) return '#22c55e'; // Green for low risk
  if (score < 80) return '#eab308'; // Yellow for medium
  return '#ef4444'; // Red for high
};

export default function Map({ places, onMarkerClick, viewMode }) {
  const center = [41.311081, 69.240562]; // Tashkent center

  return (
    <div className="w-full h-full relative z-0">
      <MapContainer 
        center={center} 
        zoom={12} 
        className="w-full h-full dark-map-tiles"
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {viewMode === 'heatmap' && <HeatmapLayer places={places} />}

        {viewMode === 'markers' && places.map((place) => (
          <Marker 
            key={place.id} 
            position={[place.lat, place.lng]}
            icon={createIcon(getMarkerColor(place.score))}
            eventHandlers={{
              click: () => onMarkerClick(place)
            }}
          >
            <MarkerPopup place={place} color={getMarkerColor(place.score)} />
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
