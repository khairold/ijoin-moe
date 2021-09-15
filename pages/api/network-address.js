import { fetchBackend, buildPath, responseFromFetch } from '@/utils/backend'

const coordinatesAddressSearchUrl = '/network-address'
// const coordinatesAddressSearchUrl = '/myunifi/coverage/v1/pre/ijoin/coordinates/address'

export default async function handler(req, res) {
  if (Object.prototype.hasOwnProperty.call(req.query, 'coordinate')) {
    const coordinateComponents = req.query.coordinate.split(',')
    if (coordinateComponents.length >= 2) {
      req.query.latitude = coordinateComponents[0]
      req.query.longitude = coordinateComponents[1]
      delete req.query.coordinate
    }
  }

  responseFromFetch(res, fetchBackend(buildPath(coordinatesAddressSearchUrl, req.query)))
}
