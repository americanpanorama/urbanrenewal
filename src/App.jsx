import * as React from 'react';
import { Typeahead } from 'react-typeahead';

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

  // search
import TypeAheadCitySnippet from './components/search/TypeAheadCitySnippet.jsx';

  // timeline
import TimelineYearComponent from './components/TimelineYearComponent.jsx';

import IntroModal from './components/IntroModalComponent.jsx';

// utils
import { AppActions, AppActionTypes } from './utils/AppActionCreator';
import AppDispatcher from './utils/AppDispatcher';
import { getColorForRace } from './utils/HelperFunctions';

export default class App extends React.Component {

  constructor (props) {
    super(props);

    this.state = {
      legendVisible: true,
      scatterplotExplanationVisible: true,
      searching: false,
      initialCityLoading: false,
      showIntroModal: false // window.localStorage.getItem('hasViewedIntroModal-renewal') !== 'true',
    };

    this.coords = {};

    // bind handlers
    const handlers = ['storeChanged','onCategoryClicked','onCityClicked','onDragUpdate','onYearClicked','onWindowResize','onZoomIn','handleMouseUp','handleMouseDown','handleMouseMove','zoomOut','resetView','toggleLegendVisibility','zoomToState', 'onViewSelected','onCityInspected','onCityOut','onCityMapMove', 'onHOLCToggle', 'onProjectInspected', 'onProjectOut', 'onSearching', 'onProjectMapHover', 'onProjectSelected', 'onProjectMapUnhover','onSearchBlur','onCloseSearch','toggleScatterplotExplanationVisibility','onDismissIntroModal'];
    handlers.map(handler => { this[handler] = this[handler].bind(this); });

    console.time('update');
  }

  componentWillMount () { 
    AppActions.loadInitialData(this.state, HashManager.getState()); 
    // check whether city is loading
    if (HashManager.getState().city) {
      this.setState({initialCityLoading: true});
    }

  }

  componentDidMount () {
    window.addEventListener('resize', this.onWindowResize);
    CitiesStore.addListener(AppActionTypes.storeChanged, this.storeChanged);
    DimensionsStore.addListener(AppActionTypes.storeChanged, this.storeChanged);
    GeographyStore.addListener(AppActionTypes.storeChanged, this.storeChanged);
    HighwaysStore.addListener(AppActionTypes.storeChanged, this.storeChanged);
  }

  componentDidUpdate () { 
    this.changeHash(); 
    if (this.state.initialCityLoading && CitiesStore.getSelectedCity()) {
      this.setState({initialCityLoading: false});
    }
  }

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
    const id = event.city_id || event.target.id || event.target.options.id;
    AppActions.citySelected(id); 

