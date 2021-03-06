import d3 from 'd3';
import CitiesStore from "../stores/CitiesStore.js";
import DimensionsStore from '../stores/DimensionsStore.js';
import GeographyStore from '../stores/GeographyStore.js';

import DorlingLocations from '../../data/dorlingLngLats.json';

export const getColorForRace =  function(weight) {
  if (isNaN(weight) || weight == null) {
    return '#909EAC';
  }
  if (weight >= 0.5) {
    var color1 = [163, 135, 190],
      color2 = [185,185,185], //
      scale = d3.scale.linear()
        .domain([0.5, 1])
        .range([0, 1]),
      weight = scale(weight);
  } else {
    var color1 = [185,185,185],
      color2 = [44, 160, 44],
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

export const getColorForProjectType= function(type, a) {
  a = a || 1;
  let hex= (type == 'R') ? '#DF894A' :
    (type == 'OB') ? '#FFB90F' :
    (type == 'PO') ? '#67C8FF' :
    (type == 'O') ? '#5DFC0A' :
    (type == 'D') ? '#ff0000' :
    (type == 'U') ? '#FF00FF' : '#999999';

  hex = hex.replace('#','');
  const r = parseInt(hex.substring(0,2), 16),
    g = parseInt(hex.substring(2,4), 16),
    b = parseInt(hex.substring(4,6), 16);

  return 'rgba('+r+','+g+','+b+','+a+')';
};

export const formatNumber = function(num, decimal) {
  decimal = (decimal) ? decimal : 0;
  if (num < 1000000 && num >= 1000) {
    return Math.round(num /100) / 10  + 'K';
  }
  return Math.round(num);
};

export const roughNumber = function(num) {
  if (num >= 1000) {
    // round to the nearest 100
    return Math.round(num / 100) * 100;
  } else if (num >= 100) {
    // round to the nearest 50
    return Math.round(num / 50) * 50;
  } else if (num >= 10) {
    // round to the nearest 5
    return Math.round(num / 5) * 5;
  }

  return Math.round(num);
};

export const getMedian = function(args) {
  if (!args.length) {return 0;};
  var numbers = args.slice(0).sort((a,b) => a - b);
  var middle = Math.floor(numbers.length / 2);
  var isEven = numbers.length % 2 === 0;
  return isEven ? (numbers[middle] + numbers[middle - 1]) / 2 : numbers[middle];
};

export const getBottomQuartile = function(args) {
  if (!args.length) {return 0;};
  var numbers = args.slice(0).sort((a,b) => a - b);
  var quart = Math.floor(numbers.length * 0.25);
  var isEven = numbers.length % 2 === 0;
  return isEven ? (numbers[quart] + numbers[quart - 1]) / 2 : numbers[quart];
};

export const getTopQuartile = function(args) {
  if (!args.length) {return 0;};
  var numbers = args.slice(0).sort((a,b) => a - b);
  var quart = Math.floor(numbers.length * 0.75);
  var isEven = numbers.length % 2 === 0;
  return isEven ? (numbers[quart] + numbers[quart - 1]) / 2 : numbers[quart];
};

export const calculateDorlingsPosition = function() {
  let years = [null, 1955, 1956, 1957, 1958, 1959, 1960, 1961, 1962, 1963, 1964, 1965, 1966],
    positions = [];

  years.forEach(year => {
    let nodes = CitiesStore.getDorlingsForceForYear(year);
    console.log('calculating dorlings for ' + year); 
    //console.log(nodes.reduce((a,b) => { return (a.r < b.r) ? a : b; }, {r: 10000}));
    console.log(nodes);
    let q = d3.geom.quadtree(nodes); 
    for (var alpha = 1; alpha > 0; alpha = alpha - 0.001) {


      
      nodes.forEach((node,i) => { 
        q = (i % 100 == 0) ? d3.geom.quadtree(nodes) : q;
        //q = d3.geom.quadtree(nodes);
        node.y += (node.y0 - node.y) * alpha * 0.5;
        node.x += (node.x0 - node.x) * alpha * 0.5;

        // collide 
        var k = 0.5;
        var nr = node.r,
          nx1 = node.x - nr,
          nx2 = node.x + nr,
          ny1 = node.y - nr,
          ny2 = node.y + nr;
        q.visit(function(quad, x1, y1, x2, y2) {
          if (quad.point && !(quad.point.y == node.y && quad.point.x == node.x)) {
            var x = node.x - quad.point.x, // x distance between points
              y = node.y - quad.point.y, // y distance between points
              l = x * x + y * y, // cartesian distance between points
              r = nr + quad.point.r; // the two radii added together
            // executed if they overlap
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

        //node.dorlingLngLat = GeographyStore.albersUsaPr().invert([node.x, node.y]);
      });
    };    
    positions.push({ year: year, cities: nodes.map(node => { return { 
      city_id: node.city_id, 
      x: node.x,
      y: node.y
    }; })});
  });

  return positions; 
};

export const calculateDorlingsPositionUnprojected = function() {
  let projection = GeographyStore.albersUsaPr().translate([0,0]).scale(1);
  let positions = [];
  DorlingLocations.forEach(dorlingsForYear => {
    console.log(dorlingsForYear.cities);
    positions.push({ year: dorlingsForYear.year, cities: dorlingsForYear.cities.map(cityData => {
      console.log(cityData.dorlingLngLat);
      let xy = projection(cityData.dorlingLngLat);
      let x = 1,y = 1;
      console.log(xy);

      return { 
        city_id: cityData.city_id, 
        x: Math.round(x * 10000) / 10000,
        y: Math.round(y * 10000) / 10000
      };
    })});
  });

  return positions;
};


export const calculateDorlingsPositionUnprojected2 = function() {
  let years = [null, 1955, 1956, 1957, 1958, 1959, 1960, 1961, 1962, 1963, 1964, 1965, 1966],
    positions = [],
    dorlingsMaxRadius = 48;

  years.forEach(year => {
    let nodes = CitiesStore.getDorlingsForceForYear(year);
    console.log('calculating dorlings for ' + year); 
    
    for (var alpha = 1; alpha > 0; alpha = alpha - 0.001) {


      var q = d3.geom.quadtree(nodes, 960, 500);
      nodes.forEach(node => { 
        node.y += (node.y0 - node.y) * alpha * node.r/dorlingsMaxRadius;
        node.x += (node.x0 - node.x) * alpha * node.r/dorlingsMaxRadius;

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

        //node.dorlingLngLat = GeographyStore.albersUsaPr().invert([node.x, node.y]);
      });
    };    
    positions.push({ year: year, cities: nodes.map(node => { return { city_id: node.city_id, xy: [node.x, node.y]}; })});
  });

  return positions; 
};