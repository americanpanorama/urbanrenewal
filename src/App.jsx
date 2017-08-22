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
// national
import MapChart from './components/national/MapChartComponent.jsx';
import Legend from  './components/national/LegendComponent.jsx';
import VizControls from './components/national/VizControlsComponent.jsx';
import ZoomControls from './components/national/ZoomControlsComponent.jsx';

// city
import CityMap from './components/city/CityMap.jsx';
import CityMapControls from  './components/city/CityMapControlsComponent.jsx';
import LegendRaceAndIncome from  './components/city/LegendRaceAndIncomeComponent.jsx';
import LegendHOLC from  './components/city/LegendHOLCComponent.jsx';

// stats
import CityStats from './components/stats/CityStats.jsx';
import ProjectStats from './components/stats/ProjectStats.jsx';


import CityTimelineComponent from './components/stats/CityTimelineComponent.jsx';
import TimelineYearComponent from './components/TimelineYearComponent.jsx';


import YearStats from './components/YearStats.jsx';
import TypeAheadCitySnippet from './components/TypeAheadCitySnippet.jsx';
import CitySnippet from './components/CitySnippetComponent.jsx';
import { Typeahead } from 'react-typeahead';


// utils
// TODO: refactor to use same structure as PanoramaDispatcher;
// Having `flux` as a dependency, and two different files, is overkill.
import { AppActions, AppActionTypes } from './utils/AppActionCreator';
import AppDispatcher from './utils/AppDispatcher';
import { getColorForRace } from './utils/HelperFunctions';

// main app container
export default class App extends React.Component {

