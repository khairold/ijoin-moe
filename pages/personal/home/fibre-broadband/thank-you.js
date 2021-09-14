import { useEffect } from 'react'

function ThankYou() {
  useEffect(() => {
    const selectedDraftOrder = getLocalStorage({ key: 'selectedDraftOrder' })
    Moengage.track_event('iJoin Hacks Thank You')
  }, [])
  return <div>Thank You</div>
}

export default ThankYou

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
