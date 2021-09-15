/** @jsxImportSource theme-ui */
import { useState, useEffect, useRef } from 'react'
import { Box, Flex, Input } from 'theme-ui'
import { X } from 'react-feather'
import useWindowSize from '@/utils/hooks/use-window-size'

const fetcher = (...args) => fetch(...args).then((res) => res.json())

export default function AddressInput({ setLng, setLat }) {
  const inputRef = useRef(null)
  const ulRef = useRef(null)

  const [inputValue, setInputValue] = useState('')
  const [inputFocus, setInputFocus] = useState(false)

  const [listSelect, setListSelect] = useState(0)

  const [mapAddress, setMapAddress] = useState('')

  const [autocompleteText, setAutocompleteText] = useState([])

  useEffect(async () => {
    let data = []
    data = inputValue ? await fetcher(`/api/smart-map/autocomplete?q=${inputValue}&limit=10`) : []
    setAutocompleteText((data || []).map(({ text }) => text) || [])
  }, [inputValue])

  useEffect(async () => {
    let data = []
    data = mapAddress ? await fetcher(`/api/smart-map?q=${mapAddress}&limit=1`) : []
    const { lat, lon } = (data[0] || [] || {}).location || {}
    if ((lon, lat)) {
      setLng(lon)
      setLat(lat)
    }
  }, [mapAddress])

  const size = useWindowSize()
  const leftPad = size.width >= 1004 ? (size.width - 1004 + 12) / 2 : '8'

  async function handleInputChange(e) {
    setListSelect(0)
    setInputValue(e.target.value)
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
        setInputFocus(false)
        setMapAddress(autocompleteText[listSelect])
      }
    }
  }

  return (
    <Box sx={{ position: 'absolute', zIndex: 2, top: 2, left: [0, `${leftPad}px`], fontSize: 1, width: ['90%', 420, 600], px: [3, 0] }}>
      <Flex
        sx={{
          width: '100%',
          alignItems: 'center',
          bg: 'white',
          borderColor: 'greys.200',
          borderStyle: 'solid',
          borderWidth: 1,
          borderRadius: 6,
        }}
      >
        <Input
          ref={inputRef}
          onKeyDown={handleKeyDown}
          onChange={handleInputChange}
          value={inputValue}
          placeholder="You can search here to zoom in to your area"
          onFocus={() => setInputFocus(true)}
          onBlur={() => setTimeout(() => setInputFocus(false))}
          sx={{
            width: '100%',
            color: 'greys.600',
            bg: 'white',
            border: 'none',
            textTransform: 'uppercase',
            ':focus': { outline: 'none' },
            '::placeholder': { color: 'greys.300', textTransform: 'none' },
          }}
        />
        <Box sx={{ bg: 'white', px: 2, borderColor: 'greys.200', borderWidth: 1, borderLeftStyle: 'solid' }} onClick={() => setInputValue('')}>
          <X sx={{ position: 'relative', top: '2px', size: 20, color: 'greys.400', ':hover': { color: 'blue' } }} />
        </Box>
      </Flex>

      <ul
        ref={ulRef}
        sx={{
          width: '100%',
          bg: 'white',
          p: 0,
          display: inputFocus ? 'block' : 'none',
          listStyle: 'none',
          m: 0,
          boxShadow: '0 4px 6px hsla(0, 0%, 0%, 0.1)',
          maxHeight: '80vh',
          overflowY: 'auto',
        }}
      >
        {autocompleteText.map((address, i) => (
          <li
            sx={{ py: 2, px: 2, bg: listSelect === i ? 'oranges.100' : 'white' }}
            key={address}
            onClick={() => {
              setInputValue(address)
              setInputFocus(false)
              setMapAddress(address)
            }}
          >
            {address}
          </li>
        ))}
        {autocompleteText.length < 1 && inputValue && (
          <li sx={{ py: 2, px: 2, color: 'greys.500' }} key="not-found">
            Try other address combinations, e.g. type your street name first
          </li>
        )}
      </ul>
    </Box>
  )
}
