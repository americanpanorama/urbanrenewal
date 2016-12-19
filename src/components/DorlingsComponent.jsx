import * as React from 'react';
import { PropTypes } from 'react';
import ReactDOM from 'react-dom';
import d3 from 'd3';

export default class Dorlings extends React.Component {

  constructor (props) {
    super(props);
    this.state = {
      r: 1e-6
    };
  }

  componentWillEnter(callback) {
    d3.select(ReactDOM.findDOMNode(this))
      .transition()
      .duration(750)
      .attr('r', Math.sqrt(this.props.value / 900000))
      .each('end', () => {
        this.setState({
          r: Math.sqrt(this.props.value / 900000)
        });
        callback();
      });
  }

  componentWillLeave(callback) {
    // d3.select(ReactDOM.findDOMNode(this))
    //   .transition()
    //   .duration(750)
    //   .attr('r', 1e-6)
    //   .each('end', () => {
    //     callback();
    //   });
    callback();
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.value != nextProps.value) {
      d3.select(ReactDOM.findDOMNode(this))
        .transition()
        .duration(750)
        .attr('r', Math.sqrt(nextProps.value / 900000))
        .each('end', () => {
          this.setState({
            r: Math.sqrt(nextProps.value / 900000)
          });
        });
    }
  }

  render () {
    return (
      <circle
        cx={ this.props.projection(this.props.lngLat)[0] }
        cy={ this.props.projection(this.props.lngLat)[1] }
        r={ this.state.r }
        style={ {
          fill: 'grey',
          fillOpacity: 0.4,
          stroke: 'purple',
          strokeWidth: 0.5,
          strokeOpacity: 0.9
        } }
        onClick={ this.props.onCityClicked }
        id={ this.props.city_id }
      />
    );
  }
}