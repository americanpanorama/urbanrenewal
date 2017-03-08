import * as React from 'react';
import { PropTypes } from 'react';

import HighwaysStore from '../stores/HighwaysStore';

export default class Highways extends React.Component {

  constructor (props) {
    super(props);
  }

  render () {
    return (
      <g>
        { HighwaysStore.getHighwaysList().map(polygon => {
          return (
            <path
              key={ 'highwaysOpened' + polygon.properties.year_open }
              d={ this.props.path(polygon.geometry) }
              style={ {
                fill: 'transparent',
                stroke: (polygon.properties.year_open <= this.props.state.year) ? 'orange' : 'transparent',
                strokeWidth: (polygon.properties.year_open <= this.props.state.year) ? 0.75/this.props.state.zoom : 0,
              } }
            />
          );
        })}
      </g>
    );
  }
}