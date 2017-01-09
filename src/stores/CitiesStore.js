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
    yearsLoaded: [],
    citiesLoaded: [],
    loaded: false
  },

  dataLoader: CartoDBLoader,

  loadInitialData: function(year) {
    // initiate year keys on yearsTotal
    [...Array(25).keys()].map(num => num+1949).forEach(year => this.data.yearsTotals[year] = {});

    this.dataLoader.query([
      {
        query: "select * from (SELECT sum(value) as total, cities.city_id, ST_Y(cities.the_geom) as lat, ST_X(cities.the_geom) as lng, city, state, year, md.category_id from urdr_category_id_key c join urdr_master_data_new md on c.category_id = md.category_id and year = " + year + " join urdr_city_id_key cities on md.city_id = cities.city_id group by cities.the_geom, city, state, cities.city_id, year, md.category_id) year_vals where total is not null",
        format: 'JSON'
      },
      {
        query: "SELECT max(value) as max, md.category_id, assessed_category, unit_of_measurement from urdr_category_id_key c join urdr_master_data_new md on c.category_id = md.category_id group by md.category_id, assessed_category, unit_of_measurement",
        format: 'JSON'
      },
      { 
        query: "SELECT sum(value) as total, year, md.category_id from urdr_category_id_key c join urdr_master_data_new md on c.category_id = md.category_id group by year, md.category_id order by year, category_id",
        format: 'JSON'
      }
    ]).then((responses) => {
      responses[0].forEach(response => {
        this.parseCityData(response);
        if (!this.data.cities[response.city_id].yearsData[response.year]) {
          this.data.cities[response.city_id].yearsData[response.year] = {};
        }
        this.data.cities[response.city_id].yearsData[response.year][response.category_id] = response.total;
      });

      // assign colors
      let color = d3.scale.category10()
        .domain(this.getCategoryIdsWithData());

      // category data
      responses[1].forEach(response => { 
        this.data.categories[response.category_id] = {
          category: response.assessed_category,
          unit: response.unit_of_measurement,
          maxForCity: response.max,
          color: color(response.category_id)
        };
      });

      responses[2].forEach(response => {
        if (!this.data.yearsTotals[response.year]) {
          this.data.yearsTotals[response.year] = {};
        }
        this.data.yearsTotals[response.year][response.category_id] = response.total;
      });

      this.data.loaded = true;
      this.data.yearsLoaded.push(year);
      this.emit(AppActionTypes.storeChanged);
    });
  },

  loadYearData: function(year) {
    this.dataLoader.query([
      {
        query: "select * from (SELECT sum(value) as total, cities.city_id, ST_Y(cities.the_geom) as lat, ST_X(cities.the_geom) as lng, city, state, year, md.category_id from urdr_category_id_key c join urdr_master_data_new md on c.category_id = md.category_id and year = " + year + " join urdr_city_id_key cities on md.city_id = cities.city_id group by cities.the_geom, city, state, cities.city_id, year, md.category_id) year_vals where total is not null",
        format: 'JSON'
      },
    ]).then((responses) => {
      responses[0].forEach(response => {
        this.parseCityData(response);
        if (!this.data.cities[response.city_id].yearsData[response.year]) {
          this.data.cities[response.city_id].yearsData[response.year] = {};
        }
        this.data.cities[response.city_id].yearsData[response.year][response.category_id] = response.total;
      });

      this.data.yearsLoaded.push(year);
      this.emit(AppActionTypes.storeChanged);
    });
  },

  loadCityData: function(city_id) {
    this.dataLoader.query([
      {
        query: "SELECT sum(value) as total, ST_Y(cities.the_geom) as lat, ST_X(cities.the_geom) as lng, cities.city, cities.state, p.project_id, project, category_id, year from urdr_city_id_key cities join urdr_id_key p on cities.city_id = " + city_id + " and cities.city_id = p.city_id join urdr_master_data_new md on p.project_id = md.project_id group by cities.the_geom, cities.city, cities.state, p.project_id, project, category_id, year",
        format: 'JSON'
      }
    ]).then(responses => {
      responses[0].forEach(response => {
        this.parseCityData(response);
        if (!this.data.cities[city_id].projects[response.project_id]) {
          this.data.cities[city_id].projects[response.project_id] = {
            project: response.project,
            yearData: {}
          };
        }
        if (!this.data.cities[city_id].projects[response.project_id].yearData[response.year]) {
          this.data.cities[city_id].projects[response.project_id].yearData[response.year] = {};
        }
        this.data.cities[city_id].projects[response.project_id].yearData[response.year][response.category_id] = response.total;
      });

      this.data.citiesLoaded.push(city_id);
      this.setSelectedCity(city_id);
      this.emit(AppActionTypes.storeChanged);
    });
  },

  parseCityData: function(response) {
    if (!this.data.cities[response.city_id]) {
      this.data.cities[response.city_id] = {
        lat: response.lat,
        lng: response.lng,
        city: response.city,
        city_id: response.city_id,
        state: response.state,
        yearsData: {},
        projects: {}
      };
    }
  },

  cityLoaded: function(city_id) { return (this.data.citiesLoaded.indexOf(city_id) !== -1); },

  yearLoaded: function(year) { return (this.data.yearsLoaded.indexOf(year) !== -1); },

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
    if (CitiesStore.cityLoaded(action.value)) {
      CitiesStore.setSelectedCity(action.value);
    } else {
      CitiesStore.loadCityData(action.value);
    }
    break;

  case AppActionTypes.dateSelected:
    if (CitiesStore.yearLoaded(action.value)) {
    } else {
      CitiesStore.loadYearData(action.value);
    }
    break;

  }
  return true;
});

export default CitiesStore;