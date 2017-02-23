import AppDispatcher from './AppDispatcher';

export const AppActionTypes = {

  storeChanged: 'storeChanged',
  POCSelected: 'POCSelected',
  loadInitialData: 'loadInitialData',
  itemSelected: 'itemSelected',
  categorySelected: 'categorySelected',
  citySelected: 'citySelected',
  dateSelected: 'dateSelected',
  mapMoved: 'mapMoved',
  windowResized: 'windowResized'

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

  POCSelected: (value, topOrBottom) => {
    console.log(value, topOrBottom);
    AppDispatcher.dispatch({
      type: AppActionTypes.POCSelected,
      value: value,
      topOrBottom: topOrBottom
    });
  },

  /**
   * Dispatch action when map is zoomed or panned.
   * @param {Object} mapState   { zoom, center: { lat, lng } }
   */
  mapMoved: (mapState) => {
    AppDispatcher.dispatch({
      type: AppActionTypes.mapMoved,
      value: mapState
    });
  },

  windowResized: () => {
    AppDispatcher.dispatch({
      type: AppActionTypes.windowResized
    });
  }

};
