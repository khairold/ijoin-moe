function unifiMarker() {
  const el = document.createElement('div')
  el.style.backgroundImage = `url(/images/unifi-marker.png)`
  el.style.width = `27px`
  el.style.height = `38px`
  el.style.backgroundSize = 'cover'
  el.style.display = 'block'
  el.style.border = 'none'
  el.style.cursor = 'pointer'
  el.style.padding = 0

  return el
}

export default unifiMarker
