import { EventEmitter } from 'events';
import AppDispatcher from '../utils/AppDispatcher';
import { AppActionTypes } from '../utils/AppActionCreator';
import CartoDBLoader from '../utils/CartoDBLoader';

const CitiesStore = {

  data: {
    loaded: false,
    yearsLoaded: [],
    cities: {},
    categories: [],
    selected: null
  },

  dataLoader: CartoDBLoader,

  loadInitialData: function(year) {
    this.dataLoader.query([
      {
        query: "SELECT ST_Y(c.the_geom) as lat, ST_X(c.the_geom) as lng, c.city_id, c.city, c.state, pr.project_id, pr.project FROM digitalscholarshiplab.urdr_id_key pr join urdr_city_id_key c on pr.city_id = c.city_id and c.cartodb_georef_status is true",
        format: 'JSON'
      },
      {
        query: "select category_id, assessed_category, unit_of_measurement from urdr_category_id_key",
        format: 'JSON'
      }
    ]).then((responses) => {
      responses[0].forEach(response => {
        if (!this.data.cities[response.city_id]) {
          this.data.cities[response.city_id] = {
            lat: response.lat,
            lng: response.lng,
            city: response.city,
            city_id: response.city_id,
            state: response.state,
            projects: {},
            yearsData: {}
          };
        }
        this.data.cities[response.city_id].projects[response.project_id] = {
          project: response.project,
          yearData: {}
        };
      });

      // category data
      responses[1].forEach(response => { 
        this.data.categories.push( {
          category_id: response.category_id,
          category: response.assessed_category,
          unit: response.unit_of_measurement,
          maxForCity: -1
        });
      });

      this.loadDataForYear(year);
    });
  },

  loadDataForYear: function(year) {
    // only load if necessary
    if (this.data.yearsLoaded.indexOf(year) == -1) {
      this.dataLoader.query([
        {
          query: "SELECT sum(value) as total, project_id, year, md.category_id, assessed_category from urdr_category_id_key c join urdr_master_data_new md on c.category_id = md.category_id and year = " + year + " group by project_id, year, md.category_id, assessed_category",
          format: 'JSON'
        }
      ]).then((responses) => {
        responses[0].forEach(response => {
          let city_id =  this.getCityId(response.project_id);
          if (this.cityDataInitialized(city_id)) {
            // add the value to the aggregated totals for the city
            if (!this.yearsDataInitialized(city_id, response.year)) {
              this.data.cities[city_id].yearsData[year] = {};
              this.data.cities[city_id].yearsData[year][response.assessed_category] = response.total;
            } else {
              this.data.cities[city_id].yearsData[year][response.assessed_category] += response.total;
            }

            // if necessary, update max in category list
            let i = this.data.categories.findIndex(category => category.category_id == response.category_id);
            this.data.categories[i].maxForCity = (!isNaN(this.data.cities[city_id].yearsData[year][response.assessed_category]) && this.data.cities[city_id].yearsData[year][response.assessed_category] > this.data.categories[i].maxForCity) ? this.data.cities[city_id].yearsData[year][response.assessed_category] : this.data.categories[i].maxForCity;

            // add the value to the project specific totals
            if (!this.yearForProjectInitialized(response.project_id, response.year)) {
              this.data.cities[this.getCityId(response.project_id)].projects[response.project_id].yearData[response.year] = {
                categories: {}
              };
            }
            this.data.cities[this.getCityId(response.project_id)].projects[response.project_id].yearData[response.year].categories[response.assessed_category] = response.total;
          }
        });

        this.data.yearsLoaded.push(year);

        this.data.loaded = true;
        this.emit(AppActionTypes.storeChanged);
      });
    }
  },

  cityDataInitialized: function(city_id) {
    return (this.data.cities && this.data.cities[city_id]);
  },

  projectDataInitialized: function(project_id) {
    let city_id =  this.getCityId(project_id);
    return (this.cityDataInitialized(city_id) && this.data.cities[city_id].projects[project_id]);
  },

  yearsDataInitialized: function(city_id, year) {
    return (this.cityDataInitialized(city_id) && this.data.cities[city_id].yearsData[year]);
  },

  yearForProjectInitialized: function(project_id, year) {
    let city_id =  this.getCityId(project_id);
    return (this.projectDataInitialized(project_id) && this.data.cities[city_id].projects[project_id].yearData[year]);
  },

  setSelected: function(city_id) {
    this.data.selected = city_id;
    this.emit(AppActionTypes.storeChanged);
  },

  getCityId: function(project_id) {
    return Object.keys(this.data.cities).filter(city_id => this.data.cities[city_id].projects.hasOwnProperty(project_id))[0];
  },

  getCities: function() {
    return (this.data && this.data.loaded) ? this.data.cities : {};
  },

  getCitiesList: function() {
    return (this.data && this.data.loaded) ? Object.keys(this.data.cities).map(city_id => this.data.cities[city_id]) : [];
  },

  getCitiesDataForYearAndCategory: function(year, category) { 
    return (this.data && this.data.loaded) ?
      this.getCitiesList()
        .filter(cityData => cityData.yearsData[year] && !isNaN(cityData.yearsData[year][category]) && cityData.yearsData[year][category] > 0 )
        .map(cityData => {
          return {
            lngLat: [cityData.lng, cityData.lat],
            city_id: cityData.city_id,
            value: cityData.yearsData[year][category]
          };
        }) :
      [];
  },

  getSelected: function() {
    return this.data.selected;
  },

  getCityData: function(city_id) {
    return (this.data && this.data.loaded && this.data.cities[city_id]) ?
      this.data.cities[city_id] :
      {};
  },

  getCategories: function() {
    return this.data.categories;
  },

  getCategory: function(category_id) {
    let filtered = this.data.categories.filter(category => category.category_id =- category_id);
    return (filtered) ? filtered[0] : [];
  }
};

// Mixin EventEmitter functionality
Object.assign(CitiesStore, EventEmitter.prototype);

// Register callback to handle all updates
CitiesStore.dispatchToken = AppDispatcher.register((action) => {
  switch (action.type) {

  case AppActionTypes.loadInitialData:
    CitiesStore.loadInitialData(action.state.year);
    break;

  case AppActionTypes.citySelected:
    CitiesStore.setSelected(action.value);
    break;

  case AppActionTypes.dateSelected:
    CitiesStore.loadDataForYear(action.value);
    break;

  }
  return true;
});

export default CitiesStore;