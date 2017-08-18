import * as React from 'react';
import ReactDOM from 'react-dom';
import { PropTypes } from 'react';
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

export default class USMap extends React.Component {

  constructor (props) { 
    super(props); 
    this.state = {
      x: this.props.x,
      y: this.props.y,
      z: this.props.z,
      dorlingZoom: this.props.z
    };
  }


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
            { ...GeographyStore.getXYZ() }
          />

          <MapField
            selectedView={ this.props.selectedView }
            z={ GeographyStore.getXYZ().z }
          />

          { CitiesStore.getDorlingsForce().map((cityData, i) => {
            return (
              <Dorlings
                { ...cityData }
                { ...GeographyStore.getXYZ() }
                r={ DimensionsStore.getDorlingRadius(cityData.value) }
                view={ CitiesStore.getSelectedView() }
                key={'cityCircle' + cityData.city_id }
                strokeWidth={ 0.5/GeographyStore.getZ()}
                onCityClicked={ this.props.onCityClicked }
                onCityHover={ this.props.onCityHover }
                onCityOut={ this.props.onCityOut }
              />
            );  
          })}

          { CitiesStore.getDorlingsForce().map((cityData, i) => {
            const visibleRadius = (CitiesStore.getSelectedView() == 'cartogram') ? DimensionsStore.getDorlingRadius(cityData.value) * GeographyStore.getZ() : DimensionsStore.getDorlingRadius(cityData.value) ;
            if (DimensionsStore.dorlingHasLabel(cityData.city_id, visibleRadius)) {
              return (
                <DorlingLabel
                  { ...cityData }
                  { ...GeographyStore.getXYZ() }
                  r={ DimensionsStore.getDorlingRadius(cityData.value) }
                  key={'cityCircle' + cityData.city_id }
                  strokeWidth={ 0.5/GeographyStore.getZ()}
                  onCityClicked={ this.props.onCityClicked }
                  onCityHover={ this.props.onCityHover }
                  onCityOut={ this.props.onCityOut }
                />
              );
            }  
          })}
          
        </g>
      </svg>
    );
  }
}