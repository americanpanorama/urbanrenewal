import { EventEmitter } from 'events';
import AppDispatcher from '../utils/AppDispatcher';
import { AppActionTypes } from '../utils/AppActionCreator';
import CartoDBLoader from '../utils/CartoDBLoader';
import GeographyStore from './GeographyStore';
import DimensionsStore from './DimensionsStore';
import { getColorForRace, calculateDorlingsPosition, calculateDorlingsPositionUnprojected } from '../utils/HelperFunctions';
import StateAbbrs from '../../data/stateAbbrs.json';
import DorlingLocations from '../../data/dorlingLngLats.json';
import DorlingXYs from '../../data/dorlingXYs.json';

const CitiesStore = {

  data: {
    // state data about selected
    selectedYear: null,
    selectedCategory: 'families',
    selectedCity: null,
    inspectedCity: null,
    selectedView: 'cartogram',
    poc: [0, 1],

    // the city data propers
    cities: {},
    categories: {
      'totalFamiles': {category: 'total Families'},
      'percentFamiliesOfColor': {category: 'Percent families of color'}
    },
    yearsTotals: {},
    dorlingXYs: {},
    maxDisplacementsInCityForYear: 5139,

    // util variables to prevent reloading data that's already been loaded
    loaded: false,
    yearsLoaded: [],
    citiesLoaded: []
  },

  dataLoader: CartoDBLoader,

  // LOADERS

  loadInitialData: function(year, citySlug, viz, selectedCategory) {
    this.setSelectedView(viz);

    // initiate year keys on yearsTotal
    [...Array(1966-1954).keys()].map(num => num+1955).forEach(year => this.data.yearsTotals[year] = { white: 0, nonwhite: 0});

    this.dataLoader.query([
      {
        // category metadata
        query: "SELECT max(value) as max, md.category_id, assessed_category, unit_of_measurement from urdr_category_id_key c join combined_dire_char_raw md on c.category_id = md.category_id group by md.category_id, assessed_category, unit_of_measurement union (select total as max, 1000 as category_id, 'totalFamilies' as assessed_category, 'familiies' as unit_of_measurement from (SELECT sum(value) as total, city_id, year from urdr_category_id_key c join combined_dire_char_raw md on c.category_id = md.category_id and (c.category_id = 71 or c.category_id = 72) and value is not null group by city_id, year order by sum(value) desc limit 1) tf)",
        format: 'JSON'
      },
      // data for projects: duration, displacments, etc.
      { query: "with polygon_bounds as (select city_id, round(st_xmin(st_envelope(st_collect(urdr_id_key.the_geom)))::numeric, 3) as bbxmin, round(st_ymin(st_envelope(st_collect(urdr_id_key.the_geom)))::numeric, 3) as bbymin, round(st_xmax(st_envelope(st_collect(urdr_id_key.the_geom)))::numeric, 3) as bbxmax, round(st_ymax(st_envelope(st_collect(urdr_id_key.the_geom)))::numeric, 3) as bbymax, round(st_x(st_centroid(st_envelope(st_collect(urdr_id_key.the_geom))))::numeric, 3) as centerlng, round(st_y(st_centroid(st_envelope(st_collect(urdr_id_key.the_geom))))::numeric, 3) as centerlat FROM urdr_id_key group by city_id) SELECT d.project_id, d.start_year, d.end_year, d.whites, d.nonwhite, ST_Y(cities.the_geom) as lat, ST_X(cities.the_geom) as lng, cities.city, cities.state, p.project, st_asgeojson(p.the_geom) as project_geojson, pop_1940, pop_1950, pop_1960, pop_1970, white_1960, white_1970, nonwhite_1960, nonwhite_1970, polygon_bounds.* FROM digitalscholarshiplab.urdr_displacements d join urdr_city_id_key cities on cities.city_id = d.city_id join urdr_id_key p on p.project_id = d.project_id join ur_city_census_data on cities.city_id = ur_city_census_data.city_id join polygon_bounds on polygon_bounds.city_id = cities.city_id",
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
        let duration = 1 + response.end_year - response.start_year;
        for (let aYear = response.start_year; aYear <= response.end_year; aYear += 1) {
          let whites = response.whites / duration,
            nonwhite = response.nonwhite / duration;

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
            center: (response.centerlat !== null) ? [response.centerlat,response.centerlng] : null,
            boundingBox: (response.bbymin !== null) ? [[response.bbymin,response.bbxmin],[response.bbymax,response.bbxmax]] : null,
            yearsData: {},
            maxDisplacmentsForYear: 0,
            'white families': 0,
            'non-white families': 0,
            totalFamilies: 0,
            percentFamiliesOfColor: 0,
            pop_1940: parseInt(response.pop_1940),
            pop_1950: parseInt(response.pop_1950),
            pop_1960: parseInt(response.pop_1960),
            pop_1970: parseInt(response.pop_1970),
            white_1960: parseInt(response.white_1960),
            nonwhite_1960: parseInt(response.nonwhite_1960),
            nonwhite_1970: parseInt(response.nonwhite_1970),
            hasProjectGeojson: false,
          };

          // total up year data
          this.data.yearsTotals[aYear].white += whites;
          this.data.yearsTotals[aYear].nonwhite += nonwhite;


          // aggregate total and year data for city
          if (!this.data.cities[response.city_id].yearsData[aYear]) {
            this.data.cities[response.city_id].yearsData[aYear] = {
              'white families': 0,
              'non-white families': 0,
              totalFamilies: 0
            };
          }
          this.data.cities[response.city_id].percentFamiliesOfColor = nonwhite /  (nonwhite + whites);
          this.data.cities[response.city_id].hasProjectGeojson = (response.project_geojson) ? true : this.data.cities[response.city_id].hasProjectGeojson;
          this.data.cities[response.city_id].yearsData[aYear]['white families'] += whites;
          this.data.cities[response.city_id].yearsData[aYear]['non-white families'] += nonwhite;
          this.data.cities[response.city_id].yearsData[aYear]['totalFamilies'] += nonwhite + whites;
          this.data.cities[response.city_id].yearsData[aYear].percentFamiliesOfColor = this.data.cities[response.city_id].yearsData[aYear]['non-white families'] /  this.data.cities[response.city_id].yearsData[aYear]['totalFamilies'];

          // project data
          this.data.cities[response.city_id].projects[response.project_id] = (this.data.cities[response.city_id].projects[response.project_id]) ? this.data.cities[response.city_id].projects[response.project_id] : {
            id: response.project_id,
            endYear: response.end_year,
            startYear: response.start_year,
            theGeojson: JSON.parse(response.project_geojson),
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

          this.data.cities[response.city_id]['white families'] += response.whites / duration;
          this.data.cities[response.city_id]['non-white families'] += response.nonwhite / duration;
          this.data.cities[response.city_id].totalFamilies += response.nonwhite / duration + response.whites / duration;
          this.data.cities[response.city_id].percentFamiliesOfColor = this.data.cities[response.city_id]['non-white families'] / this.data.cities[response.city_id].totalFamilies;



          this.data.cities[response.city_id].maxDisplacmentsForYear = (this.data.cities[response.city_id].projects[response.project_id].yearsData[aYear].totalFamilies  > this.data.cities[response.city_id].maxDisplacmentsForYear) ? this.data.cities[response.city_id].projects[response.project_id].yearsData[aYear].totalFamilies : this.data.cities[response.city_id].maxDisplacmentsForYear;
        }
      }); 

      // calculate max displacments in any city in a particular year
      this.data.maxDisplacementsInCityForYear = 0;
      Object.keys(this.data.cities).forEach(id => {
        Object.keys(this.data.cities[id].yearsData).forEach(year => {
          if (this.data.cities[id].yearsData[year].totalFamilies > this.data.maxDisplacementsInCityForYear) {
            this.data.maxDisplacementsInCityForYear = this.data.cities[id].yearsData[year].totalFamilies;
          }
        });
      });

      this.data.maxDisplacementInCity = Math.max(...Object.keys(this.data.cities).map(id => this.data.cities[id].totalFamilies));
      
      // load a city if one's specified
      if (citySlug) {
        this.loadCityData(this.getCityIdFromSlug(citySlug));
      }
      if (selectedCategory) {
        this.setSelectedCategory(selectedCategory);
      }

      this.setSelectedYear(year);

      this.assignDorlingXYs();

      this.data.loaded = true;
      this.data.yearsLoaded.push(year);

      // var citiesForDorlingProcessing = Object.keys(this.data.cities).map(id=> { return {city_id: id, lat: this.data.cities[id].lat, lng: this.data.cities[id].lng, yearsData: this.data.cities[id].yearsData}; });
      // console.log(citiesForDorlingProcessing);

      this.emit(AppActionTypes.storeChanged);
    });
  },

  loadCityData: function(city_id) {
    this.dataLoader.query([
      {
        query: ("SELECT ct.cartodb_id, ST_AsGeoJSON(ct.the_geom, 4) as the_geojson, ct.gisjoin, 100 * negro / (negro + white) as percent, case when i_under_999 > (i__1000___1998 + i__2000___2998 + i__3000___3998 + i__4000___4998 + i__5000___5998 + i__6000___6998 + i__7000___7998 + i__8000___8998 + i__9000___9998 + i__10000___14998 + i__15000___24998 + i__25000_plus) then 999 when (i_under_999 + i__1000___1998) > (i__2000___2998 + i__3000___3998 + i__4000___4998 + i__5000___5998 + i__6000___6998 + i__7000___7998 + i__8000___8998 + i__9000___9998 + i__10000___14998 + i__15000___24998 + i__25000_plus) then 1999 when (i_under_999 + i__1000___1998 + i__2000___2998) > (i__3000___3998 + i__4000___4998 + i__5000___5998 + i__6000___6998 + i__7000___7998 + i__8000___8998 + i__9000___9998 + i__10000___14998 + i__15000___24998 + i__25000_plus) then 2999 when (i_under_999 + i__1000___1998 + i__2000___2998 + i__3000___3998) > (i__4000___4998 + i__5000___5998 + i__6000___6998 + i__7000___7998 + i__8000___8998 + i__9000___9998 + i__10000___14998 + i__15000___24998 + i__25000_plus) then 3999 when (i_under_999 + i__1000___1998 + i__2000___2998 + i__3000___3998 + i__4000___4998) > (i__5000___5998 + i__6000___6998 + i__7000___7998 + i__8000___8998 + i__9000___9998 + i__10000___14998 + i__15000___24998 + i__25000_plus) then 4999 when (i_under_999 + i__1000___1998 + i__2000___2998 + i__3000___3998 + i__4000___4998 + i__5000___5998) > (i__6000___6998 + i__7000___7998 + i__8000___8998 + i__9000___9998 + i__10000___14998 + i__15000___24998 + i__25000_plus) then 5999 when (i_under_999 + i__1000___1998 + i__2000___2998 + i__3000___3998 + i__4000___4998 + i__5000___5998 + i__6000___6998) > (i__7000___7998 + i__8000___8998 + i__9000___9998 + i__10000___14998 + i__15000___24998 + i__25000_plus) then 6999 when (i_under_999 + i__1000___1998 + i__2000___2998 + i__3000___3998 + i__4000___4998 + i__5000___5998 + i__6000___6998 + i__7000___7998) > (i__8000___8998 + i__9000___9998 + i__10000___14998 + i__15000___24998 + i__25000_plus) then 7999 when (i_under_999 + i__1000___1998 + i__2000___2998 + i__3000___3998 + i__4000___4998 + i__5000___5998 + i__6000___6998 + i__7000___7998 + i__8000___8998) > (i__9000___9998 + i__10000___14998 + i__15000___24998 + i__25000_plus) then 8999 when (i_under_999 + i__1000___1998 + i__2000___2998 + i__3000___3998 + i__4000___4998 + i__5000___5998 + i__6000___6998 + i__7000___7998 + i__8000___8998 + i__9000___9998) > (i__10000___14998 + i__15000___24998 + i__25000_plus) then 9999 when (i_under_999 + i__1000___1998 + i__2000___2998 + i__3000___3998 + i__4000___4998 + i__5000___5998 + i__6000___6998 + i__7000___7998 + i__8000___8998 + i__9000___9998 + i__10000___14998) > (i__15000___24998 + i__25000_plus) then 14999 when (i_under_999 + i__1000___1998 + i__2000___2998 + i__3000___3998 + i__4000___4998 + i__5000___5998 + i__6000___6998 + i__7000___7998 + i__8000___8998 + i__9000___9998 + i__10000___14998 + i__15000___24998) > i__25000_plus then 24999 else 25000 end as median FROM us_tracts_1960 ct join urdr_city_id_key cities on cities.nhgiscty = ct.nhgiscty and cities.city_id = " + city_id + " join census_data_1960 d on ct.gisjoin = d.gisjoin and (negro + white) > 0  order by percent desc, median").replace(/\+/g, '%2B'),
        format: 'JSON'
      }
    ]).then(responses => {
      responses[0].forEach(response => {
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
      Object.keys(this.data.cities[city_id].yearsData).forEach(year => {
        // calculate family data--white families is cat 71, non-white 72
        let CityIdsToParse = (city_id) ? [city_id] : Object.keys(this.data.cities);
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
      } );

      this.data.citiesLoaded.push(city_id);
      this.setSelectedCity(city_id);
      this.emit(AppActionTypes.storeChanged);
    });
  },

  assignDorlingXYs: function() {
    DorlingXYs.forEach(yearData => {
      this.data.dorlingXYs[yearData.year] = (!this.data.dorlingXYs[yearData.year]) ? {} : this.data.dorlingXYs[yearData.year];
      yearData.cities.forEach(cityData => {
        this.data.dorlingXYs[yearData.year][cityData.city_id] = [ cityData.x * DimensionsStore.getMapScale() + DimensionsStore.getNationalMapWidth() / 2, cityData.y * DimensionsStore.getMapScale() + DimensionsStore.getNationalMapHeight() / 2 ];
      });
    });
    this.emit(AppActionTypes.storeChanged);
  },

  // SETTERS

  setInspectedCity: function(city_id) {
    this.data.inspectedCity = city_id;
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

  setSelectedCategory: function(category_id) {
    this.data.selectedCategory = category_id;
    this.emit(AppActionTypes.storeChanged);
  },

  setSelectedCity: function(city_id) {
    this.data.selectedCity = city_id;
    this.emit(AppActionTypes.storeChanged);
  },

  setSelectedView: function(view) {
    this.data.selectedView = view;
    this.emit(AppActionTypes.storeChanged);
  },

  setSelectedYear: function(year) {
    this.data.selectedYear = year;
    this.emit(AppActionTypes.storeChanged);
  },

  // CHECKERS
  
  cityLoaded: function(city_id) { return (this.data.citiesLoaded.indexOf(city_id) !== -1); },

  yearLoaded: function(year) { return (this.data.yearsLoaded.indexOf(year) !== -1); },

  // GETTERS

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

  getCategoryIdFromName: function(name) { return Object.keys(this.data.categories).filter(id => (this.data.categories[id].category == name))[0]; },

  getCategoryName: function(category_id) { return (this.data.categories[category_id]) ? this.data.categories[category_id].category : ''; },

  getCategoryUnit: function(category_id) { return (this.data.categories[category_id]) ? this.data.categories[category_id].unit : ''; },

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

  getCityData: function(city_id) { return (this.data && this.data.loaded && this.data.cities[city_id]) ? this.data.cities[city_id] : {}; },
  
  getCityId: function(project_id) { return Object.keys(this.data.cities).filter(city_id => this.data.cities[city_id].projects.hasOwnProperty(project_id))[0]; },

  getCityIdFromSlug: function(slug) { return (this.data.cities) ? Object.keys(this.data.cities).filter(cityId => (this.data.cities[cityId].slug == slug))[0] : null; },

  getDorlingXY: function(city_id) { return (this.data.loaded && this.data.dorlingXYs[this.data.selectedYear][city_id]) ? this.data.dorlingXYs[this.data.selectedYear][city_id] : [0,0]; },

  getDorlings: function() {
    // need to add something to select category
    if (this.data.selectedCategory == 'families') {
      return (this.data && this.data.loaded) ?
        this.getCitiesList()
          .filter(cityData => GeographyStore.projected([cityData.lng, cityData.lat]) !== null)
          //.filter(cityData => (this.data.selectedYear) ? cityData.yearsData[this.data.selectedYear] && cityData.yearsData[this.data.selectedYear]['totalFamilies'] > 0 : cityData.totalFamilies && cityData.totalFamilies > 0)
          .filter(cityData => cityData.yearsData[this.data.selectedYear]['percentFamiliesOfColor'] >= this.getPOCBottom() && cityData.yearsData[this.data.selectedYear]['percentFamiliesOfColor'] <= this.getPOCTop())
          .map(cityData => {
            return {
              lngLat: [cityData.lng, cityData.lat],
              cx: GeographyStore.projectedX([cityData.lng, cityData.lat]),
              cy: GeographyStore.projectedY([cityData.lng, cityData.lat]),
              city_id: cityData.city_id,
              value: (this.data.selectedYear && false) ? cityData.yearsData[this.data.selectedYear]['totalFamilies'] : cityData.totalFamilies,
              color: (this.data.selectedYear && cityData.yearsData[this.data.selectedYear]['percentFamiliesOfColor'] >= this.getPOCBottom() && cityData.yearsData[this.data.selectedYear]['percentFamiliesOfColor'] <= this.getPOCTop()) ? getColorForRace(cityData.yearsData[this.data.selectedYear]['percentFamiliesOfColor']) : (cityData.percentFamiliesOfColor >= this.getPOCBottom() && cityData.percentFamiliesOfColor <= this.getPOCTop()) ? getColorForRace(cityData.percentFamiliesOfColor) : 'transparent',
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

  getDorlingsForce: function() {
    // need to add something to select category
    
    if (this.data.selectedCategory == 'families') {
      return (this.data && this.data.loaded) ?
        this.getCitiesList()
          //.filter(cityData => GeographyStore.projected([cityData.lng, cityData.lat]) !== null)
          .filter(cityData => (this.data.selectedYear) ? cityData.yearsData[this.data.selectedYear] && cityData.yearsData[this.data.selectedYear]['totalFamilies'] > 0 && cityData.name !== 'hartford' : cityData.totalFamilies && cityData.totalFamilies > 0 && cityData.name !== 'hartford')
          .map(cityData => {
            let cx, cy;
            if (this.data.selectedView == 'scatterplot') {
              const shortside = Math.min(DimensionsStore.getNationalMapWidth() * 0.4, DimensionsStore.getNationalMapHeight() * 0.4),
                l = Math.sqrt(2*shortside*shortside);
              cx = (this.getCityData(cityData.city_id).pop_1960 && this.getCityData(cityData.city_id).nonwhite_1960) ? (this.getCityData(cityData.city_id).nonwhite_1960 / this.getCityData(cityData.city_id).pop_1960) * l : -900;
              cy = (this.data.selectedYear) ? l - this.getCityData(cityData.city_id).yearsData[this.data.selectedYear].percentFamiliesOfColor * l : l - this.getCityData(cityData.city_id).percentFamiliesOfColor * l;
              [cx, cy] = DimensionsStore.translateScatterplotPoint([cx, cy]);
            } else if (this.data.selectedView == 'cartogram') {
              [cx, cy] = this.getDorlingXY(cityData.city_id);
            } else {
              [cx, cy] = GeographyStore.projected([cityData.lng, cityData.lat]);
            }

            return {
              lngLat: [cityData.lng, cityData.lat],
              cx: cx,
              cy: cy,
              r: DimensionsStore.getDorlingRadius((this.data.selectedYear && false) ? cityData.yearsData[this.data.selectedYear]['totalFamilies'] : cityData.totalFamilies), 
              city_id: cityData.city_id,
              value: (this.data.selectedYear !== null) ? cityData.yearsData[this.data.selectedYear]['totalFamilies'] : cityData.totalFamilies,
              color: (this.data.selectedYear && cityData.yearsData[this.data.selectedYear].percentFamiliesOfColor >= this.getPOCBottom() && cityData.yearsData[this.data.selectedYear].percentFamiliesOfColor <= this.getPOCTop()) ? getColorForRace(cityData.yearsData[this.data.selectedYear].percentFamiliesOfColor) : (cityData.percentFamiliesOfColor >= this.getPOCBottom() && cityData.percentFamiliesOfColor <= this.getPOCTop()) ? getColorForRace(cityData.percentFamiliesOfColor) : 'transparent',
              name: cityData.city,
              hasProjectGeojson: cityData.hasProjectGeojson
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

  getDorlingsForceForYear: function(year) {
    return (this.data && this.data.loaded) ?
      this.getCitiesList()
        //.filter(cityData => GeographyStore.albersUsaPr().translate([0,0]).scale(1)([cityData.lng, cityData.lat]) !== null)
        .filter(cityData => (year) ? cityData.yearsData[year] && cityData.yearsData[year]['totalFamilies'] > 0 : cityData.totalFamilies && cityData.totalFamilies > 0)
        .map(cityData => {
          let [x,y] = GeographyStore.albersUsaPr().translate([0,0]).scale(1)([cityData.lng, cityData.lat]);
          if (isNaN(x) || isNaN(y)) {
            console.log(cityData);
          }
          return {
            lngLat: [cityData.lng, cityData.lat],
            x: x,
            y: y,
            x0: x,
            y0: y,
            cx: x,
            cy: y,
            r: (DimensionsStore.getDorlingRadius((year !== null) ? cityData.yearsData[year]['totalFamilies'] : cityData.totalFamilies)) / DimensionsStore.getMapScale(), 
            city_id: cityData.city_id,
            value: (year && false) ? cityData.yearsData[year]['totalFamilies'] : cityData.totalFamilies,
            color: (year && cityData.yearsData[year]['percentFamiliesOfColor'] >= this.getPOCBottom() && cityData.yearsData[year]['percentFamiliesOfColor'] <= this.getPOCTop()) ? getColorForRace(cityData.yearsData[year]['percentFamiliesOfColor']) : (cityData.percentFamiliesOfColor >= this.getPOCBottom() && cityData.percentFamiliesOfColor <= this.getPOCTop()) ? getColorForRace(cityData.percentFamiliesOfColor) : 'transparent',
            name: cityData.city
          };
        })
        .sort((a,b) => a.value - b.value) :
      [];
  },

  getHighlightedCity: function() { return this.getInspectedCity() || this.getSelectedCity(); },

  getInspectedCity: function() { return this.data.inspectedCity; },

  getPOC: function() { return this.data.poc; },

  getPOCBottom: function() { return this.data.poc[0]; },

  getPOCTop: function() { return this.data.poc[1]; },

  getProjectTimelineBars: function(cityId) {
    let projects = Object.keys(this.data.cities[cityId].projects)
        .map(id => this.data.cities[cityId].projects[id])
        // filter out projects without displacments
        .filter(p => p.totalFamilies)
        // sort by highest number of displacments in an average year descending
        //.sort((a,b) => b.totalFamilies/(Math.min(b.endYear,1966)-b.startYear+1) - a.totalFamilies/(Math.min(a.endYear,1966)-a.startYear+1)),
        .sort((a,b) => b.totalFamilies - a.totalFamilies),
      years = [1955,1956,1957,1958,1959,1960,1961,1962,1963,1964,1965,1966];

    // sort to put the longest first
    //projects = projects.sort((a,b) => b.totalFamilies - a.totalFamilies);

    // calculate "grid" placement for each project
    let rows = [new Array(12)];
    projects.forEach((project, i) => {
      const endYear = Math.min(project.endYear, 1966);
      projects[i].endYear = endYear;
      let availableRow = false;
      rows.forEach((row, rowNum) => {
        let canFit = true;
          
        // test whether the project can fit in the space
        for (let col = years.indexOf(project.startYear); col <= years.indexOf(endYear); col ++) {
          if (rows[rowNum][col]) {
            canFit = false;
          }
          // for one year spans pad it
          if (project.startYear == endYear) {
            if ((col > 0 && rows[rowNum][col-1]) || (col <= years.indexOf(endYear) && rows[rowNum][col+1])) {
              canFit = false;
            }
          }
        }
        if (canFit && !availableRow) {
          availableRow = rowNum;
        }
      });

      projects[i].row = (availableRow !== false) ? availableRow : rows.length;
      if (!availableRow) {
        rows.push(new Array(years.length));
      }
      for (let col = years.indexOf(project.startYear); col <= years.indexOf(endYear); col ++) {
        rows[projects[i].row][col] = 'x';
        // for one year spans pad it
        if (project.startYear == endYear) {
          if (col > 0) {
            rows[projects[i].row][col-1] = 'x';
          } 
          if (col <= years.indexOf(endYear)) {
            rows[projects[i].row][col+1] = 'x';
          } 
        }
      }
    });

    return projects;
  },

  getSelectedCategory: function() { return this.data.selectedCategory; },

  getSelectedCity: function() { return this.data.selectedCity; },

  getSelectedView: function() { return this.data.selectedView; },

  getSelectedYear: function() { return this.data.selectedYear; },

  getSlug: function() { return (this.data.cities[this.getSelectedCity()] && this.data.cities[this.getSelectedCity()].slug) ? this.data.cities[this.getSelectedCity()].slug : null; },

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

  getVisibleCityIds: function() {
    const bb = GeographyStore.getBoundingBox();
    // get those inside the box
    let inside = this.getDorlings()
      .filter(d => d.cx >= bb[0][0] && d.cx <= bb[1][0] && d.cy >= bb[0][1] && d.cy <= bb[1][1])
      .map(d => d.city_id);

    return inside;
    
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

  getYearsTotals: function() { return this.data.yearsTotals; },

  getYearTotals: function(year) { return this.data.yearsTotals[year]; },

  getYearsTotalsMax: function() { return Math.max(...Object.keys(this.data.yearsTotals).map(year => this.data.yearsTotals[year].white + this.data.yearsTotals[year].nonwhite)); },

  getYearsTotalsMaxRace: function() { return Math.max(...Object.keys(this.data.yearsTotals).map(year => this.data.yearsTotals[year].nonwhite).concat(Object.keys(this.data.yearsTotals).map(year => this.data.yearsTotals[year].white))); },

  getMaxDisplacementsInCityForYear: function() { return this.data.maxDisplacementsInCityForYear; },

  getMaxDisplacementsInCity: function() { return this.data.maxDisplacementInCity; },

};

// Mixin EventEmitter functionality
Object.assign(CitiesStore, EventEmitter.prototype);

// Register callback to handle all updates
CitiesStore.dispatchToken = AppDispatcher.register((action) => {
  switch (action.type) {

  case AppActionTypes.loadInitialData:
    const year = (action.hashState.year) ? action.hashState.year : null,
      category = (action.hashState.cat) ? action.hashState.cat : 'families',
      viz = (action.hashState.viz) ? action.hashState.viz : 'cartogram' ;
    CitiesStore.loadInitialData(year, action.hashState.city, viz, category);
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

  case AppActionTypes.cityInspected:
    if (!action.value || CitiesStore.cityLoaded(action.value)) {
      CitiesStore.setInspectedCity(action.value);
    } else {
      CitiesStore.setInspectedCity(action.value);
    }
    break;

  case AppActionTypes.viewSelected:
    CitiesStore.setSelectedView(action.value);
    break;

  case AppActionTypes.dateSelected:
    CitiesStore.setSelectedYear(action.value);
    break;

  case AppActionTypes.POCSelected:
    if (action.leftOrRight == 'right') {
      CitiesStore.setPOCBottom(action.value);
    } else if (action.leftOrRight == 'left') {
      CitiesStore.setPOCTop(action.value);
    }
    break;

  case AppActionTypes.windowResized:
    CitiesStore.assignDorlingXYs();
    break;

  }
  return true;
});

export default CitiesStore;