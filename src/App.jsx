// import node modules
import d3 from 'd3';
import * as React from 'react';

// stores
import CitiesStore from './stores/CitiesStore';
import DimensionsStore from './stores/DimensionsStore';
import GeographyStore from './stores/GeographyStore';
import HighwaysStore from './stores/HighwaysStore';

// components
//import { HashManager } from '@panorama/toolkit';
import TimelineComponent from './components/TimelineComponent.jsx';
import USMap from './components/USMapComponent.jsx';
import CityStats from './components/CityStats.jsx';
import YearStats from './components/YearStats.jsx';

// utils
// TODO: refactor to use same structure as PanoramaDispatcher;
// Having `flux` as a dependency, and two different files, is overkill.
import { AppActions, AppActionTypes } from './utils/AppActionCreator';
import AppDispatcher from './utils/AppDispatcher';

// config

// main app container
class App extends React.Component {

  constructor (props) {
    super(props);
    this.state = this.getDefaultState();

    // bind handlers
    const handlers = ['storeChanged','onCategoryClicked','onCityClicked','onYearClicked','onWindowResize'];
    handlers.map(handler => { this[handler] = this[handler].bind(this); });
  }

  // ============================================================ //
  // React Lifecycle
  // ============================================================ //

  componentWillMount () {
    AppActions.loadInitialData(this.state, this.state);
  }

  componentDidMount () {
    window.addEventListener('resize', this.onWindowResize);
    CitiesStore.addListener(AppActionTypes.storeChanged, this.storeChanged);
    DimensionsStore.addListener(AppActionTypes.storeChanged, this.storeChanged);
    GeographyStore.addListener(AppActionTypes.storeChanged, this.storeChanged);
    HighwaysStore.addListener(AppActionTypes.storeChanged, this.storeChanged);
  }

  componentWillUnmount () {
  }

  componentDidUpdate () {
  }

  getDefaultState () {
    return {
      year: 1967
    };
  }



  // ============================================================ //
  // Handlers
  // ============================================================ //

  hashChanged (event, suppressRender) {
  }

  storeChanged () {
    this.setState({
    });
  }

  onMapMoved (event) {
  }

  onWindowResize (event) { AppActions.windowResized(); }

  onCategoryClicked(event) { AppActions.categorySelected(event.target.id); }

  onCityClicked(event) { AppActions.citySelected(event.target.id); }

  onYearClicked(event) {
    let year = parseInt(event.target.id);

    AppActions.dateSelected(year);

    this.setState({
      year: year
    });
  }

  render () {
    return (
      <div>
        <header style={ DimensionsStore.getHeaderStyle() }>
          <h1>Urban Renewal, 1949-1973</h1>
        </header>
        <USMap 
          state={ this.state }
          onCityClicked={ this.onCityClicked }
          style={ DimensionsStore.getNationalMapStyle() }
        />
        <TimelineComponent 
          onClick={ this.onYearClicked }
          year={ this.state.year }
          style={ DimensionsStore.getTimelineStyle() }
        />
        <aside
          style={ DimensionsStore.getSidebarStyle() }
        >
          { CitiesStore.getSelectedCity() ? 
            <CityStats 
              { ...CitiesStore.getCityData(CitiesStore.getSelectedCity()) }
              categories={ CitiesStore.getCategories() }
              year={ this.state.year }
            /> :
            <YearStats
              year={ this.state.year }
              totals={ CitiesStore.getYearTotals(this.state.year) }
              onCategoryClicked={ this.onCategoryClicked }
            />
          }
        </aside>
      </div>
    );
  }

}

export default App;