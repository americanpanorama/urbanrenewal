import { EventEmitter } from 'events';
import AppDispatcher from '../utils/AppDispatcher';
import { AppActionTypes } from '../utils/AppActionCreator';
import CartoDBLoader from '../utils/CartoDBLoader';
import USTopoJson from '../../data/us.json';
import * as topojson from 'topojson';

const GeographyStore = {

  data: {
    loaded: false,
    lower48Geojson: {}
  },

  dataLoader: CartoDBLoader,

  loadInitialData: function() {
    this.dataLoader.query([
      {
        //query: "SELECT ST_transform(the_geom_webmercator, 2163) as the_geom_webmercator FROM states where start_n < 19600101 and end_n > 19600101 and name != 'Alaska' and name != 'Hawaii'",
        query: "SELECT the_geom FROM states where start_n < 19600101 and end_n > 19600101 and name != 'Alaska' and name != 'Hawaii'",
        format: 'geojson'
      }
    ]).then((responses) => {
      responses.forEach(response => {
        if (responses.length > 0) {
          this.data.lower48Geojson = responses[0];

          this.data.loaded = true;
          this.emit(AppActionTypes.storeChanged);
        }
      });
    });
  },

  getLower48: function() {
    return USTopoJson;
  },

  getStatesGeojson: function() {
    return topojson.feature(USTopoJson, USTopoJson.objects.states).features;
  }
};

// Mixin EventEmitter functionality
Object.assign(GeographyStore, EventEmitter.prototype);

// Register callback to handle all updates
GeographyStore.dispatchToken = AppDispatcher.register((action) => {
  switch (action.type) {
  case AppActionTypes.loadInitialData:
    GeographyStore.loadInitialData(action.state);
    break;
  }
  return true;
});

export default GeographyStore;
