import { EventEmitter } from 'events';
import AppDispatcher from '../utils/AppDispatcher';
import { AppActionTypes } from '../utils/AppActionCreator';
import CartoDBLoader from '../utils/CartoDBLoader';
import d3 from 'd3';

const CitiesStore = {

  data: {
    cities: {},
    categories: {},
    yearsTotals: {},
    selectedCity: null,
    selectedCategory: 67,
    loaded: false
  },

  dataLoader: CartoDBLoader,

  loadInitialData: function(year) {
    // initiate year keys on yearsTotal
    [...Array(25).keys()].map(num => num+1949).forEach(year => this.data.yearsTotals[year] = {});

    this.dataLoader.query([
      {
        query: "SELECT ST_Y(c.the_geom) as lat, ST_X(c.the_geom) as lng, c.city_id, c.city, c.state, pr.project_id, pr.project FROM digitalscholarshiplab.urdr_id_key pr join urdr_city_id_key c on pr.city_id = c.city_id and c.cartodb_georef_status is true",
        format: 'JSON'
      },
      {
        query: "select category_id, assessed_category, unit_of_measurement from urdr_category_id_key",
        format: 'JSON'
      },
      {
        query: "SELECT sum(value) as total, project_id, year, md.category_id from urdr_category_id_key c join urdr_master_data_new md on c.category_id = md.category_id and year = " + year + " group by project_id, year, md.category_id",
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
        this.data.categories[response.category_id] = {
          category: response.assessed_category,
          unit: response.unit_of_measurement,
          maxForCity: -1,
          hasData: false
        };
      });

      // the meat--value data for cities and projects
      responses[2].forEach(response => {
        let city_id =  this.getCityId(response.project_id);
        if (this.cityDataInitialized(city_id)) {
          // add the value to the aggregated totals for the city
          if (!this.yearsDataInitialized(city_id, response.year)) {
            this.data.cities[city_id].yearsData[response.year] = {};
            this.data.cities[city_id].yearsData[response.year][response.category_id] = response.total;
          } else {
            this.data.cities[city_id].yearsData[response.year][response.category_id] += response.total;
          }

          // if necessary, update max in category list
          this.data.categories[response.category_id].maxForCity = (!isNaN(this.data.cities[city_id].yearsData[year][response.category_id]) && this.data.cities[city_id].yearsData[year][response.category_id] > this.data.categories[response.category_id].maxForCity) ? this.data.cities[city_id].yearsData[year][response.category_id] : this.data.categories[response.category_id].maxForCity;
          if (response.total > 0) {
            this.data.categories[response.category_id].hasData = true;

            // add it to years total
            this.data.yearsTotals[response.year][response.category_id] = (this.data.yearsTotals[response.year][response.category_id]) ? this.data.yearsTotals[response.year][response.category_id] + response.total : response.total;
          }

          // add the value to the project specific totals
          if (!this.yearForProjectInitialized(response.project_id, response.year)) {
            this.data.cities[this.getCityId(response.project_id)].projects[response.project_id].yearData[response.year] = {
              categories: {}
            };
          }
          this.data.cities[this.getCityId(response.project_id)].projects[response.project_id].yearData[response.year].categories[response.category_id] = response.total;
        }
      });

      // assign colors to categories with data
      let color = d3.scale.category10()
        .domain(this.getCategoryIdsWithData());

      this.getCategoryIdsWithData().forEach(category_id => {
        console.log(color(category_id));
        this.data.categories[category_id].color = color(category_id);
        console.log(this.data.categories[category_id]);
      });

      this.data.loaded = true;
      this.emit(AppActionTypes.storeChanged);

    });
  },

  cityDataInitialized: function(city_id) { return (this.data.cities && this.data.cities[city_id]); },

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

  setSelectedCategory: function(category_id) {
    this.data.selectedCategory = category_id;
    this.emit(AppActionTypes.storeChanged);
  },

  setSelectedCity: function(city_id) {
    this.data.selectedCity = city_id;
    this.emit(AppActionTypes.storeChanged);
  },

  getCityId: function(project_id) { return Object.keys(this.data.cities).filter(city_id => this.data.cities[city_id].projects.hasOwnProperty(project_id))[0]; },

  getCities: function() { return (this.data && this.data.loaded) ? this.data.cities : {}; },

  getCitiesList: function() { return (this.data && this.data.loaded) ? Object.keys(this.data.cities).map(city_id => this.data.cities[city_id]) : []; },

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

  getSelectedCategory: function() { return this.data.selectedCategory; },

  getSelectedCity: function() { return this.data.selectedCity; },

  getCityData: function(city_id) { return (this.data && this.data.loaded && this.data.cities[city_id]) ? this.data.cities[city_id] : {}; },

  getCategories: function() { return this.data.categories; },

  getCategoryIdsWithData: function() { return Object.keys(this.data.categories).filter(category_id => this.data.categories[category_id].hasData); },

  getCategory: function(category_id) { return this.data.categories[category_id]; },

  getCategoryColor: function(category_id) { 
    category_id = (category_id == 'selected') ? this.getSelectedCategory() : category_id;
    return (this.data.categories[category_id]) ? this.data.categories[category_id].color : 1;
  },

  getCategoryMaxForCity: function(category_id) { 
    category_id = (category_id == 'selected') ? this.getSelectedCategory() : category_id;
    return (this.data.categories[category_id]) ? this.data.categories[category_id].maxForCity : 1;
  },

  getCategoryName: function(category_id) { return this.data.categories[category_id].category; },

  getCategoryUnit: function(category_id) { return this.data.categories[category_id].unit; },

  getYearsTotals: function() { return this.data.yearsTotals; },

  getYearTotals: function(year) { return this.data.yearsTotals[year]; }
};

// Mixin EventEmitter functionality
Object.assign(CitiesStore, EventEmitter.prototype);

// Register callback to handle all updates
CitiesStore.dispatchToken = AppDispatcher.register((action) => {
  switch (action.type) {

  case AppActionTypes.loadInitialData:
    CitiesStore.loadInitialData(action.state.year);
    break;

  case AppActionTypes.categorySelected:
    CitiesStore.setSelectedCategory(action.value);
    break;

  case AppActionTypes.citySelected:
    CitiesStore.setSelectedCity(action.value);
    break;

  }
  return true;
});

export default CitiesStore;