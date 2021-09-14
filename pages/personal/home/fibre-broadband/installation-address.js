import { useEffect } from 'react'

function Installation() {
  useEffect(() => {
    const selectedDraftOrder = getLocalStorage({ key: 'selectedDraftOrder' })
    Moengage.track_event('iJoin Hacks Installation')
  }, [])
  return <div>Installation</div>
}

export default Installation

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
