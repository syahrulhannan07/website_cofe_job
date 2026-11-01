import React, { useEffect } from 'react';
import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import { icon } from 'leaflet';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerIconRetina from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import { PUSAT_INDRAMAYU } from '../../layanan/lokasiIndramayu';

const ikonPin = icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIconRetina,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const PilihTitik = ({ onLocationChange }) => {
  useMapEvents({
    click: (event) => onLocationChange?.(event.latlng.lat, event.latlng.lng),
  });
  return null;
};

const PusatPeta = ({ latitude, longitude, zoom }) => {
  const map = useMap();

  useEffect(() => {
    map.flyTo([latitude, longitude], zoom, { duration: 0.5 });
  }, [latitude, longitude, zoom, map]);

  return null;
};

const MapLokasi = ({
  latitude = PUSAT_INDRAMAYU.lat,
  longitude = PUSAT_INDRAMAYU.lng,
  onLocationChange,
  showPopup = true,
  showMarker = true,
  zoom = 13,
  popupText = 'Posisi Lokasi',
  height = 360
}) => {
  return (
    <MapContainer
      center={[latitude, longitude]}
      zoom={zoom}
      style={{ height, width: '100%' }}
    >
      <PusatPeta latitude={latitude} longitude={longitude} zoom={zoom} />
      <PilihTitik onLocationChange={onLocationChange} />
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; <a href='https://www.openstreetmap.org/copyright' target='_blank'>OpenStreetMap</a> contributors"
      />
      {showMarker && (
        <Marker
          icon={ikonPin}
          draggable={Boolean(onLocationChange)}
          position={[latitude, longitude]}
          eventHandlers={{
            dragend: (event) => {
              const pos = event.target.getLatLng();
              onLocationChange?.(pos.lat, pos.lng);
            },
          }}
        >
          {showPopup && <Popup>{popupText}</Popup>}
        </Marker>
      )}
    </MapContainer>
  );
};

export default MapLokasi;