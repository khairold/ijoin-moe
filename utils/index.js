export function getParams(locationObj) {
  return Object.entries(locationObj)
    .map(([key, val]) => `${key}=${encodeURIComponent(val)}`)
    .join('&')
}
