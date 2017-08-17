import { EventEmitter } from 'events';
import AppDispatcher from '../utils/AppDispatcher';
import { AppActionTypes } from '../utils/AppActionCreator';
import CartoDBLoader from '../utils/CartoDBLoader';
import USTopoJson from '../../data/us.json';
import * as topojson from 'topojson';
import * as d3 from 'd3';
import DimensionsStore from './DimensionsStore';
import CitiesStore from './CitiesStore';

const GeographyStore = {

  data: {
    x: 0,
    y: 0,
    z: 1,
    loaded: false,
    lower48Geojson: {},
    lat: null,
    lng: null,
    zoom: 14,
    theMap: null
  },

  dataLoader: CartoDBLoader,

  // SETTERS

  setTheMap: function (theMap) {
    this.data.theMap = theMap;
    this.emit(AppActionTypes.storeChanged);
  },

  setView(lat,lng,zoom) {
    this.data.lat = lat;
    this.data.lng = lng;
    this.data.zoom = zoom;
    this.emit(AppActionTypes.storeChanged);
  },

  setViewFromBounds(city_id) {
    this.data.lat = (CitiesStore.getCityData(city_id).center) ? CitiesStore.getCityData(city_id).center[0] : 0;
    this.data.lng = (CitiesStore.getCityData(city_id).center) ? CitiesStore.getCityData(city_id).center[1] : 0;
    this.data.zoom = (CitiesStore.getCityData(city_id).boundingBox) ? this.data.theMap.getBoundsZoom(CitiesStore.getCityData(city_id).boundingBox) : 12;
    this.emit(AppActionTypes.storeChanged);
  },

  setXYZ: function(x,y,z) {
    this.data.x = Math.round(x * 100) / 100;
    this.data.y = Math.round(y * 100) / 100;
    this.data.z = Math.round(z * 100) / 100;

    this.emit(AppActionTypes.storeChanged);
  },

  // GETTERS

  getBoundingBox: function() {
    const topLeftX = (this.getX() * -1) / (DimensionsStore.getNationalMapWidth() * this.getZ()) * DimensionsStore.getNationalMapWidth(),
      topLeftY = (this.getY() * -1) / (DimensionsStore.getNationalMapHeight() * this.getZ()) * DimensionsStore.getNationalMapHeight(),
      bottomRightX = topLeftX + DimensionsStore.getNationalMapWidth() / this.getZ(),
      bottomRightY = topLeftY + DimensionsStore.getNationalMapHeight() / this.getZ();
    return [[topLeftX, topLeftY], [bottomRightX, bottomRightY]];

    return [this.getProjection().invert([topLeftX, topLeftY]), this.getProjection().invert([bottomRightX, bottomRightY])];
  },

  getBoundsForState: function(id) {
    let geojson = this.getStateGeojson(id);
    return this.getPathFunction().bounds(geojson.geometry);
  },

  getCentroidForState: function(id) {
    let geojson = this.getStateGeojson(id);
    return this.getPathFunction().centroid(geojson.geometry);
  },

  getLatLngZoom: function() {
    return {
      lat: this.data.lat,
      lng: this.data.lng,
      zoom: this.data.zoom
    };
  },

  updateLOC: function() {
    const center = this.getTheMap().getCenter();
    this.data.zoom = this.getTheMap().getZoom();
    this.data.lat = center.lat;
    this.data.lng = center.lng;
    this.emit(AppActionTypes.storeChanged);
  },

  getLower48: function() {
    return USTopoJson;
  },

  getStatesGeojson: function() { return topojson.feature(USTopoJson, USTopoJson.objects.states).features; },

  getStateGeojson: function(id) { return this.getStatesGeojson().filter(d => d.id == id)[0]; },

  getPathFunction: function() { return d3.geo.path().projection(this.getProjection()); },

  getPath: function(g) { return this.getPathFunction()(g); },

  getTheMap: function() { return this.data.theMap; },

  getVisibleBounds: function() { return this.data.theMap.getBounds(); },

  getProjection: function() {
    return this.albersUsaPr()
      .scale(DimensionsStore.getMapScale())
      .translate([DimensionsStore.getNationalMapWidth()/2, DimensionsStore.getNationalMapHeight()/2]);
  },

  getX: function() { return this.data.x; },

  getY: function() { return this.data.y; },

  getZ: function() { return this.data.z; },

  getXYZ: function() { 
    return { 
      x: this.getX(),
      y: this.getY(),
      z: this.getZ()
    };
  },

  projected: function(latLng) { return this.getProjection()(latLng); },

  projectedX: function(latLng) { return this.getProjection()(latLng)[0]; },

  projectedY: function(latLng) { return this.getProjection()(latLng)[1]; },

  // A modified d3.geo.albersUsa to include Puerto Rico.
  albersUsaPr: function() {
    var ε = 1e-6;

    var lower48 = d3.geo.albers();

    // EPSG:3338
    var alaska = d3.geo.conicEqualArea()
        .rotate([154, 0])
        .center([-2, 58.5])
        .parallels([55, 65]);

    // ESRI:102007
    var hawaii = d3.geo.conicEqualArea()
        .rotate([157, 0])
        .center([-3, 19.9])
        .parallels([8, 18]);

    // XXX? You should check that this is a standard PR projection!
    var puertoRico = d3.geo.conicEqualArea()
        .rotate([66, 0])
        .center([0, 18])
        .parallels([8, 18]);

    var point,
      pointStream = {point: function(x, y) { point = [x, y]; }},
      lower48Point,
      alaskaPoint,
      hawaiiPoint,
      puertoRicoPoint;

    function albersUsa(coordinates) {
      var x = coordinates[0], y = coordinates[1];
      point = null;
      (lower48Point(x, y), point)
          || (alaskaPoint(x, y), point)
          || (hawaiiPoint(x, y), point)
          || (puertoRicoPoint(x, y), point);
      return point;
    }

    albersUsa.invert = function(coordinates) {
      var k = lower48.scale(),
        t = lower48.translate(),
        x = (coordinates[0] - t[0]) / k,
        y = (coordinates[1] - t[1]) / k;
      return (y >= .120 && y < .234 && x >= -.425 && x < -.214 ? alaska
          : y >= .166 && y < .234 && x >= -.214 && x < -.115 ? hawaii
          : y >= .204 && y < .234 && x >= .320 && x < .380 ? puertoRico
          : lower48).invert(coordinates);
    };

    // A naïve multi-projection stream.
    // The projections must have mutually exclusive clip regions on the sphere,
    // as this will avoid emitting interleaving lines and polygons.
    albersUsa.stream = function(stream) {
      var lower48Stream = lower48.stream(stream),
        alaskaStream = alaska.stream(stream),
        hawaiiStream = hawaii.stream(stream),
        puertoRicoStream = puertoRico.stream(stream);
      return {
        point: function(x, y) {
          lower48Stream.point(x, y);
          alaskaStream.point(x, y);
          hawaiiStream.point(x, y);
          puertoRicoStream.point(x, y);
        },
        sphere: function() {
          lower48Stream.sphere();
          alaskaStream.sphere();
          hawaiiStream.sphere();
          puertoRicoStream.sphere();
        },
        lineStart: function() {
          lower48Stream.lineStart();
          alaskaStream.lineStart();
          hawaiiStream.lineStart();
          puertoRicoStream.lineStart();
        },
        lineEnd: function() {
          lower48Stream.lineEnd();
          alaskaStream.lineEnd();
          hawaiiStream.lineEnd();
          puertoRicoStream.lineEnd();
        },
        polygonStart: function() {
          lower48Stream.polygonStart();
          alaskaStream.polygonStart();
          hawaiiStream.polygonStart();
          puertoRicoStream.polygonStart();
        },
        polygonEnd: function() {
          lower48Stream.polygonEnd();
          alaskaStream.polygonEnd();
          hawaiiStream.polygonEnd();
          puertoRicoStream.polygonEnd();
        }
      };
    };

    albersUsa.precision = function(_) {
      if (!arguments.length) return lower48.precision();
      lower48.precision(_);
      alaska.precision(_);
      hawaii.precision(_);
      puertoRico.precision(_);
      return albersUsa;
    };

    albersUsa.scale = function(_) {
      if (!arguments.length) return lower48.scale();
      lower48.scale(_);
      alaska.scale(_ * .35);
      hawaii.scale(_);
      puertoRico.scale(_);
      return albersUsa.translate(lower48.translate());
    };

    albersUsa.translate = function(_) {
      if (!arguments.length) return lower48.translate();
      var k = lower48.scale(), x = +_[0], y = +_[1];

      lower48Point = lower48
          .translate(_)
          .clipExtent([[x - .455 * k, y - .238 * k], [x + .455 * k, y + .238 * k]])
          .stream(pointStream).point;

      alaskaPoint = alaska
          .translate([x - .307 * k, y + .201 * k])
          .clipExtent([[x - .425 * k + ε, y + .120 * k + ε], [x - .214 * k - ε, y + .234 * k - ε]])
          .stream(pointStream).point;

      hawaiiPoint = hawaii
          .translate([x - .205 * k, y + .212 * k])
          .clipExtent([[x - .214 * k + ε, y + .166 * k + ε], [x - .115 * k - ε, y + .234 * k - ε]])
          .stream(pointStream).point;

      puertoRicoPoint = puertoRico
          .translate([x + .150 * k, y + .224 * k])
          .clipExtent([[x + .120 * k, y + .204 * k], [x + .180 * k, y + .234 * k]])
          .stream(pointStream).point;

      return albersUsa;
    };

    return albersUsa.scale(1070);
  }
};

