export default async function handler(req, res) {
  const tiles = await fetch(
    `https://www.smartmap.tm.com.my/api/map/wmts?api_key=${process.env.NEXT_PUBLIC_TM_SMARTMAP_API_KEY}&request=GetTile&layer=Malaysia:TMOneSmartMap&format=image/png&TILEMATRIXSET=EPSG:3857&TILEMATRIX=EPSG:3857:{z}&TILEROW={y}&TILECOL={x}`
  )

  console.log(tiles)
  res.status(200).send(tiles)
}
