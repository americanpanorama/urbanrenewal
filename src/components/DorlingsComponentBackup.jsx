import * as React from 'react';
import { PropTypes } from 'react';
import ReactDOM from 'react-dom';
import d3 from 'd3';

export default class Dorlings extends React.Component {

  constructor (props) {
    super(props);
    this.state = {
      r: 1e-6,
      color: this.props.color
    };
  }

  componentWillEnter(callback) {
    d3.select(ReactDOM.findDOMNode(this))
      .transition()
      .duration(750)
      .attr('r', this.props.r)
      .each('end', () => {
        this.setState({
          r: this.props.r,
          color: this.props.color
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
    if (this.props.zoom !== nextProps.zoom) {
      d3.select(ReactDOM.findDOMNode(this))
        .attr('r', nextProps.r)
        .style('fill', nextProps.color);
      this.setState({
        r: nextProps.r,
        color: nextProps.color
      });
    }
    else if (this.props.r !== nextProps.r || this.props.color !== nextProps.color) {
      d3.select(ReactDOM.findDOMNode(this))
        .transition()
        //.delay((nextProps.r > this.props.r) ? 750 : 0)

        .duration(750)
        .attr('r', nextProps.r)
        .style('fill', nextProps.color)
        .each('end', () => {
          this.setState({
            r: nextProps.r,
            color: nextProps.color
          });
        });
    }
  }

  render () {
    return (
      <circle
        cx={ this.props.cx }
        cy={ this.props.cy }
        r={ this.state.r }
        style={ {
          fill: this.state.color,
          strokeWidth: this.props.strokeWidth
        } }
        onClick={ this.props.onCityClicked }
        id={ this.props.city_id }
        key={ 'city' + this.props.city_id }
        className={ 'dorling ' + this.props.className }
      />
    );
  }
}