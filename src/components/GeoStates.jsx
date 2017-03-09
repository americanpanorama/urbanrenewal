import * as React from 'react';
import { PropTypes } from 'react';

import GeographyStore from '../stores/GeographyStore';

export default class USMap extends React.Component {

  constructor (props) { super(props); }

  render () {
    return (
      <g>
        { GeographyStore.getStatesGeojson().map(polygon => {
          return (
            <path
              key={ polygon.id }
              d={ this.props.path(polygon.geometry) }
              strokeWidth={ 0.2/this.props.state.zoom }
              className='stateMap'
            />
          );
        })}
      </g>
    );
  }
}