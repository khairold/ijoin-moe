import { useEffect } from 'react'

function AddOn() {
  useEffect(() => {
    const selectedDraftOrder = getLocalStorage({ key: 'selectedDraftOrder' })
    Moengage.track_event('iJoin Hacks Add-on')
  }, [])
  return <div>Add-on</div>
}

export default AddOn

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
