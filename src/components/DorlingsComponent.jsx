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
      .attr('r', this.props.r)
      .each('end', () => {
        this.setState({
          r: this.props.r
        });
        callback();
      });
    console.log('entered');
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
    console.log('left');
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.value != nextProps.value || this.props.color != nextProps.color) {
      d3.select(ReactDOM.findDOMNode(this))
        .transition()
        .duration(750)
        .attr('r', this.props.r)
        .style('fill', this.props.color)
        .each('end', () => {
          this.setState({
            r: this.props.r
          });
        });
      console.log('transition');
    }
  }

  render () {
    return (
      <circle
        cx={ this.props.cx }
        cy={ this.props.cy }
        r={ this.state.r }
        style={ {
          fill: this.props.color,
          fillOpacity: 0.4,
          stroke: this.props.color,
          strokeWidth: 0.5,
          strokeOpacity: 0.9
        } }
        onMouseEnter={ this.props.onCityClicked }
        id={ this.props.city_id }
        key={ 'city' + this.props.city_id }
      />
    );
  }
}