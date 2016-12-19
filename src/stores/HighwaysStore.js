import { EventEmitter } from 'events';
import AppDispatcher from '../utils/AppDispatcher';
import { AppActionTypes } from '../utils/AppActionCreator';
import CartoDBLoader from '../utils/CartoDBLoader';

const HighwaysStore = {

  data: {
    loaded: false,
    highways: {}
  },

  dataLoader: CartoDBLoader,

  loadInitialData: function() {
    this.dataLoader.query([
      {
        query: "SELECT * FROM interstate_lines",
        format: 'GEOJSON'
      }
    ]).then((responses) => {
      responses.forEach(response => {
        if (responses.length > 0) {
          this.data.highways = responses[0];

          this.data.loaded = true;
          this.emit(AppActionTypes.storeChanged);
        }
      });
    });
  },

  getHighwayForYear: function(year) {
    return (this.data.loaded) ? this.data.highways.filter(highway => highway.properties.year_open <= year) : {};
  },

  getHighways: function() {
    return (this.data && this.data.loaded) ? this.data.highways : {};
  },

  getHighwaysList: function() {
    return (this.data && this.data.loaded) ? this.data.highways : [];
  }
};

// Mixin EventEmitter functionality
Object.assign(HighwaysStore, EventEmitter.prototype);

// Register callback to handle all updates
HighwaysStore.dispatchToken = AppDispatcher.register((action) => {
  switch (action.type) {
  case AppActionTypes.loadInitialData:
    HighwaysStore.loadInitialData(action.state);
    break;
  }
  return true;
});

export default HighwaysStore;
