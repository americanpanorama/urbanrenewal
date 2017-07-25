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
import LegendDorlings from './components/LegendDorlingsComponent.jsx';
import CityTimelineComponent from './components/CityTimelineComponent.jsx';
import TimelineYearComponent from './components/TimelineYearComponent.jsx';
import MapChart from './components/MapChartComponent.jsx';
import CityStats from './components/CityStats.jsx';
import YearStats from './components/YearStats.jsx';
import CitySnippet from './components/CitySnippetComponent.jsx';
import DorlingCartogram from './components/DorlingCartogramComponent.jsx';
import Scatterplot from './components/ScatterplotComponent.jsx';
import {ReactSVGPanZoom} from 'react-svg-pan-zoom';


// utils
// TODO: refactor to use same structure as PanoramaDispatcher;
// Having `flux` as a dependency, and two different files, is overkill.
import { AppActions, AppActionTypes } from './utils/AppActionCreator';
import AppDispatcher from './utils/AppDispatcher';
import { calculateDorlingsPosition } from './utils/HelperFunctions';

// main app container
class App extends React.Component {

  constructor (props) {
    super(props);

    this.state = {
      legendVisible: true
    };

    this.coords = {};

    // bind handlers
    const handlers = ['storeChanged','onCategoryClicked','onCityClicked','onDragUpdate','onYearClicked','onWindowResize','onZoomIn','handleMouseUp','handleMouseDown','handleMouseMove','zoomOut','resetView','toggleLegendVisibility','zoomToState', 'onViewSelected','onCityInspected','onCityOut'];
    handlers.map(handler => { this[handler] = this[handler].bind(this); });

    console.time('update');
  }

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

  hashChanged (event, suppressRender) { }

  storeChanged () { this.setState({});}

  onDragUpdate(value, leftOrRight) { AppActions.POCSelected(value, leftOrRight); }

  onMapMoved (event) { }

  onWindowResize (event) { AppActions.windowResized(); }

  onCategoryClicked(event) { AppActions.categorySelected(event.target.id); }

  onCityClicked(event) { AppActions.citySelected(event.target.id); }

  onCityInspected(event) { AppActions.cityInspected(event.target.id); }

  onCityOut() { AppActions.cityInspected(null); }

  onViewSelected(event) { 
    if (event.target.id !== CitiesStore.getSelectedView()) {
      AppActions.viewSelected(event.target.id); 
    }
  }

  onYearClicked(event) {
    let year = (event.target.id && parseInt(event.target.id) !== CitiesStore.getSelectedYear()) ? parseInt(event.target.id) : null;

    AppActions.dateSelected(year);
  }

  toggleLegendVisibility() { this.setState({ legendVisible: !this.state.legendVisible }); }

  onZoomIn(event) {
    console.log(event.target.id);
    const z = GeographyStore.getZ() * 1.6,
      centerX = (event.target.id == 'zoomInButton') ? DimensionsStore.getMainPaneWidth()  / 2 - GeographyStore.getX() : event.nativeEvent.offsetX - GeographyStore.getX(),
      centerY = (event.target.id == 'zoomInButton') ? DimensionsStore.getNationalMapHeight()  / 2 - GeographyStore.getY() : event.nativeEvent.offsetY - GeographyStore.getY(),
      x = DimensionsStore.getMainPaneWidth()  / 2 - centerX / GeographyStore.getZ() * z,
      y = DimensionsStore.getNationalMapHeight()  / 2 - centerY / GeographyStore.getZ() * z;
    AppActions.mapMoved(x,y,z);
  }

