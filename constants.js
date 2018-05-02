/**
 * @file gravity-lab constants.
 * 
 * @author Alejandro Ambroa <jandroz@gmail.com>
 * @version 1.0.0
 */

module.exports = {
    UA: 149597870700, // meters
    G: -6.67428e-11,
    DEFAULT_SCALE: 1 / (1e9), // 1px = SCALE meters
    DEFAULT_VELOCITY_SCALE: 100, // 1px = 1000 m/s
    DEFAULT_TIMESTEP:  1* 24 * 3600, // advance one day
    DEFAULT_DT: 3600, // integration difference
    DEFAULT_GRID_SIZE: 100, // px
    RADIUS_SCALE_THRESHOLD: 100000,
    DEFAULT_TIME_SCALE: 86400, // seconds by real time second
    STAR_DEFAULT_MASS: 1.98e30,
    STAR_DEFAULT_COLOR: '#ffff00',
    STAR_DEFAULT_RADIUS: 698700,
    BODY_DEFAULT_MASS: 5.98e24,
    BODY_DEFAULT_RADIUS: 6400
};
