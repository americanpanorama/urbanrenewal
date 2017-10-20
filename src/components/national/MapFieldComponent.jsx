import * as React from 'react';
import ReactDOM from 'react-dom';
import * as d3 from 'd3';

import GeographyStore from '../../stores/GeographyStore';

export default class MapField extends React.Component {

  constructor (props) {
    super(props);
    this.state = {
      opacity: (this.props.selectedView == 'scatterplot') ? 0 : 1,
      fill: (this.props.selectedView == 'map') ? '#F5F5F3' : '#aaa'
    };
  }

  shouldComponentUpdate(nextProps) {
    return this.props.selectedView !== nextProps.selectedView || this.props.z !== nextProps.z;
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
        <filter id="glow" x="-50%" y="-10%" width="200%" height="160%">
          <feGaussianBlur stdDeviation="10" result="glow"/>
        </filter>

        { GeographyStore.getStatesGeojson().map(polygon => {
          return (
            <path
              key={ 'statepolygon' + polygon.id }
              d={ GeographyStore.getPath(polygon.geometry) }
              strokeWidth={ (this.props.selectedView == 'cartogram') ? 0.1 / this.props.z : 1 / this.props.z }
              className={ this.props.selectedView }
              filter={ (this.props.selectedView == 'cartogram') ? 'url(#glow)' : '' }
            />
          );
        }) }
      </g>
    );
  }

}