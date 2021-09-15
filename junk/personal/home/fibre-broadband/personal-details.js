import { useEffect } from 'react'

function Personal() {
  useEffect(() => {
    const selectedDraftOrder = getLocalStorage({ key: 'selectedDraftOrder' })
    Moengage.track_event('iJoin Hacks Personal')
  }, [])
  return <div>Personal</div>
}

export default Personal

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
