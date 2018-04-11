/**
 * @file gravity-lab constants.
 * 
 * @author Alejandro Ambroa <jandroz@gmail.com>
 * @version 1.0.0
 */

exports.constants = {
    UA: 149597870700, // meters
    G: -6.67428e-11,
    DEFAULT_SCALE: 1 / (1e9), // 1px = SCALE meters
    DEFAULT_VELOCITY_SCALE: 1000, // 1px = 1000 m/s
    DEFAULT_TIMESTEP:  1* 24 * 3600, // advance one day
    DEFAULT_DT: 3600, // integration difference
    DEFAULT_GRID_SIZE: 100, // px
    RADIUS_SCALE_THRESHOLD: 100000,
    DEFAULT_time_scale: 800000 // each second is X seconds
}
