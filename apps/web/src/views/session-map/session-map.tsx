'use client'

import { useEffect, useMemo } from 'react'
import { useQuery } from 'convex/react'

import { Circle, useMap } from 'react-leaflet'
import { Polyline } from 'react-leaflet/Polyline'

import { api } from '@workspace/backend/api'
import type { Id } from '@workspace/backend/types'
import type { FunctionReturnType } from 'convex/server'

import {
  Map as LeafletMap,
  MapLayerGroup,
  MapLayers,
  MapLayersControl,
  MapLocateControl,
  MapTileLayer,
  MapZoomControl,
} from '@/shared/modules/maps'

import { formatLatLng } from '@/entities/location/lib'

import { MapTiles } from '@/shared/modules/maps/map-layers'
import { MapMarker, MapTooltip } from '@/shared/modules/maps'

import { ButtonGroup } from '@workspace/ui/components/button-group'
import { DeviceMarker, DevicePopup } from '@/widgets/maps'

export namespace SessionMap {
  export type Props = {
    sessionId: Id<'trackSession'>
  }
}
type Location = FunctionReturnType<typeof api.tracking.locations.getSession>[number]

export const SessionMap: React.FC<SessionMap.Props> = ({ sessionId }) => {
  const data = useQuery(api.tracking.sessions.get, { sessionId })
  const locations = useQuery(api.tracking.locations.getSession, { sessionId })
  const device = useQuery(api.devices.get.one, { deviceId: data?.device })

  return (
    <LeafletMap bounds={[]} center={[0, 0]} className="h-full w-full">
      <MapLayers defaultTileLayer="Default" defaultLayerGroups={['session']}>
        <MapTileLayer />
        <MapTiles layers={['mapnik', 'osm', 'topographic', 'worldStreet']} />
        <SessionLayer name="session" locations={locations} />
        <AccuracyLayer name="accuracy" locations={locations} />

        <MapLayerGroup name="device">
          {device && (
            <DeviceMarker device={device}>
              <DevicePopup />
            </DeviceMarker>
          )}
        </MapLayerGroup>
        <ButtonGroup
          orientation="vertical"
          className="absolute top-1 left-1 z-1000 gap-1 rounded-lg bg-background/50 p-1"
        >
          <MapZoomControl orientation="vertical" className="static" />
          <ButtonGroup orientation="vertical">
            <MapLocateControl className="static" />
          </ButtonGroup>
          <ButtonGroup orientation="vertical">
            <MapLayersControl className="static" />
          </ButtonGroup>
        </ButtonGroup>
      </MapLayers>
    </LeafletMap>
  )
}

type MaybeVec3 = [number, number, (number | undefined)?]

const formatLatLngAlt = (loc: Location): MaybeVec3 => {
  const coords = formatLatLng(loc.coordinates!)
  if (loc.metadata?.altitude !== undefined) {
    return [...coords, loc.metadata.altitude] as const
  }
  return coords
}

export const SessionLayer = (props: { locations?: Location[]; name: string }) => {
  const { locations, name } = props
  const coordinates = useMemo(() => {
    return (
      locations?.map((loc) => ({
        id: loc._id,
        coordinates: formatLatLngAlt(loc),
        accuracy: loc.metadata?.accuracy,
      })) || []
    )
  }, [locations])

  const ends = useMemo(() => {
    if (coordinates.length < 2) return null
    const first = coordinates[0]!
    const last = coordinates[coordinates.length - 1]!
    return [first, last]
  }, [coordinates])
  const map = useMap()
  const center = useMemo(() => getCenterLocation(locations || []), [locations])

  useEffect(() => {
    map.setView(center, 13)
  }, [center, map])

  return (
    <MapLayerGroup name={name}>
      {ends?.map(({ coordinates, id }) => (
        <MapMarker
          key={id}
          position={coordinates}
          icon={<div className="size-2 rounded-full bg-blue-500" />}
        >
          <MapTooltip>{id === ends[0]?.id ? 'Start' : 'End'}</MapTooltip>
        </MapMarker>
      ))}
      <Polyline
        positions={coordinates.map(({ coordinates }) => coordinates)}
        color="red"
        weight={2}
      />
    </MapLayerGroup>
  )
}

const AccuracyLayer = (props: { locations: Location[] | undefined; name: string }) => {
  const { locations, name } = props
  if (!locations) return null
  return (
    <MapLayerGroup name={name}>
      {locations
        .filter((loc) => loc.metadata?.accuracy !== undefined)
        .map((loc) => (
          <Circle
            key={loc._id.toString()}
            center={formatLatLng(loc.coordinates!)}
            radius={loc.metadata!.accuracy!}
            color="blue"
          />
        ))}
    </MapLayerGroup>
  )
}

/**
 * Calculate leaflet map boundaries from a list of Location objects
 */
// function getMapBounds(locations: Location[]) {
//   if (!locations || locations.length === 0) return null

//   const bounds = locations
//     .filter((loc) => !!loc.coordinates)
//     .reduce((acc, { coordinates }) => {
//       acc.extend([coordinates!.longitude, coordinates!.latitude])
//       return acc
//     })

//   return bounds
// }

/**
 * Calculate center point from a list of Location objects
 */
function getCenterLocation(locations: Location[]): [number, number] {
  if (!locations || locations.length === 0) return [0, 0]
  const latitudes = locations.map((loc) => loc.coordinates!.latitude)
  const longitudes = locations.map((loc) => loc.coordinates!.longitude)
  const avgLat = latitudes.reduce((a, b) => a + b, 0) / latitudes.length
  const avgLng = longitudes.reduce((a, b) => a + b, 0) / longitudes.length
  return [avgLat, avgLng] as [number, number]
}