  constructor (props) {
    super(props);

    this.state = {
      legendVisible: true
    };

    this.coords = {};

    // bind handlers
    const handlers = ['storeChanged','onCategoryClicked','onCityClicked','onDragUpdate','onYearClicked','onWindowResize','onZoomIn','handleMouseUp','handleMouseDown','handleMouseMove','zoomOut','resetView','toggleLegendVisibility','zoomToState', 'onViewSelected','onCityInspected','onCityOut','onCityMapMove', 'onHOLCToggle', 'onProjectInspected', 'onProjectOut', 'onSearching', 'onProjectMapHover', 'onProjectSelected', 'onProjectMapUnhover'];
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

  onCityClicked(event) { 
    const id = event.city_id || event.target.id;
    AppActions.citySelected(id); 
  }

  onCityInspected(event) { AppActions.cityInspected(event.target.id); }

  onCityMapMove(event) { AppActions.cityMapMoved(); }

  onCityOut() { AppActions.cityInspected(null); }

  onHOLCToggle() { AppActions.HOLCToggle(!CitiesStore.getHOLCSelected()); }

  onProjectInspected(event) { AppActions.projectInspected(event.target.id); }

  onProjectMapHover(event) { AppActions.projectInspectedStats(parseInt(event.target.options.id)); }

  onProjectMapUnhover(event) { AppActions.projectInspectedStats(null); }

  onProjectSelected(event) { AppActions.projectSelected(parseInt(event.target.options.id)); }

  onProjectOut() { AppActions.projectInspected(null); }

  onSearching(d) { 
    console.log(d);
  }

  onViewSelected(event) { 
    if (event.target.id !== CitiesStore.getSelectedView()) {
      AppActions.viewSelected(event.target.id, CitiesStore.getSelectedView()); 
    }
  }

  onYearClicked(event) {
    let year = (event.target.id && parseInt(event.target.id) !== CitiesStore.getSelectedYear()) ? parseInt(event.target.id) : null;

    AppActions.dateSelected(year);
  }


  toggleLegendVisibility() { this.setState({ legendVisible: !this.state.legendVisible }); }

  onZoomIn(event) {
    event.preventDefault();
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

  resetView() { 
    AppActions.citySelected(null);
    AppActions.mapMoved(0,0,1); 
  }


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
    const vizState = { 
      year: CitiesStore.getSelectedYear(),
      view: [GeographyStore.getX(), GeographyStore.getY(), GeographyStore.getZ()].join('/'),
      city: CitiesStore.getSlug(),
      viz: CitiesStore.getSelectedView(),
      holc: CitiesStore.getHOLCSelected() || null
    };
    if (CitiesStore.getSelectedCity() && GeographyStore.getLatLngZoom().lat) {
      vizState.loc = { 
        zoom: GeographyStore.getLatLngZoom().zoom, 
        center: [GeographyStore.getLatLngZoom().lat, GeographyStore.getLatLngZoom().lng] 
      };
    } else {
      vizState.loc = null;
    }

    HashManager.updateHash(vizState);
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
                  <div>
                    <CityMap
                      { ...CitiesStore.getVisibleCitiesDetails() }
                      cityData= { CitiesStore.getCityData(CitiesStore.getSelectedCity()) }
                      //visibleCityIds = { CitiesStore.getVisibleCityIds() }
                      { ...GeographyStore.getLatLngZoom() }
                      maxForYear={ CitiesStore.getCityData(CitiesStore.getSelectedCity()).maxDisplacmentsForYear }
                      onMoveend={ this.onCityMapMove }
                      onProjectHover={ this.onProjectMapHover }
                      onProjectUnhover={ this.onProjectMapUnhover }
                      onProjectClick={ this.onProjectSelected }
                      HOLCSelected={ CitiesStore.getHOLCSelected() }
                      inspectedProject={ CitiesStore.getInspectedProject() }
                      inspectedProjectStats={ CitiesStore.getHighlightedProject() }
                    />

                    <button
                      className='resetView city'
                      onClick={ this.resetView }
                    >
                      <img src='static/us-outline.svg' />
                    </button>

                    { (!CitiesStore.getHOLCSelected() && CitiesStore.hasDemographicData(CitiesStore.getSelectedCity())) ? 
                      <LegendRaceAndIncome /> : ''
                    }

                    { (CitiesStore.getHOLCSelected() && CitiesStore.hasHOLCData(CitiesStore.getSelectedCity())) ? 
                      <LegendHOLC 
                        miurl={ 'https://dsl.richmond.edu/panorama/redlining/#loc=' + [GeographyStore.getLatLngZoom().zoom, GeographyStore.getLatLngZoom().lat, GeographyStore.getLatLngZoom().lng].join('/') + "&opacity=0" }
                        city={ CitiesStore.getCityData(CitiesStore.getSelectedCity()).city }
                      /> : ''
                    }

                    { (CitiesStore.hasHOLCData(CitiesStore.getSelectedCity())) ?
                      <CityMapControls 
                       holcSelected={ CitiesStore.getHOLCSelected() }
                       onHOLCToggle={ this.onHOLCToggle }
                      /> : ''
                    }
                  </div>
                  :
                  <div>
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
                    />

                    { (CitiesStore.getSelectedView() == 'scatterplot') ?
                        <p 
                          style={ DimensionsStore.getScatterplotExplanationAttrs() }
                          className='scatterplotExplanation'
                        >James Baldwin famously characterized urban renewal as "Negro removal," a point made too by this chart. Cities below the yellow line, which is most cities, displaced families of color disproportionately relative to their overall population. For example, the bottom left of the graph shows cities like <span onMouseEnter={ this.onCityInspected } onMouseLeave={ this.onCityOut } id={ CitiesStore.getCityIdFromSlug('cincinnatiOH')}>Cincinnati</span>, <span onMouseEnter={ this.onCityInspected } onMouseLeave={ this.onCityOut } id={ CitiesStore.getCityIdFromSlug('norfolkVA')}>Norfolk</span>, <span onMouseEnter={ this.onCityInspected } onMouseLeave={ this.onCityOut } id={ CitiesStore.getCityIdFromSlug('clevelandOH')}>Cleveland</span>, <span onMouseEnter={ this.onCityInspected } onMouseLeave={ this.onCityOut } id={ CitiesStore.getCityIdFromSlug('saintlouisMO')}>St. Louis</span>, <span onMouseEnter={ this.onCityInspected } onMouseLeave={ this.onCityOut } id={ CitiesStore.getCityIdFromSlug('philadelphiaPA')}>Philadelphia</span>, and <span onMouseEnter={ this.onCityInspected } onMouseLeave={ this.onCityOut } id={ CitiesStore.getCityIdFromSlug('detroitMI')}>Detroit</span> where people of color were 20% to 30% of the overall population but made up two-thirds or more of those displaced. On the far right are usually smaller white cities with tiny populations of color. With people of color being less than 10% of those cities populations, though the majority of families displaced were white, families of color were still <em>disproportionately</em> displaced by most of these cities. For example, while 96% of the families displaced in <span onMouseEnter={ this.onCityInspected } onMouseLeave={ this.onCityOut } id={ CitiesStore.getCityIdFromSlug('scrantonPA')}>Scranton</span> where white, more than 99% of the population was white.
                        </p> : ''
                    }

                    <ZoomControls
                      onZoomIn={ this.onZoomIn }
                      onZoomOut={ this.zoomOut }
                      resetView={ this.resetView }
                    />

                    <VizControls
                      selectedView={ CitiesStore.getSelectedView() }
                      onViewSelected={ this.onViewSelected }
                    />

                    { (this.state.legendVisible) ?
                      <Legend
                        poc={ CitiesStore.getPOC() }
                        onDragUpdate={ this.onDragUpdate }
                      /> : ''
                    }
                  </div>
                }

              </div> 
            </div>
          </div>

        <aside
          style={ DimensionsStore.getSidebarStyle() }
        >

          { (CitiesStore.getHighlightedProject()) ? 
            <ProjectStats 
              { ...CitiesStore.getCityData(CitiesStore.getHighlightedCity()) }
              project_id={ CitiesStore.getHighlightedProject() }
              categories={ CitiesStore.getCategories() }
              year={ this.state.year }
            /> : ''
          }

          { (!CitiesStore.getHighlightedProject() && CitiesStore.getHighlightedCity()) ? 
            <CityStats 
              { ...CitiesStore.getCityData(CitiesStore.getHighlightedCity()) }
              categories={ CitiesStore.getCategories() }
              year={ this.state.year }
              onCityClicked={ this.onCityClicked }
              onCategoryClicked={ this.onCategoryClicked }
              onProjectInspected={ this.onProjectInspected }
              onProjectOut={ this.onProjectOut }
              onYearClick={ this.onYearClicked }
            /> : ''
          }
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

        <div 
          className='search'
          style={ DimensionsStore.getSearchStyle() }
        >
          <Typeahead
            options={ CitiesStore.getCitiesListWithDisplacements() }
            placeholder={ 'Search by city or state' }
            filterOption={ 'searchName' }
            displayOption={(city, i) => city.city }
            onOptionSelected={ this.onCityClicked }
            customListComponent={ TypeAheadCitySnippet }
            onKeyPress={ this.onSearching }
            //maxVisible={ 8 }
            
          />
        </div>
      </div>
    );
  }
}