  zoomOut() {
    const z = GeographyStore.getZ() / 1.6,
      x = DimensionsStore.getMainPaneWidth()  / 2 - (DimensionsStore.getMainPaneWidth()  / 2 - GeographyStore.getX()) / GeographyStore.getZ() * z,
      y = DimensionsStore.getNationalMapHeight()  / 2 - (DimensionsStore.getNationalMapHeight()  / 2 - GeographyStore.getY()) / GeographyStore.getZ() * z;
    AppActions.mapMoved(x,y,z);
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
    this.coords = {x: e.pageX, y:e.pageY};
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
      var x = GeographyStore.getX() - xDiff,       
        y = GeographyStore.getY() - yDiff,
        z = GeographyStore.getZ();
      //Re-render
      AppActions.mapMoved(x,y,z); 
    }
  }

  /* manage hash */

  changeHash () {
    HashManager.updateHash({ 
      year: CitiesStore.getSelectedYear(),
      view: [GeographyStore.getX(), GeographyStore.getY(), GeographyStore.getZ()].join('/'),
      city: CitiesStore.getSlug(),
      viz: CitiesStore.getSelectedView()
    });
  }

  render () {
    return (
        <div className='container full-height'>
          <div className='row full-height'>
            <div className='columns eight full-height'>
              <header style={ DimensionsStore.getHeaderStyle() }>
                <h1>Renewing Inequality</h1>
                <h2> Urban Renewal, Family Displacements, and Race 1955-1966</h2>
              </header>

              <div 
                className='mainPanel row template-tile' 
                { ...DimensionsStore.getMainPanelDimensions() }
              >

                { CitiesStore.getSelectedCity() ? 
                  <CityMap
                    cityData= { CitiesStore.getCityData(CitiesStore.getSelectedCity()) }
                    { ...GeographyStore.getLatLngZoom() }
                    maxForYear={ CitiesStore.getCityData(CitiesStore.getSelectedCity()).maxDisplacmentsForYear }
                  />
                  :
                  <div>
                    <svg 
                      { ...DimensionsStore.getMapDimensions() }
                      className='theMap'
                    >
                      <ReactTransitionGroup component='g'>
                        <MapChart
                          { ...GeographyStore.getXYZ() }
                          selectedView= { CitiesStore.getSelectedView() }
                          onCityClicked={ this.onCityClicked }
                          onStateClicked={ this.zoomToState }
                          onViewSelected={ this.onViewSelected }
                          onCityHover={ this.onCityInspected }
                          onCityOut={ this.onCityOut }
                          resetView={ this.resetView }
                          onMapClicked={ this.onZoomIn }
                          handleMouseUp={ this.handleMouseUp }
                          handleMouseDown={ this.handleMouseDown }
                          handleMouseMove={ this.handleMouseMove }
                        />
                      </ReactTransitionGroup>

                    </svg>
                    <div id='mapChartControls'>
                      <div onClick={ this.onZoomIn } className='zoomin'>
                        <img src='static/zoomin.png' />
                      </div>

                      <div onClick={ this.zoomOut }  className='zoomout'>
                        <img src='static/zoomout.png' />
                      </div>

                      <div onClick={ this.resetView } className='reset'>
                        <span className='tooltip'>reset view</span>
                        <img src='static/reset.png' />
                      </div>
                    
                    </div>

                    <div id='mapChartToggle'>
                      <div
                        className={ (CitiesStore.getSelectedView() == 'map') ? 'selected' : '' }
                        onClick={ this.onViewSelected }
                        id='map'
                      >
                        <span className='tooltip'>Shows displacements in cities.</span>
                        <img src='static/map.png' />
                        map
                      </div>

                      <div
                        className={ (CitiesStore.getSelectedView() == 'cartogram') ? 'selected' : '' }
                        onClick={ this.onViewSelected }
                        id='cartogram'
                      >
                        <span className='tooltip'>Shows all cities with no overlap keeping them as close as possible to their actual location.</span>
                        <img src='static/cartogram.png' />
                        cartogram
                      </div>

                      <div
                        className={ (CitiesStore.getSelectedView() == 'scatterplot') ? 'selected' : '' }
                        onClick={ this.onViewSelected }
                        id='scatterplot'
                      >
                        <span className='tooltip'>Charts percentage of displacements by race relative to the racial demographics of the overall city.</span>
                        <img src='static/scatterplot.png' />
                        chart

                      </div>
                    
                    </div>

                    { (this.state.legendVisible) ?
                      <div 
                        className='mapLegend'
                        style={ DimensionsStore.getLegendDimensions() }
                      >
                        <LegendGradient
                          state={ this.state }
                          poc={ CitiesStore.getPOC() }
                          onDragUpdate={ this.onDragUpdate }
                          percent={ (CitiesStore.getSelectedCity() && CitiesStore.getCityData(CitiesStore.getSelectedCity()).yearsData[this.state.year] && CitiesStore.getCityData(CitiesStore.getSelectedCity()).yearsData[this.state.year].percentFamiliesOfColor) ? Math.round(CitiesStore.getCityData(CitiesStore.getSelectedCity()).yearsData[this.state.year].percentFamiliesOfColor * 100) : false }
                        />
                        <LegendDorlings />
                      </div> : ''
                    }

                    <div 
                      className='toggleLegend'
                      onClick={ this.toggleLegendVisibility }
                    >
                      { (this.state.legendVisible) ? 'hide legend' : 'show legend' }
                    </div>

                  </div>
                }


              </div> 
            </div>
          </div>


        
        <aside
          style={ DimensionsStore.getSidebarStyle() }
        >
          { CitiesStore.getHighlightedCity() ? 
            <CityStats 
              { ...CitiesStore.getCityData(CitiesStore.getHighlightedCity()) }
              categories={ CitiesStore.getCategories() }
              year={ this.state.year }
              onCityClicked={ this.onCityClicked }
              onCategoryClicked={ this.onCategoryClicked }
            /> : 
            <div className='stateList'>
              {/* CitiesStore.getVisibleCitiesByState().map(state => {
                return (
                  <div key={ 'state' + state.abbr }>
                    <h2>{ state.name }</h2>
                    { state.cities.map(city => {
                      return (
                        <CitySnippet
                          { ...city }
                          numWithDisplacements={ Object.keys(city.projects).filter(id => (city.projects[id].yearsData[CitiesStore.getSelectedYear()] && city.projects[id].yearsData[CitiesStore.getSelectedYear()].totalFamilies && city.projects[id].yearsData[CitiesStore.getSelectedYear()].totalFamilies > 0)).length}
                          displayPop={ true }
                          key={ 'city' + city.city_id }
                          onCityClick={ this.onCityClicked }
                        />
                      );
                    })}
                  </div>
                );
              }) */} 
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

          <div
            style = { DimensionsStore.getTimelineAttrs() }
            className='timelineControls'
          >
            { (false && CitiesStore.getSelectedCity()) ?
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
              <TimelineYearComponent 
                onClick={ this.onYearClicked }
                state={ this.state }
                year={ this.state.year }
                yearSpan={ (false && CitiesStore.getSelectedCity()) ? [CitiesStore.getCityData(CitiesStore.getSelectedCity()).startYear, CitiesStore.getCityData(CitiesStore.getSelectedCity()).endYear] : [1954, 1972] }
                yearsData={ (false && CitiesStore.getSelectedCity()) ? CitiesStore.getCityData(CitiesStore.getSelectedCity()).yearsData : CitiesStore.getYearsTotals() }
                projects={ (false && CitiesStore.getSelectedCity()) ? CitiesStore.getCityData(CitiesStore.getSelectedCity()).projects : false }
                name={ (false && CitiesStore.getSelectedCity()) ? (CitiesStore.getCityData(CitiesStore.getSelectedCity()).city + ', ' + CitiesStore.getCityData(CitiesStore.getSelectedCity()).state).toUpperCase() : 'United States' }
                style={ DimensionsStore.getTimelineStyle() }
              />
            }
          </div>
      </div>
    );
  }

}

export default App;