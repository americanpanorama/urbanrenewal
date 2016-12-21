import * as React from 'react';
import { PropTypes } from 'react';
import * as d3 from 'd3';
import ReactTransitionGroup from 'react-addons-transition-group';

import GeoStates from './GeoStates.jsx';
import Highways from './HighwaysComponent.jsx';
import Dorlings from './DorlingsComponent.jsx';

import CitiesStore from '../stores/CitiesStore.js';

export default class USMap extends React.Component {

  constructor (props) { super(props); }

  render () {
    let projection = d3.geo.albersUsa()
      .scale(1000)
      .translate([900 / 2, 600 / 2]);

    let path = d3.geo.path()
      .projection(projection);

    let r = d3.scale.sqrt()
      .domain([0, CitiesStore.getCategoryMaxForCity('selected')])
      .range([0,20]);

    return (
      <svg 
        width={900}  
        height={600}
        className='ussvg'
      >
        <GeoStates path={ path } />
        <Highways 
          path={ path }
          state={ this.props.state }
        />
        <ReactTransitionGroup component='g' className='transitionGroup'>
          { CitiesStore.getCitiesDataForYearAndCategory(this.props.state.year, CitiesStore.getSelectedCategory()).map((cityData, i) => (
            <Dorlings
              r={ r(cityData.value) }
              cx={ projection(cityData.lngLat)[0] }
              cy={ projection(cityData.lngLat)[1] }
              key={'cityCircle' + cityData.city_id }
              color={ CitiesStore.getCategoryColor('selected') }
              city_id={ cityData.city_id }
            />
          ))}
        </ReactTransitionGroup>
      </svg>
    );
  }
}