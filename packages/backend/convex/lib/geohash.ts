import ngeohash from 'ngeohash'

export const geohash = {
  /**
   * Encode a pair of coordinates into a geohash
   * @param lat Latitude
   * @param lon Longitude
   * @param precision Precision (default 9, approx 4mb)
   */
  encode: (lat: number, lon: number, precision = 9) => {
    return ngeohash.encode(lat, lon, precision)
  },

  /**
   * Decode a geohash into a pair of coordinates
   */
  decode: (hash: string) => {
    return ngeohash.decode(hash)
  },

  /**
   * Decode a geohash into a bounding box
   */
  decode_bbox: (hash: string) => {
    const bbox = ngeohash.decode_bbox(hash)
    return {
      minLat: bbox[0],
      minLon: bbox[1],
      maxLat: bbox[2],
      maxLon: bbox[3],
    }
  },

  /**
   * Get all 8 neighbors of a geohash
   */
  neighbors: (hash: string) => {
    return ngeohash.neighbors(hash)
  },
}
