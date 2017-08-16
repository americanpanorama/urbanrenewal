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
import ProjectStats from './components/ProjectStats.jsx';
import YearStats from './components/YearStats.jsx';
import TypeAheadCitySnippet from './components/TypeAheadCitySnippet.jsx';
import CitySnippet from './components/CitySnippetComponent.jsx';
import DorlingCartogram from './components/DorlingCartogramComponent.jsx';
import Scatterplot from './components/ScatterplotComponent.jsx';
import { Typeahead } from 'react-typeahead';


// utils
// TODO: refactor to use same structure as PanoramaDispatcher;
// Having `flux` as a dependency, and two different files, is overkill.
import { AppActions, AppActionTypes } from './utils/AppActionCreator';
import AppDispatcher from './utils/AppDispatcher';
import { calculateDorlingsPosition, getColorForRace } from './utils/HelperFunctions';

// main app container
class App extends React.Component {

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

                {/* button for national view*/}
                <button
                  className='resetView'
                  onClick={ this.resetView }
                >
                  <img src='static/us-outline.svg' />
                </button>

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

                    { (!CitiesStore.getHOLCSelected() && CitiesStore.hasDemographicData(CitiesStore.getSelectedCity())) ? 
                      <div 
                        className='mapLegend demographics'
                      >
                        <svg
                          width={135}
                          height={130}
                          style={{ margin: '10px 0 0 5px' }}
                        >

                          { [0,1,2,3,4].map(income => {
                            return (
                              [1,0.75,0.5,0.25,0].map((perc, i) => {
                                return (
                                  <rect
                                    x={25 + income * 15}
                                    y={20 + i * 15}
                                    width={15}
                                    height={15}
                                    fill={ getColorForRace(perc) }
                                    fillOpacity={ (0.75 - 0.7 * (income * 2500 / 10000)) }
                                    stroke={ getColorForRace(perc) }
                                    strokeWidth={0.5}
                                  />
                                );
                              })
                            );
                          })}
                          <text
                            x={0}
                            y={62.5}
                            textAnchor='middle'
                            alignmentBaseline='hanging'
                            transform='rotate(270 0,57.5)'
                            fill='black'
                          >
                            people of color
                          </text>
                          <text
                            x={103}
                            y={20}
                            alignmentBaseline='hanging'
                            fill='black'
                            fontSize='0.9em'
                          >
                            100%
                          </text>
                          <text
                            x={103}
                            y={95}
                            alignmentBaseline='baseline'
                            fill='black'
                            fontSize='0.9em'
                          >
                            0%
                          </text>
                          <text
                            x={25 + (75/2)}
                            y={0}
                            textAnchor='middle'
                            alignmentBaseline='hanging'
                            fill='black'
                          >
                            ← lower income
                          </text>
                          <text
                            x={25 + 15/2}
                            y={20 + 77}
                            textAnchor='middle'
                            alignmentBaseline='hanging'
                            fill='black'
                            fontSize='0.9em'
                          >
                            $1K
                          </text>
                          <text
                            x={25 + 75 - 15/2}
                            y={20 + 77}
                            textAnchor='middle'
                            alignmentBaseline='hanging'
                            fill='black'
                            fontSize='0.9em'
                          >
                            $5K+
                          </text>
                          <text
                            x={25 + 75/2}
                            y={20 + 77 + 12 }
                            textAnchor='middle'
                            alignmentBaseline='hanging'
                            fill='#444'
                            fontSize='0.8em'
                          >
                            median family incomes
                          </text>
                        </svg>
                      </div> : ''
                    }

                    { (CitiesStore.getHOLCSelected() && CitiesStore.hasHOLCData(CitiesStore.getSelectedCity())) ? 
                       <div 
                        className='mapLegend holc'
                      >
                        <div><span className='colorkey A'> </span>A "Best"</div>
                        <div><span className='colorkey B'> </span>B "Still Desirable"</div>
                        <div><span className='colorkey C'> </span>C "Definitely Declining"</div>
                        <div><span className='colorkey D'> </span>D "Hazardous"</div>

                        <div className='link'><a href={ 'https://dsl.richmond.edu/panorama/redlining/#loc=' + [GeographyStore.getLatLngZoom().zoom, GeographyStore.getLatLngZoom().lat, GeographyStore.getLatLngZoom().lng].join('/') + "&opacity=0" }>See "Mapping Inequality" to explore redlining in { CitiesStore.getCityData(CitiesStore.getSelectedCity()).city }.</a></div>
                      </div> : ''
                    }

                    
                    { (CitiesStore.hasHOLCData(CitiesStore.getSelectedCity())) ?
                      <div id='mapChartToggle'>
                        <div
                          className={ (CitiesStore.getHOLCSelected()) ? '' : 'selected' }
                          onClick={ this.onHOLCToggle }
                        >
                          <span className='tooltip'>View the racial demographics and median incomes from the 1960s census.</span>
                          1960 Race and Income
                        </div>

                        <div
                          className={ (CitiesStore.getHOLCSelected()) ? 'selected' : '' }
                          onClick={ this.onHOLCToggle }
                        >
                          <span className='tooltip'>View the grades assigned by the Home Owners' Loan Corporation assessing 'neighborhood security' in the 1930s.</span>
                          1930s redlining grades
                        </div>
                      
                      </div> : ''
                    }

                  </div>
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
                      <div
                        className="zoom-in" 
                        title="Zoom in" 
                        role="button" 
                        aria-label="Zoom in"
                        onClick={ this.onZoomIn } 
                        id='zoomInButton'
                      >
                        +
                      </div>
                      <div
                        className="zoom-out" 
                        title="Zoom out" 
                        role="button" 
                        aria-label="Zoom out"
                        onClick={ this.zoomOut }
                      >
                        -
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

                    {/* JSX Comment <div 
                      className='toggleLegend'
                      onClick={ this.toggleLegendVisibility }
                    >
                      { (this.state.legendVisible) ? 'hide legend' : 'show legend' }
                    </div>*/}



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

export default App;