import { EventEmitter } from 'events';
import AppDispatcher from '../utils/AppDispatcher';
import { AppActionTypes } from '../utils/AppActionCreator';
import CartoDBLoader from '../utils/CartoDBLoader';

const CensusTractsStore = {

  data: {
    loaded: false,
    /*
      tracts: {
        `year`: {
          `cityId`: {
            `gisjoin`: {
              geojson: geojson,
              demographics: {
                white: #,
                black: #,
                ...
              },
              medianIncome: #
            }
          }
        }
      }
    */
    tracts: {
      1950: {},
      1960: {},
      1970: {}
    }
  },

  dataLoader: CartoDBLoader,

  loadInitialData: function(year, cityId) {
    if (!this.data.tracts[year][cityId]) {
      this.data.tracts[year][cityId] = {};
      this.dataLoader.query([
        {
          query: ("SELECT ct.cartodb_id, ST_AsGeoJSON(ct.the_geom, 4) as the_geojson, ct.gisjoin, 100 * negro / (negro + white) as percent, case when i_under_999 > (i__1000___1998 + i__2000___2998 + i__3000___3998 + i__4000___4998 + i__5000___5998 + i__6000___6998 + i__7000___7998 + i__8000___8998 + i__9000___9998 + i__10000___14998 + i__15000___24998 + i__25000_plus) then 999 when (i_under_999 + i__1000___1998) > (i__2000___2998 + i__3000___3998 + i__4000___4998 + i__5000___5998 + i__6000___6998 + i__7000___7998 + i__8000___8998 + i__9000___9998 + i__10000___14998 + i__15000___24998 + i__25000_plus) then 1999 when (i_under_999 + i__1000___1998 + i__2000___2998) > (i__3000___3998 + i__4000___4998 + i__5000___5998 + i__6000___6998 + i__7000___7998 + i__8000___8998 + i__9000___9998 + i__10000___14998 + i__15000___24998 + i__25000_plus) then 2999 when (i_under_999 + i__1000___1998 + i__2000___2998 + i__3000___3998) > (i__4000___4998 + i__5000___5998 + i__6000___6998 + i__7000___7998 + i__8000___8998 + i__9000___9998 + i__10000___14998 + i__15000___24998 + i__25000_plus) then 3999 when (i_under_999 + i__1000___1998 + i__2000___2998 + i__3000___3998 + i__4000___4998) > (i__5000___5998 + i__6000___6998 + i__7000___7998 + i__8000___8998 + i__9000___9998 + i__10000___14998 + i__15000___24998 + i__25000_plus) then 4999 when (i_under_999 + i__1000___1998 + i__2000___2998 + i__3000___3998 + i__4000___4998 + i__5000___5998) > (i__6000___6998 + i__7000___7998 + i__8000___8998 + i__9000___9998 + i__10000___14998 + i__15000___24998 + i__25000_plus) then 5999 when (i_under_999 + i__1000___1998 + i__2000___2998 + i__3000___3998 + i__4000___4998 + i__5000___5998 + i__6000___6998) > (i__7000___7998 + i__8000___8998 + i__9000___9998 + i__10000___14998 + i__15000___24998 + i__25000_plus) then 6999 when (i_under_999 + i__1000___1998 + i__2000___2998 + i__3000___3998 + i__4000___4998 + i__5000___5998 + i__6000___6998 + i__7000___7998) > (i__8000___8998 + i__9000___9998 + i__10000___14998 + i__15000___24998 + i__25000_plus) then 7999 when (i_under_999 + i__1000___1998 + i__2000___2998 + i__3000___3998 + i__4000___4998 + i__5000___5998 + i__6000___6998 + i__7000___7998 + i__8000___8998) > (i__9000___9998 + i__10000___14998 + i__15000___24998 + i__25000_plus) then 8999 when (i_under_999 + i__1000___1998 + i__2000___2998 + i__3000___3998 + i__4000___4998 + i__5000___5998 + i__6000___6998 + i__7000___7998 + i__8000___8998 + i__9000___9998) > (i__10000___14998 + i__15000___24998 + i__25000_plus) then 9999 when (i_under_999 + i__1000___1998 + i__2000___2998 + i__3000___3998 + i__4000___4998 + i__5000___5998 + i__6000___6998 + i__7000___7998 + i__8000___8998 + i__9000___9998 + i__10000___14998) > (i__15000___24998 + i__25000_plus) then 14999 when (i_under_999 + i__1000___1998 + i__2000___2998 + i__3000___3998 + i__4000___4998 + i__5000___5998 + i__6000___6998 + i__7000___7998 + i__8000___8998 + i__9000___9998 + i__10000___14998 + i__15000___24998) > i__25000_plus then 24999 else 25000 end as median FROM us_tracts_1960 ct join urdr_city_id_key cities on cities.nhgiscty = ct.nhgiscty and cities.city_id = " + cityId + " join census_data_1960 d on ct.gisjoin = d.gisjoin and (negro + white) > 0  order by percent desc, median").replace(/\+/g, '%2B'),
          format: 'JSON'
        }
      ]).then((responses) => {
        responses[0].forEach(response => {
          this.data.tracts[year][cityId][response.gisjoin] = {
            theGeojson: JSON.parse(response.the_geojson),
            percentPeopleOfColor: response.percent,
            medianIncome: response.median
          };
        });
      });
    }

  },

  getTractsForCounty: function(year, countyId) {
    return this.data.tracts[year][countyId];
  }

};

// Mixin EventEmitter functionality
Object.assign(CensusTractsStore, EventEmitter.prototype);

// Register callback to handle all updates
CensusTractsStore.dispatchToken = AppDispatcher.register((action) => {
  switch (action.type) {
  case AppActionTypes.loadInitialData:
    //CensusTractsStore.loadInitialData(1960, '0610');
    CensusTractsStore.loadInitialData(1960, 590);
    break;
  }
  return true;
});

export default CensusTractsStore;
