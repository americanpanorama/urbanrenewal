// import node modules
import d3 from 'd3';
import * as React from 'react';

// stores
import CitiesStore from './stores/CitiesStore';
import GeographyStore from './stores/GeographyStore';
import HighwaysStore from './stores/HighwaysStore';

// components
//import { HashManager } from '@panorama/toolkit';
import TimelineComponent from './components/TimelineComponent.jsx';
import USMap from './components/USMapComponent.jsx';
import CityStats from './components/CityStats.jsx';

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
    const handlers = ['storeChanged','onCityClicked','onYearClicked'];
    handlers.map(handler => { this[handler] = this[handler].bind(this); });
  }

  // ============================================================ //
  // React Lifecycle
  // ============================================================ //

  componentWillMount () {
    AppActions.loadInitialData(this.state, this.state);
  }

  componentDidMount () {
    CitiesStore.addListener(AppActionTypes.storeChanged, this.storeChanged);
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

  onWindowResize (event) {
  }

  onCityClicked(event) {
    AppActions.citySelected(event.target.id);
  }

  onYearClicked(event) {
    let year = parseInt(event.target.id);

    AppActions.dateSelected(year);

    this.setState({
      year: year
    });
  }

  render () {
    console.log(CitiesStore.getCategories());

    return (
      <div className='container full-height'>
        <h1>Urban Renewal, 1949-1973</h1>
        <USMap 
          state={ this.state }
          geojson={ GeographyStore.getStatesGeojson() }
          highways={ HighwaysStore.getHighwaysList() }
          cities={ CitiesStore.getCitiesDataForYearAndCategory(this.state.year, 'urban renewal grants dispursed') }
          onCityClicked={ this.onCityClicked }
        />
        <TimelineComponent 
          onClick={ this.onYearClicked }
          year={ this.state.year }
        />
        { CitiesStore.getSelected() ? 
          <CityStats 
            { ...CitiesStore.getCityData(CitiesStore.getSelected()) }
            categories={ CitiesStore.getCategories() }
            year={ this.state.year }
          /> :
          null
        }

      </div>
    );
  }

}

export default App;
