import React, { useEffect } from 'react';
import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';

const PusatPeta = ({ latitude, longitude }) => {
  const map = useMap();

  useEffect(() => {
    map.flyTo([latitude, longitude], map.getZoom(), { duration: 0.5 });
  }, [latitude, longitude, map]);

  return null;
};

const MapLokasi = ({
  latitude = -6.2,
  longitude = 106.81667,
  onLocationChange,
  showPopup = true
}) => {
  return (
    <MapContainer
      center={[latitude, longitude]}
      zoom={13}
      style={{ height: '360px', width: '100%' }}
    >
      <PusatPeta latitude={latitude} longitude={longitude} />
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; <a href='https://www.openstreetmap.org/copyright' target='_blank'>OpenStreetMap</a> contributors"
      />
      <Marker
        draggable
        position={[latitude, longitude]}
        onDragEnd={(e) => {
          const marker = e.target;
          const pos = marker.getLatLng();
          if (onLocationChange) {
            onLocationChange(pos.lat, pos.lng);
          }
        }}
      >
        {showPopup && <Popup>Posisi Lokasi</Popup>}
      </Marker>
    </MapContainer>
  );
};

export default MapLokasi;