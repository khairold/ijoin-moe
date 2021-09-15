/** @jsxImportSource theme-ui */
import { useState, useEffect } from 'react'
import { Box, Heading, Container, Input } from 'theme-ui'
import dynamic from 'next/dynamic'
import Fuse from 'fuse.js'

import PaginatedSearchResults from './paginated-search-results'
import FilterAddress from './filter-address'
import AddressLoader from './address-loader'

import { getParams } from '@/utils/index'

const Map = dynamic(() => import('@/components/shared/map'), { ssr: false })

function Start() {
  const [validated, setValidated] = useState(false)

  const [smartMapInstallationAddress, setSmartMapInstallationAddress] = useState({})
  const [smartMapMergedAddress, setSmartMapMergedAddress] = useState([])
  const [invetoryResults, setInventoryResults] = useState([])
  const [invetoryResultsFiltered, setInventoryResultsFiltered] = useState([])

  const [buildingFilter, setBuildingFilter] = useState('')
  const [streetFilter, setStreetFilter] = useState('')
  const [unitFilter, setUnitFilter] = useState('')

  const [searching, setSearching] = useState(false)
  const [initialState, setInitialState] = useState(true)

  // De-initialized
  useEffect(() => {
    searching && setInitialState(false)
  }, [searching])

  // Merge Address
  useEffect(async () => {
    if (!smartMapInstallationAddress.Location) return
    if (!validated) return
    const query = {
      street: smartMapInstallationAddress.Street,
      city: smartMapInstallationAddress.City,
      state: smartMapInstallationAddress.State,
      latitude: smartMapInstallationAddress.Location ? smartMapInstallationAddress.Location.Lat : '',
      longitude: smartMapInstallationAddress.Location ? smartMapInstallationAddress.Location.Lon : '',
    }
    const respond = await fetch(`/api/network-address?${getParams(query)}`)
    const data = (await respond.json()) || []
    const result = data.response || {}
    const { AddressByCoordinates = [], AddressByKeywords = [] } = result

    let mergedAddressesObj = {}

    AddressByCoordinates.forEach((r) => {
      mergedAddressesObj[r.id] = r
    })

    AddressByKeywords.forEach((r) => {
      mergedAddressesObj[r.id] = r
    })

    const mergedAddressesArr = Object.values(mergedAddressesObj).filter((f) => f.id.startsWith('G'))

    setSmartMapMergedAddress(mergedAddressesArr)
  }, [smartMapInstallationAddress, validated])

  // Reset Filter & Run Search Fuzy
  useEffect(() => {
    setUnitFilter('')
    setBuildingFilter('')
    setStreetFilter('')
    searchFuzySolr()
  }, [smartMapMergedAddress])

  // Reset Search & Run Filter
  useEffect(() => {
    setInventoryResultsFiltered(invetoryResults)
    setSearching(false)
  }, [invetoryResults])

  // Filter
  useEffect(() => {
    const filtered = invetoryResults
      .filter(({ item }) => (buildingFilter ? item.building === buildingFilter : true))
      .filter(({ item }) => (streetFilter ? item.street === streetFilter : true))

    const options = {
      includeScore: true,
      keys: ['unit'],
    }
    const fuse = new Fuse(
      filtered.map(({ item }) => item),
      options
    )

    let finalFiltered = []

    if (unitFilter) {
      finalFiltered = fuse.search(unitFilter)
    } else {
      finalFiltered = filtered
    }

    setInventoryResultsFiltered(finalFiltered)
  }, [buildingFilter, streetFilter, unitFilter])

  // Search Fuzy
  function searchFuzySolr() {
    const sArr = (smartMapInstallationAddress.Building || '').split(' ')

    let iArr = -1
    let derivedBlok = ''

    iArr = sArr.indexOf('BLOK')
    if (iArr === -1) iArr = sArr.indexOf('BLOCK')
    if (iArr !== -1) derivedBlok = `${sArr[iArr]} ${sArr[iArr + 1]}`

    const options = {
      includeScore: true,
      keys: ['unit', 'building', 'street'],
    }
    const fuse = new Fuse(smartMapMergedAddress, options)

    setInventoryResults([])

    let andArr = []

    if (smartMapInstallationAddress.Apt === '-999') {
    } else if (smartMapInstallationAddress.Apt) {
      andArr.push({ unit: smartMapInstallationAddress.Apt })
    }

    let orArr = { $or: [] }
    if (derivedBlok) orArr['$or'].push({ building: derivedBlok })
    if (smartMapInstallationAddress.Building) orArr['$or'].push({ building: smartMapInstallationAddress.Building })
    if (smartMapInstallationAddress.Building) andArr.push(orArr)

    if (!smartMapInstallationAddress.Building && smartMapInstallationAddress.Street) andArr.push({ street: smartMapInstallationAddress.Street })

    let fuseResult = []

    if (andArr.length > 0) {
      fuseResult =
        fuse.search({
          $and: andArr,
        }) || []
      if (fuseResult.length > 0) {
        setInventoryResults(fuseResult)
      } else {
        smartMapMergedAddress.forEach((s) => fuseResult.push({ item: s }))
        setInventoryResults(fuseResult)
      }
    }
    setSearching(false)
  }
  return (
    <Box>
      <Map setSmartMapInstallationAddress={setSmartMapInstallationAddress} setSearching={setSearching} />
      <Container sx={{ p: 3 }}>
        <Heading sx={{ pt: 4, fontSize: 3, fontWeight: 700 }}>
          {initialState
            ? 'Click on the map and put the marker exactly on top of your address location'
            : searching
            ? smartMapInstallationAddress.Location
              ? 'Scroll down and click on unifi address that best matches yours'
              : 'Searching unifi addresses'
            : 'Scroll down and click on unifi address that best matches yours'}
        </Heading>

        {/* <Box>
          <Input />
        </Box> */}

        {searching ? (
          <Box sx={{ pt: 5 }}>
            <AddressLoader validated={validated} setValidated={setValidated} />
          </Box>
        ) : (
          <Box>
            {initialState ? (
              <Box sx={{ py: 3 }}>
                <Box sx={{ fontSize: [1, 2], color: 'greys.400' }}>Matching unifi addresses will be listed below for</Box>
                <Box sx={{ fontSize: 0, color: 'greys.300' }}>
                  THE ADDRESS THAT YOU WILL BE SELECTING ON THE MAP
                  <br /> ZOOM IN UNTIL YOU CAN SEE YOU HOUSE UNIT NUMBER OR BUILDING BLOCK ON THE MAP
                </Box>
              </Box>
            ) : (
              <Box>
                <Box sx={{ py: 3 }}>
                  <Box sx={{ fontSize: [1, 2], color: 'greys.400' }}>{invetoryResults.length} matching unifi addresses found for</Box>
                  <Box sx={{ fontSize: 0, color: 'greys.300' }}>{smartMapInstallationAddress.FormattedAddress}</Box>
                </Box>
                {invetoryResults.length >= 10 && (
                  <FilterAddress
                    invetoryResults={invetoryResults}
                    unitFilter={unitFilter}
                    setUnitFilter={setUnitFilter}
                    setBuildingFilter={setBuildingFilter}
                    setStreetFilter={setStreetFilter}
                  />
                )}

                {invetoryResultsFiltered.map(({ item }) => (
                  <PaginatedSearchResults key={item.id} item={item} />
                ))}
              </Box>
            )}
          </Box>
        )}
      </Container>
    </Box>
  )
}

export default Start
