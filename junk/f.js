/** @jsxImportSource theme-ui */
import { useState, useEffect } from 'react'
import { Box, Heading, Container, Input } from 'theme-ui'
import dynamic from 'next/dynamic'
import Fuse from 'fuse.js'

export default function F() {
  const [re, setRe] = useState([])
  useEffect(() => {
    const arr = [{ name: '1' }, { name: 'Lala' }, { name: '12' }, { name: 'yoyoma' }]
    const options = {
      includeScore: true,
      ignoreLocation: true,
      threshold: 1.0,
      keys: ['name'],
    }
    const fuse = new Fuse(arr, options)

    const fuseResult = fuse.search('1')

    const finalArr = includeNotFound(fuseResult, arr)
    setRe(finalArr)
  }, [])

  return (
    <Box>
      <pre>{JSON.stringify(re, null, 2)}</pre>
    </Box>
  )
}

function includeNotFound(fuseResult, oriArr) {
  let tempArr = []
  oriArr.forEach((f, index) => {
    const found = fuseResult.find(({ refIndex }) => {
      return refIndex === index
    })
    if (!found) {
      tempArr.push({ item: f })
    }
  })
  const combinedArr = [...fuseResult, ...tempArr]
  return combinedArr
}
