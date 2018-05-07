/**
 * @file gravity-lab constants.
 * 
 * @author Alejandro Ambroa <jandroz@gmail.com>
 * @version 1.0.0
 */


module.exports = {
    UA: 149597870.7, // meters
    G: -6.67428e-11,
    DEFAULT_SCALE: (1e6), // 1px = SCALE km
    DEFAULT_VELOCITY_SCALE: 0.1, // 1px = X km/s
    DEFAULT_TIMESTEP:  1* 24 * 3600, // advance one day
    DEFAULT_GRID_SIZE: 100, // px
    DIAMETER_SCALE_THRESHOLD: 100,
    DEFAULT_TIME_SCALE: 864000, // seconds by real time second
    STAR_DEFAULT_MASS: 1.98e30,
    STAR_DEFAULT_COLOR: '#ffff00',
    STAR_DEFAULT_DIAMETER: 1.39e6,
    BODY_DEFAULT_MASS: 5.98e24,
    BODY_DEFAULT_DIAMETER: 12756
};
