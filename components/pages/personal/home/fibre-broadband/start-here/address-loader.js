/** @jsxImportSource theme-ui */
import { useEffect, useState } from 'react'
import { Box, Flex, Button, Input } from 'theme-ui'
import ContentLoader from 'react-content-loader'
import useWindowSize from '@/utils/hooks/use-window-size'

export default function AddressLoader({ validated, setValidated }) {
  const [internalValidated, setInternalValidated] = useState(validated)
  const [showPayWall, setShowPayWall] = useState(false)
  const size = useWindowSize()

  useEffect(() => {
    if (internalValidated) {
      setShowPayWall(false)
      return
    }
    let payWallTimer = setTimeout(() => setShowPayWall(true), 1500)
    return () => {
      clearTimeout(payWallTimer)
    }
  }, [])

  const height = 360
  const adjustedWidth = size.width >= 1004 ? 1004 - 24 : size.width - 24

  if (!size.width) return <></>

  return (
    <Box sx={{ position: 'relative' }}>
      {showPayWall && (
        <Flex
          sx={{
            width: '100%',
            height: '100vh',
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.2), rgba(240,240,240,0.8), rgba(222,222,222,1))',
            position: 'fixed',
            bottom: 0,
            left: 0,
            justifyContent: 'flex-end',
            px: 3,
            pb: 9,
            flexDirection: 'column',
            alignItems: 'center',
            zIndex: 3,
          }}
        >
          <Box
            sx={{
              borderStyle: 'solid',
              borderColor: 'greys.200',
              borderRadius: 8,
              borderWidth: 1,
              p: 5,
              bg: 'white',
              width: [300],
            }}
          >
            <Box sx={{ pb: 5, fontSize: 3, color: 'greys.800' }}>Validate your phone number to reveal unifi addresses:</Box>
            <Box>
              <Flex sx={{ alignItems: 'baseline' }}>
                <Box sx={{ pr: 2 }}>+60</Box>
                <Input sx={{ borderColor: 'greys.200' }} />
              </Flex>
              <Box sx={{ textAlign: 'right', pt: [4, 6] }}>
                <Button
                  sx={{ px: [3, 4], py: [2, 3], cursor: 'pointer' }}
                  onClick={() => {
                    setInternalValidated(true)
                    setValidated(true)
                  }}
                >
                  Request TAC
                </Button>
              </Box>
            </Box>
          </Box>
        </Flex>
      )}

      <ContentLoader speed={2} width={adjustedWidth} height={height} viewBox={`0 0 ${adjustedWidth} 360`} backgroundColor="#f3f3f3" foregroundColor="#ecebeb">
        <rect x="0" y="10" rx="5" ry="5" width={adjustedWidth * 0.525} height="24" />
        <rect x="0" y="45" rx="5" ry="5" width={adjustedWidth * 0.775} height="18" />
        <rect x="0" y="100" rx="5" ry="5" width={adjustedWidth * 0.275} height="24" />
        <rect x="0" y="135" rx="5" ry="5" width={adjustedWidth * 0.65} height="18" />
        <rect x="0" y="190" rx="5" ry="5" width={adjustedWidth * 0.5} height="24" />
        <rect x="0" y="225" rx="5" ry="5" width={adjustedWidth * 0.85} height="18" />
        <rect x="0" y="270" rx="5" ry="5" width={adjustedWidth * 0.45} height="24" />
        <rect x="0" y="305" rx="5" ry="5" width={adjustedWidth * 0.825} height="18" />
      </ContentLoader>
    </Box>
  )
}