// Mixin EventEmitter functionality
Object.assign(GeographyStore, EventEmitter.prototype);

// Register callback to handle all updates
GeographyStore.dispatchToken = AppDispatcher.register((action) => {
  switch (action.type) {
  case AppActionTypes.loadInitialData:
    //GeographyStore.loadInitialData(action.state);
    const x = (action.hashState.view) ? parseFloat(action.hashState.view.split('/')[0]) : 0,
      y = (action.hashState.view) ? parseFloat(action.hashState.view.split('/')[1]) : 0,
      z = (action.hashState.view) ? parseFloat(action.hashState.view.split('/')[2]) : 1;
    GeographyStore.setXYZ(x,y,z);
    if (action.hashState.loc) {
      GeographyStore.setView(action.hashState.loc.center[0],action.hashState.loc.center[1],action.hashState.loc.zoom);
    }
    // if there's a city but no loc, wait for the projects to load to calculate the bounding box 
    else if (action.hashState.city) {
      const waitingId = setInterval(() => {
        if (CitiesStore.initialDataLoaded() && CitiesStore.data.citiesLoaded.length == 1 && GeographyStore.getTheMap()) {
          clearInterval(waitingId);
          GeographyStore.setViewFromBounds(CitiesStore.data.citiesLoaded[0]);
        } 
      }, 500);

    }
    
    break;
  case AppActionTypes.mapMoved:
    GeographyStore.setXYZ(action.x, action.y, action.z);
    break;

  // this is to reset the zoom if moving to or from the scatterplot
  case AppActionTypes.viewSelected:
    if (action.value == 'scatterplot' || action.oldView == 'scatterplot') {
      GeographyStore.setXYZ(0,0,1);
    }
    break;
  case AppActionTypes.mapInitialized:
    GeographyStore.setTheMap(action.value);
    break;
  case AppActionTypes.citySelected:
    if (action.value == null) {
      GeographyStore.setView(null,null,null);
    } else {
      // you have to wait for the map to set the bounds
      const waitingId = setInterval(() => {
        if (GeographyStore.getTheMap()) {
          clearInterval(waitingId);
          GeographyStore.setViewFromBounds(action.value);
        }
      }, 500);
    }

    
    break;
  case AppActionTypes.cityMapMoved:
    if (GeographyStore.getTheMap !== null) {
      GeographyStore.updateLOC();
    }
    break;
  }
  

  return true;
});

export default GeographyStore;
