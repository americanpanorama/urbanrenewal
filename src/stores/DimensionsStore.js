import { EventEmitter } from 'events';
import AppDispatcher from '../utils/AppDispatcher';
import { AppActionTypes } from '../utils/AppActionCreator';
import CitiesStore from './CitiesStore';
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
    legendVerticalGutter: 3,
    gradientTopBottomMargins: 20,
    

    dorlingsMaxRadius: 10
  },

  computeComponentDimensions () {
    this.data.windowHeight = window.innerHeight;
    this.data.windowWidth = window.innerWidth;
    this.data.tilesHeight = this.data.windowHeight - this.data.headerHeight - 2*this.data.containerPadding;
    this.data.sidebarWidth =(document.getElementsByClassName('dataViewer').length > 0) ? document.getElementsByClassName('dataViewer')[0].offsetWidth : this.data.windowWidth * 0.322 - 2*this.data.containerPadding;
    this.data.mainPaneWidth = (document.getElementsByClassName('main-pane').length > 0) ? document.getElementsByClassName('main-pane')[0].offsetWidth : (this.data.windowWidth) * (2/3 - 0.015*11/12) - this.data.containerPadding ; // this is complicated--I deduced it from the calcuations in _skeleton.scss
    this.data.mainPaneHeight = this.data.windowHeight - this.data.headerHeight - 2*this.data.containerPadding;

    this.data.sidebarHeight = (this.data.windowHeight - this.data.headerHeight - 2 * this.data.containerPadding) * 2/3 ;
    this.data.sidebarTitleHeight = (document.getElementsByClassName('sidebarTitle').length > 0) ? document.getElementsByClassName('sidebarTitle')[0].offsetHeight: 30;
    this.data.nationalMapHeight = this.data.mainPaneHeight - this.data.containerPadding * 2;
    this.data.nationalMapWidth = this.data.mainPaneWidth - this.data.containerPadding * 2;
    this.data.dorlingsMaxRadius= this.data.nationalMapWidth / 22;

    this.data.legendRight = this.data.nationalMapWidth * 0.077 + this.data.containerPadding; // lines up roughly with the western edge of Maine on full size map
    
    this.data.legendHeight = 2 * this.data.dorlingsMaxRadius + this.data.legendVerticalGutter * 2;

    this.data.legendDorlingWidth =  4 * this.data.dorlingsMaxRadius + this.data.legendVerticalGutter * 2; // I'm estimating the labels take the same width as the diameter 3 for gutters on either side
    this.data.legendDorlingHeight = 2 * this.data.dorlingsMaxRadius + this.data.legendVerticalGutter * 2; // 3 for gutters on either side

    this.data.legendGradientHeight = this.data.legendHeight - this.data.legendVerticalGutter * 2;
    
    this.data.legendGradientHorizontalGutter = this.data.dorlingsMaxRadius;
    this.data.legendGradientWidth = this.data.dorlingsMaxRadius * 4+ this.data.legendGradientHorizontalGutter * 2;

    this.data.legendGradientHeightQuints = this.data.legendGradientHeight / 5;

    this.data.legendWidth =  this.data.legendDorlingWidth + this.data.legendGradientWidth;

    this.data.timelineHeight = (this.data.windowHeight - this.data.headerHeight - 2 * this.data.containerPadding) * 1/3 - this.data.containerPadding;

    this.data.timelineProjectHeight = 18;

    this.emit(AppActionTypes.storeChanged);
  },

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

  getMapScale: function() { return Math.min(1.2 * this.getNationalMapWidth(), 2 * this.getNationalMapHeight()); }, // I calculated these with trial and error--sure there's a more precise way as this will be fragile if the width changes 

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

  getLegendDimensions: function() { 
    return {
      width: this.data.legendWidth,
      height: this.data.legendHeight,
      right: this.data.legendRight
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
      x: this.getLegendGradientPercentX(0.75), 
      y: this.data.legendGradientHeightQuints,
      fontSize: this.data.dorlingsMaxRadius / 2.5,
      textAnchor: 'middle',
      alignmentBaseline: 'baseline'
    };
  },

  getLegendGradientPOC0Attrs: function() {
    return {
      x: this.getLegendGradientPercentX(0), 
      y: this.data.legendGradientHeightQuints * 2,
      fontSize: this.data.dorlingsMaxRadius / 3,
      textAnchor: 'start',
      alignmentBaseline: 'baseline'
    };
  },

  getLegendGradientPOC100Attrs: function() {
    return {
      x: this.getLegendGradientPercentX(1), 
      y: this.data.legendGradientHeightQuints * 2,
      fontSize: this.data.dorlingsMaxRadius / 3,
      textAnchor: 'end',
      alignmentBaseline: 'baseline'
    };
  },

  getLegendGradientWhitesLabelAttrs: function() {
    return {
      x: this.getLegendGradientPercentX(0.25), 
      y: this.data.legendGradientHeightQuints * 4,
      fontSize: this.data.dorlingsMaxRadius / 2.5,
      textAnchor: 'middle',
      alignmentBaseline: 'hanging'
    };
  },

  getLegendGradientWhites0Attrs: function() {
    return {
      x: this.getLegendGradientPercentX(1), 
      y: this.data.legendGradientHeightQuints * 3,
      fontSize: this.data.dorlingsMaxRadius / 3,
      textAnchor: 'end',
      alignmentBaseline: 'hanging'
    };
  },

  getLegendGradientWhites100Attrs: function() {
    return {
      x: this.getLegendGradientPercentX(0), 
      y: this.data.legendGradientHeightQuints * 3,
      fontSize: this.data.dorlingsMaxRadius / 3,
      textAnchor: 'start',
      alignmentBaseline: 'hanging'
    };
  },

  getLegendGradientPercentX: function(percent) { return this.getLegendGradientInteriorDimensions().x + this.getLegendGradientInteriorDimensions().width * (1 - percent); },

  getLegendGradientTopLabelX: function() { return this.data.dorlingsMaxRadius + this.data.legendGradientWidth * 0.25; },

  getLegendGradientBottomLabelX: function() { return this.data.dorlingsMaxRadius + this.data.legendGradientWidth * 0.75; },

  getLegendGradientTopLabelY: function() { return this.data.dorlingsMaxRadius * 2 / 5 - 3; },

  getLegendGradientBottomLabelY: function() { return this.data.dorlingsMaxRadius * 2 / 5 * 4 + 3; },

  getLegendGradientTopTextY: function() { return this.data.dorlingsMaxRadius * 2 / 5 * 2 - 3; },

  getLegendGradientBottomTextY: function() { return this.data.dorlingsMaxRadius * 2 / 5 * 3 + 3; },

  getLegendDorlingsDimensions: function() {
    return {
      width: this.data.legendDorlingWidth,
      height: this.data.legendDorlingHeight
    };  
  },

  getLegendDorlingsCircleDimensions: function() {
    return {
      cx: this.data.legendDorlingWidth - 3 - this.data.dorlingsMaxRadius,
      cy: 3 + this.data.dorlingsMaxRadius
    };
  },

  getLegendDorlingsTextPositioning: function(v, max) {
    return {
      x: this.getLegendDorlingsCircleDimensions().cx - this.data.dorlingsMaxRadius - 0,
      y: this.getLegendDorlingsCircleDimensions().cy + DimensionsStore.getDorlingRadius(max) - DimensionsStore.getDorlingRadius(v) - DimensionsStore.getDorlingRadius(v),
      fontSize: DimensionsStore.getDorlingRadius(max) / 2.5
    };
  },

  getMainPaneStyle: function() {
    return { height: this.data.tilesHeight + 'px' };
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

  getDorlingRadius: function(v) {
    let r = d3.scale.sqrt()
      .domain([0, (CitiesStore.getSelectedCategory() == 'funding') ? CitiesStore.getCategoryMaxForCity('urban renewal grants dispursed') : CitiesStore.getCategoryMaxForCity('totalFamilies') ])
      .range([0, this.data.dorlingsMaxRadius]);

    return r(v);
  },

  getDorlingsMaxRadius: function() { return this.data.dorlingsMaxRadius; },

  getCitySnippetWidth: function() { return this.getSidebarStyle().width - 10; },




  // SCATTERPLOT DIMENSIONS

  translateScatterplotPoint: function(point) {
    const cx = this.getNationalMapWidth() / 2 - (Math.sqrt((point[0] * point[0]) / 2) -  Math.sqrt((point[1] * point[1]) / 2)),
      cy = this.getNationalMapHeight() * 0.9 - Math.sqrt((point[0] * point[0]) / 2) -  Math.sqrt((point[1] * point[1]) / 2);

    return [cx,cy];
  },


  // PROJECT TIMELINE DIMENSIONS

  getCityTimelineStyle: function() {
    return {
      width: this.data.sidebarWidth - 2 * this.data.containerPadding
    };
  },

  getTimelineYearWidth: function() { return this.getCityTimelineStyle().width / 12; },

  getTimelineYearsSpanWidth: function(year1, year2) { return this.getTimelineYearWidth() * (year2-year1); },

  getTimelineProjectHeight: function() { return this.data.timelineProjectHeight; },

  getTimelineXOffsetForYear: function(year) { return (year - 1955) * this.getTimelineYearWidth(); },

 
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