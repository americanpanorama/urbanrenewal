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
import CityMap from './components/CityMap.jsx';
import LegendGradient from './components/LegendGradientComponent.jsx';
import CityTimelineComponent from './components/CityTimelineComponent.jsx';
import TimelineComponent from './components/TimelineComponent.jsx';
import USMap from './components/USMapComponent.jsx';
import CityStats from './components/CityStats.jsx';
import YearStats from './components/YearStats.jsx';
import CitySnippet from './components/CitySnippetComponent.jsx';

// utils
// TODO: refactor to use same structure as PanoramaDispatcher;
// Having `flux` as a dependency, and two different files, is overkill.
import { AppActions, AppActionTypes } from './utils/AppActionCreator';
import AppDispatcher from './utils/AppDispatcher';

// config

let cases = {
  '1956': [994], // Cincinnati
  '1958': [590], // Atlanta
  '1959': [65], // Cambridge,
  '1960': [168] // New York
};

// main app container
class App extends React.Component {

  constructor (props) {
    super(props);

    // bind handlers
    const handlers = ['storeChanged','onCategoryClicked','onCityClicked','onDragUpdate','onYearClicked','onWindowResize','onZoomIn','handleMouseUp','handleMouseDown','handleMouseMove','zoomOut','resetView','zoomToState'];
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
  }

  componentDidUpdate () { this.changeHash(); }

  // ============================================================ //
  // Handlers
  // ============================================================ //

  hashChanged (event, suppressRender) {
  }

  storeChanged () {
    this.setState({
    });
  }

  onDragUpdate(value, leftOrRight) { AppActions.POCSelected(value, leftOrRight); }

  onMapMoved (event) {
  }

  onWindowResize (event) { AppActions.windowResized(); }

  onCategoryClicked(event) { AppActions.categorySelected(event.target.id); }

  onCityClicked(event) { AppActions.citySelected(event.target.id); }

  onYearClicked(event) {
    let year = parseInt(event.target.id);

    let cat = (event.target.id.indexOf('families') !== -1) ? 'families' : (event.target.id.indexOf('funding') !== -1) ? 'funding' : this.state.cat;

    this.setState({
      cat: cat
    });

    AppActions.dateSelected(year);
  }