    // clear and blur search
    this.refs.typeahead.setEntryText('');
    this.refs.typeahead.refs.entry.blur();
    this.setState({ searching: false });
  }

  onCityInspected(event) {
    const id = event.city_id || event.target.id || event.target.options.id;
    AppActions.cityInspected(parseInt(id)); 
  }

  onCityMapMove(event) { 
    // wait until move has stopped before executing
    let waitingId = setInterval(() => {
      if (!this.refs.cityMap.isMoving()) {
        clearInterval(waitingId);
        AppActions.cityMapMoved();
      }
    }, 100);
  }

  onCityOut() { AppActions.cityInspected(null); }

  onCloseSearch() {
    this.refs.typeahead.setEntryText('');
    this.setState({ searching: false });
    AppActions.citiesHighlighted([]);
  }

  onDismissIntroModal (persist) {
    if (persist) {
      window.localStorage.setItem('hasViewedIntroModal-executiveabroad', 'true');
    }
    this.setState({
      showIntroModal: false
    });
  }

  onHOLCToggle() { AppActions.HOLCToggle(!CitiesStore.getHOLCSelected()); }

  onProjectInspected(event) { AppActions.projectInspected(event.target.id); }

  onProjectMapHover(event) { AppActions.projectInspectedStats(parseInt(event.target.options.id)); }

  onProjectMapUnhover(event) { AppActions.projectInspectedStats(null); }

  onProjectSelected(event) { 
    let id = (event.target.id) ? event.target.id : (event.target.options) ? parseInt(event.target.options.id) : null;
    id = (id == CitiesStore.getSelectedProject()) ? null : id;
    AppActions.projectSelected(id); 
  }

  onProjectOut() { AppActions.projectInspected(null); }

  onSearchBlur() { 
    // you don't want this firing before a click on the search results
    let waitingId = setInterval(() => {
      if (!this.refs.typeahead.refs.entry.value) {
        clearInterval(waitingId);
        this.refs.typeahead.setEntryText('');
        AppActions.citiesHighlighted([]); 
      }
    }, 150);

  }

  onSearching(e) { 
    AppActions.citiesHighlighted(this.refs.typeahead.getOptionsForValue(this.refs.typeahead.refs.entry.value, CitiesStore.getCitiesListWithDisplacements()).map(c => c.city_id)); 
    this.setState({ searching: true });
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

  toggleScatterplotExplanationVisibility() { this.setState({ scatterplotExplanationVisible: !this.state.scatterplotExplanationVisible}); }

  onZoomIn(event) {
    event.preventDefault();
    const z = Math.min(GeographyStore.getZ() * 1.62, 18),
      centerX = (event.target.id == 'zoomInButton') ? DimensionsStore.getMainPaneWidth()  / 2 - GeographyStore.getX() : event.nativeEvent.offsetX - GeographyStore.getX(),
      centerY = (event.target.id == 'zoomInButton') ? DimensionsStore.getNationalMapHeight()  / 2 - GeographyStore.getY() : event.nativeEvent.offsetY - GeographyStore.getY(),
      x = DimensionsStore.getMainPaneWidth()  / 2 - centerX / GeographyStore.getZ() * z,
      y = DimensionsStore.getNationalMapHeight()  / 2 - centerY / GeographyStore.getZ() * z;
    AppActions.mapMoved(x,y,z);
  }

  zoomOut() {
    const z = Math.max(GeographyStore.getZ() / 1.62, 1),
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
    AppActions.projectSelected(null);
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
      holc: CitiesStore.getHOLCSelected() || null,
      project: CitiesStore.getSelectedProject()
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
                <h2>Family Displacements through Urban Renewal, 1955-1966</h2>
              </header>

              { (!this.state.showIntroModal) ?
                <div 
                  className='mainPanel row template-tile' 
                  { ...DimensionsStore.getMainPanelDimensions() }
                >

                  { (CitiesStore.getSelectedCity()) ? 
                    <div>
                      <CityMap
                        { ...CitiesStore.getVisibleCitiesDetails() }
                        cityData= { CitiesStore.getCityData(CitiesStore.getSelectedCity()) }
                        //visibleCityIds = { CitiesStore.getVisibleCityIds() }
                        { ...GeographyStore.getLatLngZoom() }
                        maxForYear={ CitiesStore.getCityData(CitiesStore.getSelectedCity()).maxDisplacmentsForYear }
                        onMoveend={ this.onCityMapMove }
                        onCitySelected={ this.onCityClicked }
                        onCityHover={ this.onCityInspected }
                        onCityOut={ this.onCityOut }
                        onProjectHover={ this.onProjectMapHover }
                        onProjectUnhover={ this.onProjectMapUnhover }
                        onProjectClick={ this.onProjectSelected }
                        HOLCSelected={ CitiesStore.getHOLCSelected() }
                        highlightedCity={ CitiesStore.getHighlightedCity() }
                        inspectedCity={ CitiesStore.getInspectedCity() }
                        inspectedProject={ CitiesStore.getInspectedProject() }
                        inspectedProjectStats={ CitiesStore.getHighlightedProject() }
                        selectedYear={ CitiesStore.getSelectedYear() }
                        ref='cityMap'
                      />

                      <button
                        className='resetView city'
                        onClick={ this.resetView }
                      >
                        <img src='static/us-outline.svg' />
                      </button>

                      { (!CitiesStore.getHOLCSelected() && this.state.legendVisible) ? 
                        <LegendRaceAndIncome selectedYear={ CitiesStore.getSelectedYear() } /> : ''
                      }

                      { (CitiesStore.getHOLCSelected() && CitiesStore.hasHOLCData(CitiesStore.getSelectedCity()) && this.state.legendVisible) ? 
                        <LegendHOLC 
                          miurl={ 'https://dsl.richmond.edu/panorama/redlining/#loc=' + [GeographyStore.getLatLngZoom().zoom, GeographyStore.getLatLngZoom().lat, GeographyStore.getLatLngZoom().lng].join('/') + "&opacity=0" }
                          city={ CitiesStore.getCityData(CitiesStore.getSelectedCity()).city }
                          selectedYear={ CitiesStore.getSelectedYear() }
                        /> : ''
                      }

                      { (CitiesStore.hasHOLCData(CitiesStore.getSelectedCity())) ?
                        <CityMapControls 
                         holcSelected={ CitiesStore.getHOLCSelected() }
                         onHOLCToggle={ this.onHOLCToggle }
                        /> : ''
                      }

                      <div 
                        className='hideLegend'
                        onClick={ this.toggleLegendVisibility }
                      >
                        { (this.state.legendVisible) ? '⇲ hide legend' : '⇱ show legend' }
                      </div>
                    </div>
                    : (!this.state.initialCityLoading) ? 
                      <div>
                        <MapChart
                          { ...GeographyStore.getXYZ() }
                          selectedView= { CitiesStore.getSelectedView() }
                          highlightedCities={ CitiesStore.getHighlightedCities() }
                          onCityClicked={ this.onCityClicked }
                          onStateClicked={ this.zoomToState }
                          onViewSelected={ this.onViewSelected }
                          onCityHover={ this.onCityInspected }
                          onCityOut={ this.onCityOut }
                          resetView={ this.resetView }
                          onMapClicked={ this.onZoomIn }
                          handleMouseDown={ this.handleMouseDown }
                          handleMouseMove={ this.handleMouseMove }
                          handleMouseUp={ this.handleMouseUp }
                        />

                        { (CitiesStore.getSelectedView() == 'scatterplot') ?
                            <div className='scatterplotExplanation'>
                              { (this.state.scatterplotExplanationVisible) ?
                                <p>James Baldwin famously characterized urban renewal as "Negro removal," a point made too by this chart. Most cities fall below the orange line because they displaced families of color disproportionately relative to their overall population. For example, the bottom left of the graph shows cities like <span onMouseEnter={ this.onCityInspected } onMouseLeave={ this.onCityOut } id={ CitiesStore.getCityIdFromSlug('cincinnatiOH')}>Cincinnati</span>, <span onMouseEnter={ this.onCityInspected } onMouseLeave={ this.onCityOut } id={ CitiesStore.getCityIdFromSlug('norfolkVA')}>Norfolk</span>, <span onMouseEnter={ this.onCityInspected } onMouseLeave={ this.onCityOut } id={ CitiesStore.getCityIdFromSlug('clevelandOH')}>Cleveland</span>, <span onMouseEnter={ this.onCityInspected } onMouseLeave={ this.onCityOut } id={ CitiesStore.getCityIdFromSlug('saintlouisMO')}>St. Louis</span>, <span onMouseEnter={ this.onCityInspected } onMouseLeave={ this.onCityOut } id={ CitiesStore.getCityIdFromSlug('philadelphiaPA')}>Philadelphia</span>, and <span onMouseEnter={ this.onCityInspected } onMouseLeave={ this.onCityOut } id={ CitiesStore.getCityIdFromSlug('detroitMI')}>Detroit</span> where people of color were 20% to 30% of the overall population but made up two-thirds or more of those displaced. On the far right are usually smaller white cities with tiny populations of color. With people of color being less than 10% of those cities populations, though the majority of families displaced were white, racial disparities still characterized urban renewal in most of these citeis as well. For example, while 96% of the families displaced in <span onMouseEnter={ this.onCityInspected } onMouseLeave={ this.onCityOut } id={ CitiesStore.getCityIdFromSlug('scrantonPA')}>Scranton</span> were white, more than 99% of the population was white.
                                </p> : ''
                              }
                              <div 
                                className='hideExplanation'
                                onClick={ this.toggleScatterplotExplanationVisibility }
                              >
                                { (this.state.scatterplotExplanationVisible) ? '↙ hide explanation' : '↗ show explanation' }
                              </div>
                            </div> : ''
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
                            selectedYear={ CitiesStore.getSelectedYear() || '1955-1966' }
                            dorlingScale={ (CitiesStore.getSelectedView() == 'cartogram') ? GeographyStore.getZ() : 1 }
                            dorlingIncrements={ DimensionsStore.getLegendDimensionsIntervals() }
                            onDragUpdate={ this.onDragUpdate }
                          /> : ''
                        }

                        <div 
                          className='hideLegend'
                          onClick={ this.toggleLegendVisibility }
                        >
                          { (this.state.legendVisible) ? '⇲ hide legend' : '⇱ show legend' }
                        </div>
                      </div> : ''
                  }

                </div> : ''
              }
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
              resetView={ this.resetView }
              onProjectClick={ this.onProjectSelected }
              selected={ CitiesStore.getHighlightedProject() == CitiesStore.getSelectedProject() }
            /> : ''
          }

          { (!CitiesStore.getHighlightedProject() && CitiesStore.getHighlightedCity()) ? 
            <CityStats 
              { ...CitiesStore.getCityData(CitiesStore.getHighlightedCity()) }
              otherCities={ CitiesStore.getVisibleCitiesDetails().cities }
              categories={ CitiesStore.getCategories() }
              selectedYear={ CitiesStore.getSelectedYear() }
              inspectedProject={ CitiesStore.getInspectedProject() }
              selected={ CitiesStore.getHighlightedCity() == CitiesStore.getSelectedCity() }
              onCityClicked={ this.onCityClicked }
              onCategoryClicked={ this.onCategoryClicked }
              onProjectSelected={ this.onProjectSelected }
              onProjectInspected={ this.onProjectInspected }
              onProjectOut={ this.onProjectOut }
              onYearClick={ this.onYearClicked }
              resetView={ this.resetView }
            /> : ''
          }
        </aside>

          <div
            style = { DimensionsStore.getTimelineAttrs() }
            className='timelineControls'
          >
            <TimelineYearComponent 
              onClick={ this.onYearClicked }
              state={ this.state }
              selectedYear={ CitiesStore.getSelectedYear() }
              yearSpan={ (false && CitiesStore.getSelectedCity()) ? [CitiesStore.getCityData(CitiesStore.getSelectedCity()).startYear, CitiesStore.getCityData(CitiesStore.getSelectedCity()).endYear] : [1954, 1972] }
              yearsData={ (false && CitiesStore.getSelectedCity()) ? CitiesStore.getCityData(CitiesStore.getSelectedCity()).yearsData : CitiesStore.getYearsTotals() }
              projects={ (false && CitiesStore.getSelectedCity()) ? CitiesStore.getCityData(CitiesStore.getSelectedCity()).projects : false }
              name={ (false && CitiesStore.getSelectedCity()) ? (CitiesStore.getCityData(CitiesStore.getSelectedCity()).city + ', ' + CitiesStore.getCityData(CitiesStore.getSelectedCity()).state).toUpperCase() : 'United States' }
              style={ DimensionsStore.getTimelineStyle() }
            />
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
            onKeyUp={ this.onSearching }
            //onBlur={ this.onSearchBlur }
            ref='typeahead'
            //maxVisible={ 8 }
          />

          { (this.state.searching) ?
            <div 
              className='close'
              style={ DimensionsStore.getSearchCloseStyle() }
              onClick={ this.onCloseSearch }
              ref='closeSearch'
            >X</div> : ''
          }

          { this.state.showIntroModal ? <IntroModal onDismiss={ this.onDismissIntroModal } /> : '' }


        </div>
      </div>
    );
  }
}