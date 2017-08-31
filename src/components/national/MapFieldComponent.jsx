import * as React from 'react';
import ReactDOM from 'react-dom';
import * as d3 from 'd3';

import GeographyStore from '../../stores/GeographyStore';

export default class MapField extends React.Component {

  constructor (props) {
    super(props);
    this.state = {
      opacity: (this.props.selectedView == 'scatterplot') ? 0 : 1,
      fill: (this.props.selectedView == 'map') ? 'white' : '#444'
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
      <g 
        opacity={this.state.opacity}
        className='nationalMap'
      >
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
              strokeWidth={ (this.props.selectedView == 'cartogram') ? 0.1 / this.props.z : 1 / this.props.z }
              className={ this.props.selectedView }
            />
          );
        }) }
      </g>
    );
  }

}