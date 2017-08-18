import * as React from 'react';
import ReactDOM from 'react-dom';
import * as d3 from 'd3';

import GeographyStore from '../../stores/GeographyStore';
import CitiesStore from '../../stores/CitiesStore';

export default class MapField extends React.Component {

  constructor (props) {
    super(props);
    this.state = {
      opacity: (this.props.selectedView == 'scatterplot') ? 0 : 1,
    };
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.selectedView == 'scatterplot') {
      d3.select(ReactDOM.findDOMNode(this))
        .transition()
        .duration(5750*2/3)
        .attr('opacity', 0)
        .each('end', () => {
          this.setState({
            opacity: 0
          });
        });
    }

    if (this.props.selectedView == 'scatterplot' && nextProps.selectedView !== 'scatterplot') {
      d3.select(ReactDOM.findDOMNode(this))
        .transition()
        .duration(750)
        .attr('opacity', 1)
        .each('end', () => {
          this.setState({
            opacity: 0
          });
        });
    }
  }

  render () {
    return (
      <g opacity={this.state.opacity}>
        <defs>
          <filter id="glow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="6 6" result="glow"/>
          </filter>
        </defs>

        { GeographyStore.getStatesGeojson().map(polygon => {
          return (
            <path
              key={ 'statepolygon' + polygon.id }
              d={ GeographyStore.getPath(polygon.geometry) }
              strokeWidth={ (CitiesStore.getSelectedView() == 'cartogram') ? 0.1 / this.props.z : 1 / this.props.z }
              stroke={ (CitiesStore.getSelectedView() == 'cartogram') ? 'white' : 'silver' }
              fillOpacity={(CitiesStore.getSelectedView() == 'cartogram') ? 0.75 : 1}
              className='stateMap'
              style={{
                filter: (CitiesStore.getSelectedView() == 'map') ? '' : 'url(#glow)'
              }}
            />
          );
        }) }
      </g>
    );
  }

}