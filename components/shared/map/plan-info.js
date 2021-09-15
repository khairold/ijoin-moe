/** @jsxImportSource theme-ui */
import { Box } from 'theme-ui'
import useWindowSize from '@/utils/hooks/use-window-size'

export default function PlanInfo({ speed, price }) {
  const size = useWindowSize()
  const rightPad = size.width >= 1004 ? (size.width - 1004 + 12) / 2 : '8'
  return (
    <Box sx={{ position: 'absolute', bottom: [2, 3], right: [`${rightPad}px`], zIndex: 1 }}>
      <Box
        sx={{
          textAlign: 'right',
          px: [3, 4],
          py: [2, 3],
          bg: 'rgba(35, 55, 75, 0.9)',
          position: 'relative',
          borderRadius: 4,
          color: 'white',
          display: 'inline-block',
        }}
      >
        <Box sx={{ pb: [1, 3] }}>
          <img src="/images/unifi-logo-grey.svg" alt="unifi" sx={{ height: [16, 20] }} />
        </Box>

        <Box sx={{ fontSize: [1, 2], fontWeight: 700 }}>unifi {speed}Mbps</Box>
        <Box sx={{ fontSize: 0, color: '#C6D4E3' }}>RM{price} / Month</Box>
      </Box>
    </Box>
  )
}
