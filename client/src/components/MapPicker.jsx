
import { useState } from 'react'
import {
  MapContainer,
  TileLayer,
  Marker,
  useMap,
  useMapEvents,
} from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix default Leaflet marker icons in Vite
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'

const defaultIcon = L.icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
})

const DEFAULT_POSITION = [23.0225, 72.5714] // Ahmedabad

function MapClickHandler({ onSelect }) {
  useMapEvents({
    click(event) {
      onSelect([
        event.latlng.lat,
        event.latlng.lng,
      ])
    },
  })

  return null
}

function MapCenter({ position }) {
  const map = useMap()

  map.setView(position, map.getZoom())

  return null
}

function MapPicker({
  initialPosition,
  onLocationSelect,
}) {
  const [position, setPosition] = useState(
    initialPosition || null
  )
  const [error, setError] = useState('')
  const [locating, setLocating] = useState(false)

  const selectedPosition = position || DEFAULT_POSITION

  const selectPosition = (newPosition) => {
    setPosition(newPosition)
    setError('')

    if (onLocationSelect) {
      onLocationSelect({
        latitude: newPosition[0],
        longitude: newPosition[1],
      })
    }
  }

  const useCurrentLocation = () => {
    setError('')

    if (!navigator.geolocation) {
      setError('Your browser does not support GPS location.')
      return
    }

    setLocating(true)

    navigator.geolocation.getCurrentPosition(
      (result) => {
        selectPosition([
          result.coords.latitude,
          result.coords.longitude,
        ])

        setLocating(false)
      },
      (err) => {
        if (err.code === 1) {
          setError(
            'Location permission denied. Please allow location access in your browser.'
          )
        } else if (err.code === 2) {
          setError('Your current location could not be determined.')
        } else {
          setError('Location request timed out. Please try again.')
        }

        setLocating(false)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted">
          Click on the map or drag the marker to select a location.
        </p>

        <button
          type="button"
          onClick={useCurrentLocation}
          disabled={locating}
          className="btn btn-secondary"
        >
          {locating
            ? 'Getting location...'
            : 'Use My Current Location'}
        </button>
      </div>

      {error && (
        <p
          role="alert"
          className="rounded-lg bg-red-50 p-3 text-sm text-red-700"
        >
          {error}
        </p>
      )}

      <div className="overflow-hidden rounded-xl border border-gray-200">
        <MapContainer
          center={selectedPosition}
          zoom={13}
          scrollWheelZoom
          style={{
            height: '400px',
            width: '100%',
          }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <MapCenter position={selectedPosition} />

          <MapClickHandler onSelect={selectPosition} />

          <Marker
            position={selectedPosition}
            icon={defaultIcon}
            draggable
            eventHandlers={{
              dragend(event) {
                const marker = event.target
                const latlng = marker.getLatLng()

                selectPosition([
                  latlng.lat,
                  latlng.lng,
                ])
              },
            }}
          />
        </MapContainer>
      </div>

      <div className="rounded-lg bg-gray-50 p-3 text-sm">
        <p className="font-medium">Selected coordinates</p>

        <p className="mt-1 text-muted">
          Latitude: {position ? position[0].toFixed(6) : 'Not selected'}
        </p>

        <p className="text-muted">
          Longitude: {position ? position[1].toFixed(6) : 'Not selected'}
        </p>
      </div>
    </div>
  )
}

export default MapPicker
