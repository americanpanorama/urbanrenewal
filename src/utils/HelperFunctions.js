import d3 from 'd3';
import CitiesStore from "../stores/CitiesStore.js";
import DimensionsStore from '../stores/DimensionsStore.js';
import GeographyStore from '../stores/GeographyStore.js';

export const getColorForRace =  function(weight) {
  if (weight >= 0.5) {
    var color1 = [44, 160, 44],
      color2 = [255,231,97],
      scale = d3.scale.linear()
        .domain([0.5, 1])
        .range([0, 1]),
      weight = scale(weight);
  } else {
    var color1 = [255,231,97],
      color2 = [163, 135, 190],
      scale = d3.scale.linear()
        .domain([0, 0.5])
        .range([0, 1]),
      weight = scale(weight);
  }

  var p = weight;
  var w = p * 2 - 1;
  var w1 = (w/1+1) / 2;
  var w2 = 1 - w1;
  var rgb = [Math.round(color1[0] * w1 + color2[0] * w2),
      Math.round(color1[1] * w1 + color2[1] * w2),
      Math.round(color1[2] * w1 + color2[2] * w2)];
  return 'rgb(' + rgb + ')';
};

export const calculateDorlingsPosition = function() {
  let years = [null, 1955, 1956, 1957, 1958, 1959, 1960, 1961, 1962, 1963, 1964, 1965, 1966],
    positions = [];

  years.forEach(year => {
    let nodes = CitiesStore.getDorlingsForceForYear(year);
    console.log('calculating dorlings for ' + year); 
    
    for (var alpha = 1; alpha > 0; alpha = alpha - 0.001) {


      var q = d3.geom.quadtree(nodes, DimensionsStore.getNationalMapWidth(), DimensionsStore.getNationalMapHeight());
      nodes.forEach(node => { 
        node.y += (node.y0 - node.y) * alpha * node.r/DimensionsStore.data.dorlingsMaxRadius;
        node.x += (node.x0 - node.x) * alpha * node.r/DimensionsStore.data.dorlingsMaxRadius;

        // collide 
        var k = 0.5;
        var nr = node.r,
          nx1 = node.x - nr,
          nx2 = node.x + nr,
          ny1 = node.y - nr,
          ny2 = node.y + nr;
        q.visit(function(quad, x1, y1, x2, y2) {
          if (quad.point && (quad.point !== node)) {
            var x = node.x - quad.point.x,
              y = node.y - quad.point.y,
              l = x * x + y * y,
              r = nr + quad.point.r;
            if (l < r * r) {
              l = ((l = Math.sqrt(l)) - r) / l * k;
              node.x -= x *= l;
              node.y -= y *= l;
              quad.point.x += x;
              quad.point.y += y;
            }
          }
          return x1 > nx2 || x2 < nx1 || y1 > ny2 || y2 < ny1;
        });

        node.cx = node.x;
        node.cy = node.y;

        node.dorlingLngLat = GeographyStore.getProjection().invert([node.x, node.y]);
      });
    };    
    positions.push({ year: year, cities: nodes.map(node => { return { city_id: node.city_id, dorlingLngLat: node.dorlingLngLat}; })});
  });

  return positions; 
};