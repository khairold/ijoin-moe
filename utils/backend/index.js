import querystring from 'querystring'

async function fetchBackend(path, config = { method: 'GET' }) {
  const apiKeyHeader = process.env.NEXT_PUBLIC_API_KEY_HEADER || 'X-Gravitee-Api-Key'
  const apiKeyValue = process.env.NEXT_PUBLIC_API_KEY_VALUE || '0eab24a6-5163-4de6-a8e0-16f80edfa23c'
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://dev.myu.unifi.com.my/myunifi-dev/api'

  if (typeof window !== 'undefined') {
    throw new Error('Coding Error: fetchBackend should not be called from client-side code in order to protect API key')
  }

  config.headers = {
    Accept: 'application/json',
    'Content-Type': 'application/x-www-form-urlencoded',
    ...(config.headers || {}),
    [apiKeyHeader]: apiKeyValue,
  }

  const apiUrl = `${apiBaseUrl}${path}`
  if (!(process.env.NODE_ENV || '').startsWith('prod')) {
    console.log(`Calling ${config.method} ${apiUrl} ...`)
  }

  return fetch(apiUrl, config)
}

async function fetchSmartMapBackend(path, config = { method: 'GET' }) {
  const apiBaseUrl = 'https://www.smartmap.tm.com.my/api'
  if (typeof window !== 'undefined') {
    throw new Error('Coding Error: fetchBackend should not be called from client-side code in order to protect API key')
  }
  config.headers = {
    Accept: 'application/json',
    'Content-Type': 'application/x-www-form-urlencoded',
    ...(config.headers || {}),
  }

  const apiKey =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoiZGVtbyIsImNyZWRpdElEIjo3MSwicGFyZW50SUQiOjAsImlhdCI6MTU4MjUyNTI1OX0.c6YWrNf_7k9yGCiA6DW5HYi22CWe6XfkIESJXKXaFgs'

  const apiUrl = `${apiBaseUrl}${path}&api_key=${apiKey}`
  if (!(process.env.NODE_ENV || '').startsWith('prod')) {
    console.log(`Calling ${config.method} ${apiUrl} ...`)
  }
  return fetch(apiUrl, config)
}

function buildPath(path, queryParams = {}) {
  // if path already has query parameters, parse it and append queryObject to it
  let qmarkpos = path.indexOf('?')
  if (qmarkpos > -1) {
    queryParams = {
      ...querystring.parse(path.substr(qmarkpos + 1)),
      ...queryParams,
    }
    path = path.substr(0, qmarkpos)
  }
  return path + (Object.keys(queryParams).length > 0 ? `?${new URLSearchParams(queryParams)}` : '')
}

function responseFromFetch(response, fetchPromise) {
  fetchPromise
    .then((r) => {
      response.status(r.status).json(r.body)
    })
    .catch((error) => {
      response.status(500).json({ error })
    })
}

export { fetchBackend, fetchSmartMapBackend, buildPath, responseFromFetch }
