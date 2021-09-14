import { useEffect } from 'react'

function Review() {
  useEffect(() => {
    const selectedDraftOrder = getLocalStorage({ key: 'selectedDraftOrder' })
    Moengage.track_event('iJoin Hacks Review')
  }, [])
  return <div>Review</div>
}

export default Review

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
