/** @jsxImportSource theme-ui */
import { useState, useEffect, useRef } from 'react'
import { Box, Container, Flex, Heading, Text, Input } from 'theme-ui'
import dynamic from 'next/dynamic'
import Fuse from 'fuse.js'
import ContentLoader from 'react-content-loader'
import { FixedSizeList as List } from 'react-window'
import usePagination from '@/utils/hooks/use-pagination'

const Map = dynamic(() => import('../../../../components/map'), { ssr: false })

function MyLoader(props) {
  return (
    <ContentLoader speed={2} width={800} height={600} viewBox="0 0 800 600" backgroundColor="#f3f3f3" foregroundColor="#ecebeb" {...props}>
      <rect x="0" y="10" rx="5" ry="5" width="420" height="24" />
      <rect x="0" y="45" rx="5" ry="5" width="620" height="18" />
      <rect x="0" y="100" rx="5" ry="5" width="220" height="24" />
      <rect x="0" y="135" rx="5" ry="5" width="520" height="18" />
      <rect x="0" y="190" rx="5" ry="5" width="400" height="24" />
      <rect x="0" y="225" rx="5" ry="5" width="720" height="18" />
      <rect x="0" y="270" rx="5" ry="5" width="360" height="24" />
      <rect x="0" y="305" rx="5" ry="5" width="660" height="18" />
    </ContentLoader>
  )
}

function Start() {
  const [smartMapInstallationAddress, setSmartMapInstallationAddress] = useState({})
  const [smartMapMergedAddress, setSmartMapMergedAddress] = useState([])
  const [invetoryResults, setInventoryResults] = useState([])
  const [invetoryResultsFiltered, setInventoryResultsFiltered] = useState([])

  const [buildingFilter, setBuildingFilter] = useState('')
  const [streetFilter, setStreetFilter] = useState('')
  const [unitFilter, setUnitFilter] = useState('')

  const [searching, setSearching] = useState(false)

  useEffect(async () => {
    if (!smartMapInstallationAddress.Location) return
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
  }, [smartMapInstallationAddress])

  useEffect(() => {
    setUnitFilter('')
    setBuildingFilter('')
    setStreetFilter('')
    searchFuzySolr()
  }, [smartMapMergedAddress])

  useEffect(() => {
    setInventoryResultsFiltered(invetoryResults)
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
    <>
      <Map setSmartMapInstallationAddress={setSmartMapInstallationAddress} setSearching={setSearching} />
      <Container sx={{ p: 3 }}>
        <Flex sx={{ justifyContent: 'space-between', alignItems: 'baseline' }}>
          <Heading sx={{ pt: 6, fontSize: 5, fontWeight: 700 }}>Click on the address that best matches yours below</Heading>
          <Box sx={{ color: 'orange', textDecoration: 'underline', fontSize: 2 }}>Can't find your address?</Box>
        </Flex>
        <Box>
          <Box sx={{ pt: 3, pb: 4, color: 'greys.600', fontSize: 2 }}>
            {searching ? (
              <Box>Searching matching addresses</Box>
            ) : (
              <Box>
                <Box>{invetoryResults.length} matching addresses found for</Box>
                <Box sx={{ fontSize: 0, color: 'greys.400' }}>{smartMapInstallationAddress.FormattedAddress}</Box>
                {invetoryResults.length > 0 ? (
                  <Flex
                    sx={{
                      alignItems: 'baseline',
                      pt: 5,
                      pb: 3,
                      fontSize: 1,
                      color: 'greys.400',
                      width: '100%',
                      // justifyContent: 'space-between',
                    }}
                  >
                    <Flex sx={{ alignItems: 'baseline' }}>
                      Unit:
                      <Input
                        value={unitFilter}
                        onChange={(e) => setUnitFilter(e.target.value)}
                        sx={{
                          ':focus': { outline: 'none' },
                          pb: 0,
                          px: 1,
                          fontSize: 1,
                          width: 70,
                          borderColor: 'greys.200',
                          color: 'greys.400',
                          borderLeft: 'none',
                          borderTop: 'none',
                          borderRight: 'none',
                        }}
                      />
                    </Flex>
                    <Box sx={{ pl: 5 }}>
                      Building: <Option invetoryResults={invetoryResults} field="building" setFilter={setBuildingFilter} />
                    </Box>
                    <Box sx={{ pl: 5 }}>
                      Street: <Option invetoryResults={invetoryResults} field="street" setFilter={setStreetFilter} />
                    </Box>
                  </Flex>
                ) : (
                  <Box />
                )}
              </Box>
            )}
          </Box>
          {/* {searching ? (
            <MyLoader />
          ) : (
            <Box sx={{ pt: 5, pb: 4 }}>
              <VirtualizedSearchResults itemData={invetoryResultsFiltered.map(({ item }) => item)} />
            </Box>
          )} */}

          {/* {searching ? <MyLoader /> : invetoryResultsFiltered.map(({ item }) => <SearchResults key={item.id} item={item} />)} */}
          {searching ? <MyLoader /> : invetoryResultsFiltered.map(({ item }) => <PaginatedSearchResults key={item.id} item={item} />)}
          {/* <Page data={invetoryResultsFiltered.map(({ item }) => item)} /> */}
        </Box>
      </Container>
    </>
  )
}
export default Start

function Page({ data = [] }) {
  const { next, prev, jump, currentData, currentPage, maxPage } = usePagination(data)
  return (
    <Box>
      <Box sx={{ py: 5 }}>
        Page {currentPage} of {data.length} results
      </Box>

      <Box>
        {currentData().map((a) => (
          <Box key={a.id}>
            <Box>
              {a.unit} {a.street}
            </Box>
          </Box>
        ))}

        <Flex sx={{ pt: 6 }}>
          {currentPage !== 1 && (
            <Box sx={{ px: 3, cursor: 'pointer' }} onClick={() => prev()}>
              Previous
            </Box>
          )}

          <Box>
            {[...Array(maxPage > 10 ? 10 : maxPage)].map((_, i) => (
              <Text key={i + 1} sx={{ mx: 2, cursor: 'pointer' }} onClick={() => jump(i + 1)}>
                {i + 1}
              </Text>
            ))}
          </Box>

          {currentPage !== maxPage && (
            <Box sx={{ px: 3, cursor: 'pointer' }} onClick={() => next()}>
              Next
            </Box>
          )}
        </Flex>
      </Box>
    </Box>
  )
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
          fontSize: 6,
          color: 'blue',
          cursor: 'pointer',
          ':hover': { borderColor: 'blue' },
          lineHeight: 1,
          mb: 1,
        }}
      >
        <Text>{item.unit}</Text> <Text sx={{ fontSize: 4 }}>{item.building ? item.building : item.street}</Text>
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

