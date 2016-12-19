import * as React from 'react';
import { PropTypes } from 'react';

export default class USMap extends React.Component {

  constructor (props) {
    super(props);
  }

  render () {
    return (
      <g>
        { this.props.data.map(polygon => {
          return (
            <path
              key={ polygon.id }
              d={ this.props.path(polygon.geometry) }
              style={ {
                fill: 'silver',
                stroke: 'white',
                strokeWidth: 0.3
              } }
            />
          );
        })}
      </g>
    );
  }
}