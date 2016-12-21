import AppDispatcher from './AppDispatcher';

export const AppActionTypes = {

  storeChanged: 'storeChanged',
  loadInitialData: 'loadInitialData',
  itemSelected: 'itemSelected',
  categorySelected: 'categorySelected',
  citySelected: 'citySelected',
  dateSelected: 'dateSelected',
  mapMoved: 'mapMoved'

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

  /**
   * Dispatch action when map is zoomed or panned.
   * @param {Object} mapState   { zoom, center: { lat, lng } }
   */
  mapMoved: (mapState) => {
    AppDispatcher.dispatch({
      type: AppActionTypes.mapMoved,
      value: mapState
    });
  }

};
