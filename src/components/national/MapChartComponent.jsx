import * as React from 'react';
import ReactDOM from 'react-dom';

import * as d3 from 'd3';

import Highways from './HighwaysComponent.jsx';
import Dorlings from './DorlingsComponent.jsx';
import DorlingLabel from './DorlingLabelComponent.jsx';
import ChartField from './ChartFieldComponent.jsx';
import MapField from './MapFieldComponent.jsx';

import CitiesStore from '../../stores/CitiesStore.js';
import GeographyStore from '../../stores/GeographyStore';
import HighwaysStore from '../../stores/HighwaysStore';
import DimensionsStore from '../../stores/DimensionsStore';
import HelperFunctions from '../../utils/HelperFunctions.js';

export default class MapChartField extends React.Component {

  constructor (props) { super(props); }

  render () {
    return (
      <svg 
        { ...DimensionsStore.getMapDimensions() }
        className='theMap'
      >
        <g 
          width={ DimensionsStore.getNationalMapWidth() }  
          height={ DimensionsStore.getNationalMapHeight() }
          className='ussvg'
          onDoubleClick={ this.props.onMapClicked }
          onMouseUp={this.props.handleMouseUp }
          onMouseDown={this.props.handleMouseDown }
          onMouseMove={this.props.handleMouseMove }
          ref='mapChart'
          transform={"translate("+this.props.x+","+this.props.y+")scale(" + this.props.z +")"}
        >

          <ChartField
            selectedView={ this.props.selectedView }
            onCityHover={ this.props.onCityHover }
            onCityOut={ this.props.onCityOut }
            popYear={ (CitiesStore.getSelectedYear() == null || CitiesStore.getSelectedYear() <= 1960) ? 1960 : CitiesStore.getSelectedYear() }
            percentWhitePop={ (CitiesStore.getHighlightedCities() && CitiesStore.getHighlightedCities().length == 1) ? 1 - CitiesStore.getPercentNonWhitePop(CitiesStore.getHighlightedCities()[0]) : null}
            percentFamiliesOfColor={ (CitiesStore.getHighlightedCities() && CitiesStore.getHighlightedCities().length == 1 &&CitiesStore.getSelectedYear()) ? CitiesStore.getCityData(CitiesStore.getHighlightedCities()[0]).yearsData[CitiesStore.getSelectedYear()].percentFamiliesOfColor : (CitiesStore.getHighlightedCities() && CitiesStore.getHighlightedCities().length == 1 && !CitiesStore.getSelectedYear()) ? CitiesStore.getCityData(CitiesStore.getHighlightedCities()[0]).percentFamiliesOfColor : null }
            { ...GeographyStore.getXYZ() }
          />

          <MapField
            selectedView={ this.props.selectedView }
            z={ GeographyStore.getXYZ().z }
            mapScale={ DimensionsStore.getMapScale() }
          />

          { (this.props.selectedView == 'map') ? 
            <g>
              { HighwaysStore.getHighwayForYear(CitiesStore.getSelectedYear() || 1966).map((section, i) => 
                <path
                  d={GeographyStore.getPath(section)}
                  stroke='lightsteelblue'
                  strokeWidth='1.5'
                  fill='transparent'
                  key={'highway' + i}
                />
              )}
            </g> : ''
          }

          { CitiesStore.getDorlingsCoords().map((cityData, i) => {
            return (
              <Dorlings
                { ...cityData }
                { ...GeographyStore.getXYZ() }
                highlightedCities={ this.props.highlightedCities }
                r={ DimensionsStore.getDorlingRadius(cityData.value) }
                stroke={ (CitiesStore.getSelectedView() == 'cartogram') ? 'transparent' : 'grey'}
                view={ CitiesStore.getSelectedView() }
                key={'cityCircle' + cityData.city_id }
                strokeWidth={ 0.5/GeographyStore.getZ()}
                onCityClicked={ this.props.onCityClicked }
                onCityHover={ this.props.onCityHover }
                onCityOut={ this.props.onCityOut }
                pocSpan={ CitiesStore.getPOC() }
                mapScale={ DimensionsStore.getMapScale() }
              />
            );  
          })}

          { CitiesStore.getDorlingsCoords().map((cityData, i) => {
            const visibleRadius = (CitiesStore.getSelectedView() == 'cartogram') ? DimensionsStore.getDorlingRadius(cityData.value) * GeographyStore.getZ() : DimensionsStore.getDorlingRadius(cityData.value) ;
            if (DimensionsStore.dorlingHasLabel(cityData.city_id, visibleRadius) && (this.props.highlightedCities.length == 0 || this.props.highlightedCities.includes(cityData.city_id))) {
              return (
                <DorlingLabel
                  { ...cityData }
                  { ...GeographyStore.getXYZ() }
                  r={ DimensionsStore.getDorlingRadius(cityData.value) }
                  view={ CitiesStore.getSelectedView() }
                  roughNumber={ CitiesStore.getSelectedYear() }
                  key={'cityCircle' + cityData.city_id }
                  strokeWidth={ 0.5/GeographyStore.getZ()}
                  onCityClicked={ this.props.onCityClicked }
                  onCityHover={ this.props.onCityHover }
                  onCityOut={ this.props.onCityOut }
                  mapScale={ DimensionsStore.getMapScale() }
                />
              );
            }  
          })}
          
        </g>
      </svg>
    );
  }
}