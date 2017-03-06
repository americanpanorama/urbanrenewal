import { EventEmitter } from 'events';
import AppDispatcher from '../utils/AppDispatcher';
import { AppActionTypes } from '../utils/AppActionCreator';
import CartoDBLoader from '../utils/CartoDBLoader';
import d3 from 'd3';

let cases = {
  '1956': [994], // Cincinnati
  '1958': [590], // Atlanta
  '1959': [65], // Cambridge,
  '1960': [168] // New York
};

const CitiesStore = {

  data: {
    cities: {},
    categories: {
      'totalFamiles': {category: 'total Families'},
      'percentFamiliesOfColor': {category: 'Percent families of color'}
    },
    yearsTotals: {},
    selectedCity: null,
    selectedCategory: 72,
    poc: [0, 1],
    yearsLoaded: [],
    citiesLoaded: [],
    loaded: false
  },

  dataLoader: CartoDBLoader,

  loadInitialData: function(year, citySlug, selectedCategory) {
    // initiate year keys on yearsTotal
    [...Array(25).keys()].map(num => num+1949).forEach(year => this.data.yearsTotals[year] = {});

    this.dataLoader.query([
      {
        query: "SELECT max(value) as max, md.category_id, assessed_category, unit_of_measurement from urdr_category_id_key c join combined_dir_char md on c.category_id = md.category_id group by md.category_id, assessed_category, unit_of_measurement union (select total as max, 1000 as category_id, 'totalFamilies' as assessed_category, 'familiies' as unit_of_measurement from (SELECT sum(value) as total, city_id, year from urdr_category_id_key c join combined_dir_char md on c.category_id = md.category_id and (c.category_id = 71 or c.category_id = 72) and value is not null group by city_id, year order by sum(value) desc limit 1) tf) ",
        format: 'JSON'
      },
      { 
        query: "SELECT sum(value) as total, year, md.category_id from urdr_category_id_key c join combined_dir_char md on c.category_id = md.category_id group by year, md.category_id order by year, category_id", //"SELECT sum(value) as total, year, md.category_id from urdr_category_id_key c join combined_dir_char md on c.category_id = md.category_id and case when c.category_id = any(array[71,72]) and quarter != 'December' then false else true end group by year, md.category_id order by year, category_id",
        format: 'JSON'
      },
      {
        query: "select * from (SELECT sum(value) as total, cities.city_id, ST_Y(cities.the_geom) as lat, ST_X(cities.the_geom) as lng, city, state, year, md.category_id from urdr_category_id_key c join combined_dir_char md on c.category_id = md.category_id and year = " + year + " join urdr_city_id_key cities on md.city_id = cities.city_id group by cities.the_geom, city, state, cities.city_id, year, md.category_id) year_vals where total is not null", //"select * from (SELECT sum(value) as total, cities.city_id, ST_Y(cities.the_geom) as lat, ST_X(cities.the_geom) as lng, city, state, year, md.category_id from urdr_category_id_key c join combined_dir_char md on c.category_id = md.category_id and year = " + year + " and quarter = 'December' join urdr_city_id_key cities on md.city_id = cities.city_id group by cities.the_geom, city, state, cities.city_id, year, md.category_id) year_vals where total is not null",
        format: 'JSON'
      }

    ]).then((responses) => {
      // assign colors
      let color = d3.scale.category20()
        .domain(this.getCategoryIdsWithData());

      // category data
      responses[0].forEach(response => { 
        this.data.categories[response.category_id] = {
          category: response.assessed_category,
          unit: response.unit_of_measurement,
          maxForCity: response.max,
          color: color(response.category_id)
        };
      });

      responses[1].forEach(response => {
        if (!this.data.yearsTotals[response.year]) {
          this.data.yearsTotals[response.year] = {};
        }
        this.data.yearsTotals[response.year][this.getCategoryName(response.category_id)] = response.total;
      });

      responses[2].forEach(response => {
        this.parseCityData(response);
        this.parseYearData(response);
        
      });

      this.parseFamilyData(year);

      // calculate family data for year
      Object.keys(this.data.yearsTotals).forEach(year => {
        if (this.data.yearsTotals[year]['white families'] || this.data.yearsTotals[year]['non-white families']) {
          this.data.yearsTotals[year]['totalFamilies'] = this.data.yearsTotals[year]['white families'] + this.data.yearsTotals[year]['non-white families'];
          this.data.yearsTotals[year]['percentFamiliesOfColor'] = this.data.yearsTotals[year]['non-white families'] / this.data.yearsTotals[year]['totalFamilies'];
        }
      });

      // load a city if one's specified
      if (citySlug) {
        this.loadCityData(this.getCityIdFromSlug(citySlug));
      }
      if (selectedCategory) {
        this.setSelectedCategory(selectedCategory);
      }

      this.data.loaded = true;
      this.data.yearsLoaded.push(year);
      this.emit(AppActionTypes.storeChanged);
    });
  },

  loadYearData: function(year) {
    this.dataLoader.query([
      {
        query: "select * from (SELECT sum(value) as total, cities.city_id, ST_Y(cities.the_geom) as lat, ST_X(cities.the_geom) as lng, city, state, year, md.category_id from urdr_category_id_key c join combined_dir_char md on c.category_id = md.category_id and year = " + year + " join urdr_city_id_key cities on md.city_id = cities.city_id group by cities.the_geom, city, state, cities.city_id, year, md.category_id) year_vals where total is not null",
        format: 'JSON'
      },
    ]).then((responses) => {
      responses[0].forEach(response => {
        this.parseCityData(response);
        this.parseYearData(response);
      });

      this.parseFamilyData(year);

      this.data.yearsLoaded.push(year);
      this.emit(AppActionTypes.storeChanged);
    });
  },

  loadCityData: function(city_id) {
    this.dataLoader.query([
      {
        query: "SELECT value as total, ST_Y(cities.the_geom) as lat, ST_X(cities.the_geom) as lng, cities.city, cities.state, p.project_id, project, category_id, year, st_asgeojson(p.the_geom) as project_geojson from urdr_city_id_key cities join urdr_id_key p on cities.city_id = " + city_id + " and cities.city_id = p.city_id join combined_dir_char md on p.project_id = md.project_id and value > 0", //"SELECT sum(value) as total, ST_Y(cities.the_geom) as lat, ST_X(cities.the_geom) as lng, cities.city, cities.state, p.project_id, project, category_id, year, st_asgeojson(p.the_geom) as project_geojson from urdr_city_id_key cities join urdr_id_key p on cities.city_id = " + city_id + " and cities.city_id = p.city_id join combined_dir_char md on p.project_id = md.project_id and case when md.category_id = any(array[71,72]) and quarter != 'December' then false else true end group by cities.the_geom, cities.city, cities.state, p.project_id, project, category_id, year, p.the_geom",
        format: 'JSON'
      },
      {
        query: ("SELECT ct.cartodb_id, ST_AsGeoJSON(ct.the_geom, 4) as the_geojson, ct.gisjoin, 100 * negro / (negro + white) as percent, case when i_under_999 > (i__1000___1998 + i__2000___2998 + i__3000___3998 + i__4000___4998 + i__5000___5998 + i__6000___6998 + i__7000___7998 + i__8000___8998 + i__9000___9998 + i__10000___14998 + i__15000___24998 + i__25000_plus) then 999 when (i_under_999 + i__1000___1998) > (i__2000___2998 + i__3000___3998 + i__4000___4998 + i__5000___5998 + i__6000___6998 + i__7000___7998 + i__8000___8998 + i__9000___9998 + i__10000___14998 + i__15000___24998 + i__25000_plus) then 1999 when (i_under_999 + i__1000___1998 + i__2000___2998) > (i__3000___3998 + i__4000___4998 + i__5000___5998 + i__6000___6998 + i__7000___7998 + i__8000___8998 + i__9000___9998 + i__10000___14998 + i__15000___24998 + i__25000_plus) then 2999 when (i_under_999 + i__1000___1998 + i__2000___2998 + i__3000___3998) > (i__4000___4998 + i__5000___5998 + i__6000___6998 + i__7000___7998 + i__8000___8998 + i__9000___9998 + i__10000___14998 + i__15000___24998 + i__25000_plus) then 3999 when (i_under_999 + i__1000___1998 + i__2000___2998 + i__3000___3998 + i__4000___4998) > (i__5000___5998 + i__6000___6998 + i__7000___7998 + i__8000___8998 + i__9000___9998 + i__10000___14998 + i__15000___24998 + i__25000_plus) then 4999 when (i_under_999 + i__1000___1998 + i__2000___2998 + i__3000___3998 + i__4000___4998 + i__5000___5998) > (i__6000___6998 + i__7000___7998 + i__8000___8998 + i__9000___9998 + i__10000___14998 + i__15000___24998 + i__25000_plus) then 5999 when (i_under_999 + i__1000___1998 + i__2000___2998 + i__3000___3998 + i__4000___4998 + i__5000___5998 + i__6000___6998) > (i__7000___7998 + i__8000___8998 + i__9000___9998 + i__10000___14998 + i__15000___24998 + i__25000_plus) then 6999 when (i_under_999 + i__1000___1998 + i__2000___2998 + i__3000___3998 + i__4000___4998 + i__5000___5998 + i__6000___6998 + i__7000___7998) > (i__8000___8998 + i__9000___9998 + i__10000___14998 + i__15000___24998 + i__25000_plus) then 7999 when (i_under_999 + i__1000___1998 + i__2000___2998 + i__3000___3998 + i__4000___4998 + i__5000___5998 + i__6000___6998 + i__7000___7998 + i__8000___8998) > (i__9000___9998 + i__10000___14998 + i__15000___24998 + i__25000_plus) then 8999 when (i_under_999 + i__1000___1998 + i__2000___2998 + i__3000___3998 + i__4000___4998 + i__5000___5998 + i__6000___6998 + i__7000___7998 + i__8000___8998 + i__9000___9998) > (i__10000___14998 + i__15000___24998 + i__25000_plus) then 9999 when (i_under_999 + i__1000___1998 + i__2000___2998 + i__3000___3998 + i__4000___4998 + i__5000___5998 + i__6000___6998 + i__7000___7998 + i__8000___8998 + i__9000___9998 + i__10000___14998) > (i__15000___24998 + i__25000_plus) then 14999 when (i_under_999 + i__1000___1998 + i__2000___2998 + i__3000___3998 + i__4000___4998 + i__5000___5998 + i__6000___6998 + i__7000___7998 + i__8000___8998 + i__9000___9998 + i__10000___14998 + i__15000___24998) > i__25000_plus then 24999 else 25000 end as median FROM us_tracts_1960 ct join urdr_city_id_key cities on cities.nhgiscty = ct.nhgiscty and cities.city_id = " + city_id + " join census_data_1960 d on ct.gisjoin = d.gisjoin and (negro + white) > 0  order by percent desc, median").replace(/\+/g, '%2B'),
        format: 'JSON'
      }
    ]).then(responses => {
      responses[0].forEach(response => {
        this.parseCityData(response);
        if (!this.data.cities[city_id].projects[response.project_id]) {
          this.data.cities[city_id].projects[response.project_id] = {
            project: response.project,
            id: response.project_id,
            theGeojson: JSON.parse(response.project_geojson),
            startYear: null,
            endYear: null,
            yearsData: {}
          };
        }
        // get start and end years
        if (!this.data.cities[city_id].projects[response.project_id].yearsData[response.year]) {
          this.data.cities[city_id].projects[response.project_id].yearsData[response.year] = {};
          this.data.cities[city_id].projects[response.project_id].startYear = (!this.data.cities[city_id].projects[response.project_id].startYear || response.year < this.data.cities[city_id].projects[response.project_id].startYear) ? response.year :  this.data.cities[city_id].projects[response.project_id].startYear;
          this.data.cities[city_id].projects[response.project_id].endYear = (!this.data.cities[city_id].projects[response.project_id].endYear || response.year > this.data.cities[city_id].projects[response.project_id].endYear) ? response.year :  this.data.cities[city_id].projects[response.project_id].endYear;
        }
        this.data.cities[city_id].projects[response.project_id].yearsData[response.year][this.getCategoryName(response.category_id)] = response.total;
      });

      responses[1].forEach(response => {
        this.data.cities[city_id].tracts[response.gisjoin] = {
          theGeojson: JSON.parse(response.the_geojson),
          percentPeopleOfColor: response.percent,
          medianIncome: response.median
        };
      });

      // use the project totals to calculate city totals
      this.data.cities[city_id].yearsData = {};
      Object.keys(this.data.cities[city_id].projects).forEach(project_id => {
        Object.keys(this.data.cities[city_id].projects[project_id].yearsData).forEach(year => {
          this.data.cities[city_id].startYear = (!this.data.cities[city_id].startYear || year < this.data.cities[city_id].startYear) ? year : this.data.cities[city_id].startYear;
          this.data.cities[city_id].endYear = (!this.data.cities[city_id].endYear || year > this.data.cities[city_id].endYear) ? year : this.data.cities[city_id].endYear;
          this.data.cities[city_id].yearsData[year] = (this.data.cities[city_id].yearsData[year]) ? this.data.cities[city_id].yearsData[year] : {};
          Object.keys(this.data.cities[city_id].projects[project_id].yearsData[year]).forEach(category => {
            this.data.cities[city_id].yearsData[year][category] = (this.data.cities[city_id].yearsData[year][category]) ? this.data.cities[city_id].yearsData[year][category] + this.data.cities[city_id].projects[project_id].yearsData[year][category] : this.data.cities[city_id].projects[project_id].yearsData[year][category];
          });
        });
      });
      // add family data
      Object.keys(this.data.cities[city_id].yearsData).forEach(year => this.parseFamilyData(year, city_id) );

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
        slug: response.city + response.state.toUpperCase(),
        startYear: null,
        endYear: null,
        yearsData: {},
        projects: {},
        tracts: {}
      };
    }
  },

  parseFamilyData: function(year, singleCityId) {
    // calculate family data--white families is cat 71, non-white 72
    let CityIdsToParse = (singleCityId) ? [singleCityId] : Object.keys(this.data.cities);
    CityIdsToParse.forEach(city_id => {
      if (this.data.cities[city_id].yearsData[year]) {
        let white = (this.data.cities[city_id].yearsData[year]['white families']) ? this.data.cities[city_id].yearsData[year]['white families'] : 0,
          nonwhite =  (this.data.cities[city_id].yearsData[year]['non-white families']) ? this.data.cities[city_id].yearsData[year]['non-white families'] : 0;
        if (white + nonwhite > 0) {
          this.data.cities[city_id].yearsData[year]['totalFamilies'] = white + nonwhite;
          this.data.cities[city_id].yearsData[year]['percentFamiliesOfColor'] = nonwhite / this.data.cities[city_id].yearsData[year]['totalFamilies'];
        }
      }
    });
  },

  parseYearData: function(response) {
    if (!this.data.cities[response.city_id].yearsData[response.year]) {
      this.data.cities[response.city_id].yearsData[response.year] = {};
    }
    this.data.cities[response.city_id].yearsData[response.year][this.getCategoryName(response.category_id)] = response.total;
  },

  _pickHex: function(color1, color2, weight) {
    var p = weight;
    var w = p * 2 - 1;
    var w1 = (w/1+1) / 2;
    var w2 = 1 - w1;
    var rgb = [Math.round(color1[0] * w1 + color2[0] * w2),
        Math.round(color1[1] * w1 + color2[1] * w2),
        Math.round(color1[2] * w1 + color2[2] * w2)];
    return 'rgb(' + rgb + ')';
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

  setPOCBottom: function(value) {
    this.data.poc[0] = value;
    this.emit(AppActionTypes.storeChanged);
  },

  setPOCTop: function(value) {
    this.data.poc[1] = value;
    this.emit(AppActionTypes.storeChanged);
  },

  getCityId: function(project_id) { return Object.keys(this.data.cities).filter(city_id => this.data.cities[city_id].projects.hasOwnProperty(project_id))[0]; },

  getCityIdFromSlug: function(slug) { return (this.data.cities) ? Object.keys(this.data.cities).filter(cityId => (this.data.cities[cityId].slug == slug))[0] : null; },

  getCities: function() { return (this.data && this.data.loaded) ? this.data.cities : {}; },

  getCitiesList: function() { return (this.data && this.data.loaded) ? Object.keys(this.data.cities).map(city_id => this.data.cities[city_id]) : []; },

  getCitiesDataForYearAndCategory: function(year, category) { 
    return (this.data && this.data.loaded) ?
      this.getCitiesList()
        .filter(cityData => cityData.yearsData[year] && cityData.yearsData[year][category] > 0 )
        .map(cityData => {
          return {
            lngLat: [cityData.lng, cityData.lat],
            city_id: cityData.city_id,
            value: cityData.yearsData[year][category]
          };
        }) :
      [];
  },

  getDorlings: function(year, cat) {
    // need to add something to select category
    if (cat == 'families') {
      return (this.data && this.data.loaded) ?
        this.getCitiesList()
          .filter(cityData => cityData.yearsData[year] && cityData.yearsData[year]['totalFamilies'] > 0 )
          .map(cityData => {
            return {
              lngLat: [cityData.lng, cityData.lat],
              city_id: cityData.city_id,
              value: cityData.yearsData[year]['totalFamilies'],
              color: (cityData.yearsData[year]['percentFamiliesOfColor'] >= this.getPOCBottom() && cityData.yearsData[year]['percentFamiliesOfColor'] <= this.getPOCTop()) ? this._pickHex([125,200,125], [100,150,200], cityData.yearsData[year]['percentFamiliesOfColor']) : 'transparent'
            };
          })
          .sort((a,b) => b.value - a.value) :
        [];
    } else if (cat == 'funding') {
      return (this.data && this.data.loaded) ?
        this.getCitiesList()
          .filter(cityData => cityData.yearsData[year] && cityData.yearsData[year]['urban renewal grants dispursed'] > 0 )
          .map(cityData => {
            return {
              lngLat: [cityData.lng, cityData.lat],
              city_id: cityData.city_id,
              value: cityData.yearsData[year]['urban renewal grants dispursed'],
              color: '#9E7B9B'
            };
          })
          .sort((a,b) => b.value - a.value) :
        [];
    } else {
      return [];
    }
  },

  getSelectedCategory: function() { return this.data.selectedCategory; },

  getSelectedCity: function() { return this.data.selectedCity; },

  getSlug: function() { 
    return (this.data.cities[this.getSelectedCity()] && this.data.cities[this.getSelectedCity()].slug) ? this.data.cities[this.getSelectedCity()].slug : null; 
  },

  getCityData: function(city_id) { return (this.data && this.data.loaded && this.data.cities[city_id]) ? this.data.cities[city_id] : {}; },

  getCategories: function() { return this.data.categories; },

  getCategory: function(id) { return this.data.categories[id]; },

  getCategoryName: function(id) { return this.data.categories[id].category; },

  getCategoryIdsWithData: function() { return Object.keys(this.data.categories).filter(category_id => this.data.categories[category_id].hasData); },

  getCategoryColor: function(category_id) { 
    category_id = (category_id == 'selected') ? this.getSelectedCategory() : category_id;
    return (this.data.categories[category_id]) ? this.data.categories[category_id].color : 1;
  },

  getCategoryMaxForCity: function(category) { 
    let category_id = this.getCategoryIdFromName(category);
    return (this.data.categories[category_id]) ? this.data.categories[category_id].maxForCity : 1;
  },

  getCategoryIdFromName: function(name) {
    return Object.keys(this.data.categories).filter(id => (this.data.categories[id].category == name))[0];
  },

  getCategoryName: function(category_id) { return (this.data.categories[category_id]) ? this.data.categories[category_id].category : ''; },

  getCategoryUnit: function(category_id) { return (this.data.categories[category_id]) ? this.data.categories[category_id].unit : ''; },

  getProjectGeojson: function(project_id) {
    let city_id = this.getCityId(project_id);
    if (this.data.cities[city_id] && this.data.cities[city_id].projects[project_id]) {
      return this.data.cities[city_id].projects[project_id];
    }

  },

  getPOC: function() { return this.data.poc; },

  getPOCBottom: function() { return this.data.poc[0]; },

  getPOCTop: function() { return this.data.poc[1]; },

  getYearsTotals: function() { return this.data.yearsTotals; },

  getYearTotals: function(year) { return this.data.yearsTotals[year]; }
};

// Mixin EventEmitter functionality
Object.assign(CitiesStore, EventEmitter.prototype);

// Register callback to handle all updates
CitiesStore.dispatchToken = AppDispatcher.register((action) => {
  switch (action.type) {

  case AppActionTypes.loadInitialData:
    CitiesStore.loadInitialData(action.state.year, action.hashState.city, action.hashState.category);
    break;

  case AppActionTypes.categorySelected:
    CitiesStore.setSelectedCategory(action.value);
    break;

  case AppActionTypes.citySelected:
    if (!action.value || CitiesStore.cityLoaded(action.value)) {
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

    /* if (cases[action.value]) {
      cases[action.value].forEach(cityId => {
        if (!CitiesStore.cityLoaded(cityId)) {
          CitiesStore.loadCityData(cityId);
        } 
      });  
    } */

    break;

  case AppActionTypes.POCSelected:
    if (action.topOrBottom == 'bottom') {
      CitiesStore.setPOCBottom(action.value);
    } else if (action.topOrBottom == 'top') {
      CitiesStore.setPOCTop(action.value);
    }
    break;

  }
  return true;
});

export default CitiesStore;