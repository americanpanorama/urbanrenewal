import { EventEmitter } from 'events';
import AppDispatcher from '../utils/AppDispatcher';
import { AppActionTypes } from '../utils/AppActionCreator';
import CitiesStore from './CitiesStore';
import GeographyStore from './GeographyStore';
import d3 from 'd3';

const DimensionsStore = {

  data: {
    containerPadding: 20,
    headerHeight: 100,
    timelineHeight: 200, // set in scss
    
    tilesHeight: window.innerHeight - 140, // two paddings + headerHeight
    sidebarTitleBottomMargin: 10,
    adNavHeight: 20,
    windowHeight: window.innerHeight,

    sidebarWidth: 0,
    mainPaneWidth: 0,
    sidebarTitleHeight: 0,

    legendWidth: 400,
    legendHeight: 100,
    legendVerticalGutter: 10,
    gradientTopBottomMargins: 20,
    

    dorlingsMaxRadius: 10,

    isRetina: false
  },

  computeComponentDimensions () {
    this.data.windowHeight = window.innerHeight;
    this.data.windowWidth = window.innerWidth;
    this.data.tilesHeight = this.data.windowHeight - this.data.headerHeight - 2*this.data.containerPadding;
    this.data.sidebarWidth =(document.getElementsByClassName('dataViewer').length > 0) ? document.getElementsByClassName('dataViewer')[0].offsetWidth : this.data.windowWidth * 0.322 - 2*this.data.containerPadding;
    this.data.mainPaneWidth = (document.getElementsByClassName('main-pane').length > 0) ? document.getElementsByClassName('main-pane')[0].offsetWidth : (this.data.windowWidth) * (2/3 - 0.015*8/12) - this.data.containerPadding ; // this is complicated--I deduced it from the calcuations in _skeleton.scss
    this.data.mainPaneHeight = this.data.windowHeight - this.data.headerHeight - 2*this.data.containerPadding;

    this.data.sidebarHeight = (this.data.windowHeight - this.data.headerHeight - 2 * this.data.containerPadding) * 2/3 ;
    this.data.sidebarTitleHeight = (document.getElementsByClassName('sidebarTitle').length > 0) ? document.getElementsByClassName('sidebarTitle')[0].offsetHeight: 30;
    this.data.nationalMapHeight = this.data.mainPaneHeight - this.data.containerPadding * 2;
    this.data.nationalMapWidth = this.data.mainPaneWidth - this.data.containerPadding * 2;
    this.data.dorlingsMaxRadius= (this.getNationalMapWidth()/960 < this.getNationalMapHeight()/500) ? this.data.nationalMapWidth / 28 : this.getNationalMapHeight() / 15;

    this.data.legendRight = this.data.nationalMapWidth * 0.077 + this.data.containerPadding; // lines up roughly with the western edge of Maine on full size map
    
    this.data.legendHeight = Math.max(2 * this.data.dorlingsMaxRadius, 18 * 5) + this.data.legendVerticalGutter * 2;

    this.data.legendDorlingWidth =  3 * this.data.dorlingsMaxRadius + this.data.legendVerticalGutter * 2; // I'm estimating the labels take half the width as the diameter + 3 for gutters on either side
    this.data.legendDorlingHeight = 2 * this.data.dorlingsMaxRadius + this.data.legendVerticalGutter * 2; // 10 for gutters on either side

    this.data.legendGradientHeight = this.data.legendHeight - this.data.legendVerticalGutter * 2;
    
    this.data.legendGradientHorizontalGutter = this.data.dorlingsMaxRadius;
    this.data.legendGradientWidth = this.data.dorlingsMaxRadius * 4+ this.data.legendGradientHorizontalGutter * 2;

    this.data.legendGradientHeightQuints = this.data.legendGradientHeight / 5;

    this.data.legendWidth =  this.data.legendDorlingWidth + this.data.legendGradientWidth;

    this.data.timelineHeight = (this.data.windowHeight - this.data.headerHeight - 2 * this.data.containerPadding) * 1/3 - this.data.containerPadding;

    this.data.timelineProjectHeight = 20;

    this.data.isRetina = this.isItRetina();

    this.emit(AppActionTypes.storeChanged);
  },

  isItRetina: function() { return ((window.matchMedia && (window.matchMedia('only screen and (min-resolution: 124dpi), only screen and (min-resolution: 1.3dppx), only screen and (min-resolution: 48.8dpcm)').matches || window.matchMedia('only screen and (-webkit-min-device-pixel-ratio: 1.3), only screen and (-o-min-device-pixel-ratio: 2.6/2), only screen and (min--moz-device-pixel-ratio: 1.3), only screen and (min-device-pixel-ratio: 1.3)').matches)) || (window.devicePixelRatio && window.devicePixelRatio > 1.3)); },

  isRetina: function () { return this.data.isRetina; },

  getDimensions: function() { return this.data; },

  getMainPaneWidth: function() { return this.data.mainPaneWidth; },

  getMainPanelDimensions: function() {
    return {
      style: {
        height: this.data.mainPaneHeight
      }
    };
  },

  getMapDimensions: function() {
    return {
      width: this.data.mainPaneWidth - this.data.containerPadding * 2,
      height: this.data.mainPaneHeight - this.data.containerPadding * 2
    };
  },

  getNationalMapHeight: function() { return this.data.nationalMapHeight; },

  getNationalMapWidth: function() { return this.data.nationalMapWidth; },

  getMapScale: function() { return Math.min(this.getNationalMapWidth()/960* 1000, this.getNationalMapHeight()/500 * 1000); }, // I calculated these with trial and error--sure there's a more precise way as this will be fragile if the width changes 

  getMainStyle: function() {
    return {
      width: this.data.mainPaneWidth
    };
  },

  getHeaderStyle: function() {
    return {
      width: this.data.mainPaneWidth,
      height: this.data.headerHeight
    };
  },

  getNationalMapStyle: function() {
    return {
      width: this.data.mainPaneWidth,
      height: this.data.nationalMapHeight
    };
  },

  getTimelineStyle: function() {
    return {
      width: this.data.mainPaneWidth,
      height: this.data.timelineHeight
    };
  },

  getLegendWidth: function() { return this.data.legendWidth; },

  getLegendFontSize: function() { return Math.max(this.data.dorlingsMaxRadius / 3, 14); },

  getLegendDimensions: function() { 
    return {
      width: this.data.legendWidth,
      height: this.data.legendHeight + 40,
      //right: this.data.legendRight
    };
  },

  getLegendGradientDimensions: function() {
    return {
      width: this.data.legendGradientWidth,
      height: this.data.legendHeight
    };
  },

  getLegendGradientHorizontalGutter: function() { return this.data.legendGradientHorizontalGutter; },

  getLegendGradientInteriorDimensions: function() {
    return {
      x: 0,
      y: this.data.legendGradientHeightQuints * 2 + 2,
      width: this.data.dorlingsMaxRadius * 4,
      height: this.data.legendGradientHeightQuints - 4
    };
  },

  getLegendGradientPOCLabelAttrs: function() {
    return {
      x: this.getLegendGradientPercentX(1), 
      y: this.data.legendGradientHeightQuints,
      fontSize: this.getLegendFontSize() + 2,
      textAnchor: 'start',
    };
  },

  getLegendGradientNoRaceLabelAttrs: function() {
    return {
      x: this.getLegendGradientPercentX(1) + this.data.legendGradientHeightQuints + 5, 
      y: this.data.legendGradientHeightQuints * 5 + this.getLegendFontSize() + 2,
      fontSize: this.getLegendFontSize() + 2,
      textAnchor: 'start',
    };
  },



  getLegendGradientPOC0Attrs: function() {
    return {
      x: this.getLegendGradientPercentX(0), 
      y: this.data.legendGradientHeightQuints * 2,
      fontSize: this.getLegendFontSize(),
      textAnchor: 'start',
    };
  },

  getLegendGradientPOC100Attrs: function() {
    return {
      x: this.getLegendGradientPercentX(1), 
      y: this.data.legendGradientHeightQuints * 2,
      fontSize: this.getLegendFontSize(),
      textAnchor: 'end',
    };
  },

  getLegendGradientWhitesLabelAttrs: function() {
    return {
      x: this.getLegendGradientPercentX(0), 
      y: this.data.legendGradientHeightQuints * 4 + this.getLegendFontSize() + 2,
      fontSize: this.getLegendFontSize() + 2,
      textAnchor: 'end',
    };
  },

  getLegendGradientNoRaceBoxAttrs: function() {
    return {
      x: DimensionsStore.getLegendGradientPercentX(1),
      y: this.data.legendGradientHeightQuints * 5,
      width: this.getLegendFontSize() + 2,
      height: this.getLegendFontSize() + 2
    };
  },

  getLegendGradientPercentAttrs: function(perc, race) {
    return {
      x: this.getLegendGradientPercentX((race == 'poc') ? perc : 1-perc), 
      y: (race == 'poc') ? this.data.legendGradientHeightQuints * 2 - 1 : this.data.legendGradientHeightQuints * 3 + this.getLegendFontSize(),
      fontSize: this.getLegendFontSize(),
      textAnchor: 'middle',
    };
  },

  getLegendGradientWhites0Attrs: function() {
    return {
      x: this.getLegendGradientPercentX(1), 
      y: this.data.legendGradientHeightQuints * 3 + this.getLegendFontSize(),
      fontSize: this.getLegendFontSize(),
      textAnchor: 'end',
    };
  },

  getLegendGradientWhites100Attrs: function() {
    return {
      x: this.getLegendGradientPercentX(0), 
      y: this.data.legendGradientHeightQuints * 3 + this.getLegendFontSize(),
      fontSize: this.getLegendFontSize(),
      textAnchor: 'start',
    };
  },

  getLegendGradientPercentX: function(percent) { return this.getLegendGradientInteriorDimensions().x + this.getLegendGradientInteriorDimensions().width * (1 - percent); },

  getLegendGradientTopLabelX: function() { return this.data.dorlingsMaxRadius + this.data.legendGradientWidth * 0.25; },

  getLegendGradientBottomLabelX: function() { return this.data.dorlingsMaxRadius + this.data.legendGradientWidth * 0.75; },

  getLegendGradientTopLabelY: function() { return this.data.dorlingsMaxRadius * 2 / 5 - 3; },

  getLegendGradientBottomLabelY: function() { return this.data.dorlingsMaxRadius * 2 / 5 * 4 + 3; },

  getLegendGradientTopTextY: function() { return this.data.dorlingsMaxRadius * 2 / 5 * 2 - 3; },

  getLegendGradientBottomTextY: function() { return this.data.dorlingsMaxRadius * 2 / 5 * 3 + 3; },

  getLegendDimensionsIntervals: function() {
    const maxRepresentable = (CitiesStore.getSelectedView() == 'cartogram') ? this.getValueFromDorlingRadius(this.getDorlingsMaxRadius() / GeographyStore.getZ()) : this.getValueFromDorlingRadius(this.getDorlingsMaxRadius()),
      numDigits = Math.floor(maxRepresentable).toString().length,
      testNum = Math.round(maxRepresentable/Math.pow(10, numDigits - 2));

    return (testNum <= 15) ? [10,5,2,0.5].map(n => n * Math.pow(10, numDigits - 2)) :
      (testNum <= 20) ? [15,10,5,1].map(n => n * Math.pow(10, numDigits - 2)) :
      (testNum <= 25) ? [20,10,5,1].map(n => n * Math.pow(10, numDigits - 2)) :
      (testNum <= 50) ? [25, 15, 5, 1].map(n => n * Math.pow(10, numDigits - 2)) :
      (testNum <= 75) ? [50, 25, 10, 1].map(n => n * Math.pow(10, numDigits - 2)) :
      [75, 50, 25, 10].map(n => n * Math.pow(10, numDigits - 2));
  },

  getLegendDorlingsDimensions: function() {
    return {
      width: this.data.legendDorlingWidth,
      height: this.data.legendDorlingHeight
    };  
  },

  getLegendDorlingsCircleDimensions: function(scale) {
    scale = scale || 1;
    return {
      cx: (this.data.legendDorlingWidth - this.data.legendVerticalGutter - this.data.dorlingsMaxRadius) / scale,
      cy: (this.data.legendVerticalGutter + this.data.dorlingsMaxRadius) / scale,
      strokeWidth: 0.5/scale
    };
  },

  getLegendDorlingsTextPositioning: function(v, scale) {
    return {
      x: (this.getLegendDorlingsCircleDimensions(scale).cx - this.data.dorlingsMaxRadius/scale),
      y: (this.getLegendDorlingsCircleDimensions(scale).cy + this.getDorlingRadius(this.getLegendDimensionsIntervals()[0]) - this.getDorlingRadius(v) - this.getDorlingRadius(v)),
      fontSize: this.getLegendFontSize() / scale
    };
  },

  getMainPaneStyle: function() {
    return { height: this.data.tilesHeight + 'px' };
  },

  getSearchStyle: function() {
    return {
      top: this.data.headerHeight / 3,
      right: this.data.containerPadding,
      width: this.getSidebarStyle().width + this.data.containerPadding,
      height: 20
    };
  },

  getSearchCloseStyle: function() {
    return {
      top: this.data.headerHeight / 3,
      right: this.getSidebarStyle().width / 5 + this.data.containerPadding * 1.75
    };
  },

  getSearchResultsStyle: function() {
    return {
      width: this.getSidebarStyle().width + this.data.containerPadding,
      height: this.getSidebarStyle().height + this.data.containerPadding,
      marginTop: this.data.headerHeight * (2/3) - 20 
    };
  },

  getSidebarStyle: function() {
    return {
      marginTop: this.data.headerHeight,
      width: this.data.sidebarWidth,
      height: this.data.sidebarHeight
    };
  },

  getSidebarHeightStyle: function() {
    // same as the main panel style as it's just the height
    return this.getMainPaneStyle();
  },

  getTimelineAttrs: function() {
    return {
      width: this.data.sidebarWidth,
      height: this.data.timelineHeight - this.data.containerPadding * 2
    };
  },

  getValueFromDorlingRadius: function(r, options={}) {
    let theMax = (options.useYear || (CitiesStore.getSelectedYear() && !options.useAll)) ? CitiesStore.getMaxDisplacementsInCityForYear() : CitiesStore.getMaxDisplacementsInCity() || 1;
    let v = d3.scale.pow().exponent(2)
      .domain([0, this.data.dorlingsMaxRadius])
      .range([0, theMax]);

    return v(r);
  },


  getDorlingRadius: function(v, options = {}) {
    let theMax = (options.useYear || (CitiesStore.getSelectedYear() && !options.useAll)) ? CitiesStore.getMaxDisplacementsInCityForYear() : CitiesStore.getMaxDisplacementsInCity() || 1;
    let r = d3.scale.sqrt()
      .domain([0, (CitiesStore.getSelectedCategory() == 'funding') ? CitiesStore.getCategoryMaxForCity('urban renewal grants dispursed') : theMax])
      .range([0, this.data.dorlingsMaxRadius]);

    return r(v);
  },

  getDorlingsMaxRadius: function() { return this.data.dorlingsMaxRadius; },

  dorlingHasLabel: function(city_id, visibleRadius) { 
    const radiusThreshold = (this.isRetina() ? 17 : 20);
    return (city_id == CitiesStore.getHighlightedCity() || (CitiesStore.getSelectedView() == 'cartogram' && visibleRadius >= radiusThreshold && !CitiesStore.getHighlightedCity())); 
  },

  getCitySnippetWidth: function() { return this.getSidebarStyle().width - 10; },




  // SCATTERPLOT DIMENSIONS

  translateScatterplotPoint: function(point) {

    const shortside = Math.min(DimensionsStore.getNationalMapWidth() * 0.4, DimensionsStore.getNationalMapHeight() * 0.4),
      l = Math.sqrt(2*shortside*shortside);
    if (point[1] == null) {
      return [this.getNationalMapWidth() / 2 + Math.sqrt(l * l / 2), this.getNationalMapHeight() * 12.5/31 + Math.sqrt(l * l / 2) * 0.66];
    } else {
      const cx = this.getNationalMapWidth() / 2 - (Math.sqrt((point[0] * point[0]) / 2) -  Math.sqrt((point[1] * point[1]) / 2)),
        cy = this.getNationalMapHeight() * 12.5 / 31 + shortside - Math.sqrt((point[0] * point[0]) / 2) -  Math.sqrt((point[1] * point[1]) / 2);
      return [cx,cy];
    }
  },

  getScatterplotLength: function() {
    const shortside = Math.min(this.data.nationalMapWidth, this.data.nationalMapHeight) * 0.4;
    return Math.sqrt(2*shortside*shortside);
  },

  getScatterplotLengthDecile: function(decile) { return this.getScatterplotLength() / 10 * decile; },

  getScatterplotExplanationAttrs: function() {
    const shortside = Math.min(this.data.nationalMapWidth, this.data.nationalMapHeight) * 0.4;
    return {
      width:  this.data.nationalMapWidth - 80 - (46 + 6 + 6 + 6) * 3 - this.data.containerPadding,
      height: this.data.nationalMapHeight / 4
    };
  },




  // MAIN TIMELINE DIMENSIONS

  getMainTimelineBarAttrs: function(year, race) {
    return {
      x: (race == 'whites') ? this.getMainTimlineXOffset(year) - this.getMainTimelineBarWidth() / 2 : (race == 'nonwhite') ? this.getMainTimlineXOffset(year) - 1.5 * this.getMainTimelineBarWidth() : this.getMainTimlineXOffset(year) + this.getMainTimelineBarWidth() / 2,
      y: this.getMainTimelineBarY(year, race),
      width: this.getMainTimelineBarWidth(),
      height: this.getMainTimelineBarHeight(year, race),
      stroke: (year == CitiesStore.getSelectedYear()) ? 'transparent' : 'transparent',
      fillOpacity: (year == CitiesStore.getSelectedYear() || CitiesStore.getSelectedYear() == null) ? 1 : 0.3,
      strokeWidth: 1,
      //key: 'bar' + year
    };
  },

  // getMainTimelineBarAttrs: function(year, race) {
  //   return {
  //     x: (race == 'whites') ? this.getMainTimlineXOffset(year) : this.getMainTimlineXOffset(year) - this.getMainTimelineBarWidth(),
  //     y: this.getMainTimelineBarY(year, race),
  //     width: this.getMainTimelineBarWidth(),
  //     height: this.getMainTimelineBarHeight(year, race),
  //     stroke: (year == CitiesStore.getSelectedYear()) ? 'transparent' : 'transparent',
  //     fillOpacity: (year == CitiesStore.getSelectedYear() || CitiesStore.getSelectedYear() == null) ? 1 : 0.3,
  //     strokeWidth: 1,
  //     //key: 'bar' + year
  //   };
  // },

  // 90% of the height
  getMainTimelineBarBottom: function() { return this.getTimelineAttrs().height - this.data.containerPadding ; },

  // 90% of the width
  getMainTimelineBarFieldWidth: function() { return this.getTimelineAttrs().width * 0.9; },

  getMainTimelineBarHeight: function(year, race) { return this.getMainTimelineMaxBarHeight() * CitiesStore.getYearTotals(year)[race]/ CitiesStore.getYearsTotalsMaxRace() || 1; },

  getMainTimelineMaxBarHeight: function() { return this.getTimelineAttrs().height - this.data.containerPadding * 2; },

  getMainTimelineYearWidth: function() { return this.getMainTimelineBarFieldWidth() / (1966-1949); },
  
  getMainTimelineBarWidth: function() { return this.getMainTimelineYearWidth() / 3 - 1.5; },

  getMainTimelineBarXOffset: function(year) {  return (year == 1955) ? 0 : this.getMainTimlineXOffset(year) + this.getMainTimelineBarWidth() / 6; },

  getMainTimelineBarY: function(year, race) { return this.data.containerPadding + this.getMainTimelineMaxBarHeight() - this.getMainTimelineBarHeight(year, race) || 0; },

  getMainTimlineXOffset: function(year) { return (year - 1950 + 0.5) * this.getMainTimelineYearWidth(); },

  getMainTimelineLabelXOffset: function(year) { 
    return (year - 1950) * this.getMainTimelineBarFieldWidth() / (1966-1949) + this.getMainTimelineBarFieldWidth() / (1966-1949) / 2;
    // years run from 1950-55 through individual years until 66
    const w49_55 = this.getMainTimelineBarWidth() * (1955-1949),
      wOtherYear = (this.getMainTimelineBarFieldWidth() - w49_55) / (1966-1955);
    return (year == 1955) ? w49_55 / 2 : w49_55 + (year - 1956) * wOtherYear + wOtherYear / 2;
  },

  getMainTimelineLabelY: function() { return this.getTimelineAttrs().height; },

  getMainTimelineYAxisAttrs: function(value) {
    return {
      dx: this.getMainTimelineBarFieldWidth() + 3,
      dy: this.data.containerPadding + this.getMainTimelineMaxBarHeight() - (value / CitiesStore.getYearsTotalsMaxRace() * this.getMainTimelineMaxBarHeight()) + (this.getMainTimelineFontSize() - 2) / 2,
      fontSize: this.getMainTimelineFontSize() - 2,
      key: 'yAxisLabel' + value
    };
  },

  getMainTimelineYAxisInterval(value) {
    let interval = -1;
    for (let num = 1; num <= 1000000000; num = num*10) {
      [1, 2, 2.5, 5].forEach(multiplier => {
        let testNum = num * multiplier;
        if (interval == -1 && value / testNum <= 9 && value / testNum >= 1) {
          interval = testNum;
        }
      });
    }    
    return interval;
  },

  getMainTimelineYAxisValues() { 
    const max = CitiesStore.getYearsTotalsMaxRace() || 4000,
      intervals = this.getMainTimelineYAxisInterval(max);
    return [...Array(Math.floor(max/intervals)).keys()].map(i => (i + 1) * intervals ); 
  },



  // the font size is calculated to take up just less than 10% of the full timeline area's height
  getMainTimelineFontSize: function() { return Math.min(Math.floor(this.getTimelineAttrs().height * 0.085), 16); },

  getMainTimelineXAxisAttrs: function(year) {
    return {
      dx: this.getMainTimelineLabelXOffset(year), 
      dy: (year % 5 == 0) ? this.getMainTimelineLabelY() : this.getMainTimelineLabelY() - 1,
      fill: (year == CitiesStore.getSelectedYear()) ? 'black' : 'grey',
      stroke: 'transparent',
      fontSize: (year % 5 == 0) ? this.getMainTimelineFontSize() : this.getMainTimelineFontSize() - 2 ,
      key: 'xAxis' + year
    };
  },

  getMainTimelineXAxisAllYearsAttrs: function(year) {
    return {
      dx: this.getTimelineAttrs().width, 
      dy: this.getMainTimelineLabelY(),
      fill: (year == CitiesStore.getSelectedYear()) ? 'black' : 'grey',
      stroke: 'transparent',
      fontSize: this.getMainTimelineFontSize(),
      key: 'xAxis' + year
    };
  },

  getMainTimelineGridAttrs: function(value) {
    return {
      x: 0,
      y: this.data.containerPadding + this.getMainTimelineMaxBarHeight() - (value / CitiesStore.getYearsTotalsMaxRace() * this.getMainTimelineMaxBarHeight()),
      width: this.getMainTimelineBarFieldWidth(),
      height: 1,
      className: (value == 0) ? 'base' : '',
      key: 'gridline' + value
    };
  },

  getMainTimelineYearLabelAttrs: function() {
    return {
      dx: this.getMainTimlineXOffset(1950),
      dy: 18,
      fontSize: 18,
      className: 'timelineLabel',
    };
  },

  getMainTimelineLegendBoxPOCAttrs() {
    return {
      x: this.getMainTimlineXOffset(1950) * 1.5,
      y: 27,
      width: Math.max(this.getMainTimelineBarWidth(), 16),
      height: Math.max(this.getMainTimelineBarWidth(), 16),
      fill: '#a387be',
      stroke: '#444',
      strokeWidth: 0
    };
  },

  getMainTimelineLegendLabelPOCAttrs() {
    return {
      dx: this.getMainTimlineXOffset(1950) * 1.5 + Math.max(this.getMainTimelineBarWidth(), 16) * 1.5 ,
      dy: 27 + Math.max(this.getMainTimelineBarWidth(), 16) ,
      fontSize: Math.max(this.getMainTimelineBarWidth(), 16),
    };
  },

  getMainTimelineLegendBoxWhiteAttrs() {
    return {
      x: this.getMainTimlineXOffset(1950) * 1.5,
      y: 27 + Math.max(this.getMainTimelineBarWidth(), 16) * 1.5 ,
      width: Math.max(this.getMainTimelineBarWidth(), 16),
      height: Math.max(this.getMainTimelineBarWidth(), 16),
      fill: '#2ca02c',
      stroke: '#444',
      strokeWidth: 0
    };
  },

  getMainTimelineLegendLabelWhiteAttrs() {
    return {
      dx: this.getMainTimlineXOffset(1950) * 1.5 + Math.max(this.getMainTimelineBarWidth(), 16) * 1.5 ,
      dy: 27 + Math.max(this.getMainTimelineBarWidth(), 16) * 2.5,
      fontSize: Math.max(this.getMainTimelineBarWidth(), 16),
    };
  },

  getMainTimelineLegendBoxPRVIAttrs() {
    return {
      x: this.getMainTimlineXOffset(1950) * 1.5,
      y: 27 + Math.max(this.getMainTimelineBarWidth(), 16) * 3 ,
      width: Math.max(this.getMainTimelineBarWidth(), 16),
      height: Math.max(this.getMainTimelineBarWidth(), 16),
      fill: '#909EAC',
      stroke: '#444',
      strokeWidth: 0
    };
  },

  getMainTimelineLegendLabelPRVIAttrs() {
    return {
      dx: this.getMainTimlineXOffset(1950) * 1.5 + Math.max(this.getMainTimelineBarWidth(), 16) * 1.5 ,
      dy: 27 + Math.max(this.getMainTimelineBarWidth(), 16) * 4,
      fontSize: Math.max(this.getMainTimelineBarWidth(), 16),
    };
  },



  // PROJECT TIMELINE DIMENSIONS

  getCityTimelineStyle: function() {
    return {
      width: this.data.sidebarWidth - this.data.containerPadding,
      transform: 'translate(' + this.data.containerPadding/3 + ')'
    };
  },

  getTimelineXOffset: function(year) { return (year - 1955) * this.getMainTimelineYearWidth(); },

  getTimelineYearWidth: function() { return this.getMainTimelineBarFieldWidth() / (1966-1954); },

  getTimelineYearsSpanWidth: function(year1, year2) { return this.getTimelineYearWidth() * (year2-year1); },

  getTimelineProjectHeight: function() { return this.data.timelineProjectHeight; },

  getTimelineXOffsetForYear: function(year) { return (year - 1955) * this.getTimelineYearWidth(); },

  getTimelineXDorlingAttrs: function(year, families, fill) {
    return {
      cx: this.getMainTimelineLabelXOffset(year), 
      cy: this.getDorlingRadius(CitiesStore.getMaxDisplacementsInCityForYear(), {useYear: true}),
      r: this.getDorlingRadius(families, {useYear: true}),
      fill: fill,
      fillOpacity: (year == CitiesStore.getSelectedYear() || CitiesStore.getSelectedYear() == null) ? 1 : 0.4,
      stroke: 'transparent',
      key: 'xdorling' + year
    };
  },

  getTimelineXDorlingLabelAttrs: function(year, families) {
    const fontSize = (8 * this.getDorlingRadius(families, {useYear: true}) / 15 < 12) ? 12 : (8 * this.getDorlingRadius(families, {useYear: true}) / 15 > 18) ? 18 : 8 * this.getDorlingRadius(families, {useYear: true})  / 15;
    return {
      x: this.getMainTimelineLabelXOffset(year), 
      y: this.getDorlingRadius(CitiesStore.getMaxDisplacementsInCityForYear(), {useYear: true}) + fontSize/2,
      fill: (year == CitiesStore.getSelectedYear() || CitiesStore.getSelectedYear() == null) ? 'black' : 'grey',
      textAnchor: 'middle',
      pointerEvents: 'none',
      fontSize: fontSize,
      key: 'xdorlinglabel' + year
    };
  },

  getTimelineXAxisAttrs: function(year) {
    return {
      dx: this.getMainTimelineLabelXOffset(year), 
      dy: this.getMainTimelineFontSize(),
      textAnchor: 'middle',
      fill: (year == CitiesStore.getSelectedYear() || CitiesStore.getSelectedYear() == null) ? 'black' : 'grey',
      stroke: 'transparent',
      fontSize: this.getMainTimelineFontSize(),
      key: 'xAxiscitytimeline' + year
    };
  },

  getTimelineLabelXOffset: function(year) { return (year - 1955) * this.getTimelineYearWidth(); },


  getProjectStatsOverallDimensions: function() {
    return {
      width: this.data.sidebarWidth - this.data.containerPadding,
      height: 70
    };
  },

  getProjectStatProportionWidth: function(prop) { return (this.getProjectStatsOverallDimensions().width - 220) * prop; },
            

 
      // xOffsetForYearMiddle = (year) => xOffsetForYear(year) + yearMiddleOffset,
      // xOffsetForYearBar = (year) => xOffsetForYear(year) + barOffset;


};

// Mixin EventEmitter functionality
Object.assign(DimensionsStore, EventEmitter.prototype);

// Register callback to handle all updates
DimensionsStore.dispatchToken = AppDispatcher.register((action) => {

  switch (action.type) {
  case AppActionTypes.loadInitialData:
  case AppActionTypes.windowResized:
    DimensionsStore.computeComponentDimensions();
    break;
  }
});

export default DimensionsStore;