function Row({ data, index, style }) {
  const item = data[index]
  return (
    <Box style={style} sx={{ bg: 'white', py: 3 }}>
      <Box
        sx={{
          borderBottomStyle: 'solid',
          borderWidth: 2,
          borderColor: 'white',
          display: 'inline-block',
          fontSize: 6,
          color: 'blue',
          cursor: 'pointer',
          ':hover': { borderColor: 'blue' },
          lineHeight: 1,
          mb: 1,
        }}
      >
        <Text>{item.unit}</Text> <Text sx={{ fontSize: 4 }}>{item.building ? item.building : item.street}</Text>
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

function VirtualizedSearchResults({ itemData }) {
  return (
    <List height={500} itemData={itemData} itemCount={itemData.length} itemSize={112} width="100%" sx={{ bg: 'white' }}>
      {Row}
    </List>
  )
}

function SearchResults({ item = {} }) {
  return (
    <Box sx={{ pt: 6, pb: 4 }}>
      <Box sx={{ fontSize: 4, color: 'blue', cursor: 'pointer', ':hover': { textDecoration: 'underline' } }}>
        {item.building ? (
          <Text>
            {item.unit}, {item.building}
          </Text>
        ) : (
          <Text>
            {item.unit}, {item.street}
          </Text>
        )}
      </Box>
      <Box sx={{ color: 'greys.800', fontSize: 1 }}>
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

function Option({ invetoryResults = [], field, setFilter }) {
  let optionObj = {}
  invetoryResults.forEach(({ item }) => {
    if (item[field]) {
      optionObj[item[field]] = item[field]
    }
  })
  const options = Object.values(optionObj).sort()

  return (
    <select
      onChange={(e) => setFilter(e.target.value)}
      sx={{
        bg: 'white',
        borderColor: 'greys.200',
        color: 'greys.400',
        borderLeft: 'none',
        borderTop: 'none',
        borderRight: 'none',
        ':focus': { outline: 'none' },
      }}
    >
      <option value="">All</option>
      {options.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
  )
}

function getLocalStorage({ key }) {
  const initialValue = {}
  try {
    const item = window.localStorage.getItem(key)
    return item ? JSON.parse(item) : initialValue
  } catch (error) {
    console.log(error)
    return initialValue
  }
}

function debounce(callback) {
  var timeout = null
  var callbackArgs = null
  var wait = 1000
  var context = this

  function later() {
    return callback.apply(context, callbackArgs)
  }

  return function () {
    callbackArgs = arguments
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

function getParams(locationObj) {
  return Object.entries(locationObj)
    .map(([key, val]) => `${key}=${encodeURIComponent(val)}`)
    .join('&')
}
