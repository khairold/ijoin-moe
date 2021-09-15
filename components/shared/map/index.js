/** @jsxImportSource theme-ui */
import { useState, useEffect, useRef } from 'react'
import { Box, Flex, Input, Button, Container } from 'theme-ui'

import PlanInfo from './plan-info'
import AddressInput from './address-input'
import unifiMarker from './unifi-marker'

import mapboxgl from '!mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'

import useWindowSize from '@/utils/hooks/use-window-size'

const fetcher = (...args) => fetch(...args).then((res) => res.json())

function Map({ setSmartMapInstallationAddress, setSearching }) {
  const map = useRef(null)
  const mapRef = useRef(null)
  // const [lng, setLng] = useState(101.66582308248029)
  // const [lat, setLat] = useState(3.1163757960642897)
  const [lng, setLng] = useState(101.7746047254445)
  const [lat, setLat] = useState(3.1569107066875746)
  const [zoom, setZoom] = useState(17)

  const size = useWindowSize()

  useEffect(() => {
    if (map.current) return

    const marker = new mapboxgl.Marker(unifiMarker(), { draggable: true })

    map.current = new mapboxgl.Map({
      container: mapRef.current,
      style: {
        version: 8,
        sources: {
          'raster-tiles': {
            type: 'raster',
            tiles: [
              `https://www.smartmap.tm.com.my/api/map/wmts?api_key=${process.env.NEXT_PUBLIC_TM_SMARTMAP_API_KEY}&request=GetTile&layer=Malaysia:TMOneSmartMap&format=image/png&TILEMATRIXSET=EPSG:3857&TILEMATRIX=EPSG:3857:{z}&TILEROW={y}&TILECOL={x}`,
            ],
            tileSize: 256,
          },
        },
        layers: [{ id: 'simple-tiles', type: 'raster', source: 'raster-tiles' }],
      },
      center: [lng, lat],
      zoom: zoom,
    })

    const geolocate = new mapboxgl.GeolocateControl({
      positionOptions: {
        enableHighAccuracy: true,
      },
      trackUserLocation: true,
      showUserLocation: false,
      fitBoundsOptions: {
        maxZoom: zoom,
      },
    })

    map.current.addControl(geolocate, 'top-right').on('load', () => {
      // geolocate.trigger()
    })

    const nav = new mapboxgl.NavigationControl({ showCompass: false })
    map.current.addControl(nav, 'top-right')

    marker.on('dragend', async (e) => {
      setAddressByReverse({ lat: e.target._lngLat.lat, lng: e.target._lngLat.lng })
    })

    map.current.on('click', async (e) => {
      marker.remove()
      marker.setLngLat(e.lngLat).addTo(map.current)
      setAddressByReverse({ lat: e.lngLat.lat, lng: e.lngLat.lng })
    })
  }, [])

  useEffect(() => {
    map.current.setCenter([lng, lat])
  }, [lng, lat])

  async function setAddressByReverse({ lat, lng }) {
    setSearching(true)

    const data = await fetcher(`/api/smart-map/reverse-geocode?lat=${lat}&lon=${lng}`)
    const result = (data || [])[0] || { location: {} }

    setSmartMapInstallationAddress({
      FormattedAddress: result.formatted_address,
      Apt: result.apt,
      City: result.city,
      PostCode: result.postcode,
      Section: result.section,
      Building: result.building,
      Street: result.street,
      StreetName: result.streetExact,
      StreetType: result.street_type,
      State: result.state,
      Location: {
        Lat: result.location.lat,
        Lon: result.location.lon,
      },
    })
  }

  return (
    <Box sx={{ position: 'relative', width: '100%', height: ['80vw', 400], mx: 'auto' }}>
      <AddressInput setLng={setLng} setLat={setLat} />
      <PlanInfo speed="300" price="189" />
      <Box ref={mapRef} sx={{ width: '100%', height: ['80vw', 400] }} />
    </Box>
  )
}

export default Map
