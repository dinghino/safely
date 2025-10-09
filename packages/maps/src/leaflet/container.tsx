import { MapContainer, TileLayer } from 'react-leaflet'

export function LeafletMap(props: React.ComponentProps<typeof MapContainer>) {
  return (
    <MapContainer {...props} style={{ height: '100%', width: '100%' }}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
    </MapContainer>
  )
}
