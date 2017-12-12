import * as React from 'react';
import { Typeahead } from 'react-typeahead';
import "babel-polyfill";

// stores
import CitiesStore from './stores/CitiesStore';
import DimensionsStore from './stores/DimensionsStore';
import GeographyStore from './stores/GeographyStore';
import HighwaysStore from './stores/HighwaysStore';
import TextsStore from './stores/TextsStore';
import HashManager from './stores/HashManager';

import panoramaNavData from '../data/pannav.json';



// components
  // national
import MapChart from './components/national/MapChartComponent.jsx';
import Legend from  './components/national/LegendComponent.jsx';
import VizControls from './components/national/VizControlsComponent.jsx';
import ZoomControls from './components/national/ZoomControlsComponent.jsx';
import NationalStats from './components/national/NationalStats.jsx';

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
import ContactUs from './components/ContactUs.jsx';
import PanNavComponent from './components/PanNavComponent.jsx';


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
      contactUs: false,
      showIntroModal: window.localStorage.getItem('hasViewedIntroModal-renewal') !== 'true',
      showIntro: false,
      showPanoramaMenu: false,
    };

    this.coords = {};

    // bind handlers
    const handlers = ['storeChanged','onCategoryClicked','onCityClicked','onDragUpdate','onYearClicked','onWindowResize','onZoomIn','handleMouseUp','handleMouseDown','handleMouseMove','zoomOut','resetView','toggleLegendVisibility','zoomToState', 'onViewSelected','onCityInspected','onCityOut','onCityMapMove', 'onHOLCToggle', 'onProjectInspected', 'onProjectOut', 'onSearching', 'onProjectMapHover', 'onProjectSelected', 'onProjectMapUnhover','onSearchBlur','onCloseSearch','toggleScatterplotExplanationVisibility','onDismissIntroModal','onModalClick','onContactUsToggle','onCityViewSelected','toggleIntro','introIntercept','onPanoramaMenuClick'];
    handlers.map(handler => { this[handler] = this[handler].bind(this); });

    console.time('update');
  }

  componentWillMount () { 
    AppActions.loadInitialData(this.state, HashManager.getState()); 
    // check whether city is loading
    if (HashManager.getState().city) {
      this.setState({initialCityLoading: true});
    }

    if (HashManager.getState().hasOwnProperty('noIntro')) {
      this.setState({showIntroModal: false});
    }

  }

  componentDidMount () {
    window.addEventListener('resize', this.onWindowResize);
    CitiesStore.addListener(AppActionTypes.storeChanged, this.storeChanged);
    DimensionsStore.addListener(AppActionTypes.storeChanged, this.storeChanged);
    GeographyStore.addListener(AppActionTypes.storeChanged, this.storeChanged);
    HighwaysStore.addListener(AppActionTypes.storeChanged, this.storeChanged);
    TextsStore.addListener(AppActionTypes.storeChanged, this.storeChanged);
  }

  componentDidUpdate () { 
    this.changeHash(); 
    if (this.state.initialCityLoading && CitiesStore.getSelectedCity()) {
      this.setState({initialCityLoading: false});
    }

    // add event listener for intro
    if (this.state.showIntro) {
      this.refs.storymap.addEventListener('load', () => { 
        var iDoc = this.refs.storymap.contentWindow || this.refs.storymap.contentDocument;  
        if (iDoc.document) {
          iDoc = iDoc.document;

          if (iDoc.addEventListener) {
            iDoc.addEventListener('click', this.introIntercept, true);
          }
        }
      });
    }
  }

  // ============================================================ //
  // Handlers
  // ============================================================ //

  introIntercept(e) {
    let target = e.target || e.srcElement;
    // intercept clicks on links
    if (target.tagName == 'A') {
      // stop the link from executing
      e.stopPropagation();
      e.preventDefault();

      // parse the link hash to load the project or whatever
      let hashVars ={};
      target.hash
        .substr(1)
        .split('&')
        .forEach(d => hashVars[d.split('=')[0]] = d.split('=')[1]);

      // hide the intro
      this.setState({ showIntro: false }, () => {
        if (hashVars.project) {
          AppActions.projectSelected(parseInt(hashVars.project)); 
        } else if (hashVars.city) {
          AppActions.citySelected(CitiesStore.getCityIdFromSlug(hashVars.city));
          if (hashVars.cityview) {
            AppActions.cityViewSelected(hashVars.cityview);
          }
        } else if (hashVars.year) {
          // after much trial and error, it appears the storymap needs to be gone and out of the dom before you can make the updates.
          // uncomfortably hacky, but it seems to work
          var waitingId1 = setInterval(() => {
            if (!this.refs.storymap) {
              clearInterval(waitingId1);
              this.resetView();
              AppActions.dateSelected(hashVars.year);
            }
          }, 50);
        }
      });
    }
  }

  hashChanged (event, suppressRender) { }

  storeChanged () { this.setState({}); }

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

  onContactUsToggle () {
    this.setState({
      contactUs: !this.state.contactUs,
      showIntro: false
    });
    AppActions.onModalClick(null);
  }

  onDismissIntroModal (persist) {
    if (persist) {
      window.localStorage.setItem('hasViewedIntroModal-renewal', 'true');
    }
    this.setState({
      showIntroModal: false
    });
  }

  onHOLCToggle() { AppActions.HOLCToggle(!CitiesStore.getHOLCSelected()); }

  onModalClick (event) {
    const subject = (event.target.id) ? (event.target.id) : null;
    AppActions.onModalClick(subject);
    this.setState({
      contactUs: null,
      showIntro: false
    });
  }

  onProjectInspected(event) { console.log(event.target.id); AppActions.projectInspected(event.target.id); }

  onProjectMapHover(event) { AppActions.projectInspectedStats(parseInt(event.target.options.id)); }

  onProjectMapUnhover(event) { AppActions.projectInspectedStats(null); }

  onProjectSelected(event) { 
    let id = (event.target.id) ? event.target.id : (event.target.options) ? parseInt(event.target.options.id) : null;
    id = (id == CitiesStore.getSelectedProject()) ? null : id;
    AppActions.projectSelected(parseInt(id)); 
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
    this.setState({ 
      searching: true,
      showIntro: false
    });
  }

  onCityViewSelected(event) {
    if (event.target.id == CitiesStore.getSelectedCityView()) {
      AppActions.cityViewSelected(null); 
    } else {
      AppActions.cityViewSelected(event.target.id); 
    }
  }

  onPanoramaMenuClick() { this.setState({ showPanoramaMenu: !this.state.showPanoramaMenu }); }

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

  toggleIntro() { 
    this.setState({ 
      showIntro: !this.state.showIntro,
      contactUs: null,
    }); 
  }

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
      cityview: CitiesStore.getSelectedCityView(),
      city: CitiesStore.getSlug(),
      viz: CitiesStore.getSelectedView(),
      project: CitiesStore.getSelectedProject(),
      text: TextsStore.getSubject(),
      noIntro: null, // it's done it's job at this point
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

    // let tempStats = {}, cityCount =0, projects = [];
    // [10000,25000,50000,100000,250000,500000,'500000+'].forEach(pop => tempStats[pop] = {cities: 0, projects: 0, whites: 0, nonwhite: 0, total: 0});
    // Object.keys(CitiesStore.getCities()).forEach(city_id => {
    //   const cityData = CitiesStore.getCityData(city_id),
    //     pPop = CitiesStore.getPopKey(cityData.pop_1960),
    //     aYear = 1963;
    //   if (pPop && cityData.yearsData[aYear]) {
    //     cityCount++;
    //     tempStats[pPop].cities++;
    //     tempStats[pPop].whites += cityData.yearsData[aYear].whites;
    //     tempStats[pPop].nonwhite += cityData.yearsData[aYear].nonwhite;
    //     tempStats[pPop].total += cityData.yearsData[aYear].whites + cityData.yearsData[aYear].nonwhite;

    //     Object.keys(cityData.projects).forEach(project_id => {
    //       if (cityData.projects[project_id].yearsData[aYear] && cityData.projects[project_id].yearsData[aYear].totalFamilies > 0) {
    //         tempStats[pPop].projects++;

    //         if (pPop == 10000 || pPop==25000) {
    //           if (cityData.projects[project_id].the_geojson) {
    //             projects.push(cityData.projects[project_id]);
    //           }
    //         }
    //       }
    //     });
    //   }

    // });

    // console.log(tempStats);
    // console.log(cityCount);
    // console.log(projects.sort((a,b) => b.totalFamilies - a.totalFamilies ));

    // let citiesToHighlight = Object.keys(CitiesStore.getCities()).filter(id => CitiesStore.getCityData(id).percentFamiliesOfColor == 1).map(id => parseInt(id));
    // let citiesToHighlight = Object.keys(CitiesStore.getCities()).filter(id => CitiesStore.getCityData(id).pop_1960 <= 50000).map(id => parseInt(id));
    // setTimeout(() => { AppActions.citiesHighlighted(citiesToHighlight); }, 3000);
    // console.log(citiesToHighlight);

    return (
        <div className='container full-height'>

          <div className='row full-height'>
            <div className='columns eight full-height'>
              <header style={ DimensionsStore.getHeaderStyle() }>
                <h1><a href='./'>Renewing <span className='dark'>Inequality</span></a></h1>
                <h2><a href='./'>Family Displacements through Urban Renewal, 1950-1966</a></h2>
                <h4 onClick={ this.toggleIntro } id={ 'intro' }>Introduction</h4>
                <h4 onClick={ this.onModalClick } id={ 'sources' }>Sources & Method</h4>
                <h4 onClick={ this.onModalClick } id={ 'defining' }>Legislative History</h4>
                <h4 onClick={ this.onModalClick } id={ 'citing' }>Citing</h4>
                <h4 onClick={ this.onModalClick } id={ 'about' }>About</h4>
                <h4 onClick={ this.onContactUsToggle }>Contact Us</h4>
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
                        selectedCityView={ CitiesStore.getSelectedCityView() }
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

                      { ((CitiesStore.getSelectedCityView() !== 'holc' || !CitiesStore.hasHOLCData(CitiesStore.getSelectedCity())) && this.state.legendVisible) ? 
                        <LegendRaceAndIncome 
                          selectedYear={ CitiesStore.getSelectedYear() } 
                          selectedCityView={ CitiesStore.getSelectedCityView() }
                        /> : ''
                      }

                      { (CitiesStore.getSelectedCityView() == 'holc' && CitiesStore.hasHOLCData(CitiesStore.getSelectedCity()) && this.state.legendVisible) ? 
                        <LegendHOLC 
                          miurl={ 'https://dsl.richmond.edu/panorama/redlining/#loc=' + [GeographyStore.getLatLngZoom().zoom, GeographyStore.getLatLngZoom().lat, GeographyStore.getLatLngZoom().lng].join('/') }
                          city={ CitiesStore.getCityData(CitiesStore.getSelectedCity()).city }
                          selectedYear={ CitiesStore.getSelectedYear() }
                        /> : ''
                      }

                      <CityMapControls 
                       selectedCityView={ CitiesStore.getSelectedCityView() }
                       onCityViewSelected={ this.onCityViewSelected }
                       hasHOLCData = { CitiesStore.hasHOLCData(CitiesStore.getSelectedCity()) }
                      /> 

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
                          ref='nationalmap'
                        />

                        { (CitiesStore.getSelectedView() == 'scatterplot') ?
                            <div className='scatterplotExplanation'>
                              { (this.state.scatterplotExplanationVisible) ?
                                <p><a href='https://www.youtube.com/watch?v=T8Abhj17kYU' target='_blank'>James Baldwin famously indicted urban renewal as "Negro removal."</a> While it certainly lacks Baldwin's eloquence, this chart largely makes the same point. Most cities fall below the yellow line because they displaced families of color disproportionately relative to their overall population. Expressed another way visually, cities represented by purple circles against the green part of the chart are cities with a majority white population that largely displaced people of color through their urban renewal projects. For example, the bottom left of the graph shows cities like <span onMouseEnter={ this.onCityInspected } onMouseLeave={ this.onCityOut } id={ CitiesStore.getCityIdFromSlug('cincinnatiOH')}>Cincinnati</span>, <span onMouseEnter={ this.onCityInspected } onMouseLeave={ this.onCityOut } id={ CitiesStore.getCityIdFromSlug('norfolkVA')}>Norfolk</span>, <span onMouseEnter={ this.onCityInspected } onMouseLeave={ this.onCityOut } id={ CitiesStore.getCityIdFromSlug('clevelandOH')}>Cleveland</span>, <span onMouseEnter={ this.onCityInspected } onMouseLeave={ this.onCityOut } id={ CitiesStore.getCityIdFromSlug('saintlouisMO')}>St. Louis</span>, <span onMouseEnter={ this.onCityInspected } onMouseLeave={ this.onCityOut } id={ CitiesStore.getCityIdFromSlug('philadelphiaPA')}>Philadelphia</span>, and <span onMouseEnter={ this.onCityInspected } onMouseLeave={ this.onCityOut } id={ CitiesStore.getCityIdFromSlug('detroitMI')}>Detroit</span> where people of color were 20% to 30% of the overall population but made up two-thirds or more of those displaced. On the far right are usually smaller white cities with tiny populations of color. With people of color being less than 10% of those cities' populations, though the majority of families displaced were white, racial disparities still characterized urban renewal in most of these cities as well. For example, while 96% of the families displaced in <span onMouseEnter={ this.onCityInspected } onMouseLeave={ this.onCityOut } id={ CitiesStore.getCityIdFromSlug('scrantonPA')}>Scranton</span> were white, more than 99% of the population was white.
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
                            selectedYear={ CitiesStore.getSelectedYear() || '1950-1966' }
                            selectedView={ CitiesStore.getSelectedView() }
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

                        { (CitiesStore.getCityLoading()) ?
                          <div className='cityLoading'>
                            <img src='static/loading3.svg' style={{ marginTop: DimensionsStore.getLoaderOffset() }} />
                          </div> : ''
                        }
                      </div> : ''
                  }

                  { (TextsStore.mainModalIsOpen()) ?
                    <div className='longishform'>
                      <button className='close' onClick={ this.onModalClick }><span>×</span></button>
                      <div className='content' dangerouslySetInnerHTML={ TextsStore.getModalContent() } />
                    </div> :
                    null
                  }

                  { (this.state.contactUs) ? <ContactUs onContactUsToggle={ this.onContactUsToggle }/> : '' }
                </div> : ''

              }


            </div> 



          </div>

        <aside
          style={ DimensionsStore.getSidebarStyle() }
        >

          { (CitiesStore.getHighlightedProject() && !CitiesStore.getInspectedCity()) ? 
            <ProjectStats 
              { ...CitiesStore.getCityData(CitiesStore.getHighlightedCity()) }
              project_id={ CitiesStore.getHighlightedProject() }
              stats={ CitiesStore.getStatsByProject(CitiesStore.getHighlightedProject()) }
              cityCat={ CitiesStore.getPopCatDescription(CitiesStore.getHighlightedProject()) }
              categories={ CitiesStore.getCategories() }
              year={ this.state.year }
              resetView={ this.resetView }
              onProjectClick={ this.onProjectSelected }
              onProjectInspected={ this.onProjectInspected }
              onProjectOut={ this.onProjectOut }
              onContactUsToggle={ this.onContactUsToggle }
              selected={ CitiesStore.getHighlightedProject() == CitiesStore.getSelectedProject() }
            /> : ''
          }

          { ((!CitiesStore.getHighlightedProject() && CitiesStore.getHighlightedCity()) || CitiesStore.getInspectedCity()) ? 
            <CityStats 
              { ...CitiesStore.getCityData(CitiesStore.getHighlightedCity()) }
              displacementProjects={ CitiesStore.getCityProjectsOrganized(CitiesStore.getHighlightedCity(), true) }
              noDisplacementProjects={ CitiesStore.getCityProjectsOrganized(CitiesStore.getHighlightedCity(), false) }
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

          { (!CitiesStore.getHighlightedProject() && !CitiesStore.getHighlightedCity()) ? 
            <NationalStats 
              { ...CitiesStore.getYearTotals(CitiesStore.getSelectedYear()) }
              selectedYear={ CitiesStore.getSelectedYear() }
              onCityClicked={ this.onCityClicked }
              onProjectClick={ this.onProjectSelected }
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
              yearSpan={ [1954, 1972] }
              yearsData={ CitiesStore.getYearsTotals() }
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

        <PanNavComponent
          show_menu={ this.state.showPanoramaMenu } 
          on_hamburger_click={ this.onPanoramaMenuClick } 
          nav_data={ panoramaNavData.filter((item, i) => item.url.indexOf('renewing-inequality') === -1) } 
          links={ [
            { name: 'Digital Scholarship Lab', url: '//dsl.richmond.edu' },
            { name: 'University of Richmond', url: '//www.richmond.edu' }
          ] }
          link_separator=', '
        />

        { (this.state.showIntro) ?
          <div
            className='storymap'
          >
            <iframe 
              width="100%" 
              height="100%" 
              src="//dsl.richmond.edu/panorama/renewal/intro/index.html?appid=8627fd65192a4734a7173f421e240e8c&ui=min&embed" 
              frameBorder="0" 
              scrolling="yes"
              id='storymap'
              ref='storymap' />

            <div className='closeIntro' onClick={ this.toggleIntro }>
              x
            </div>
          </div> : ''
        }

      </div>
    );
  }
}