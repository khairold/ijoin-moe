/** @jsxImportSource theme-ui */
import { useState, useEffect, useRef } from 'react'
import { Box, Flex, Input, Button, Container } from 'theme-ui'
import { X } from 'react-feather'

import mapboxgl from '!mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'

import useWindowSize from '@/utils/hooks/use-window-size'

const el = document.createElement('div')
el.style.backgroundImage = `url(http://localhost:3000/images/unifi-marker.png)`
el.style.width = `27px`
el.style.height = `38px`
el.style.backgroundSize = 'cover'
el.style.display = 'block'
el.style.border = 'none'
el.style.cursor = 'pointer'
el.style.padding = 0

function Map({ setSmartMapInstallationAddress, setSearching }) {
  const map = useRef(null)
  const mapRef = useRef(null)

  const [selectedAddress, setSelectedAddress] = useState('')

  const [lng, setLng] = useState(101.66582308248029)
  const [lat, setLat] = useState(3.1163757960642897)
  // const [lng, setLng] = useState(101.7746047254445)
  // const [lat, setLat] = useState(3.1569107066875746)
  const [zoom, setZoom] = useState(18)

  const marker = new mapboxgl.Marker(el, { draggable: true })

  // const marker = new mapboxgl.Marker({
  //   draggable: true,
  // })

  async function setAddressByReverse({ lat, lng }) {
    setSearching(true)

    const respond = await fetch(`/api/smart-map/reverse-geocode?lat=${lat}&lon=${lng}`)
    const data = (await respond.json()) || []
    const result = data[0] || { location: {} }

    setSelectedAddress(result.formatted_address)

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

  useEffect(() => {
    if (map.current) return
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
        maxZoom: 18,
      },
    })

    map.current.addControl(geolocate).on('load', () => {
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

  return (
    <Box sx={{ position: 'relative', width: '100%', height: 400, mx: 'auto' }}>
      <AddressInput setLng={setLng} setLat={setLat} />
      {/* <SelectedAddress selectedAddress={selectedAddress} searchFuzySolr={searchFuzySolr} /> */}
      <PlanInfo />
      <Box ref={mapRef} sx={{ width: '100%', height: 400 }} />
    </Box>
  )
}

function PlanInfo() {
  const size = useWindowSize()
  const rightPad = size.width >= 1004 ? (size.width - 1004 + 12) / 2 : '8px'
  return (
    <Box sx={{ position: 'absolute', bottom: 3, right: rightPad, zIndex: 1 }}>
      <Box
        sx={{
          textAlign: 'right',
          px: 4,
          py: 3,
          bg: 'rgba(35, 55, 75, 0.9)',
          position: 'relative',
          borderRadius: 4,
          color: 'white',
          display: 'inline-block',
        }}
      >
        <Box sx={{ pb: 3 }}>
          <img src="/images/unifi-logo-grey.svg" alt="unifi" sx={{ height: 20 }} />
        </Box>

        <Box sx={{ fontSize: 2, fontWeight: 700 }}>unifi 300Mbps</Box>
        <Box sx={{ fontSize: 0, color: '#C6D4E3' }}>RM189 / Month</Box>
      </Box>
    </Box>
  )
}

function AddressInput({ setLng, setLat }) {
  const size = useWindowSize()
  const leftPad = size.width >= 1004 ? (size.width - 1004 + 12) / 2 : '8px'

  const inputRef = useRef(null)
  const ulRef = useRef(null)

  const [inputValue, setInputValue] = useState('')
  const [autocompleteText, setAutocompleteText] = useState([])
  const [showText, setShowText] = useState(false)

  const [listSelect, setListSelect] = useState(0)

  async function addressSelect({ address }) {
    const respond = await fetch(`/api/smart-map?q=${address}&limit=1`)
    const data = (await respond.json()) || []
    setLng(data[0].location.lon)
    setLat(data[0].location.lat)
    setAutocompleteText([])
  }

  async function handleInputChange(e) {
    setListSelect(0)
    if (ulRef.current) ulRef.current.scroll(0, 0)
    setInputValue(e.target.value)

    if (e.target.value === '') {
      setAutocompleteText([])
      return
    }

    const respond = await fetch(`/api/smart-map/autocomplete?q=${e.target.value}&limit=50`)
    const data = (await respond.json()) || []
    const text = data.map(({ text }) => text)
    setAutocompleteText(text)
  }

  function handleKeyDown(e) {
    if (e.keyCode === 38) {
      if (listSelect > 0) setListSelect(listSelect - 1)
      if (ulRef.current) ulRef.current.scrollBy(0, -34)
    }
    if (e.keyCode === 40) {
      if (listSelect < autocompleteText.length - 1) setListSelect(listSelect + 1)
      if (ulRef.current && listSelect > 9) ulRef.current.scrollBy(0, 34)
    }

    if (e.keyCode === 13) {
      if (autocompleteText.length > 0) {
        setInputValue(autocompleteText[listSelect])
        setShowText(false)
        addressSelect({ address: autocompleteText[listSelect] })
      }
    }
  }

  return (
    <Box sx={{ position: 'absolute', zIndex: 2, top: 2, left: leftPad, fontSize: 1, width: 600 }}>
      <Box>
        <Flex
          sx={{
            width: ['100%', '85%', '100%'],
            alignItems: 'center',
            bg: 'white',
            borderColor: 'greys.200',
            borderStyle: 'solid',
            borderWidth: 1,
            borderRadius: 6,
            py: 0,
          }}
        >
          <Input
            onKeyDown={handleKeyDown}
            placeholder="Type in to zoom to your area"
            onFocus={() => {
              setShowText(true)
            }}
            onBlur={() =>
              setTimeout(() => {
                setShowText(false)
              }, 100)
            }
            ref={inputRef}
            sx={{
              color: 'greys.400',
              bg: 'white',
              border: 'none',
              textTransform: 'uppercase',
              ':focus': { outline: 'none' },
              '::placeholder': { color: 'greys.300', textTransform: 'none' },
            }}
            onChange={handleInputChange}
            value={inputValue}
          />
          <Box sx={{ bg: 'white', px: 3, borderColor: 'greys.200', borderWidth: 1, borderLeftStyle: 'solid' }} onClick={() => setInputValue('')}>
            <X sx={{ position: 'relative', top: '2px', size: 20, color: 'greys.400', ':hover': { color: 'blue' } }} />
          </Box>
        </Flex>
        {autocompleteText.length > 0 && (
          <ul
            ref={ulRef}
            sx={{
              width: ['100%', '85%', '100%'],
              bg: 'white',
              px: 1,
              py: 2,
              maxHeight: 400,
              overflowY: 'auto',
              display: showText ? 'block' : 'none',
              listStyle: 'none',
              m: 0,
            }}
          >
            {autocompleteText.slice(0, 9).map((t, i) => (
              <li
                sx={{ py: 2, px: 2, bg: listSelect === i ? 'oranges.100' : 'white' }}
                key={t}
                onClick={() => {
                  setInputValue(t)
                  setShowText(false)
                  addressSelect({ address: t })
                }}
              >
                {t}
              </li>
            ))}
          </ul>
        )}
      </Box>
    </Box>
  )
}

function SelectedAddress({ selectedAddress, searchFuzySolr }) {
  const selectedAddressArray = selectedAddress.split(',')
  return (
    <>
      <Box sx={{ position: 'absolute', left: 0, bottom: 0, zIndex: 1, width: '100%', p: 3 }}>
        <Box
          sx={{
            justifyContent: 'space-between',
            alignItems: 'flex-end',

            px: 5,
            py: 4,
            bg: 'rgba(35, 55, 75, 0.96)',
            position: 'relative',
            borderRadius: 4,
            color: 'white',
            width: '100%',
          }}
        >
          <Box sx={{ position: 'relative' }}>
            <Box sx={{ borderWidth: 2, borderLeftStyle: 'solid', borderColor: 'white', px: 3, pt: 3, pb: 5 }}>
              {selectedAddressArray.length > 1 ? (
                <Box>
                  <Box sx={{ fontSize: 4, fontWeight: 700 }}>
                    {selectedAddressArray.length > 1 &&
                      selectedAddressArray.map((a, i) => {
                        if (i < 2) return `${a}${i !== 1 ? ',' : ''}`
                      })}
                  </Box>
                  <Box sx={{ fontSize: 1, color: '#C6D4E3' }}>
                    {selectedAddressArray.map((a, i) => {
                      if (i >= 2 && i < 4) return `${a}${i !== 3 ? ',' : ''}`
                    })}
                  </Box>
                  <Box sx={{ fontSize: 1, color: '#C6D4E3' }}>
                    {selectedAddressArray.map((a, i) => {
                      if (i >= 4) return `${a}${i !== selectedAddressArray.length - 1 ? ',' : ''}`
                    })}
                  </Box>
                </Box>
              ) : (
                <Box>
                  <Box sx={{ textTransform: 'uppercase', fontSize: 4, fontWeight: 700 }}>Click on the map</Box>
                  <Box sx={{ fontSize: 1, color: '#C6D4E3' }}>Put the marker exactly on top of your installation address location</Box>
                </Box>
              )}
            </Box>
          </Box>

          {selectedAddress && (
            <Button
              onClick={() => searchFuzySolr()}
              sx={{
                fontSize: 2,
                position: 'absolute',
                bottom: 0,
                right: 0,
                px: [2, 3],
                py: [2, 2],
                cursor: 'pointer',
                borderWidth: 1,
                borderStyle: 'solid',
                borderColor: 'blue',
                backgroundImage: 'linear-gradient(hsl(213, 88%, 60%), hsl(212, 74%,50%), hsl(212, 74%, 35%))',
                mr: 5,
                mb: 4,
              }}
            >
              Search Inventory
            </Button>
          )}
        </Box>
      </Box>
    </>
  )
}

export default Map
