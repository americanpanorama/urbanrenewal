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

    legendWidth: 200,
    gradientHeight: 10,
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
    this.data.sidebarTitleHeight = (document.getElementsByClassName('sidebarTitle').length > 0) ? document.getElementsByClassName('sidebarTitle')[0].offsetHeight: 30;
    this.data.nationalMapHeight = this.data.mainPaneHeight - this.data.containerPadding * 2;
    this.data.dorlingsMaxRadius= this.data.mainPaneWidth / 10;

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

  getNationalMapWidth: function() { return this.data.mainPaneWidth - this.data.containerPadding * 2; },

  getMapScale: function() { return Math.min(1.36 * this.getNationalMapWidth(), 2.08 * this.getNationalMapHeight()); }, // I calculated these with trial and error--sure there's a more precise way as this will be fragile if the width changes 

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

  getLegendGradientDimensions: function() {
    return {
      x: this.data.legendWidth * .15,
      y: this.data.gradientTopBottomMargins * 2,
      width: this.data.legendWidth * .7,
      height: this.data.gradientHeight
    };
  },

  getLegendGradientPercentX: function(percent) { return this.getLegendGradientDimensions().x + this.getLegendGradientDimensions().width * (1 - percent); },

  getLegendGradientLabelsX: function() { return this.data.legendWidth / 2; },

  getLegendGradientTopLabelY: function() { return this.data.gradientTopBottomMargins - 3; },

  getLegendGradientBottomLabelY: function() { return this.data.gradientTopBottomMargins * 3 + this.data.gradientHeight + 3; },

  getLegendGradientTopTextY: function() { return this.data.gradientTopBottomMargins * 2 - 3; },

  getLegendGradientBottomTextY: function() { return this.data.gradientTopBottomMargins * 2 + this.data.gradientHeight + 3; },

  getMainPaneStyle: function() {
    return { height: this.data.tilesHeight + 'px' };
  },

  getSidebarStyle: function() {
    return {
      marginTop: this.data.headerHeight,
      width: this.data.sidebarWidth,
      paddingRight: this.data.containerPadding
    };
  },

  getSidebarHeightStyle: function() {
    // same as the main panel style as it's just the height
    return this.getMainPaneStyle();
  },

  getDorlingRadius: function(v) {
    let r = d3.scale.sqrt()
      .domain([0, (CitiesStore.getSelectedCategory() == 'funding') ? CitiesStore.getCategoryMaxForCity('urban renewal grants dispursed') : CitiesStore.getCategoryMaxForCity('totalFamilies') ])
      .range([0, this.data.dorlingsMaxRadius]);

    return r(v);
  },

  getDorlingsMaxRadius: function() { return this.data.dorlingsMaxRadius; },


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