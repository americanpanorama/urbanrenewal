import * as React from 'react';
import { PropTypes } from 'react';
import * as d3 from 'd3';
import ReactTransitionGroup from 'react-addons-transition-group';

import GeoStates from './GeoStates.jsx';
import Highways from './HighwaysComponent.jsx';
import Dorlings from './DorlingsComponent.jsx';

export default class USMap extends React.Component {

  constructor (props) {
    super(props);
  }

  render () {
    let projection = d3.geo.albersUsa()
      .scale(1000)
      .translate([900 / 2, 600 / 2]);

    let path = d3.geo.path()
      .projection(projection);

    return (
      <svg 
        width={900}  
        height={600}
        className='ussvg'
      >
        <GeoStates 
          data={ this.props.geojson }
          path={ path }
        />
        <Highways 
          data={ this.props.highways }
          path={ path }
          state={ this.props.state }
        />
        <ReactTransitionGroup component='g' className='transitionGroup'>
          { this.props.cities.map((cityData, i) => (
            <Dorlings
              { ...cityData }
              projection={ projection }
              key={'cityCircle' + cityData.city_id}
              onCityClicked={ this.props.onCityClicked }
            />
          ))}
        </ReactTransitionGroup>
      </svg>
    );
  }
}