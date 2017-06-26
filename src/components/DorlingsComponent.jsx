import * as React from 'react';
import { PropTypes } from 'react';
import ReactDOM from 'react-dom';
import d3 from 'd3';
import CitiesStore from '../stores/CitiesStore.js';
import DimensionsStore from '../stores/DimensionsStore.js';

export default class Dorlings extends React.Component {

  constructor (props) {
    super(props);
    this.state = {
      r: this.props.r,
      color: this.props.color,
      cx: this.props.cx,
      cy: this.props.cy
    };
  }

  componentWillEnter(callback) {
    callback();
    // d3.select(ReactDOM.findDOMNode(this))
    //   .transition()
    //   .duration(0)
    //   .attr('r', this.props.r)
    //   .each('end', () => {
    //     this.setState({
    //       r: this.props.r,
    //       color: this.props.color
    //     });
    //     callback();
    //   });
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
    else if (this.props.r !== nextProps.r || this.props.color !== nextProps.color || this.props.cx !== nextProps.cx || this.props.cy !== nextProps.cy ) {
      d3.select(ReactDOM.findDOMNode(this)).select('circle')
        .transition()
        .delay((CitiesStore.getSelectedView() == 'scatterplot') ? Math.min((DimensionsStore.getNationalMapHeight() * 0.9 - nextProps.cy) * 10, 5000) : 0)
        .duration(750)
        .attr('r', nextProps.r)
        .attr('cx', nextProps.cx)
        .attr('cy', nextProps.cy)
        .style('fill', nextProps.color)
        .each('end', () => {
          this.setState({
            cx: nextProps.cx,
            cy: nextProps.cy,
            r: nextProps.r,
            color: nextProps.color
          });
        });
    }
  }

  render () {
    const labelSize = (8 * this.state.r  / 15 < 12) ? 12 : (8 * this.state.r  / 15 > 18) ? 18 : 8 * this.state.r  / 15;
    return (
      <g>
        <circle
          cx={ this.state.cx }
          cy={ this.state.cy }
          r={ this.state.r }
          style={ {
            fill: this.state.color,
            fillOpacity: 1,
            strokeWidth: this.props.strokeWidth
          } }
          onClick={ this.props.onCityClicked }
          onMouseEnter={ this.props.onCityHover }
          onMouseLeave={ this.props.onCityOut }
          id={ this.props.city_id }
          key={ 'city' + this.props.city_id }
          className={ 'dorling ' + this.props.className }
        />
        { (this.state.r > 15) ?
          <text
            x={ (this.props.dorlingXY) ?  this.props.dorlingXY[0] : this.props.cx }
            y={ (this.props.dorlingXY) ?  this.props.dorlingXY[1] : this.props.cy }
            textAnchor='middle'
            alignmentBaseline='middle'
            fontSize={ labelSize }
          >
            {this.props.name.replace(/\w\S*/g, txt =>  txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase())}
          </text> : ''
        }
      </g>
    );
  }
}