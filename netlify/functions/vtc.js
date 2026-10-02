exports.handler = async function handler(event) {
  const reqId = Math.random().toString(36).slice(2, 8)
  try {
    const path = event.path || ''
    console.log(`[vtc][${reqId}] incoming`, { path })
    const match = path.match(/\/vtc\/(\d+)(.*)$/)
    const id = match && match[1]
    const rest = match && match[2] ? match[2] : ''

    if (!id) {
      console.warn(`[vtc][${reqId}] missing id`)
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({ error: true, message: 'Missing VTC id in path' }),
      }
    }

    const query = event.rawQuery ? `?${event.rawQuery}` : ''
    const upstreamPath = rest.replace(/\/$/, '')
    const url = `https://api.truckersmp.com/v2/vtc/${id}${upstreamPath}${query}`
    console.log(`[vtc][${reqId}] fetching`, url)
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'TamilPasangaVTC/1.0 (+https://whimsical-parfait-ba3196.netlify.app)',
        'Accept': 'application/json',
      },
    })

    const text = await response.text()
    console.log(`[vtc][${reqId}] upstream status`, response.status)

    return {
      statusCode: response.status,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=300',
        'Access-Control-Allow-Origin': '*',
      },
      body: text,
    }
  } catch (error) {
    console.error(`[vtc][${reqId}] error`, error)
    return {
      statusCode: 502,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({ error: true, message: 'Upstream request failed', details: String(error && error.message ? error.message : error) }),
    }
  }
}

