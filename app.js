const ee = require('@google/earthengine')
const fastify = require('fastify')({
    logger: false,
    disableRequestLogging: false
});

fastify.register(require('./plugins/gee.js'))

// Declare a route
fastify.get('/modis', async (request, reply) => {
    fastify.ee(() =>{
        let col = ee.ImageCollection('MODIS/006/MOD13A2').select('NDVI');
        // Define a mask to clip the NDVI data by.
        const mask = ee.FeatureCollection('USDOS/LSIB_SIMPLE/2017')
            .filter(ee.Filter.eq('country_co', 'BR'));

        // Define the regional bounds of animation frames.
        const region = ee.Geometry.Polygon(
            [
                [
                    [
                        -75.673828125,
                        -34.161818161230386
                    ],
                    [
                        -32.16796875,
                        -34.161818161230386
                    ],
                    [
                        -32.16796875,
                        6.227933930268672
                    ],
                    [
                        -75.673828125,
                        6.227933930268672
                    ],
                    [
                        -75.673828125,
                        -34.161818161230386
                    ]
                ]
            ],
            null, false
        );

        col = col.map(function(img) {
            const doy = ee.Date(img.get('system:time_start')).getRelative('day', 'year');
            return img.set('doy', doy);
        });
        const distinctDOY = col.filterDate('2021-01-01', '2022-01-01');

        // Define a filter that identifies which images from the complete collection
        // match the DOY from the distinct DOY collection.
        const filter = ee.Filter.equals({leftField: 'doy', rightField: 'doy'});

        // Define a join.
        const join = ee.Join.saveAll('doy_matches');

        // Apply the join and convert the resulting FeatureCollection to an
        // ImageCollection.
        const joinCol = ee.ImageCollection(join.apply(distinctDOY, col, filter));

        // Apply median reduction among matching DOY collections.
        const comp = joinCol.map(function(img) {
            const doyCol = ee.ImageCollection.fromImages(
                img.get('doy_matches')
            );
            return doyCol.reduce(ee.Reducer.median());
        });

        // Define RGB visualization parameters.
        const visParams = {
            min: 0.0,
            max: 9000.0,
            palette: [
                'FFFFFF', 'CE7E45', 'DF923D', 'F1B555', 'FCD163', '99B718', '74A901',
                '66A000', '529400', '3E8601', '207401', '056201', '004C00', '023B01',
                '012E01', '011D01', '011301'
            ],
        };

        // Create RGB visualization images for use as animation frames.
        const rgbVis = comp.map(function(img) {
            return img.visualize(visParams).clip(mask);
        });

        const gifParams = {
            'region': region,
            'dimensions': 600,
            'crs': 'EPSG:3857',
            'framesPerSecond': 10
        };

        reply
            .code(200)
            .header('Content-Type', 'application/json; charset=utf-8')
            .send({thumb: rgbVis.getVideoThumbURL(gifParams)})
    })
})

fastify.get('/sebop', async (request, reply) => {
    fastify.ee(() =>{
        let col = ee.ImageCollection('MODIS/006/MOD13A2').select('NDVI');
        // Define a mask to clip the NDVI data by.
        const mask = ee.FeatureCollection('USDOS/LSIB_SIMPLE/2017')
            .filter(ee.Filter.eq('country_co', 'BR'));

        // Define the regional bounds of animation frames.
        const region = ee.Geometry.Polygon(
            [
                [
                    [
                        -75.673828125,
                        -34.161818161230386
                    ],
                    [
                        -32.16796875,
                        -34.161818161230386
                    ],
                    [
                        -32.16796875,
                        6.227933930268672
                    ],
                    [
                        -75.673828125,
                        6.227933930268672
                    ],
                    [
                        -75.673828125,
                        -34.161818161230386
                    ]
                ]
            ],
            null, false
        );

        col = col.map(function(img) {
            const doy = ee.Date(img.get('system:time_start')).getRelative('day', 'year');
            return img.set('doy', doy);
        });
        const distinctDOY = col.filterDate('2021-01-01', '2022-01-01');

        // Define a filter that identifies which images from the complete collection
        // match the DOY from the distinct DOY collection.
        const filter = ee.Filter.equals({leftField: 'doy', rightField: 'doy'});

        // Define a join.
        const join = ee.Join.saveAll('doy_matches');

        // Apply the join and convert the resulting FeatureCollection to an
        // ImageCollection.
        const joinCol = ee.ImageCollection(join.apply(distinctDOY, col, filter));

        // Apply median reduction among matching DOY collections.
        const comp = joinCol.map(function(img) {
            const doyCol = ee.ImageCollection.fromImages(
                img.get('doy_matches')
            );
            return doyCol.reduce(ee.Reducer.median());
        });

        // Define RGB visualization parameters.
        const visParams = {
            min: 0.0,
            max: 9000.0,
            palette: [
                'FFFFFF', 'CE7E45', 'DF923D', 'F1B555', 'FCD163', '99B718', '74A901',
                '66A000', '529400', '3E8601', '207401', '056201', '004C00', '023B01',
                '012E01', '011D01', '011301'
            ],
        };

        // Create RGB visualization images for use as animation frames.
        const rgbVis = comp.map(function(img) {
            return img.visualize(visParams).clip(mask);
        });

        const gifParams = {
            'region': region,
            'dimensions': 600,
            'crs': 'EPSG:3857',
            'framesPerSecond': 10
        };

        reply
            .code(200)
            .header('Content-Type', 'application/json; charset=utf-8')
            .send({thumb: rgbVis.getVideoThumbURL(gifParams)})
    })
})
// Run the server!
exports.start = async() => {
    try {
        await fastify.listen(parseInt(process.env.PORT));
        console.log(process.env.APP_NAME, `listening on http://localhost:${fastify.server.address().port} and worker ${process.pid}`);
    } catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
}