  onZoomIn(event) {
    let nextZoom = this.state.zoom*2;
    
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
      x: DimensionsStore.getMainPaneWidth()  / 2 - (DimensionsStore.getMainPaneWidth()  / 2 - this.state.x) / this.state.zoom * (nextZoom),
      y: DimensionsStore.getNationalMapHeight()  / 2 - (DimensionsStore.getNationalMapHeight()  / 2 - this.state.y) / this.state.zoom * (nextZoom)
    });
  }

  zoomToState(e) {
    const b = GeographyStore.getBoundsForState(e.target.id),
      centroid = GeographyStore.getCentroidForState(e.target.id),
      z = .8 / Math.max((b[1][0] - b[0][0]) / DimensionsStore.getMainPaneWidth(), (b[1][1] - b[0][1]) / DimensionsStore.getNationalMapHeight()),
      x = (DimensionsStore.getMainPaneWidth() / 2) - (DimensionsStore.getMainPaneWidth() * z * (centroid[0] / DimensionsStore.getMainPaneWidth())),
      y = (DimensionsStore.getNationalMapHeight() / 2) - (DimensionsStore.getNationalMapHeight() * z * (centroid[1] /  DimensionsStore.getNationalMapHeight()));
    AppActions.mapMoved(x,y,z);
  }

  resetView() { AppActions.mapMoved(0,0,1); }

  handleMouseUp() {
    this.dragging = false;
    this.coords = {};
  }

  handleMouseDown(e) {
    this.dragging = true;
    //Set coords
    //AppActions.mapMoved(e.pageX,e.pageY,GeographyStore.getZ());
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
      year: CitiesStore.getSelectedYear(),
      view: [GeographyStore.getX(), GeographyStore.getY(), GeographyStore.getZ()].join('/'),
      city: CitiesStore.getSlug(),
      cat: CitiesStore.getSelectedCategory()
    });
  }

  render () {
    console.log(CitiesStore.getVisibleCitiesByState());
    return (
        <div className='container full-height'>
          <div className='row full-height'>
            <div className='columns eight full-height'>
              <header style={ DimensionsStore.getHeaderStyle() }>
                <h1>Renewing Inequality</h1>
                <h2>1954-1972</h2>
              </header>

              <div 
                className='mainPanel row template-tile' 
                { ...DimensionsStore.getMainPanelDimensions() }
              >
                <svg 
                  { ...DimensionsStore.getMapDimensions() }
                  className='theMap'
                >
                  <ReactTransitionGroup component='g'>
                    <USMap 
                      x={ GeographyStore.getX() }
                      y={ GeographyStore.getY() }
                      z={ GeographyStore.getZ() }
                      onCityClicked={ this.onCityClicked }
                      onStateClicked={ this.zoomToState }
                      resetView={ this.resetView }
                      //onMapClicked={ this.onZoomIn }
                      handleMouseUp={ this.handleMouseUp }
                      handleMouseDown={ this.handleMouseDown }
                      handleMouseMove={ this.handleMouseMove }
                      //zoomOut={ this.zoomOut }
                      
                    />
                  </ReactTransitionGroup>

                  

                {/* JSX Comment 
                  <g
                    transform={ 'translate(0 ' + DimensionsStore.getNationalMapHeight() + ')' }
                  >

                    <TimelineComponent 
                      onClick={ this.onYearClicked }
                      state={ this.state }
                      year={ this.state.year }
                      yearSpan={ (CitiesStore.getSelectedCity()) ? [CitiesStore.getCityData(CitiesStore.getSelectedCity()).startYear, CitiesStore.getCityData(CitiesStore.getSelectedCity()).endYear] : [1954, 1972] }
                      yearsData={ (CitiesStore.getSelectedCity()) ? CitiesStore.getCityData(CitiesStore.getSelectedCity()).yearsData : CitiesStore.getYearsTotals() }
                      projects={ (CitiesStore.getSelectedCity()) ? CitiesStore.getCityData(CitiesStore.getSelectedCity()).projects : false }
                      name={ (CitiesStore.getSelectedCity()) ? (CitiesStore.getCityData(CitiesStore.getSelectedCity()).city + ', ' + CitiesStore.getCityData(CitiesStore.getSelectedCity()).state).toUpperCase() : 'United States' }
                      style={ DimensionsStore.getTimelineStyle() }
                    />

                  </g>*/}
                </svg>

                <LegendGradient
                  state={ this.state }
                  poc={ CitiesStore.getPOC() }
                  onDragUpdate={ this.onDragUpdate }
                  percent={ (CitiesStore.getSelectedCity() && CitiesStore.getCityData(CitiesStore.getSelectedCity()).yearsData[this.state.year] && CitiesStore.getCityData(CitiesStore.getSelectedCity()).yearsData[this.state.year].percentFamiliesOfColor) ? Math.round(CitiesStore.getCityData(CitiesStore.getSelectedCity()).yearsData[this.state.year].percentFamiliesOfColor * 100) : false }
                />

              {/* JSX Comment 
          
                { (CitiesStore.getSelectedCity()) ?
                  <CityTimelineComponent 
                    onClick={ this.onYearClicked }
                    state={ this.state }
                    year={ this.state.year }
                    yearSpan={ (CitiesStore.getSelectedCity()) ? [CitiesStore.getCityData(CitiesStore.getSelectedCity()).startYear, CitiesStore.getCityData(CitiesStore.getSelectedCity()).endYear] : [1954, 1972] }
                    yearsData={ (CitiesStore.getSelectedCity()) ? CitiesStore.getCityData(CitiesStore.getSelectedCity()).yearsData : CitiesStore.getYearsTotals() }
                    projects={ (CitiesStore.getSelectedCity()) ? CitiesStore.getCityData(CitiesStore.getSelectedCity()).projects : false }
                    maxForYear={ CitiesStore.getCityData(CitiesStore.getSelectedCity()).maxDisplacmentsForYear }
                    name={ (CitiesStore.getSelectedCity()) ? (CitiesStore.getCityData(CitiesStore.getSelectedCity()).city + ', ' + CitiesStore.getCityData(CitiesStore.getSelectedCity()).state).toUpperCase() : 'United States' }
                    style={ DimensionsStore.getTimelineStyle() }
                  /> :
                  <TimelineComponent 
                    onClick={ this.onYearClicked }
                    state={ this.state }
                    year={ this.state.year }
                    yearSpan={ (CitiesStore.getSelectedCity()) ? [CitiesStore.getCityData(CitiesStore.getSelectedCity()).startYear, CitiesStore.getCityData(CitiesStore.getSelectedCity()).endYear] : [1954, 1972] }
                    yearsData={ (CitiesStore.getSelectedCity()) ? CitiesStore.getCityData(CitiesStore.getSelectedCity()).yearsData : CitiesStore.getYearsTotals() }
                    projects={ (CitiesStore.getSelectedCity()) ? CitiesStore.getCityData(CitiesStore.getSelectedCity()).projects : false }
                    name={ (CitiesStore.getSelectedCity()) ? (CitiesStore.getCityData(CitiesStore.getSelectedCity()).city + ', ' + CitiesStore.getCityData(CitiesStore.getSelectedCity()).state).toUpperCase() : 'United States' }
                    style={ DimensionsStore.getTimelineStyle() }
                  />
                }*/}
              </div> 
            </div>
          </div>


        
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
            <div className='stateList'>
              { CitiesStore.getVisibleCitiesByState().map(state => {
                return (
                  <div key={ 'state' + state.abbr }>
                    <h2>{ state.name }</h2>
                    { state.cities.map(city => {
                      return (
                        <CitySnippet
                          { ...city }
                          displayPop={ true }
                          key={ 'city' + city.city_id }
                          onCityClick={ this.onCityClicked }
                        />
                      );
                    })}
                  </div>
                );
              })} 
            </div>
          }

          {/* <YearStats
              year={ this.state.year }
              totals={ CitiesStore.getYearTotals(this.state.year) }
              onCategoryClicked={ this.onCategoryClicked }
            />*/}

          {/* (cases[this.state.year]) ? 
            cases[this.state.year].map((cityId, i)=> {
              return (
                <CityMap 
                  year={ this.state.year }
                  cityData={ CitiesStore.getCityData(cityId) }
                  key={'case' + this.state.year + i }
                />
              );
            }) :
            ''
          */}


          

          
        </aside>
      </div>
    );
  }

}

export default App;