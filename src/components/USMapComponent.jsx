import * as React from 'react';
import { PropTypes } from 'react';
import * as d3 from 'd3';
import ReactTransitionGroup from 'react-addons-transition-group';

import GeoStates from './GeoStates.jsx';
import Highways from './HighwaysComponent.jsx';
import Dorlings from './DorlingsComponent.jsx';

import CitiesStore from '../stores/CitiesStore.js';
import GeographyStore from '../stores/GeographyStore';

export default class USMap extends React.Component {

  constructor (props) { super(props); }

  render () {
    let width = this.props.style.width,
      height = this.props.style.height,
      scale = Math.min(1.36 * width, 2.08 * height); // I calculated these with trial and error--sure there's a more precise way as this will be fragile if the width changes

    let projection = d3.geo.albersUsa()
      .scale(scale) 
      .translate([width / 2, height / 2]);

    // calculate scale
    // let easternmost = projection([-66.95, 44.815])[0],
    //   westernmost = projection([-124.732, 48.164])[0],
    //   northernmost = projection([-95.153, 49.384])[1],
    //   southernmost = projection([-81.086, 25.11])[1];

    let path = d3.geo.path()
      .projection(projection);

    let r = d3.scale.sqrt()
      .domain([0, CitiesStore.getCategoryMaxForCity('selected')])
      .range([0,scale / 50]);

    return (
      <svg 
        width={width}  
        height={height}
        className='ussvg'
      >
        <GeoStates path={ path } />
        <Highways 
          path={ path }
          state={ this.props.state }
        />
        <ReactTransitionGroup component='g' className='transitionGroup'>
          { CitiesStore.getCitiesDataForYearAndCategory(this.props.state.year, CitiesStore.getSelectedCategory()).filter(cityData => projection(cityData.lngLat) !== null).map((cityData, i) => (
            <Dorlings
              r={ r(cityData.value) }
              cx={ projection(cityData.lngLat)[0] }
              cy={ projection(cityData.lngLat)[1] }
              key={'cityCircle' + cityData.city_id }
              color={ CitiesStore.getCategoryColor('selected') }
              city_id={ cityData.city_id }
              onCityClicked={ this.props.onCityClicked }
            />
          ))}
        </ReactTransitionGroup>
      </svg>
    );
  }
}