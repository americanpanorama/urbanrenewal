import AppDispatcher from './AppDispatcher';

export const AppActionTypes = {

  storeChanged: 'storeChanged',
  POCSelected: 'POCSelected',
  loadInitialData: 'loadInitialData',
  itemSelected: 'itemSelected',
  categorySelected: 'categorySelected',
  cityInspected: 'cityInspected',
  citySelected: 'citySelected',
  dateSelected: 'dateSelected',
  viewSelected: 'viewSelected',
  mapMoved: 'mapMoved',
  mapInitialized: 'mapInitialized',
  windowResized: 'windowResized',
  cityMapMoved: 'cityMapMoved',

};

export const AppActions = {

  loadInitialData: (state, hashState) => {
    AppDispatcher.dispatch({
      type: AppActionTypes.loadInitialData,
      state: state,
      hashState: hashState
    });
  },

  categorySelected: (category_id) => {
    AppDispatcher.dispatch({
      type: AppActionTypes.categorySelected,
      value: category_id
    });
  },

  cityInspected: (city_id) => {
    AppDispatcher.dispatch({
      type: AppActionTypes.cityInspected,
      value: city_id
    });
  },

  citySelected: (city_id) => {
    AppDispatcher.dispatch({
      type: AppActionTypes.citySelected,
      value: city_id
    });
  },

  dateSelected: (date) => {
    AppDispatcher.dispatch({
      type: AppActionTypes.dateSelected,
      value: date
    });
  },

  /**
   * Dispatch action when an item is selected (usually by user action).
   * @param {String} item     ID of the selected item.
   */
  itemSelected: (item) => {
    AppDispatcher.dispatch({
      type: AppActionTypes.itemSelected,
      value: item
    });
  },

  viewSelected: (view) => {
    AppDispatcher.dispatch({
      type: AppActionTypes.viewSelected,
      value: view
    });
  },

  POCSelected: (value, leftOrRight) => {
    AppDispatcher.dispatch({
      type: AppActionTypes.POCSelected,
      value: value,
      leftOrRight: leftOrRight
    });
  },

  /**
   * Dispatch action when map is zoomed or panned.
   * @param {Object} mapState   { zoom, center: { lat, lng } }
   */
  mapMoved: (x,y,z) => {
    AppDispatcher.dispatch({
      type: AppActionTypes.mapMoved,
      x: x,
      y: y,
      z: z
    });
  },

  mapInitialized: (theMap) => {
    AppDispatcher.dispatch({
      type: AppActionTypes.mapInitialized,
      value: theMap
    });
  },

  windowResized: () => {
    AppDispatcher.dispatch({
      type: AppActionTypes.windowResized
    });
  },

  cityMapMoved: () => {
    AppDispatcher.dispatch({
      type: AppActionTypes.cityMapMoved
    });
  },




};
