const flattening = 1 / 298.25
const radius = 6378137.0

/**
 * Converts an angle from degrees to radians.
 *
 * @param {number} degree The angle in degrees.
 * @returns {number} The angle in radians.
 */
const degreeToRadian = (degree) => {
    return degree * Math.PI / 180
}

/**
 * Returns the spherical distance between two points on the surface of a
 * slightly oblate spheroid (Earth) in meters.
 *
 * @param {number} x1 X coordinate of the first point
 * @param {number} y1 Y coordinate of the first point
 * @param {number} x2 X coordinate of the second point
 * @param {number} y2 Y coordinate of the second point
 * @returns {number}
 */
const spherical_distance = (x1, y1, x2, y2) => {
    const lat1 = degreeToRadian(y1)
    const lat2 = degreeToRadian(y2)
    const long1 = degreeToRadian(x1)
    const long2 = degreeToRadian(x2)

    const reduced_lat1 = (1 - flattening) * Math.tan(lat1)
    const reduced_lat2 = (1 - flattening) * Math.tan(lat2)
    const P = (reduced_lat1 + reduced_lat2) / 2
    const Q = (reduced_lat2 - reduced_lat1) / 2
    const angle = 2 * Math.asin(Math.sqrt(Math.sin((lat1 - lat2) / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * (Math.sin((long1 - long2) / 2) ** 2)))
    const X = (angle - Math.sin(angle)) * (Math.sin(P) ** 2 * Math.cos(Q) ** 2)/(Math.cos(angle / 2) ** 2)
    const Y = (angle + Math.sin(angle)) * (Math.sin(Q) ** 2 * Math.cos(P) ** 2)/(Math.sin(angle / 2) ** 2)

    return radius * (angle - (flattening / 2) * (X + Y))
}