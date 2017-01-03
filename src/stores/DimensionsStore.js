import { EventEmitter } from 'events';
import AppDispatcher from '../utils/AppDispatcher';
import { AppActionTypes } from '../utils/AppActionCreator';

const DimensionsStore = {

  data: {
    containerPadding: 20,
    headerHeight: 100,
    timelineHeight: 150, // set in scss
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
    this.data.sidebarWidth =(document.getElementsByClassName('dataViewer').length > 0) ? document.getElementsByClassName('dataViewer')[0].offsetWidth : this.data.windowWidth * 0.322 - 2*this.data.containerPadding;
    this.data.mainPaneWidth = (document.getElementsByClassName('main-pane').length > 0) ? document.getElementsByClassName('main-pane')[0].offsetWidth : this.data.windowWidth * 0.644 - 2*this.data.containerPadding;
    this.data.sidebarTitleHeight = (document.getElementsByClassName('sidebarTitle').length > 0) ? document.getElementsByClassName('sidebarTitle')[0].offsetHeight: 30;
    this.data.nationalMapHeight = this.data.windowHeight - this.data.headerHeight - this.data.timelineHeight;

    this.emit(AppActionTypes.storeChanged);
  },

  getDimensions: function() { return this.data; },

  getMainPaneWidth: function() { return this.data.mainPaneWidth; },

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
      width: this.data.mainPaneWidth
    };
  },

  getMainPaneStyle: function() {
    return { height: this.data.tilesHeight + 'px' };
  },

  getSidebarStyle: function() {
    return {
      width: this.data.sidebarWidth
    };
  },

  getSidebarHeightStyle: function() {
    // same as the main panel style as it's just the height
    return this.getMainPaneStyle();
  },

  getADViewerStyle: function() {
    return {
      height: (this.data.tilesHeight - this.data.containerPadding * 2) + 'px',
      width: (this.data.mainPaneWidth - this.data.containerPadding * 2) + 'px'
    };
  },

  // this needs to be redone

  getSearchStyle: function() {
    return {
      width: (this.data.windowWidth * 0.3233333 - this.data.windowWidth * 0.0075) + 'px',
      height: (this.data.windowHeight - 2 * this.data.containerPadding) + 'px'
    };
  },

  getADNavPreviousStyle: function() {
    return {
      width: this.data.tilesHeight + 'px',
      top: ((this.data.tilesHeight + this.data.containerPadding) / 2 + this.data.headerHeight) + 'px',
      right: (this.data.containerPadding * 1.5 - this.data.tilesHeight / 2 + this.data.sidebarWidth - this.data.adNavHeight) + 'px'
    };
  },

  getADNavNextStyle: function() {
    return {
      width: this.data.tilesHeight + 'px',
      top: ((this.data.tilesHeight + this.data.containerPadding) / 2 + this.data.headerHeight) + 'px',
      right: (this.data.containerPadding * 1.5 - this.data.tilesHeight / 2) + 'px'
    };
  },

  getSidebarMapStyle: function() {
    return {
      width: (this.data.sidebarWidth - 2*this.data.adNavHeight) + 'px',
      height: (this.data.tilesHeight - this.data.sidebarTitleHeight - this.data.sidebarTitleBottomMargin - 2*this.data.containerPadding) + 'px'
    };
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