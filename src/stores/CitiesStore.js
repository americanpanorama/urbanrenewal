import { EventEmitter } from 'events';
import AppDispatcher from '../utils/AppDispatcher';
import { AppActionTypes } from '../utils/AppActionCreator';
import CartoDBLoader from '../utils/CartoDBLoader';
import GeographyStore from './GeographyStore';
import DimensionsStore from './DimensionsStore';
import { HelperFunctions } from '../utils/HelperFunctions';
import StateAbbrs from '../../data/stateAbbrs.json';

const CitiesStore = {

  data: {
    // state data about selected
    selectedYear: 1960,
    selectedCategory: 'families',
    selectedCity: null,
    poc: [0, 1],

    // the city data propers
    cities: {},
    categories: {
      'totalFamiles': {category: 'total Families'},
      'percentFamiliesOfColor': {category: 'Percent families of color'}
    },
    yearsTotals: {},

    // util variables to prevent reloading data that's already been loaded
    loaded: false,
    yearsLoaded: [],
    citiesLoaded: []
  },

  dataLoader: CartoDBLoader,

  getCityDataQuery: function(year) { return "select sum(value) as total, cities.city_id, ST_Y(cities.the_geom) as lat, ST_X(cities.the_geom) as lng, cities.city, cities.state, year, v2.category_id, pop_1940, pop_1950, pop_1960, pop_1970, white_1960, white_1970, nonwhite_1960, nonwhite_1970 from (select value, fy.year, v.category_id, v.project_id, v.city_id from (SELECT max(year), value, city_id, project_id, category_id FROM digitalscholarshiplab.combined_dire_char_raw where value is not null group by value, city_id, project_id, category_id) v join (SELECT min(year) as year, city_id, project_id, category_id FROM digitalscholarshiplab.combined_dire_char_raw where value is not null group by city_id, project_id, category_id) fy on v.project_id = fy.project_id and v.category_id = fy.category_id) v2 join urdr_city_id_key cities on v2.city_id = cities.city_id and year = " + year + " join ur_city_census_data on v2.city_id = ur_city_census_data.city_id group by cities.the_geom, cities.city, cities.state, cities.city_id, year, category_id, pop_1940, pop_1950, pop_1960, pop_1970, white_1960, white_1970, nonwhite_1960, nonwhite_1970"; },

  loadInitialData: function(year, citySlug, selectedCategory) {
    // initiate year keys on yearsTotal
    [...Array(25).keys()].map(num => num+1949).forEach(year => this.data.yearsTotals[year] = {});

    this.dataLoader.query([
      {
        // category metadata
        query: "SELECT max(value) as max, md.category_id, assessed_category, unit_of_measurement from urdr_category_id_key c join combined_dire_char_raw md on c.category_id = md.category_id group by md.category_id, assessed_category, unit_of_measurement union (select total as max, 1000 as category_id, 'totalFamilies' as assessed_category, 'familiies' as unit_of_measurement from (SELECT sum(value) as total, city_id, year from urdr_category_id_key c join combined_dire_char_raw md on c.category_id = md.category_id and (c.category_id = 71 or c.category_id = 72) and value is not null group by city_id, year order by sum(value) desc limit 1) tf)",
        format: 'JSON'
      },
      // years totals -- not sure if I'm using this anymore
      { 
        query: "select sum(value) as total, fy.year, v.category_id from (SELECT max(year), value, city_id, project_id, category_id FROM digitalscholarshiplab.combined_dire_char_raw where value is not null group by value, city_id, project_id, category_id) v join (SELECT min(year) as year, city_id, project_id, category_id FROM digitalscholarshiplab.combined_dire_char_raw where value is not null group by city_id, project_id, category_id) fy on v.project_id = fy.project_id and v.category_id = fy.category_id group by fy.year, v.category_id",
        format: 'JSON'
      },
      // city data for year
      {
        query: this.getCityDataQuery(year),
        format: 'JSON'
      },
      // data for projects: duration, displacments, etc.
      { query: "SELECT d.project_id, d.start_year, d.end_year, d.whites, d.nonwhite, ST_Y(cities.the_geom) as lat, ST_X(cities.the_geom) as lng, cities.city, cities.city_id, cities.state, p.project FROM digitalscholarshiplab.urdr_displacements d join urdr_city_id_key cities on cities.city_id = d.city_id join urdr_id_key p on p.project_id = d.project_id",
        format: 'JSON'
      }

    ]).then((responses) => {

      // category data
      responses[0].forEach(response => { 
        this.data.categories[response.category_id] = {
          category: response.assessed_category,
          unit: response.unit_of_measurement,
          maxForCity: response.max
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

      responses[3].forEach(response => {
        let duration = 1 + response.end_year - response.start_year;
        for (let aYear = response.start_year; aYear <= response.end_year; aYear += 1) {
          this.data.cities[response.city_id] = (this.data.cities[response.city_id]) ? this.data.cities[response.city_id] : { 
            city: response.city,
            city_id: response.city_id,
            endYear: response.end_year,
            lat: response.lat,
            lng: response.lng,
            projects: {},
            slug: response.city.replace(/ /g,'') + response.state.toUpperCase(),
            startYear: response.start_year,
            state: response.state,
            tracts: {},
            yearsData: {},
            maxDisplacmentsForYear: 0
          };

          // aggregate year data for city
          if (!this.data.cities[response.city_id].yearsData[aYear]) {
            this.data.cities[response.city_id].yearsData[aYear] = {
              'white families': 0,
              'non-white families': 0,
              totalFamilies: 0
            };
          }
          this.data.cities[response.city_id].yearsData[aYear]['white families'] += response.whites / duration;
          this.data.cities[response.city_id].yearsData[aYear]['non-white families'] += response.nonwhite / duration;
          this.data.cities[response.city_id].yearsData[aYear]['totalFamilies'] += response.nonwhite / duration + response.whites / duration;
          this.data.cities[response.city_id].yearsData[aYear].percentFamiliesOfColor = (response.nonwhite / duration) /  (response.nonwhite / duration + response.whites / duration);

          // project data
          this.data.cities[response.city_id].projects[response.project_id] = (this.data.cities[response.city_id].projects[response.project_id]) ? this.data.cities[response.city_id].projects[response.project_id] : {
            id: response.project_id,
            endYear: response.end_year,
            startYear: response.start_year,
            theGeojson: null,
            project: response.project,
            yearsData: {},
            'white families': response.whites,
            'non-white families': response.nonwhite,
            totalFamilies: response.nonwhite + response.whites,
            percentFamiliesOfColor: (response.nonwhite) /  (response.nonwhite + response.whites)
          };
          this.data.cities[response.city_id].projects[response.project_id].yearsData[aYear] = (this.data.cities[response.city_id].projects[response.project_id].yearsData[aYear]) ? this.data.cities[response.city_id].projects[response.project_id].yearsData[aYear] : {};
          this.data.cities[response.city_id].projects[response.project_id].yearsData[aYear]['white families'] = response.whites / duration;
          this.data.cities[response.city_id].projects[response.project_id].yearsData[aYear]['non-white families'] = response.nonwhite / duration;
          this.data.cities[response.city_id].projects[response.project_id].yearsData[aYear].totalFamilies = response.nonwhite / duration + response.whites / duration;
          this.data.cities[response.city_id].projects[response.project_id].yearsData[aYear].percentFamiliesOfColor = (response.nonwhite / duration) /  (response.nonwhite / duration + response.whites / duration);

          this.data.cities[response.city_id].maxDisplacmentsForYear = (this.data.cities[response.city_id].projects[response.project_id].yearsData[aYear].totalFamilies  > this.data.cities[response.city_id].maxDisplacmentsForYear) ? this.data.cities[response.city_id].projects[response.project_id].yearsData[aYear].totalFamilies : this.data.cities[response.city_id].maxDisplacmentsForYear;
        }
      });

      // load a city if one's specified
      if (citySlug) {
        this.loadCityData(this.getCityIdFromSlug(citySlug));
      }
      if (selectedCategory) {
        this.setSelectedCategory(selectedCategory);
      }

      this.setSelectedYear(year);

      this.data.loaded = true;
      this.data.yearsLoaded.push(year);
      this.emit(AppActionTypes.storeChanged);
    });
  },

  loadYearData: function(year) {
    this.dataLoader.query([
      {
        query: "select sum(value) as total, cities.city_id, ST_Y(cities.the_geom) as lat, ST_X(cities.the_geom) as lng, city, state, year, v2.category_id from (select value, fy.year, v.category_id, v.project_id, v.city_id from (SELECT max(year), value, city_id, project_id, category_id FROM digitalscholarshiplab.combined_dire_char_raw where value is not null group by value, city_id, project_id, category_id) v join (SELECT min(year) as year, city_id, project_id, category_id FROM digitalscholarshiplab.combined_dire_char_raw where value is not null group by city_id, project_id, category_id) fy on v.project_id = fy.project_id and v.category_id = fy.category_id) v2 join urdr_city_id_key cities on v2.city_id = cities.city_id and year = " + year + " group by cities.the_geom, city, state, cities.city_id, year, category_id", //"select * from (SELECT sum(value) as total, cities.city_id, ST_Y(cities.the_geom) as lat, ST_X(cities.the_geom) as lng, city, state, year, md.category_id from urdr_category_id_key c join combined_dire_char_raw md on c.category_id = md.category_id and year = " + year + " join urdr_city_id_key cities on md.city_id = cities.city_id group by cities.the_geom, city, state, cities.city_id, year, md.category_id) year_vals where total is not null",
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
        query:  "select v.*, ST_Y(cities.the_geom) as lat, ST_X(cities.the_geom) as lng, cities.city, cities.state, fy.year from (SELECT max(year), value as total, d.project_id, project, category_id, st_asgeojson(p.the_geom) as project_geojson FROM digitalscholarshiplab.combined_dire_char_raw d join urdr_id_key p on p.project_id = d.project_id where value is not null and d.city_id = " + city_id + " group by d.project_id, category_id, value, st_asgeojson(p.the_geom), project) v join (SELECT min(year) as year, project_id, category_id FROM digitalscholarshiplab.combined_dire_char_raw where value is not null and city_id = " + city_id + " group by project_id, category_id) fy on v.project_id = fy.project_id and v.category_id = fy.category_id join urdr_city_id_key cities on cities.city_id = " + city_id,
        format: 'JSON'
      },
      {
        query: ("SELECT ct.cartodb_id, ST_AsGeoJSON(ct.the_geom, 4) as the_geojson, ct.gisjoin, 100 * negro / (negro + white) as percent, case when i_under_999 > (i__1000___1998 + i__2000___2998 + i__3000___3998 + i__4000___4998 + i__5000___5998 + i__6000___6998 + i__7000___7998 + i__8000___8998 + i__9000___9998 + i__10000___14998 + i__15000___24998 + i__25000_plus) then 999 when (i_under_999 + i__1000___1998) > (i__2000___2998 + i__3000___3998 + i__4000___4998 + i__5000___5998 + i__6000___6998 + i__7000___7998 + i__8000___8998 + i__9000___9998 + i__10000___14998 + i__15000___24998 + i__25000_plus) then 1999 when (i_under_999 + i__1000___1998 + i__2000___2998) > (i__3000___3998 + i__4000___4998 + i__5000___5998 + i__6000___6998 + i__7000___7998 + i__8000___8998 + i__9000___9998 + i__10000___14998 + i__15000___24998 + i__25000_plus) then 2999 when (i_under_999 + i__1000___1998 + i__2000___2998 + i__3000___3998) > (i__4000___4998 + i__5000___5998 + i__6000___6998 + i__7000___7998 + i__8000___8998 + i__9000___9998 + i__10000___14998 + i__15000___24998 + i__25000_plus) then 3999 when (i_under_999 + i__1000___1998 + i__2000___2998 + i__3000___3998 + i__4000___4998) > (i__5000___5998 + i__6000___6998 + i__7000___7998 + i__8000___8998 + i__9000___9998 + i__10000___14998 + i__15000___24998 + i__25000_plus) then 4999 when (i_under_999 + i__1000___1998 + i__2000___2998 + i__3000___3998 + i__4000___4998 + i__5000___5998) > (i__6000___6998 + i__7000___7998 + i__8000___8998 + i__9000___9998 + i__10000___14998 + i__15000___24998 + i__25000_plus) then 5999 when (i_under_999 + i__1000___1998 + i__2000___2998 + i__3000___3998 + i__4000___4998 + i__5000___5998 + i__6000___6998) > (i__7000___7998 + i__8000___8998 + i__9000___9998 + i__10000___14998 + i__15000___24998 + i__25000_plus) then 6999 when (i_under_999 + i__1000___1998 + i__2000___2998 + i__3000___3998 + i__4000___4998 + i__5000___5998 + i__6000___6998 + i__7000___7998) > (i__8000___8998 + i__9000___9998 + i__10000___14998 + i__15000___24998 + i__25000_plus) then 7999 when (i_under_999 + i__1000___1998 + i__2000___2998 + i__3000___3998 + i__4000___4998 + i__5000___5998 + i__6000___6998 + i__7000___7998 + i__8000___8998) > (i__9000___9998 + i__10000___14998 + i__15000___24998 + i__25000_plus) then 8999 when (i_under_999 + i__1000___1998 + i__2000___2998 + i__3000___3998 + i__4000___4998 + i__5000___5998 + i__6000___6998 + i__7000___7998 + i__8000___8998 + i__9000___9998) > (i__10000___14998 + i__15000___24998 + i__25000_plus) then 9999 when (i_under_999 + i__1000___1998 + i__2000___2998 + i__3000___3998 + i__4000___4998 + i__5000___5998 + i__6000___6998 + i__7000___7998 + i__8000___8998 + i__9000___9998 + i__10000___14998) > (i__15000___24998 + i__25000_plus) then 14999 when (i_under_999 + i__1000___1998 + i__2000___2998 + i__3000___3998 + i__4000___4998 + i__5000___5998 + i__6000___6998 + i__7000___7998 + i__8000___8998 + i__9000___9998 + i__10000___14998 + i__15000___24998) > i__25000_plus then 24999 else 25000 end as median FROM us_tracts_1960 ct join urdr_city_id_key cities on cities.nhgiscty = ct.nhgiscty and cities.city_id = " + city_id + " join census_data_1960 d on ct.gisjoin = d.gisjoin and (negro + white) > 0  order by percent desc, median").replace(/\+/g, '%2B'),
        format: 'JSON'
      }
    ]).then(responses => {
      // responses[0].forEach(response => {
      //   this.parseCityData(response);
      //   if (!this.data.cities[city_id].projects[response.project_id]) {
      //     this.data.cities[city_id].projects[response.project_id] = {
      //       project: response.project,
      //       id: response.project_id,
      //       theGeojson: JSON.parse(response.project_geojson),
      //       startYear: null,
      //       endYear: null,
      //       yearsData: {}
      //     };
      //   }
      //   // get start and end years
      //   if (!this.data.cities[city_id].projects[response.project_id].yearsData[response.year]) {
      //     this.data.cities[city_id].projects[response.project_id].yearsData[response.year] = {};
      //     this.data.cities[city_id].projects[response.project_id].startYear = (!this.data.cities[city_id].projects[response.project_id].startYear || response.year < this.data.cities[city_id].projects[response.project_id].startYear) ? response.year :  this.data.cities[city_id].projects[response.project_id].startYear;
      //     this.data.cities[city_id].projects[response.project_id].endYear = (!this.data.cities[city_id].projects[response.project_id].endYear || response.year > this.data.cities[city_id].projects[response.project_id].endYear) ? response.year :  this.data.cities[city_id].projects[response.project_id].endYear;
      //   }
      //   this.data.cities[city_id].projects[response.project_id].yearsData[response.year][this.getCategoryName(response.category_id)] = response.total;
      // });

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
        pop_1940: parseInt(response.pop_1940),
        pop_1950: parseInt(response.pop_1950),
        pop_1960: parseInt(response.pop_1960),
        pop_1970: parseInt(response.pop_1970),
        white_1960: parseInt(response.white_1960),
        nonwhite_1960: parseInt(response.nonwhite_1960),
        nonwhite_1970: parseInt(response.nonwhite_1970),
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

  getSelectedYear: function() { return this.data.selectedYear; },

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

  setSelectedYear: function(year) {
    this.data.selectedYear = year;
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

  getFamiliesDisplaced: function(year) {
    return (this.data && this.data.loaded) ?
      this.getCitiesList()
        .filter(cityData => cityData.yearsData[year] && cityData.yearsData[year]['totalFamilies'] > 0 )
        .map(cityData => {
          return {
            lngLat: [cityData.lng, cityData.lat],
            city_id: cityData.city_id,
            'non-white families': cityData.yearsData[year]['non-white families'],
            'white families': cityData.yearsData[year]['white families'],
            value: cityData.yearsData[year]['totalFamilies'],
            color: (cityData.yearsData[year]['percentFamiliesOfColor'] >= this.getPOCBottom() && cityData.yearsData[year]['percentFamiliesOfColor'] <= this.getPOCTop()) ? HelperFunctions.getColorForRace(cityData.yearsData[year]['percentFamiliesOfColor']) : 'transparent',
            name: cityData.city
          };
        })
        .sort((a,b) => b.value - a.value) :
      [];
  },

  getDorlings: function() {
    // need to add something to select category
    if (this.data.selectedCategory == 'families') {
      return (this.data && this.data.loaded) ?
        this.getCitiesList()
          .filter(cityData => cityData.yearsData[this.data.selectedYear] && cityData.yearsData[this.data.selectedYear]['totalFamilies'] > 0 && GeographyStore.projected([cityData.lng, cityData.lat]) !== null)
          .map(cityData => {
            return {
              lngLat: [cityData.lng, cityData.lat],
              cx: GeographyStore.projectedX([cityData.lng, cityData.lat]),
              cy: GeographyStore.projectedY([cityData.lng, cityData.lat]),
              city_id: cityData.city_id,
              value: cityData.yearsData[this.data.selectedYear]['totalFamilies'],
              color: (cityData.yearsData[this.data.selectedYear]['percentFamiliesOfColor'] >= this.getPOCBottom() && cityData.yearsData[this.data.selectedYear]['percentFamiliesOfColor'] <= this.getPOCTop()) ? HelperFunctions.getColorForRace(cityData.yearsData[this.data.selectedYear]['percentFamiliesOfColor']) : 'transparent',
              name: cityData.city
            };
          })
          .sort((a,b) => b.value - a.value) :
        [];
    } else if (this.data.selectedCategory == 'funding') {
      return (this.data && this.data.loaded) ?
        this.getCitiesList()
          .filter(cityData => cityData.yearsData[this.data.selectedYear] && cityData.yearsData[this.data.selectedYear]['totalFamilies'] > 0 && GeographyStore.projected([cityData.lng, cityData.lat]) !== null)
          .map(cityData => {
            return {
              lngLat: [cityData.lng, cityData.lat],
              city_id: cityData.city_id,
              value: cityData.yearsData[this.data.selectedYear]['urban renewal grants dispursed'],
              color: '#9E7B9B',
              name: cityData.city
            };
          })
          .sort((a,b) => b.value - a.value) :
        [];
    } else {
      return [];
    }
  },

  getVisibleCityIds: function() {
    const bb = GeographyStore.getBoundingBox();
    // get those inside the box
    let inside = this.getDorlings()
      .filter(d => d.cx >= bb[0][0] && d.cx <= bb[1][0] && d.cy >= bb[0][1] && d.cy <= bb[1][1])
      .map(d => d.city_id);
    
    let intersects = this.getDorlings()
      .filter(d => {
        // exclude if it's inside already
        if (inside.includes(d.city_id)) {
          return false;
        }
        // calculate the distance to the bounding box
        let dist = 100000000;
        // calculate if it's above or below
        if (d.cx >= bb[0][0] && d.cx <= bb[1][0]) {
          dist = Math.min(dist, (d.cy <= bb[0][1]) ? bb[0][1] - d.cy : (d.cy >= bb[1][1]) ? d.cy - bb[1][1] : 100000000);
        }
        // calculate if it's right or left 
        if (d.cy >= bb[0][1] && d.cy <= bb[1][1]) {
          dist = Math.min(dist, (d.cx <= bb[0][0]) ? bb[0][0] - d.cx : (d.cx >= bb[1][0]) ? d.cx - bb[1][0] : 100000000);
        }
        // check against the corners if it's diagonal
        if (dist == 100000000 ) {
          let closestCornerDist = Math.min(
            Math.sqrt((bb[0][0] - d.cx) * (bb[0][0] - d.cx) + (bb[0][1] - d.cy) * (bb[0][1] - d.cy)),
            Math.sqrt((bb[1][0] - d.cx) * (bb[1][0] - d.cx) + (bb[0][1] - d.cy) * (bb[0][1] - d.cy)),
            Math.sqrt((bb[1][0] - d.cx) * (bb[1][0] - d.cx) + (bb[1][1] - d.cy) * (bb[1][1] - d.cy)),
            Math.sqrt((bb[0][0] - d.cx) * (bb[0][0] - d.cx) + (bb[1][1] - d.cy) * (bb[1][1] - d.cy))
          );
          dist = Math.min(dist, closestCornerDist);
        } 

        return dist < DimensionsStore.getDorlingRadius(d.value);
      })
      .map(d => d.city_id);
    return inside.concat(intersects);
  },

  getVisibleCities: function() {
    const cityIds = this.getVisibleCityIds();
    return this.getCitiesList().filter(d => cityIds.includes(d.city_id));
  },

  getVisibleCitiesByState: function() {
    const cities = this.getVisibleCities();
    let states = [];
    cities.forEach(city => {
      const i = states.findIndex(s => s.abbr == city.state);
      if (i == -1) {
        states.push({
          abbr: city.state,
          name: StateAbbrs[city.state.toUpperCase()],
          cities: [city]
        });
      } else {
        states[i].cities.push(city);
      }
    });

    states.sort((a,b) => (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0));
    states.forEach(s => s.cities.sort((a,b) => (a.city > b.city) ? 1 : ((b.city > a.city) ? -1 : 0)));

    return states;
  },

  getIntersectingDorlings: function() { 
    const cityIds = this.getVisibleCityIds();
    return this.getDorlings().filter(d => cityIds.includes(d.city_id));
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
    const year = (action.hashState.year) ? action.hashState.year : 1960,
      category = (action.hashState.cat) ? action.hashState.cat : 'families';
    CitiesStore.loadInitialData(year, action.hashState.city, category);
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
    CitiesStore.setSelectedYear(action.value);
    if (CitiesStore.yearLoaded(action.value)) {
    } else {
      CitiesStore.loadYearData(action.value);
    } 
    break;

  case AppActionTypes.POCSelected:
    if (action.leftOrRight == 'right') {
      CitiesStore.setPOCBottom(action.value);
    } else if (action.leftOrRight == 'left') {
      CitiesStore.setPOCTop(action.value);
    }
    break;

  }
  return true;
});

export default CitiesStore;