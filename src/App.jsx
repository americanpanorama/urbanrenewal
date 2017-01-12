// import node modules
import d3 from 'd3';
import * as React from 'react';
import ReactTransitionGroup from 'react-addons-transition-group';

// stores
import CitiesStore from './stores/CitiesStore';
import DimensionsStore from './stores/DimensionsStore';
import GeographyStore from './stores/GeographyStore';
import HighwaysStore from './stores/HighwaysStore';
import HashManager from './stores/HashManager';

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
    const handlers = ['storeChanged','onCategoryClicked','onCityClicked','onYearClicked','onWindowResize','onZoomIn','handleMouseUp','handleMouseDown','handleMouseMove','zoomOut'];
    handlers.map(handler => { this[handler] = this[handler].bind(this); });
  }

  // ============================================================ //
  // React Lifecycle
  // ============================================================ //

  componentWillMount () {
    AppActions.loadInitialData(this.state, HashManager.getState());
  }

  componentDidMount () {
    window.addEventListener('resize', this.onWindowResize);
    CitiesStore.addListener(AppActionTypes.storeChanged, this.storeChanged);
    DimensionsStore.addListener(AppActionTypes.storeChanged, this.storeChanged);
    GeographyStore.addListener(AppActionTypes.storeChanged, this.storeChanged);
    HighwaysStore.addListener(AppActionTypes.storeChanged, this.storeChanged);

    // this.setState({
    //   x: DimensionsStore.getMainPaneWidth() / 2,
    //   y: DimensionsStore.getNationalMapHeight() / 2
    // });
  }

  componentWillUnmount () {
  }

  componentDidUpdate () { this.changeHash(); }

  getDefaultState () {
    return {
      year: (HashManager.getState().year) ? HashManager.getState().year : 1967,
      x: (HashManager.getState().view) ? parseInt(HashManager.getState().view.split('/')[0]) :0,
      y: (HashManager.getState().view) ? parseInt(HashManager.getState().view.split('/')[1]) :0,
      zoom: (HashManager.getState().view) ? parseInt(HashManager.getState().view.split('/')[2]) : 1
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

  onZoomIn(event) {
    let nextZoom = this.state.zoom*2;
    console.log(DimensionsStore.getNationalMapHeight()  / 2, event.nativeEvent.offsetX, this.state.x, this.state.zoom, nextZoom);

    this.setState({ 
      zoom: nextZoom,
      x: DimensionsStore.getMainPaneWidth()  / 2 - (event.nativeEvent.offsetX - this.state.x) / this.state.zoom * (nextZoom),
      y: DimensionsStore.getNationalMapHeight()  / 2 - (event.nativeEvent.offsetY - this.state.y) / this.state.zoom * (nextZoom)
    });
  }

  zoomOut() {
    let nextZoom = this.state.zoom / 2;
    this.setState({
      zoom: (this.state.zoom >= 2) ? nextZoom : 1,
      x: DimensionsStore.getMainPaneWidth()  / 2 - (DimensionsStore.getNationalMapHeight()  / 2 - this.state.x) / this.state.zoom * (nextZoom),
      y: DimensionsStore.getNationalMapHeight()  / 2 - (DimensionsStore.getNationalMapHeight()  / 2 - this.state.y) / this.state.zoom * (nextZoom)
    });
  }

  handleMouseUp() {
    this.dragging = false;
    this.coords = {};
  }

  handleMouseDown(e) {
    this.dragging = true;
    //Set coords
    this.coords = {
      x: e.pageX,
      y: e.pageY
    };
  }

  handleMouseMove(e) {
    //If we are dragging
    if (this.dragging) {
      e.preventDefault();
      //Get mouse change differential
      var xDiff = this.coords.x - e.pageX,
        yDiff = this.coords.y - e.pageY;
      //Update to our new coordinates
      this.coords.x = e.pageX;
      this.coords.y = e.pageY;
      //Adjust our x,y based upon the x/y diff from before
      var x = this.state.x - xDiff,       
        y = this.state.y - yDiff;
      //Re-render
      this.setState({
        x: x,
        y: y
      });  
    }
  }

  /* manage hash */

  changeHash () {
    HashManager.updateHash({ 
      year: this.state.year,
      view: [this.state.x, this.state.y, this.state.zoom].join('/'),
      city: CitiesStore.getSlug(),
      category: CitiesStore.getSelectedCategory()
    });
  }

  render () {
    return (
      <div>
        <header style={ DimensionsStore.getHeaderStyle() }>
          <h1>Urban Renewal, 1949-1973</h1>
        </header>

        <ReactTransitionGroup>
          <USMap 
            state={ this.state }
            onCityClicked={ this.onCityClicked }
            style={ DimensionsStore.getNationalMapStyle() }
            onMapClicked={ this.onZoomIn }
            handleMouseUp={ this.handleMouseUp }
            handleMouseDown={ this.handleMouseDown }
            handleMouseMove={ this.handleMouseMove }
            zoomOut={ this.zoomOut }
          />
        </ReactTransitionGroup>
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
              onCityClicked={ this.onCityClicked }
              onCategoryClicked={ this.onCategoryClicked }
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