var JSONStream = require('JSONStream');
var fs = require('fs');
var turf = require('turf');

var rs = fs.createReadStream('./crimes.json');
var js = JSONStream.parse('.data.*');
pace = require('pace')(5738523);

// pipe data from the crimes.json file so memory usage is kept low
rs.pipe(js);

// create 1/2 mi grid over chicago
var bbox = [ -87.934324986, 41.644580105, -87.524388789, 42.023024908 ];
var grid = turf.squareGrid(bbox, 0.5, 'miles');
fs.writeFileSync('grid.geojson', JSON.stringify(grid));
grid.features.forEach(function(cell) {
    // precompute bboxes
    cell.bbox = turf.extent(cell);
    cell.properties.total = 0;
});

var months = {};
js.on('data', function (obj) {
    pace.op();
    // check for valid lat, lons
    if(obj[28] && obj[27]) {
        var pt = turf.point([parseFloat(obj[28]), parseFloat(obj[27])]);
        for(var i = 0; i < grid.features.length; i++) {
            if(pt.geometry.coordinates[0] >= grid.features[i].bbox[0] &&
               pt.geometry.coordinates[0] <= grid.features[i].bbox[2] &&
               pt.geometry.coordinates[1] >= grid.features[i].bbox[1] &&
               pt.geometry.coordinates[1] <= grid.features[i].bbox[3] &&
               turf.inside(pt, grid.features[i])) {
                var dateParts = obj[10].split('-');
                var month = dateParts[0]+'/'+dateParts[1];
                months[month] = true;
                if(!grid.features[i].properties[month]) grid.features[i].properties[month] = 0;
                grid.features[i].properties[month]++;
                grid.features[i].properties.total++;
                break;
            }
        }
    }
});

js.on('end', function() {
    months = Object.keys(months);
    // remove cells with no crimes across all months
    grid.features = grid.features.filter(function(cell) {
        if(cell.properties.total > 0) return true;
    });
    // populate undefined months with a 0 value
    grid.features.forEach(function(cell) {
        delete cell.bbox;
        months.forEach(function(month) {
            if(!cell.properties[month]) cell.properties[month] = 0;
        });
    });
    fs.writeFileSync('grid_dates.geojson', JSON.stringify(grid));
    console.log('complete');
});

