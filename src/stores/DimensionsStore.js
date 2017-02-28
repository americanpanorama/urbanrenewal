import { EventEmitter } from 'events';
import AppDispatcher from '../utils/AppDispatcher';
import { AppActionTypes } from '../utils/AppActionCreator';

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
    sidebarTitleHeight: 0
  },

  computeComponentDimensions () {
    this.data.windowHeight = window.innerHeight;
    this.data.windowWidth = window.innerWidth;
    this.data.tilesHeight = this.data.windowHeight - this.data.headerHeight - 2*this.data.containerPadding;
    this.data.sidebarWidth =(document.getElementsByClassName('dataViewer').length > 0) ? document.getElementsByClassName('dataViewer')[0].offsetWidth : this.data.windowWidth * 0.33 - this.data.containerPadding;
    this.data.mainPaneWidth = (document.getElementsByClassName('main-pane').length > 0) ? document.getElementsByClassName('main-pane')[0].offsetWidth : this.data.windowWidth * 0.66;
    this.data.sidebarTitleHeight = (document.getElementsByClassName('sidebarTitle').length > 0) ? document.getElementsByClassName('sidebarTitle')[0].offsetHeight: 30;
    this.data.nationalMapHeight = this.data.windowHeight - this.data.headerHeight - this.data.timelineHeight;

    this.emit(AppActionTypes.storeChanged);
  },

  getDimensions: function() { return this.data; },

  getMainPaneWidth: function() { return this.data.mainPaneWidth; },

  getNationalMapHeight: function() { return this.data.nationalMapHeight; },

  getHeaderStyle: function() {
    return {
      width: this.data.mainPaneWidth
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
      width: this.data.mainPaneWidth - 300,
      height: this.data.timelineHeight
    };
  },

  getLegendGradientStyle: function() {
    return {
      width: 300,
      height: this.data.timelineHeight
    };
  },

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
  }


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