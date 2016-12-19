import * as React from 'react';
import { PropTypes } from 'react';

export default class Highways extends React.Component {

  constructor (props) {
    super(props);
  }

  render () {
    return (
      <g>
        { this.props.data.map(polygon => {
          return (
            <path
              key={ 'highwaysOpened' + polygon.properties.year_open }
              d={ this.props.path(polygon.geometry) }
              style={ {
                fill: 'transparent',
                stroke: (polygon.properties.year_open <= this.props.state.year) ? 'orange' : 'transparent',
                strokeWidth: (polygon.properties.year_open <= this.props.state.year) ? 1 : 0,
              } }
            />
          );
        })}
      </g>
    );
  }
}