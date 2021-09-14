import { fetchSmartMapBackend, buildPath, responseFromFetch } from '@/utils/backend'

const orderDetailsUrl = '/search'
export default async function handler(req, res) {
  if (req.method === 'GET') {
    responseFromFetch(
      res,
      fetchSmartMapBackend(buildPath(orderDetailsUrl, req.query), {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      })
    )
  }
}
