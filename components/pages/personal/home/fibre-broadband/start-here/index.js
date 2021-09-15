/** @jsxImportSource theme-ui */
import { useState, useEffect, useRef } from 'react'
import { Box, Flex, Heading, Input, Container, Text } from 'theme-ui'
import dynamic from 'next/dynamic'
import Fuse from 'fuse.js'
import { Filter } from 'react-feather'

import AddressLoader from './address-loader'

const Map = dynamic(() => import('@/components/shared/map'), { ssr: false })

function useDebounce(value, delay) {
  // State and setters for debounced value
  const [debouncedValue, setDebouncedValue] = useState(value)
  useEffect(
    () => {
      // Update debounced value after delay
      const handler = setTimeout(() => {
        setDebouncedValue(value)
      }, delay)
      // Cancel the timeout if value changes (also on delay change or unmount)
      // This is how we prevent debounced value from updating if value is changed ...
      // .. within the delay period. Timeout gets cleared and restarted.
      return () => {
        clearTimeout(handler)
      }
    },
    [value, delay] // Only re-call effect if value or delay changes
  )
  return debouncedValue
}

function Start() {
  const [validated, setValidated] = useState(true)

  const [smartMapInstallationAddress, setSmartMapInstallationAddress] = useState({})
  const [smartMapMergedAddress, setSmartMapMergedAddress] = useState([])
  const [invetoryResults, setInventoryResults] = useState([])
  const [invetoryResultsFiltered, setInventoryResultsFiltered] = useState([])

  const [buildingFilter, setBuildingFilter] = useState('')
  const [streetFilter, setStreetFilter] = useState('')
  const [unitFilter, setUnitFilter] = useState('')

  const [searching, setSearching] = useState(false)
  const [initialState, setInitialState] = useState(true)

  const debouncedUnitFilter = useDebounce(unitFilter, 1000)

  useEffect(() => {
    searching && setInitialState(false)
  }, [searching])

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

  useEffect(() => {
    setUnitFilter('')
    setBuildingFilter('')
    setStreetFilter('')
    searchFuzySolr()
  }, [smartMapMergedAddress])

  useEffect(() => {
    setInventoryResultsFiltered(invetoryResults)
    setSearching(false)
  }, [invetoryResults])

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

        {searching ? (
          <Box sx={{ pt: 5 }}>
            <AddressLoader validated={validated} setValidated={setValidated} />
          </Box>
        ) : (
          <Box>
            {initialState ? (
              <Box sx={{ py: 3 }}>
                <Box sx={{ fontSize: [1, 2], color: 'greys.400' }}>Matching unifi addresses will be listed below for</Box>
                <Box sx={{ fontSize: 0, color: 'greys.300' }}>THE ADDRESS THAT YOU WILL BE SELECTING ON THE MAP</Box>
              </Box>
            ) : (
              <Box>
                <Box sx={{ py: 3 }}>
                  <Box sx={{ fontSize: [1, 2], color: 'greys.400' }}>{invetoryResults.length} matching unifi addresses found for</Box>
                  <Box sx={{ fontSize: 0, color: 'greys.300' }}>{smartMapInstallationAddress.FormattedAddress}</Box>
                </Box>
                <FilterAddress
                  invetoryResults={invetoryResults}
                  unitFilter={unitFilter}
                  setUnitFilter={setUnitFilter}
                  setBuildingFilter={setBuildingFilter}
                  setStreetFilter={setStreetFilter}
                />
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

function FilterAddress({ invetoryResults, setUnitFilter, setBuildingFilter, setStreetFilter }) {
  const [show, setShow] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const debouncedSearchTerm = useDebounce(searchTerm, 500)

  useEffect(() => {
    setUnitFilter(debouncedSearchTerm)
  }, [debouncedSearchTerm])
  return (
    <Flex
      sx={{
        position: 'sticky',
        top: 0,
        alignItems: 'baseline',
        mt: 2,
        mb: 3,
        fontSize: 1,
        color: 'greys.400',
        flexDirection: ['row', 'column'],
        borderStyle: 'solid',
        borderColor: 'backgroundGrey',
        boxShadow: show && '0 4px 6px hsla(0, 0%, 0%, 0.1)',
        borderRadius: 8,
        borderWidth: 1,
        pt: 2,
        pb: show ? 4 : 0,
        px: 4,
        bg: 'white',
      }}
    >
      {!show ? (
        <Flex onClick={() => setShow(true)} sx={{ cursor: 'pointer', pb: show ? 3 : 2, width: '100%' }}>
          <Filter sx={{ color: 'greys.400', size: [14, 16] }} /> <Text sx={{ color: 'greys.400', fontSize: [0, 1], pl: 1 }}>Filter</Text>
        </Flex>
      ) : (
        <Box>
          <Flex sx={{ flexDirection: ['column', 'row'], alignItems: 'baseline' }}>
            <Flex sx={{ alignItems: 'baseline' }}>
              <Box sx={{ pr: 3 }}>Unit: </Box>
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                sx={{
                  width: [70],
                  ':focus': { outline: 'none' },
                  pb: 0,
                  px: 1,
                  fontSize: 1,
                  borderColor: 'greys.200',
                  color: 'greys.400',
                  borderLeft: 'none',
                  borderTop: 'none',
                  borderRight: 'none',
                }}
              />
            </Flex>
            <Option invetoryResults={invetoryResults} field="building" setFilter={setBuildingFilter} />
            <Option invetoryResults={invetoryResults} field="street" setFilter={setStreetFilter} />
          </Flex>
        </Box>
      )}
    </Flex>
  )
}

// function FilterAddress({ invetoryResults, unitFilter, setUnitFilter, setBuildingFilter, setStreetFilter }) {
//   const [show, setShow] = useState(false)
//   const [searchTerm, setSearchTerm] = useState('')
//   const debouncedSearchTerm = useDebounce(searchTerm, 500)

//   useEffect(() => {
//     setUnitFilter(debouncedSearchTerm)
//   }, [debouncedSearchTerm])

//   return (
//     <Flex
//       sx={{
//         zIndex: 100,
//         positon: 'sticky',
//         top: 0,
//         alignItems: 'baseline',
//         mt: 2,
//         mb: 3,
//         fontSize: 1,
//         color: 'greys.400',
//         flexDirection: ['row', 'column'],
//         borderStyle: 'solid',
//         borderColor: 'backgroundGrey',
//         boxShadow: show && '0 4px 6px hsla(0, 0%, 0%, 0.1)',
//         borderRadius: 8,
//         borderWidth: 1,
//         pt: 2,
//         pb: show ? 4 : 0,
//         px: 4,
//       }}
//     >
//       {/* <Flex sx={{ justifyContent: 'space-between', pb: show ? 4 : 2 }}> */}

//       {/* <Box sx={{ color: 'oranges.400', fontSize: 0 }}>Still can't find your address?</Box> */}
//       {/* </Flex> */}
//       {!show ? (
//         <Flex onClick={() => setShow(true)} sx={{ cursor: 'pointer', pb: show ? 3 : 2, width: '100%' }}>
//           <Filter sx={{ color: 'greys.400', size: [14, 16] }} /> <Text sx={{ color: 'greys.400', fontSize: [0, 1], pl: 1 }}>Filter</Text>
//         </Flex>
//       ) : (
//         <Box>
//           <Flex sx={{ flexDirection: ['column', 'row'], alignItems: 'baseline' }}>
//             <Flex sx={{ alignItems: 'baseline' }}>
//               <Box sx={{ pr: 3 }}>Unit: </Box>
//               <Input
//                 // value={unitFilter}
//                 // onChange={(e) => setUnitFilter(e.target.value)}
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//                 sx={{
//                   width: [70],
//                   ':focus': { outline: 'none' },
//                   pb: 0,
//                   px: 1,
//                   fontSize: 1,
//                   borderColor: 'greys.200',
//                   color: 'greys.400',
//                   borderLeft: 'none',
//                   borderTop: 'none',
//                   borderRight: 'none',
//                 }}
//               />
//             </Flex>
//             <Option invetoryResults={invetoryResults} field="building" setFilter={setBuildingFilter} />
//             <Option invetoryResults={invetoryResults} field="street" setFilter={setStreetFilter} />
//           </Flex>
//         </Box>
//       )}
//     </Flex>
//   )
// }

function Option({ invetoryResults = [], field, setFilter }) {
  let optionObj = {}
  invetoryResults.forEach(({ item }) => {
    if (item[field]) {
      optionObj[item[field]] = item[field]
    }
  })
  const options = Object.values(optionObj).sort()

  if (options.length < 1) return <></>

  return (
    <Flex sx={{ alignItems: 'baseline', pt: [2, 0], pl: [0, 5] }}>
      <Box sx={{ pr: 1, textTransform: 'capitalize' }}>{field}: </Box>
      <select
        onChange={(e) => setFilter(e.target.value)}
        sx={{
          // flex: 7,
          // width: ['80%', null],
          // width: '100%',
          // textAlign: 'right',
          // overflow: 'hidden',
          bg: 'white',
          borderColor: 'greys.200',
          color: 'greys.400',
          borderLeft: 'none',
          borderTop: 'none',
          borderRight: 'none',
          ':focus': { outline: 'none' },
          width: 200,
        }}
      >
        <option value="">All</option>
        {options.map((o) => (
          <option key={o} value={o} sx={{ width: 200, wordWrap: 'break-word' }}>
            {o}
          </option>
        ))}
      </select>
    </Flex>
  )
}

function getParams(locationObj) {
  return Object.entries(locationObj)
    .map(([key, val]) => `${key}=${encodeURIComponent(val)}`)
    .join('&')
}

function PaginatedSearchResults({ item }) {
  return (
    <Box sx={{ bg: 'white', py: 5 }}>
      <Box
        sx={{
          borderBottomStyle: 'solid',
          borderWidth: 2,
          borderColor: 'white',
          display: 'inline-block',
          color: 'blue',
          cursor: 'pointer',
          ':hover': { borderColor: 'blue' },
          lineHeight: 1,
          mb: 1,
        }}
      >
        <Box sx={{ fontSize: [4, 5, 6], display: ['block', 'inline-block'], fontWeight: 700 }}>{item.unit}</Box>{' '}
        <Box sx={{ pt: [1, 0], fontSize: [2, 3, 4], display: ['block', 'inline-block'] }}>{item.building ? item.building : item.street}</Box>
      </Box>

      <Box sx={{ color: 'greys.600', fontSize: 1 }}>
        {item.building ? (
          <Text>
            {item.street} {item.section}, {item.city} {item.postcode}, {item.state}
          </Text>
        ) : (
          <Text>
            {item.section}
            {item.section && ','} {item.city} {item.postcode}, {item.state}
          </Text>
        )}
      </Box>
    </Box>
  )
}
