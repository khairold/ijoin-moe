/** @jsxImportSource theme-ui */
import { useState, useEffect } from 'react'
import { Box, Flex, Input, Text } from 'theme-ui'
import { Filter } from 'react-feather'

export default function FilterAddress({ invetoryResults, setUnitFilter, setBuildingFilter, setStreetFilter }) {
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
        mb: [2, 3],
        fontSize: 1,
        color: 'greys.400',
        flexDirection: ['row', 'column'],
        borderTopStyle: show ? 'solid' : 'none',
        borderLeftStyle: show ? 'solid' : 'none',
        borderRightStyle: show ? 'solid' : 'none',
        borderBottomStyle: show ? 'solid' : 'solid',
        borderColor: show ? 'backgroundGrey' : 'greys.200',
        boxShadow: show && '0 4px 6px hsla(0, 0%, 0%, 0.1)',
        borderRadius: show ? 8 : 0,
        borderWidth: 1,
        pt: 2,
        pb: show ? 4 : 0,
        px: show ? 4 : 0,
        bg: 'white',
      }}
    >
      {!show ? (
        <Flex onClick={() => setShow(true)} sx={{ cursor: 'pointer', pb: show ? 3 : 2, width: '100%' }}>
          <Filter sx={{ color: 'greys.500', size: [14, 16] }} /> <Text sx={{ color: 'greys.500', fontSize: [0, 1], pl: 1 }}>Filter</Text>
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
                  color: 'greys.500',
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
          color: 'greys.500',
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
