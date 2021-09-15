/** @jsxImportSource theme-ui */

import { Box, Text } from 'theme-ui'

export default function PaginatedSearchResults({ item }) {
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
