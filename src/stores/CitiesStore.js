import { EventEmitter } from 'events';
import AppDispatcher from '../utils/AppDispatcher';
import { AppActionTypes } from '../utils/AppActionCreator';
import CartoDBLoader from '../utils/CartoDBLoader';
import GeographyStore from './GeographyStore';
import DimensionsStore from './DimensionsStore';
import { getColorForRace, calculateDorlingsPosition, calculateDorlingsPositionUnprojected, getMedian, getBottomQuartile, getTopQuartile } from '../utils/HelperFunctions';
import StateAbbrs from '../../data/stateAbbrs.json';
import DorlingLocations from '../../data/dorlingLngLats.json';
import DorlingXYs from '../../data/dorlingXYs.json';
import ProjectedCoords from '../../data/projectedCoords.json';
import nara from '../../data/nara.json';

const CitiesStore = {

  data: {
    // state data about selected
    selectedYear: null,
    selectedCategory: 'families',
    selectedCity: null,
    HOLCSelected: false,
    inspectedCity: null,
    selectedView: 'cartogram',
    selectedCityView: null,
    inspectedProject: null,
    inspectedProjectStats: null,
    selecteProject: null,
    poc: [0, 1],
    visibleCitiesIds: [],
    highlightedCities: [],
    cityLoading: false,

    // the city data propers
    cities: {},
    categories: {
      'totalFamiles': {category: 'total Families'},
      'percentFamiliesOfColor': {category: 'Percent families of color'}
    },
    yearsTotals: {},
    stats: {
      '10000': {displacements: [], percentsFamiliesOfColor: [], projects: [] },
      '25000': {displacements: [], percentsFamiliesOfColor: [], projects: [] },
      '50000': {displacements: [], percentsFamiliesOfColor: [], projects: [] },
      '100000': {displacements: [], percentsFamiliesOfColor: [], projects: [] },
      '250000': {displacements: [], percentsFamiliesOfColor: [], projects: [] },
      '500000': {displacements: [], percentsFamiliesOfColor: [], projects: [] },
      '500000+': {displacements: [], percentsFamiliesOfColor: [], projects: [] }
    },
    dorlingCoords: {},
    maxDisplacementsInCityForYear: 5139,

    // util variables to prevent reloading data that's already been loaded
    loaded: false,
    yearsLoaded: [],
    citiesLoaded: []
  },

  dataLoader: CartoDBLoader,

  // LOADERS

  loadInitialData: function(year, viz, selectedCategory) {
    this.setSelectedView(viz);

    this.dataLoader.query([
      {
        // category metadata
        query: "SELECT max(value) as max, md.category_id, assessed_category, unit_of_measurement from urdr_category_id_key c join combined_dire_char_raw md on c.category_id = md.category_id group by md.category_id, assessed_category, unit_of_measurement union (select total as max, 1000 as category_id, 'totalFamilies' as assessed_category, 'familiies' as unit_of_measurement from (SELECT sum(value) as total, city_id, year from urdr_category_id_key c join combined_dire_char_raw md on c.category_id = md.category_id and (c.category_id = 71 or c.category_id = 72) and value is not null group by city_id, year order by sum(value) desc limit 1) tf)",
        format: 'JSON'
      },
      {
        // cities data
        query: "with polygon_bounds as (select city_id, round(st_xmin(st_envelope(st_collect(urdr_id_key.the_geom)))::numeric, 3) as bbxmin, round(st_ymin(st_envelope(st_collect(urdr_id_key.the_geom)))::numeric, 3) as bbymin, round(st_xmax(st_envelope(st_collect(urdr_id_key.the_geom)))::numeric, 3) as bbxmax, round(st_ymax(st_envelope(st_collect(urdr_id_key.the_geom)))::numeric, 3) as bbymax, round(st_x(st_centroid(st_envelope(st_collect(urdr_id_key.the_geom))))::numeric, 3) as centerlng, round(st_y(st_centroid(st_envelope(st_collect(urdr_id_key.the_geom))))::numeric, 3) as centerlat FROM urdr_id_key group by city_id), tracts_bounds as (select city_id, round(st_xmin(st_envelope(st_collect(ct.the_geom)))::numeric, 3) as bbxmin, round(st_ymin(st_envelope(st_collect(ct.the_geom)))::numeric, 3) as bbymin, round(st_xmax(st_envelope(st_collect(ct.the_geom)))::numeric, 3) as bbxmax, round(st_ymax(st_envelope(st_collect(ct.the_geom)))::numeric, 3) as bbymax, round(st_x(st_centroid(st_envelope(st_collect(ct.the_geom))))::numeric, 3) as centerlng, round(st_y(st_centroid(st_envelope(st_collect(ct.the_geom))))::numeric, 3) as centerlat FROM us_tracts_1960 ct join urdr_city_id_key cities on cities.nhgiscty = ct.nhgiscty and cities.nhgisst = ct.nhgisst group by city_id) select cities.city_id, cities.city, cities.state, ST_Y(cities.the_geom) as lat, ST_X(cities.the_geom) as lng, pop_1940, pop_1950, pop_1960, pop_1970, white_1960, white_1970, nonwhite_1960, nonwhite_1970, polygon_bounds.bbxmin, polygon_bounds.bbymin, polygon_bounds.bbxmax, polygon_bounds.bbymax, polygon_bounds.centerlng, polygon_bounds.centerlat, tracts_bounds.bbxmin as tbbxmin, tracts_bounds.bbymin as tbbymin, tracts_bounds.bbxmax as tbbxmax, tracts_bounds.bbymax as tbbymax, tracts_bounds.centerlng  as tcenterlng, tracts_bounds.centerlat as tcenterlat from urdr_city_id_key cities left join ur_city_census_data on cities.city_id = ur_city_census_data.city_id left join polygon_bounds on polygon_bounds.city_id = cities.city_id left join tracts_bounds on tracts_bounds.city_id = cities.city_id",
        format: 'JSON'
      },
      // data for projects: duration, displacments, etc.
      { query: "select projects.city_id, projects.project_id, projects.project, project_type, st_asgeojson(projects.the_geom) as the_geojson, round(st_xmin(st_envelope(projects.the_geom))::numeric, 3) as bbxmin, round(st_ymin(st_envelope(projects.the_geom))::numeric, 3) as bbymin, round(st_xmax(st_envelope(projects.the_geom))::numeric, 3) as bbxmax, round(st_ymax(st_envelope(projects.the_geom))::numeric, 3) as bbymax, round(st_y(st_centroid(projects.the_geom))::numeric, 3) as centerlat, round(st_x(st_centroid(projects.the_geom))::numeric, 3) as centerlng, duration.start_year, duration.end_year, whites.value as whites, nonwhites.value as nonwhite, pr.value as pr_total, substandard.value as substandard, standard.value as standard, funding.value as funding, planning, contract, completion, completed.year as completed_year, active.year as active_year, planning.year as planning_year from urdr_id_key projects join (SELECT project_id, min(year) as start_year, max(year) as end_year FROM combined_dire_char_raw group by project_id, city_id) duration on projects.project_id = duration.project_id left join (SELECT distinct on (project_id) project_id, value FROM digitalscholarshiplab.combined_dire_char_raw where category_id = 71 order by project_id, year desc) whites on whites.project_id = projects.project_id left join (SELECT distinct on (project_id) project_id, value FROM digitalscholarshiplab.combined_dire_char_raw where category_id = 72 order by project_id, year desc) nonwhites on nonwhites.project_id = projects.project_id left join (SELECT distinct on (project_id) project_id, value FROM digitalscholarshiplab.combined_dire_char_raw where category_id = 80 order by project_id, year desc) pr on pr.project_id = projects.project_id left join (SELECT distinct on (project_id) project_id, value FROM digitalscholarshiplab.combined_dire_char_raw where category_id = 69 order by project_id, year desc) substandard on substandard.project_id = projects.project_id left join (SELECT distinct on (project_id) project_id, value FROM digitalscholarshiplab.combined_dire_char_raw where category_id = 70 order by project_id, year desc) standard on standard.project_id = projects.project_id left join (SELECT distinct on (project_id) project_id, value FROM digitalscholarshiplab.combined_dire_char_raw where category_id = 68 order by project_id, year desc) funding on funding.project_id = projects.project_id left join (SELECT distinct on (project_id) project_id, year FROM digitalscholarshiplab.combined_dire_char_raw where category_id = 88 and value = 3 order by project_id, year) completed on completed.project_id = projects.project_id left join (SELECT distinct on (project_id) project_id, year FROM digitalscholarshiplab.combined_dire_char_raw where category_id = 88 and value = 2 order by project_id, year) active on active.project_id = projects.project_id left join (SELECT distinct on (project_id) project_id, year FROM digitalscholarshiplab.combined_dire_char_raw where category_id = 88 and value = 1 order by project_id, year) planning on planning.project_id = projects.project_id",
        format: 'JSON'
      },
      // national stats
      { query: "SELECT year, value, assessed_category FROM urdr_national_data join urdr_category_id_key on nat_id = category_id where year >= 1955 and year <= 1966",
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

      responses[1].forEach(r => {
        // calculate some additional/aggregate and initialization values 
        r.id = r.city_id;
        r.slug = r.city.replace(/ /g,'').toLowerCase() + r.state.toUpperCase();
        r.searchName = r.city + ' ' + StateAbbrs[r.state.toUpperCase()];
        r.center = (r.centerlat !== null) ? [r.centerlat,r.centerlng] : null;
        r.hasProjectGeojson = (r.centerlat !== null);
        r.boundingBox = (r.bbymin !== null) ? [[r.bbymin,r.bbxmin],[r.bbymax,r.bbxmax]] : null;
        r.tractsBoundingBox = (r.tbbymin !== null) ? [[r.tbbymin,r.tbbxmin],[r.tbbymax,r.tbbxmax]] : null;
        r.detectionBoundingBox = r.boundingBox || r.center || [[r.lat + 0.008, r.lng - 0.01], [r.lat - 0.008, r.lng + 0.01]];
        r.projects = {};
        r.yearsData = {};
        r.tracts = {};
        r.holc_areas = [];
        r.maxDisplacmentsForYear = 0;
        r.whites = 0;
        r.nonwhite = 0;
        r.totalFamilies = 0;
        r.percentFamiliesOfColor = 0;
        r.projectsWithDisplacements = 0;
        
        // delete a few values you no longer need
        delete r.centerlat;
        delete r.centerlng;
        delete r.bbymin;
        delete r.bbxmin;
        delete r.bbymax;
        delete r.bbxmax;
        delete r.tcenterlat;
        delete r.tcenterlng;
        delete r.tbbymin;
        delete r.tbbxmin;
        delete r.tbbymax;
        delete r.tbbxmax;

        this.data.cities[r.city_id] = r;
      });

      let durations = {};

      responses[2].forEach(r => {
        // calculate some additional/aggregate and initialization values 
        r.the_geojson = JSON.parse(r.the_geojson);
        r.totalFamilies = r.nonwhite + r.whites + r.pr_total;
        r.percentFamiliesOfColor = (this.data.cities[r.city_id].state !== 'pr' && this.data.cities[r.city_id].state !== 'vi') ? r.nonwhite / r.totalFamilies : null;
        r.yearsData = {};
        r.citations = {};
        r.center = [r.centerlat,r.centerlng];
        r.boundingBox = (r.bbymin) ? [[r.bbymin,r.bbxmin],[r.bbymax,r.bbxmax]] : null;
        if (r.contract) {
          r.active_start_year = 1900 + parseInt(r.contract.split('-')[0]);
          r.planning_start_year = (r.planning && r.planning !== 'none') ? 1900 + Math.min(parseInt(r.planning.split('-')[0]), r.start_year) : null;
          r.completed_year = (r.completion) ? 1900 + parseInt(r.completion.split('-')[0]) : 1974;
        } else {
          r.active_start_year = r.start_year;
          r.planning_start_year = null;
          r.completed_year = r.completed_year || r.end_year  || 1974;
        }
        // r.planning_start_year = (r.planning && r.planning !== 'none') ? 1900 + Math.min(parseInt(r.planning.split('-')[0]), r.start_year) : (r.planning_year) ? Math.min(r.planning_year, r.start_year) : r.start_year;
        // r.active_start_year = (r.contract&& r.contract !== 'none') ? 1900 + parseInt(r.contract.split('-')[0]) : r.active_year || r.start_year;
        // r.completed_year = (r.completed && r.completed !== 'none') ? 1900 + parseInt(r.completed.split('-')[0]) : r.completed_year || r.end_year || 1974;


        delete r.centerlat;
        delete r.centerlng;
        delete r.bbymin;
        delete r.bbxmin;
        delete r.bbymax;
        delete r.bbxmax;
        delete r.completed;
        delete r.planning_year;
        delete r.planning;
        delete r.active_year;
        delete r.contract;

        // add the project
        this.data.cities[r.city_id].projects[r.project_id] = r;

        // aggregate city-level data
        this.data.cities[r.city_id].whites += r.whites;
        this.data.cities[r.city_id].nonwhite += r.nonwhite;
        this.data.cities[r.city_id].totalFamilies += r.totalFamilies;
        this.data.cities[r.city_id].percentFamiliesOfColor = (this.data.cities[r.city_id].state !== 'pr' && this.data.cities[r.city_id].state !== 'vi') ? this.data.cities[r.city_id].nonwhite / this.data.cities[r.city_id].totalFamilies : null;
        if (r.totalFamilies > 0) {
          this.data.cities[r.city_id].projectsWithDisplacements += 1;
        }

        const duration = Math.round(Math.max((1 + r.completed_year - r.active_start_year) / 3, 1));
        durations[duration] = (durations[duration]) ? durations[duration] + 1 : 1;

        // calculate and add years data
        for (let aYear = r.active_start_year; aYear <= r.active_start_year + duration; aYear += 1) {
          //const duration = (r.active_start_year) >= 1965 ? 1967 - r.active_start_year : 3,
          
          const whites = r.whites / duration,
            nonwhite = r.nonwhite / duration,
            prForYear = r.pr_total / duration,
            substandard = r.substandard / duration,
            standard = r.standard / duration;


          this.data.yearsTotals[aYear] = this.data.yearsTotals[aYear] || {whites: 0, nonwhite: 0, unspecified: 0, houses_sub_standard: 0, houses_standard: 0};
          this.data.yearsTotals[aYear].whites += whites;
          this.data.yearsTotals[aYear].nonwhite += nonwhite;
          this.data.yearsTotals[aYear].unspecified += prForYear;
          this.data.yearsTotals[aYear].houses_sub_standard += substandard;
          this.data.yearsTotals[aYear].houses_standard += standard;

          // aggregate total and year data for city
          if (!this.data.cities[r.city_id].yearsData[aYear]) {
            this.data.cities[r.city_id].yearsData[aYear] = {
              whites: 0,
              nonwhite: 0,
              totalFamilies: 0
            };
          }
          this.data.cities[r.city_id].yearsData[aYear].whites += whites;
          this.data.cities[r.city_id].yearsData[aYear].nonwhite += nonwhite;
          this.data.cities[r.city_id].yearsData[aYear].totalFamilies += (this.data.cities[r.city_id].state !== 'pr' && this.data.cities[r.city_id].state !== 'vi') ? nonwhite + whites : prForYear;
          this.data.cities[r.city_id].yearsData[aYear].percentFamiliesOfColor = (this.data.cities[r.city_id].state !== 'pr' && this.data.cities[r.city_id].state !== 'vi') ? this.data.cities[r.city_id].yearsData[aYear].nonwhite /  this.data.cities[r.city_id].yearsData[aYear].totalFamilies : null;

          this.data.cities[r.city_id].projects[r.project_id].yearsData[aYear] = (this.data.cities[r.city_id].projects[r.project_id].yearsData[aYear]) ? this.data.cities[r.city_id].projects[r.project_id].yearsData[aYear] : {};
          this.data.cities[r.city_id].projects[r.project_id].yearsData[aYear].whites = r.whites / duration;
          this.data.cities[r.city_id].projects[r.project_id].yearsData[aYear].nonwhite = r.nonwhite / duration;
          this.data.cities[r.city_id].projects[r.project_id].yearsData[aYear].totalFamilies = r.nonwhite / duration + r.whites / duration;
          this.data.cities[r.city_id].projects[r.project_id].yearsData[aYear].percentFamiliesOfColor = (r.nonwhite / duration) /  (r.nonwhite / duration + r.whites / duration);


          this.data.cities[r.city_id].maxDisplacmentsForYear = (this.data.cities[r.city_id].projects[r.project_id].yearsData[aYear].totalFamilies  > this.data.cities[r.city_id].maxDisplacmentsForYear) ? this.data.cities[r.city_id].projects[r.project_id].yearsData[aYear].totalFamilies : this.data.cities[r.city_id].maxDisplacmentsForYear;
        }
      }); 

      responses[3].forEach(r => this.data.yearsTotals[r.year][r.assessed_category.replace(/ /g,"_")] = r.value);

      // calculate additional years total values 
      this.data.yearsTotals.all = Object.keys(this.data.yearsTotals).reduce((aggregating, aYear) => {
        return {
          whites: aggregating.whites + this.data.yearsTotals[aYear].whites,
          nonwhite: aggregating.nonwhite + this.data.yearsTotals[aYear].nonwhite,
          unspecified: aggregating.unspecified + this.data.yearsTotals[aYear].unspecified,
          houses_sub_standard: aggregating.houses_sub_standard + this.data.yearsTotals[aYear].houses_sub_standard,
          houses_standard: aggregating.houses_standard + this.data.yearsTotals[aYear].houses_standard
        };
      }, {whites: 0, nonwhite: 0, unspecified: 0, houses_sub_standard: 0, houses_standard: 0});
      Object.keys(this.data.yearsTotals).forEach(aYear => {
        this.data.yearsTotals[aYear].totalFamilies = this.data.yearsTotals[aYear].nonwhite + this.data.yearsTotals[aYear].whites;
        this.data.yearsTotals[aYear].percentFamiliesOfColor = this.data.yearsTotals[aYear].nonwhite / (this.data.yearsTotals[aYear].nonwhite + this.data.yearsTotals[aYear].whites);
      });

      // filter out cities without displacements
      Object.keys(this.data.cities).forEach(id => {
        if (this.data.cities[id].totalFamilies == 0) {
          delete this.data.cities[id];
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

      Object.keys(this.data.cities).forEach(id => {
        if (this.data.cities[id].pop_1960 && this.data.cities[id].state !== 'pr') {
          let displacements_in_city = [],
            percents_in_city = [],
            projects = [],
            theKey = this.getPopKey(this.data.cities[id].pop_1960);

          if (theKey) {
            Object.keys(this.data.cities[id].projects).forEach(project_id => {
              if (this.data.cities[id].projects[project_id].totalFamilies > 0 || (this.data.cities[id].projects[project_id].funding > 0 && this.data.cities[id].projects[project_id].funding < 80000000 && this.data.cities[id].projects[project_id].project !== 'Neighborhood Dev Program')) {
                displacements_in_city.push(this.data.cities[id].projects[project_id].totalFamilies);
                percents_in_city.push(this.data.cities[id].projects[project_id].percentFamiliesOfColor);
                projects.push( {
                  project_id: parseInt(project_id),
                  project: this.data.cities[id].projects[project_id].project,
                  city: this.data.cities[id].city,
                  city_id: parseInt(id),
                  state: this.data.cities[id].state,
                  totalFamilies: this.data.cities[id].projects[project_id].totalFamilies,
                  percentFamiliesOfColor: this.data.cities[id].projects[project_id].percentFamiliesOfColor,
                  funding: this.data.cities[id].projects[project_id].funding,
                  hasProjectGeojson: !!this.data.cities[id].projects[project_id].the_geojson,
                });
              }
            });

            this.data.stats[theKey].displacements.push(...displacements_in_city);
            this.data.stats[theKey].percentsFamiliesOfColor.push(...percents_in_city);
            this.data.stats[theKey].projects.push(...projects);
          }
        }
      });

      Object.keys(this.data.stats).forEach(pop => {
        this.data.stats[pop].displacements.sort((a,b) =>a-b);
        this.data.stats[pop].projects.sort((a,b) =>a.totalFamilies-b.totalFamilies);
        const displacements = this.data.stats[pop].projects.filter(p => p.totalFamilies > 0).map(p => p.totalFamilies);
        this.data.stats[pop].avgDisplacements = displacements.reduce((a,b) =>a+b) / displacements.length;
        this.data.stats[pop].medianDisplacements = getMedian(displacements);
        this.data.stats[pop].bottomQuartileDisplacements = getBottomQuartile(displacements);
        this.data.stats[pop].topQuartileDisplacements = getTopQuartile(displacements);
        this.data.stats[pop].medianDisplacements = getMedian(displacements);

        const percentsFamiliesOfColor = this.data.stats[pop].projects.filter(p => p.totalFamilies > 0).map(p => p.percentFamiliesOfColor).sort((a,b) =>a-b);
        this.data.stats[pop].avgPercentsFamiliesOfColor = percentsFamiliesOfColor.reduce((a,b) =>a+b) / percentsFamiliesOfColor.length;
        this.data.stats[pop].medianPercentsFamiliesOfColor = getMedian(percentsFamiliesOfColor);
        this.data.stats[pop].bottomQuartilePercentsFamiliesOfColor = getBottomQuartile(percentsFamiliesOfColor);
        this.data.stats[pop].topQuartilePercentsFamiliesOfColor = getTopQuartile(percentsFamiliesOfColor);
        this.data.stats[pop].medianPercentsFamiliesOfColor = getMedian(percentsFamiliesOfColor);

        const funding = this.data.stats[pop].projects.map(p => p.funding).filter(f => f).sort((a,b) =>a-b);
        this.data.stats[pop].avgFunding = funding.reduce((a,b) =>a+b) / funding.length;
        this.data.stats[pop].medianFunding = getMedian(funding);
        this.data.stats[pop].bottomQuartileFunding = getBottomQuartile(funding);
        this.data.stats[pop].topQuartileFunding = getTopQuartile(funding);
        this.data.stats[pop].medianFunding = getMedian(funding);
        
      });

      
      if (selectedCategory) {
        this.setSelectedCategory(selectedCategory);
      }

      this.setSelectedYear(year);

      this.data.loaded = true;
      this.data.yearsLoaded.push(year);

      // let projectNames = [];
      // Object.keys(this.data.cities).forEach(id => {
      //   Object.keys(this.data.cities[id].projects).forEach(projectId => {
      //     projectNames.push(this.data.cities[id].projects[projectId].project);
      //   });
      // });
      // console.log(projectNames);

      // var citiesForDorlingProcessing = Object.keys(this.data.cities).map(id=> { return {city_id: id, lat: this.data.cities[id].lat, lng: this.data.cities[id].lng, yearsData: this.data.cities[id].yearsData}; });
      // citiesForDorlingProcessing.forEach(cityData => {
      //   cityData.yearsData['all'] = {
      //     whites: this.data.cities[cityData.city_id].whites,
      //     nonwhite: this.data.cities[cityData.city_id].nonwhite,
      //     totalFamilies: this.data.cities[cityData.city_id].totalFamilies,
      //     percentFamiliesOfColor: this.data.cities[cityData.city_id].percentFamiliesOfColor
      //   };
      // });
      // console.log(citiesForDorlingProcessing);

      this.parseDorlings();

      this.emit(AppActionTypes.storeChanged);
    });
  },

  loadCityData: function(city_id) {
    if (!city_id || this.cityLoaded(city_id)) {
      return;
    }

    this.dataLoader.query([
      {
        //query: ("SELECT ct.cartodb_id, ST_AsGeoJSON(ct.the_geom, 4) as the_geojson, ct.gisjoin, 100 * (negro + other_races) / (negro + other_races + white) as percent, case when i_under_999 > (i__1000___1998 + i__2000___2998 + i__3000___3998 + i__4000___4998 + i__5000___5998 + i__6000___6998 + i__7000___7998 + i__8000___8998 + i__9000___9998 + i__10000___14998 + i__15000___24998 + i__25000_plus) then 999 when (i_under_999 + i__1000___1998) > (i__2000___2998 + i__3000___3998 + i__4000___4998 + i__5000___5998 + i__6000___6998 + i__7000___7998 + i__8000___8998 + i__9000___9998 + i__10000___14998 + i__15000___24998 + i__25000_plus) then 1999 when (i_under_999 + i__1000___1998 + i__2000___2998) > (i__3000___3998 + i__4000___4998 + i__5000___5998 + i__6000___6998 + i__7000___7998 + i__8000___8998 + i__9000___9998 + i__10000___14998 + i__15000___24998 + i__25000_plus) then 2999 when (i_under_999 + i__1000___1998 + i__2000___2998 + i__3000___3998) > (i__4000___4998 + i__5000___5998 + i__6000___6998 + i__7000___7998 + i__8000___8998 + i__9000___9998 + i__10000___14998 + i__15000___24998 + i__25000_plus) then 3999 when (i_under_999 + i__1000___1998 + i__2000___2998 + i__3000___3998 + i__4000___4998) > (i__5000___5998 + i__6000___6998 + i__7000___7998 + i__8000___8998 + i__9000___9998 + i__10000___14998 + i__15000___24998 + i__25000_plus) then 4999 when (i_under_999 + i__1000___1998 + i__2000___2998 + i__3000___3998 + i__4000___4998 + i__5000___5998) > (i__6000___6998 + i__7000___7998 + i__8000___8998 + i__9000___9998 + i__10000___14998 + i__15000___24998 + i__25000_plus) then 5999 when (i_under_999 + i__1000___1998 + i__2000___2998 + i__3000___3998 + i__4000___4998 + i__5000___5998 + i__6000___6998) > (i__7000___7998 + i__8000___8998 + i__9000___9998 + i__10000___14998 + i__15000___24998 + i__25000_plus) then 6999 when (i_under_999 + i__1000___1998 + i__2000___2998 + i__3000___3998 + i__4000___4998 + i__5000___5998 + i__6000___6998 + i__7000___7998) > (i__8000___8998 + i__9000___9998 + i__10000___14998 + i__15000___24998 + i__25000_plus) then 7999 when (i_under_999 + i__1000___1998 + i__2000___2998 + i__3000___3998 + i__4000___4998 + i__5000___5998 + i__6000___6998 + i__7000___7998 + i__8000___8998) > (i__9000___9998 + i__10000___14998 + i__15000___24998 + i__25000_plus) then 8999 when (i_under_999 + i__1000___1998 + i__2000___2998 + i__3000___3998 + i__4000___4998 + i__5000___5998 + i__6000___6998 + i__7000___7998 + i__8000___8998 + i__9000___9998) > (i__10000___14998 + i__15000___24998 + i__25000_plus) then 9999 when (i_under_999 + i__1000___1998 + i__2000___2998 + i__3000___3998 + i__4000___4998 + i__5000___5998 + i__6000___6998 + i__7000___7998 + i__8000___8998 + i__9000___9998 + i__10000___14998) > (i__15000___24998 + i__25000_plus) then 14999 when (i_under_999 + i__1000___1998 + i__2000___2998 + i__3000___3998 + i__4000___4998 + i__5000___5998 + i__6000___6998 + i__7000___7998 + i__8000___8998 + i__9000___9998 + i__10000___14998 + i__15000___24998) > i__25000_plus then 24999 else 25000 end as median FROM us_tracts_1960 ct join urdr_city_id_key cities on cities.nhgiscty = ct.nhgiscty and cities.city_id = " + city_id + " join census_data_1960 d on ct.gisjoin = d.gisjoin and (negro + white + other_races) > 0  order by percent desc, median").replace(/\+/g, '%2B'),
        query: ("select *, 100 * belowpoverty / (belowpoverty + abovepoverty) as percentbelow from (SELECT ct.cartodb_id, ST_AsGeoJSON(ct.the_geom, 4) as the_geojson, ct.gisjoin, 100 * (negro + other_races) / (negro + other_races + white) as percent, (i_under_999 + i__1000___1998 + i__2000___2998) as belowpoverty, (i__3000___3998 + i__4000___4998 + i__5000___5998 + i__6000___6998 + i__7000___7998 + i__8000___8998 + i__9000___9998 + i__10000___14998 + i__15000___24998 + i__25000_plus) as abovepoverty FROM us_tracts_1960 ct join urdr_city_id_key cities on cities.nhgiscty = ct.nhgiscty and cities.city_id =  " + city_id + " join census_data_1960 d on ct.gisjoin = d.gisjoin and (negro + white + other_races) > 0  order by percent desc) stats").replace(/\+/g, '%2B'),
        format: 'JSON'
      },
      {
        query: "select st_asgeojson(st_union(ct.the_geom)) as city_geom from us_tracts_1960 ct join urdr_city_id_key cities on cities.nhgiscty = ct.nhgiscty and cities.city_id = "+ city_id,
        format: 'JSON'
      },
      {
        query: "select ST_asgeojson(the_geom, 4) as the_geojson, holc_grade, neighborhood_id from holc_polygons where ad_id in (select ad_id from holc_polygons join (select city_id, st_envelope(st_collect(the_geom)) as the_geom from urdr_id_key where city_id = " + city_id + " and the_geom is not null group by city_id) projects on st_intersects(projects.the_geom, holc_polygons.the_geom) group by ad_id)",
        format: 'JSON'
      },
      // full category data
      {
        query: "SELECT distinct on(project_id, combined_dire_char_raw.category_id) combined_dire_char_raw.project_id, combined_dire_char_raw.category_id, value, year, assessed_category, unit_of_measurement FROM digitalscholarshiplab.combined_dire_char_raw join urdr_category_id_key on city_id = " + city_id + " and combined_dire_char_raw.category_id != 71 and combined_dire_char_raw.category_id != 72 and combined_dire_char_raw.category_id = urdr_category_id_key.category_id order by project_id, combined_dire_char_raw.category_id, year desc",
        format: 'JSON'
      },
      {
        query: "select projects.project_id, urdr_citations.citation, urdr_citations.link, box, report, urdr_citation_join.amazon_link as internal_link from urdr_id_key projects join urdr_citation_join on projects.project_id = urdr_citation_join.project_id join urdr_citations on urdr_citations.citation_id = urdr_citation_join.citation where projects.city_id =" + city_id,
        format: 'JSON'
      },
      // {
      //   query: "select projects.project_id, projects.project, projects.city_id, urdr_citations.citation, urdr_citations.link, box, report, urdr_citation_join.amazon_link as internal_link from urdr_id_key projects join urdr_citation_join on projects.project_id = urdr_citation_join.project_id join urdr_citations on urdr_citations.citation_id = urdr_citation_join.citation",
      //   format: 'JSON'
      // }
    ]).then(responses => {
      responses[0].forEach(response => {
        this.data.cities[city_id].tracts[response.gisjoin] = {
          the_geojson: JSON.parse(response.the_geojson),
          percentPeopleOfColor: response.percent,
          medianIncome: 999,
          percentBelow: response.percentbelow
        };
      });

      responses[1].forEach(response => {
        this.data.cities[city_id].city_geom = JSON.parse(response.city_geom);
      });

      responses[2].forEach(response => {
        this.data.cities[city_id].holc_areas.push({
          the_geojson: JSON.parse(response.the_geojson),
          grade: response.holc_grade,
          neighborhood_id: response.neighborhood_id
        });
      });

      const cat_codes = {
        'proposed reuse of project land- public': 'reuse_public',
        'proposed reuse of project land- industrial': 'reuse_industrial',
        'proposed reuse of project land- commercial': 'reuse_commercial',
        'proposed reuse of project land- residential': 'reuse_residential',
        'dwelling units- sub-standard': 'houses_sub_standard',
        'dwelling units- standard': 'houses_standard',
        'urban renewal grants dispursed': 'funding_dispursed',
        'urban renewal grants approved/reserved': 'funding_approved'
      };
      responses[3].forEach(r => {
        if (this.data.cities[city_id].projects[r.project_id]) {
          this.data.cities[city_id].projects[r.project_id][cat_codes[r.assessed_category]] = r.value; 
        }
      });

      responses[4].forEach(response => {
        if (response.box && response.box.trim() !== '' && response.box !== '0') {
          const boxData = nara.find(report => report.containerId == response.box);
          let title ='';
          if (boxData && boxData.items) {
            const recordData = boxData.items.find(item => item.reportNum == response.report) || {};
            if (recordData.title) {
              title = recordData.title.replace("[Report #]", '').replace(response.report + ' -', '').trim() || '';
            }
          }
          
          response.citation = ((title !== '') ? "\"" + title + ",\" " : '') + "Final Grant Reports 1951-1981, General Records of the Department of Housing and Urban Development 1931-2003, Record Group 207, Box " + response.box + ", Report " + response.report + ", National Archives, College Park, MD.";
          response.link = response.internal_link;
        } 

        if (response.citation && !this.data.cities[city_id].projects[response.project_id].citations[response.citation_id]) {
          this.data.cities[city_id].projects[response.project_id].citations[response.citation_id] = {
            citation: response.citation,
            links: (response.link !== "") ? [response.link] : []
          };
        } else if (response.citation && response.link !== "" && !this.data.cities[city_id].projects[response.project_id].citations[response.citation_id].links.includes(response.link)) {
          this.data.cities[city_id].projects[response.project_id].citations[response.citation_id].links.push(response.link);
        }
      });

      // this is to troubleshoot citations
      // let citationData = {};
      // responses[5].forEach(response => {
      //   if (response.box && response.box.trim() !== '' && response.box !== '0') {
      //     const boxData = nara.find(report => report.containerId == response.box);
      //     let title ='';
      //     if (boxData && boxData.items) {
      //       const recordData = boxData.items.find(item => item.reportNum == response.report) || {};
      //       if (recordData.title) {
      //         title = recordData.title.replace("[Report #]", '').replace(response.report + ' -', '').trim() || '';
      //       }
      //     }
          
      //     response.citation = ((title !== '') ? "\"" + title + ",\" " : '') + "Final Grant Reports 1951-1981, General Records of the Department of Housing and Urban Development 1931-2003, Record Group 207, Box " + response.box + ", Report " + response.report + ", National Archives, College Park, MD.";
      //     response.link = response.internal_link;
      //   } 

      //   citationData[response.city_id] = citationData[response.city_id] || {city: this.getCityData(response.city_id).city, projects: {}};
      //   citationData[response.city_id].projects[response.project_id] = citationData[response.city_id].projects[response.project_id] || {project: response.project, citations: {}};
      //   if (response.citation && !citationData[response.city_id].projects[response.project_id].citations[response.citation_id]) {
      //     citationData[response.city_id].projects[response.project_id].citations[response.citation_id] = {
      //       citation: response.citation,
      //       links: (response.link !== "") ? [response.link] : []
      //     };
      //   } else if (response.citation && response.link !== "" && !citationData[response.city_id].projects[response.project_id].citations[response.citation_id].links.includes(response.link)) {
      //     citationData[response.city_id].projects[response.project_id].citations[response.citation_id].links.push(response.link);
      //   }
      // });
      // console.log(citationData);

      // use the project totals to calculate city totals
      this.data.cities[city_id].yearsData = {};
      Object.keys(this.data.cities[city_id].projects).forEach(project_id => {
        Object.keys(this.data.cities[city_id].projects[project_id].yearsData).forEach(year => {
          this.data.cities[city_id].start_year = (!this.data.cities[city_id].start_year || year < this.data.cities[city_id].start_year) ? year : this.data.cities[city_id].start_year;
          this.data.cities[city_id].end_year = (!this.data.cities[city_id].end_year || year > this.data.cities[city_id].end_year) ? year : this.data.cities[city_id].end_year;
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
            let white = (this.data.cities[city_id].yearsData[year].whites) ? this.data.cities[city_id].yearsData[year].whites : 0,
              nonwhite =  (this.data.cities[city_id].yearsData[year].nonwhite) ? this.data.cities[city_id].yearsData[year].nonwhite : 0;
            if (white + nonwhite > 0) {
              this.data.cities[city_id].yearsData[year].totalFamilies = white + nonwhite;
              this.data.cities[city_id].yearsData[year]['percentFamiliesOfColor'] = nonwhite / this.data.cities[city_id].yearsData[year].totalFamilies;
            }
          }
        });
      } );


      this.data.citiesLoaded.push(city_id);
      this.emit(AppActionTypes.storeChanged);
    });
  },

  // used when the city map moves to figure which cities need to be loaded
  loadVisibleCities: function() {
    // a couple utility functions from https://stackoverflow.com/questions/27928/calculate-distance-between-two-latitude-longitude-points-haversine-formula
    const getDistanceFromLatLonInKm = function(lat1,lon1,lat2,lon2) {
      var R = 6371; // Radius of the earth in km
      var dLat = deg2rad(lat2-lat1);  // deg2rad below
      var dLon = deg2rad(lon2-lon1); 
      var a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
        Math.sin(dLon/2) * Math.sin(dLon/2)
        ; 
      var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
      var d = R * c; // Distance in km
      return d;
    };
    const deg2rad = function(deg) {
      return deg * (Math.PI/180);
    };
    const previousSelectedCity = this.data.setSelectedCity;

    // stop if the map just initialized but hasn't reloaded to city cooprdinate
    if (GeographyStore.getLatLngZoom().lat == 0) {
      return;
    }

    let visibleCitiesIds = [];
    const visibleBounds = GeographyStore.getVisibleBounds();

    Object.keys(this.data.cities).forEach(city_id => {
      let cityBounds = this.data.cities[city_id].detectionBoundingBox;
      if (cityBounds && visibleBounds.intersects(cityBounds)) {
        visibleCitiesIds.push(parseInt(city_id));
        this.loadCityData(city_id);
      }
    });

    if (visibleCitiesIds.length!==this.data.visibleCitiesIds.length || !visibleCitiesIds.every((v,i)=> v === this.data.visibleCitiesIds[i])) {
      this.data.visibleCitiesIds = visibleCitiesIds;
      this.emit(AppActionTypes.storeChanged);
    }

    // reset selected city if there's only one and it's not the current selected
    if (this.data.visibleCitiesIds.length == 1 && this.data.selectedCity !== this.data.visibleCitiesIds[0]) {
      this.setSelectedCity(this.data.visibleCitiesIds[0]);
      this.setSelectedProject(null);
    }

    // or reset if to the nearest city if the current selection has moved offscreen
    else if (this.data.visibleCitiesIds.length > 0 && !this.data.visibleCitiesIds.includes(this.data.selectedCity)) {
      //this.setSelectedCity(this.data.visibleCitiesIds[0]);
      const theCenter = (previousSelectedCity && this.getCityData[previousSelectedCity].lat) ? [this.getCityData[previousSelectedCity].lat, this.getCityData[previousSelectedCity].lng] : GeographyStore.getTheMap().getCenter(),
        closestToCenterIndex = this.data.visibleCitiesIds
          .reduce((smallestSoFar, cityId, i) => {
            let dist = getDistanceFromLatLonInKm(theCenter.lat, theCenter.lng, this.getCityData(cityId).lat, this.getCityData(cityId).lng);
            if (dist < Object.values(smallestSoFar)[0]) {
              let iDist = {};
              iDist[i] = dist;
              return iDist;
            } else {
              return smallestSoFar;
            }
          }, {'-1': 1000000000});
      this.setSelectedCity(this.data.visibleCitiesIds[Object.keys(closestToCenterIndex)[0]]);
      this.setSelectedProject(null);
    }
  },

  parseDorlings: function() {
    const shortside = Math.min(DimensionsStore.getNationalMapWidth() * 0.4, DimensionsStore.getNationalMapHeight() * 0.4),
      l = Math.sqrt(2*shortside*shortside);

    ['all',1949,1950,1951,1952,1953,1954,1955,1956,1957,1958,1959,1960,1961,1962,1963,1964,1965,1966].forEach(year => {
      const citiesForYear = this.getCitiesList().filter(cityData => (year == 'all') ? cityData.totalFamilies && cityData.totalFamilies > 0 : cityData.yearsData[year] && cityData.yearsData[year]['totalFamilies'] > 0);
      let cx, cy;

      // scatterplot
      this.data.dorlingCoords[year] = {};
      this.data.dorlingCoords[year] = citiesForYear.map(cityData => {
        if (!this.getCityData(cityData.city_id).pop_1960 || !this.getCityData(cityData.city_id).nonwhite_1960 || this.getCityData(cityData.city_id).state == 'pr' || this.getCityData(cityData.city_id).state == 'vi') {
          cx = (year !== 'all') ? this.getCityData(cityData.city_id).yearsData[year].totalFamilies : this.getCityData(cityData.city_id).totalFamilies; // use this to calculate a small offset
          cy = null; 
        } else {
          cx = this.getPercentNonWhitePop(cityData.city_id, year) * l;
          cy = (year !== 'all') ? l - this.getCityData(cityData.city_id).yearsData[year].percentFamiliesOfColor * l : l - this.getCityData(cityData.city_id).percentFamiliesOfColor * l;
        }
        let [scatterplotcx, scatterplotcy] = DimensionsStore.translateScatterplotPoint([cx, cy]);

        let cityCoords = DorlingXYs.find(aYearData => (!aYearData.year && year == 'all') || aYearData.year == year).cities.find(dCityData => dCityData.city_id == cityData.city_id);
        let [cartogramcx, cartogramcy] = [ cityCoords.x * DimensionsStore.getMapScale() + DimensionsStore.getNationalMapWidth() / 2, cityCoords.y * DimensionsStore.getMapScale() + DimensionsStore.getNationalMapHeight() * 12.5/31 ];

        let [mapcx, mapcy] = (ProjectedCoords[cityData.city_id]) ? [ ProjectedCoords[cityData.city_id][0]* DimensionsStore.getMapScale() + DimensionsStore.getNationalMapWidth() / 2, ProjectedCoords[cityData.city_id][1] * DimensionsStore.getMapScale() + DimensionsStore.getNationalMapHeight() * 12.5/31 ] : [0,0];

        return {
          lngLat: [cityData.lng, cityData.lat],
          coords: {
            scatterplot: { cx: scatterplotcx, cy: scatterplotcy},
            cartogram: { cx: cartogramcx, cy: cartogramcy},
            map: { cx: mapcx, cy: mapcy},
          },
          r: DimensionsStore.getDorlingRadius((year && false) ? cityData.yearsData[year]['totalFamilies'] : cityData.totalFamilies), 
          city_id: cityData.city_id,
          value: (year !== 'all') ? cityData.yearsData[year].totalFamilies : cityData.totalFamilies,
          percentFamiliesOfColor: (year !== 'all') ? cityData.yearsData[year].percentFamiliesOfColor : cityData.percentFamiliesOfColor,
          color: (year !== 'all' && cityData.yearsData[year].percentFamiliesOfColor >= this.getPOCBottom() && cityData.yearsData[year].percentFamiliesOfColor <= this.getPOCTop()) ? getColorForRace(cityData.yearsData[year].percentFamiliesOfColor) : (cityData.percentFamiliesOfColor >= this.getPOCBottom() && cityData.percentFamiliesOfColor <= this.getPOCTop()) ? getColorForRace(cityData.percentFamiliesOfColor) : 'transparent',
          name: cityData.city,
          hasProjectGeojson: cityData.hasProjectGeojson
        };        
      }).sort((a,b) => b.value - a.value); 
    });

    this.emit(AppActionTypes.storeChanged);
  },

  // SETTERS

  setCityLoading: function(bool) { 
    this.data.cityLoading = bool;
    this.emit(AppActionTypes.storeChanged);
  },

  setHighlightedCities: function(ids) {
    this.data.inspectedCity = null;
    this.data.highlightedCities = ids;
    this.emit(AppActionTypes.storeChanged);
  },

  setHOLCSelected: function(value) {
    this.data.HOLCSelected = value;
    this.emit(AppActionTypes.storeChanged);
  },

  setInspectedCity: function(city_id) {
    this.data.inspectedCity = city_id;
    this.emit(AppActionTypes.storeChanged);
  },

  setInspectedProject: function(project_id) {
    this.data.inspectedProject = project_id;
    if (project_id) {
      this.data.inspectedCity = this.getCityId(project_id);
    }
    this.emit(AppActionTypes.storeChanged);
  },

  setInspectedProjectStats: function(project_id) {
    this.data.inspectedProjectStats = project_id;
    this.data.inspectedCity = (project_id) ? this.getCityId(project_id) : null;
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
    this.data.selectedCity = parseInt(city_id);
    // you know it's visible, so set the data for initial rendering
    if (city_id && !this.data.visibleCitiesIds.includes(parseInt(city_id))) {
      this.data.visibleCitiesIds = [parseInt(city_id)];
    }
    this.emit(AppActionTypes.storeChanged);
  },

  setSelectedCityView: function(view) {
    this.data.selectedCityView = view;
    this.emit(AppActionTypes.storeChanged);
  },

  setSelectedProject: function(project_id) {
    this.data.selectedProject = project_id;
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

  initialDataLoaded: function() { return this.data.loaded; },

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

  getCitiesListWithDisplacements: function() { return this.getCitiesList().filter(d => d.totalFamilies > 0); },

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

  getCityProjectsOrganized(city_id, displacementsOrNot) {
    const cityData = this.getCityData(city_id),
      cityProjects = cityData.projects;

    if (cityProjects) {
      const projectsWithDisplacements = Object.keys(cityProjects)
        .map(project_id => cityProjects[project_id])
        .filter(p => (displacementsOrNot) ? p.totalFamilies > 0 : p.totalFamilies == 0);

      const labelHeight = 22,
        rowHeight = 20,
        theMax = (cityData.state !== 'pr' && cityData.state !== 'vi' ) ? 
          projectsWithDisplacements.reduce((max,p) => Math.max(max, p.whites || 0, p.nonwhite || 0), 0) : 
          Math.max(...projectsWithDisplacements.map(p=> p.totalFamilies));

      var runningOffset = 0;

      const calculateCoords = function(p, i, status) {
        p.status = status;
        p.y = runningOffset + i * rowHeight;
        if (p.nonwhite || p.whites) {
          p.xNonwhite =DimensionsStore.getCityTimelineStyle().width * 0.75  - ((p.nonwhite || 0) / theMax) * DimensionsStore.getCityTimelineStyle().width / 6;
          p.widthNonwhite = ((p.nonwhite || 0) / theMax) * DimensionsStore.getCityTimelineStyle().width / 6;
          p.xWhite = DimensionsStore.getCityTimelineStyle().width * 0.75;
          p.widthWhite = ((p.whites || 0) / theMax) * DimensionsStore.getCityTimelineStyle().width / 6; 
        } else {
          p.x = DimensionsStore.getCityTimelineStyle().width * 0.75 - ((p.totalFamilies || 0) / theMax) * DimensionsStore.getCityTimelineStyle().width / 12;
          p.width = ((p.totalFamilies || 0) / theMax) * DimensionsStore.getCityTimelineStyle().width / 6;
        }
        return p;
      };

      // return if no selected year 
      if (!this.getSelectedYear()) {
        return projectsWithDisplacements
          .sort((a,b)=> (a.project < b.project) ? -1 : (a.project > b.project) ? 1 : 0)
          .map((p,i) => calculateCoords(p,i,null));
      }

      // otherwise sort by project stage
      const completedProjects = projectsWithDisplacements.filter(p => this.getSelectedYear() >= p.completed_year)
        .sort((a,b)=> {
          if (a.completed_year < b.completed_year) {
            return -1;
          } else if (a.completed_year > b.completed_year) {
            return 1;
          } else if (a.active_start_year < b.active_start_year) {
            return -1;
          } else if (a.active_start_year > b.active_start_year) {
            return 1;
          } else {
            (a.project < b.project) ? -1 : (a.project > b.project) ? 1 : 0;
          }
        })
        .map((p,i) => calculateCoords(p,i,'completed'));

      runningOffset += completedProjects.length * 20 + 5;

      const activeProjects = projectsWithDisplacements.filter(p => (p.active_start_year <= this.getSelectedYear() && p.completed_year > this.getSelectedYear()))
        .sort((a,b)=> {
          const aTransition = (a.planning_start_year) ? Math.min(a.planning_start_year, a.active_start_year) : a.active_start_year,
            bTransition = (b.planning_start_year) ? Math.min(b.planning_start_year, b.active_start_year) : b.active_start_year;

          if ((a.completed_year <= 1966 || b.completed_year <= 1966) && a.completed_year < b.completed_year) {
            return -1;
          } else if ((a.completed_year <= 1966 || b.completed_year <= 1966) && a.completed_year > b.completed_year) {
            return 1;
          } else if (a.active_start_year < b.active_start_year) {
            return -1;
          } else if (a.active_start_year > b.active_start_year) {
            return 1;
          } else if (aTransition < bTransition) {
            return -1;
          } else if (aTransition > bTransition) {
            return 1;
          } else {
            return (a.project < b.project) ? -1 : (a.project > b.project) ? 1 : 0;
          }
        })
        .map((p,i) => calculateCoords(p,i,'active'));

      runningOffset += activeProjects.length * 20 + 5;

      const planningProjects = projectsWithDisplacements.filter(p => (p.planning_start_year && p.planning_start_year <= this.getSelectedYear() && p.active_start_year > this.getSelectedYear()))
        .sort((a,b)=> {
          if (a.active_start_year < b.active_start_year) {
            return -1;
          } else if (a.active_start_year > b.active_start_year) {
            return 1;
          } else {
            return (a.project < b.project) ? -1 : (a.project > b.project) ? 1 : 0;
          }
        })
        .map((p,i) => calculateCoords(p,i,'planning'));

      runningOffset += planningProjects.length * 20 + 5;

      const futureProjects = projectsWithDisplacements.filter(p => p.active_start_year > this.getSelectedYear() && (!p.planning_start_year ||  p.planning_start_year > this.getSelectedYear()))
        .sort((a,b)=> {
          const aTransition = (a.planning_start_year) ? Math.min(a.planning_start_year, a.active_start_year) : a.active_start_year,
            bTransition = (b.planning_start_year) ? Math.min(b.planning_start_year, b.active_start_year) : b.active_start_year;

          if (aTransition < bTransition) {
            return -1;
          } else if (aTransition > bTransition) {
            return 1;
          }
          if (a.active_start_year < b.active_start_year) {
            return -1;
          } else if (a.active_start_year > b.active_start_year) {
            return 1;
          } else {
            return (a.project < b.project) ? -1 : (a.project > b.project) ? 1 : 0;
          }
        })
        .map((p,i) => calculateCoords(p,i,'future'));

      return completedProjects.concat(activeProjects).concat(planningProjects).concat(futureProjects);
    }



  },
  
  getCityId: function(project_id) { return (project_id) ? parseInt(Object.keys(this.data.cities).filter(city_id => this.data.cities[city_id].projects.hasOwnProperty(project_id))[0]) : null; },

  getCityIdFromSlug: function(slug) { return (this.data.cities) ? Object.keys(this.data.cities).filter(cityId => (this.data.cities[cityId].slug == slug))[0] : null; },

  getCityLoading: function() { return this.data.cityLoading; },

  getDorlingXY: function(city_id) { return (this.data.loaded && this.data.dorlingXYs[this.data.selectedYear][city_id]) ? this.data.dorlingXYs[this.data.selectedYear][city_id] : [0,0]; },

  getDorlingsCoords: function() { 
    const year = this.getSelectedYear() || 'all';
    return this.data.dorlingCoords[year] || []; 
  },

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

  getHighlightedCities: function() { 
    return (this.getInspectedCity()) ? [this.getInspectedCity()] :
      (this.data.highlightedCities.length > 0) ? this.data.highlightedCities : 
      (this.getSelectedCity()) ? [this.getSelectedCity()] :
      [];
  },

  getHighlightedCity: function() { return this.getInspectedCity() || this.getSelectedCity(); },

  getHighlightedProject: function() { return this.getInspectedProjectStats() || this.getSelectedProject(); },

  getHOLCSelected: function() { return this.data.HOLCSelected; },

  getInspectedCity: function() { return this.data.inspectedCity; },

  getInspectedProject: function() { return this.data.inspectedProject; },

  getInspectedProjectStats: function() { return this.data.inspectedProjectStats; },

  getPercentNonWhitePop: function(cityId, year) {
    year = year || this.getSelectedYear();
    let nonwhitePercent = this.getCityData(cityId).nonwhite_1960 / this.getCityData(cityId).pop_1960;
    if (year > 1960 && this.getCityData(cityId).nonwhite_1970 && this.getCityData(cityId).pop_1970) {
      const nonwhitePercent1970 = (this.getCityData(cityId).nonwhite_1970 / this.getCityData(cityId).pop_1970),
        estDiffPerYear = (nonwhitePercent1970 - nonwhitePercent) / 10;
      nonwhitePercent = nonwhitePercent + estDiffPerYear * (year - 1960);
    } 
    return nonwhitePercent;
  },

  getPOC: function() { return this.data.poc; },

  getPOCBottom: function() { return this.data.poc[0]; },

  getPOCTop: function() { return this.data.poc[1]; },

  getPopKey(pop) {
    if (!pop) {
      return;
    }
    if (pop > 500000) {
      return '500000+';
    }

    return [10000,25000,50000,100000,250000,500000].find(popTest => {
      if (pop <= popTest) {
        return popTest;
      }
    });
  },

  getPopCatDescription(project_id) {
    const city_id = this.getCityId(project_id),
      cat = this.getPopKey(this.data.cities[city_id].pop_1960);

    return (cat == 10000) ? '< 10K' :
      (cat == 25000) ? '10-25K' :
      (cat == 50000) ? '25-50K' :
      (cat == 100000) ? '50-100K' :
      (cat == 250000) ? '100-250K' :
      (cat == 500000) ? '250-500K' :
      (cat == '500000+') ? '> 500K' : '';
  },

  getProjectBoundingBox: function (id) { 
    const city_id = this.getCityId(id);
    return (this.data.cities[city_id] && this.data.cities[city_id].projects[id]) ? this.data.cities[city_id].projects[id].boundingBox : null; 
  },

  getProjectCenter: function (id) { 
    const city_id = this.getCityId(id);
    return (this.data.cities[city_id].projects[id]) ? this.data.cities[city_id].projects[id].center : null; 
  },

  getProjectTimelineBars: function(cityId) {
    let projects = Object.keys(this.data.cities[cityId].projects)
        .filter(id => this.data.cities[cityId].projects[id].start_year <= 1966)
        .map(id => this.data.cities[cityId].projects[id])
        // filter out projects without displacments
        //.filter(p => p.totalFamilies)
        // sort by highest number of displacments in an average year descending
        //.sort((a,b) => b.totalFamilies/(Math.min(b.end_year,1966)-b.start_year+1) - a.totalFamilies/(Math.min(a.end_year,1966)-a.start_year+1)),
        .sort((a,b) => b.totalFamilies - a.totalFamilies),
      years = [1955,1956,1957,1958,1959,1960,1961,1962,1963,1964,1965,1966];

    // sort to put the longest first
    //projects = projects.sort((a,b) => b.totalFamilies - a.totalFamilies);

    // calculate "grid" placement for each project
    let rows = [new Array(12)];
    projects.forEach((project, i) => {
      const end_year = Math.min(project.end_year, 1966);
      projects[i].end_year = end_year;
      let availableRow = false;
      rows.forEach((row, rowNum) => {
        let canFit = true;
          
        // test whether the project can fit in the space
        for (let col = years.indexOf(project.start_year); col <= years.indexOf(end_year); col ++) {
          if (rows[rowNum][col]) {
            canFit = false;
          }
          // for one year spans pad it
          if (project.start_year == end_year) {
            if ((col > 0 && rows[rowNum][col-1]) || (col <= years.indexOf(end_year) && rows[rowNum][col+1])) {
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
      for (let col = years.indexOf(project.start_year); col <= years.indexOf(end_year); col ++) {
        rows[projects[i].row][col] = 'x';
        // for one year spans pad it
        if (project.start_year == end_year) {
          if (col > 0) {
            rows[projects[i].row][col-1] = 'x';
          } 
          if (col <= years.indexOf(end_year)) {
            rows[projects[i].row][col+1] = 'x';
          } 
        }
      }
    });

    return projects;
  },

  getSelectedCategory: function() { return this.data.selectedCategory; },

  getSelectedCity: function() { return this.data.selectedCity; },

  getSelectedCityView: function() { return this.data.selectedCityView; },

  getSelectedProject: function() { return this.data.selectedProject; },

  getSelectedView: function() { return this.data.selectedView; },

  getSelectedYear: function() { return this.data.selectedYear; },

  getSlug: function() { return (this.data.cities[this.getSelectedCity()] && this.data.cities[this.getSelectedCity()].slug) ? this.data.cities[this.getSelectedCity()].slug : null; },

  getStats: function(pop) { 
    const theKey = this.getPopKey(pop);
    if (theKey) {
      return this.data.stats[theKey];
    }
  },

  getStatsByProject: function(project_id) {
    const city_id = this.getCityId(project_id),
      pop = this.getCityData(city_id).pop_1960;
    return this.getStats(pop);
  },

  getVisibleCities: function() {
    const cityIds = this.getVisibleCityIds();
    return this.getCitiesList().filter(d => cityIds.includes(d.city_id));
  },

  getVisibleCitiesDetails: function() {
    const visibleCitiesData = this.getCitiesList().filter(d => this.data.visibleCitiesIds.includes(d.city_id) && this.data.cities[d.city_id].totalFamilies > 0);
    let visibleCitiesSpatialData = { cities: [], projects: {}, tracts: {}, holc_areas: [], cities_geoms: [] };

    visibleCitiesData.forEach(cd => {
      visibleCitiesSpatialData.cities.push(cd);
      Object.keys(cd.projects).forEach(project_id => visibleCitiesSpatialData.projects[project_id] = cd.projects[project_id]);
      Object.keys(cd.tracts).forEach(tract_id => visibleCitiesSpatialData.tracts[tract_id] = cd.tracts[tract_id]);
      if (cd.city_geom) {
        visibleCitiesSpatialData.cities_geoms.push(cd.city_geom);
      }
      // the filter here removes duplicates for cities that overlap the same HOLC cities
      visibleCitiesSpatialData.holc_areas = visibleCitiesSpatialData.holc_areas.concat(cd.holc_areas).filter((polygon, index, self) => self.findIndex(t => t.neighborhood_id === polygon.neighborhood_id) === index);
    });

    return visibleCitiesSpatialData;
  },

  getVisibleCityIds: function() { return this.data.visibleCitiesIds; },

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

  getYearTotals: function(year) { 
    year = year || 'all';
    return this.data.yearsTotals[year]; 
  },

  getYearTotalsForCity: function(year, city_id) {
    if (!this.cityLoaded(city_id)) {
      return null;
    }
    year = year || 'all';
    console.log(this.data.cities[city_id]);
    console.log(this.data.cities[city_id].yearsData[year]);
    return this.data.cities[city_id].yearsData[year];
  },

  getYearsTotalsMax: function() { return Math.max(...Object.keys(this.data.yearsTotals).map(year => this.data.yearsTotals[year].whites + this.data.yearsTotals[year].nonwhite)); },


  getYearsTotalsMaxForCity: function(city_id) { return Math.max(...Object.keys(this.data.cities[city_id].yearsData).map(year => this.data.cities[city_id].yearsData[year].whites + this.data.cities[city_id].yearsData[year].nonwhite)); },

  getYearsTotalsMaxRace: function() { return (this.data.loaded) ? Math.max(...Object.keys(this.data.yearsTotals).map(year => (year !== 'all') ? this.data.yearsTotals[year].nonwhite : 0).concat(Object.keys(this.data.yearsTotals).map(year => (year !== 'all') ? this.data.yearsTotals[year].whites : 0))) : 4000; },

  getYearsTotalsMaxRaceForCity: function(city_id) { return (this.cityLoaded(city_id)) ? Math.max(...Object.keys(this.data.cities[city_id].yearsData).map(year => (year !== 'all') ? this.data.cities[city_id].yearsData[year].nonwhite : 0).concat(Object.keys(this.data.cities[city_id].yearsData).map(year => (year !== 'all') ? this.data.cities[city_id].yearsData[year].whites : 0))) : 4000; },

  getMaxDisplacementsInCityForYear: function() { return this.data.maxDisplacementsInCityForYear; },

  getMaxDisplacementsInCity: function() { return this.data.maxDisplacementInCity; },

  hasDemographicData: function(city_id) { return this.data.cities[city_id].tracts && Object.keys(this.data.cities[city_id].tracts).length > 0; },

  hasHOLCData: function(city_id) { return this.data.cities[city_id].holc_areas.length > 0; },

};

// Mixin EventEmitter functionality
Object.assign(CitiesStore, EventEmitter.prototype);

// Register callback to handle all updates
CitiesStore.dispatchToken = AppDispatcher.register((action) => {
  switch (action.type) {

  case AppActionTypes.loadInitialData:
    const year = (action.hashState.year) ? action.hashState.year : null,
      category = (action.hashState.cat) ? action.hashState.cat : 'families',
      viz = (action.hashState.viz) ? action.hashState.viz : 'cartogram';
    CitiesStore.loadInitialData(year, viz, category);

    if (action.hashState.cityview) {
      CitiesStore.setSelectedCityView(action.hashState.cityview);
    }

    if (action.hashState.city) {
      // wait for the overall data to load before you can look up and load the city
      let waitingId = setInterval(() => {
        if (CitiesStore.initialDataLoaded()) {
          clearInterval(waitingId);
          CitiesStore.loadCityData(CitiesStore.getCityIdFromSlug(action.hashState.city));
          CitiesStore.setSelectedCity(CitiesStore.getCityIdFromSlug(action.hashState.city));
          if (action.hashState.project) {
            CitiesStore.setSelectedProject(action.hashState.project);
          }
        }
      }, 50);
    }



    break;

  case AppActionTypes.categorySelected:
    CitiesStore.setSelectedCategory(action.value);
    break;

  case AppActionTypes.citySelected:
    if (action.value == null) {
      CitiesStore.setSelectedCity(null);
    } else if (CitiesStore.cityLoaded(action.value)) {
      CitiesStore.setSelectedCity(action.value);
    } else {
      CitiesStore.setCityLoading(true);
      CitiesStore.loadCityData(action.value);
      let waitingId = setInterval(() => {
        if (CitiesStore.cityLoaded(action.value)) {
          clearInterval(waitingId);
          CitiesStore.setSelectedCity(action.value);
        }
        CitiesStore.setCityLoading(false);
      }, 100);
    }
    CitiesStore.setInspectedCity(null);
    CitiesStore.setInspectedProject(null);
    CitiesStore.setSelectedProject(null);
    CitiesStore.setHighlightedCities([]);
    break;

  case AppActionTypes.cityInspected:
    if (!action.value || CitiesStore.cityLoaded(action.value)) {
      CitiesStore.setInspectedCity(action.value);
    } else {
      CitiesStore.setInspectedCity(action.value);
    }
    break;

  case AppActionTypes.projectInspected:
    CitiesStore.setInspectedProject(action.value);
    CitiesStore.setInspectedCity(null);
    break;

  case AppActionTypes.projectInspectedStats:
    CitiesStore.setInspectedProjectStats(action.value);
    CitiesStore.setInspectedCity(null);
    break;

  case AppActionTypes.projectSelected:
    const city_id = CitiesStore.getCityId(action.value);
    if (!action.value) {
      CitiesStore.setSelectedProject(null);
    } else if (city_id && CitiesStore.getSelectedCity() !== city_id) {
      if (CitiesStore.cityLoaded(city_id)) {
        CitiesStore.setSelectedCity(city_id);
        CitiesStore.setInspectedCity(null);
        CitiesStore.setSelectedProject(action.value);
        CitiesStore.setInspectedProject(null);
      } else {
        CitiesStore.loadCityData(city_id);
        let waitingId = setInterval(() => {
          if (CitiesStore.cityLoaded(city_id)) {
            clearInterval(waitingId);
            CitiesStore.setSelectedCity(city_id);
            CitiesStore.setSelectedProject(action.value);
            CitiesStore.setInspectedCity(null);
            CitiesStore.setInspectedProject(null);
          }
        }, 100);
      }
    } else {
      CitiesStore.setSelectedProject(action.value);
      CitiesStore.setInspectedCity(null);
      CitiesStore.setInspectedProject(null);
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
    CitiesStore.parseDorlings();
    break;

  case AppActionTypes.HOLCToggle:
    CitiesStore.setHOLCSelected(action.value);
    break;

  case AppDispatcher.cityViewSelected:
    CitiesStore.setSelectedCityView(action.value);
    break;

  case AppActionTypes.cityMapMoved:
    CitiesStore.loadVisibleCities();
    break;

  case AppActionTypes.mapInitialized:
    // wait until GeographyStore initialized before loading cities
    let waitingId= setInterval(() => {
      if (GeographyStore.getLatLngZoom().lat) {
        clearInterval(waitingId);
        CitiesStore.loadVisibleCities();
      }
    }, 100);
    break;

  case AppActionTypes.citiesHighlighted:
    CitiesStore.setHighlightedCities(action.value);
    break;
  }

  return true;
});

export default CitiesStore;