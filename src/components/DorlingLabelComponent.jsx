import * as React from 'react';
import { PropTypes } from 'react';
import ReactDOM from 'react-dom';
import d3 from 'd3';
import CitiesStore from '../stores/CitiesStore.js';
import DimensionsStore from '../stores/DimensionsStore.js';
import { formatNumber } from '../utils/HelperFunctions';

export default class DorlingLabel extends React.Component {

  constructor (props) {
    super(props);
    this.state = {
      r: (CitiesStore.getSelectedView() == 'cartogram') ? this.props.r : this.props.r / this.props.z,
      color: this.props.color,
      cx: this.props.cx,
      cy: this.props.cy
    };
  }

  componentWillEnter(callback) {
    callback();
  }

  componentWillLeave(callback) { callback(); }

  componentWillReceiveProps(nextProps) {
    if (this.props.z !== nextProps.z && CitiesStore.getSelectedView() !== 'cartogram') {
      d3.select(ReactDOM.findDOMNode(this)).select('circle')
        .transition()
        .duration(0)
        .attr('r', nextProps.r / nextProps.z)
        .each('end', () => {
          this.setState({
            r: nextProps.r / nextProps.z
          });
        });
    }
    // if (this.props.zoom !== nextProps.zoom) {
    //   d3.select(ReactDOM.findDOMNode(this))
    //     .attr('r', nextProps.r)
    //     .style('fill', nextProps.color);
    //   this.setState({
    //     r: nextProps.r,
    //     color: nextProps.color
    //   });
    // }
    if (this.props.r !== nextProps.r || this.props.color !== nextProps.color || this.props.cx !== nextProps.cx || this.props.cy !== nextProps.cy ) {
      d3.select(ReactDOM.findDOMNode(this)).select('circle')
        .transition()
        .delay((CitiesStore.getSelectedView() == 'scatterplot') ? Math.min((DimensionsStore.getNationalMapHeight() * 0.9 - nextProps.cy) * 10, 5000) : 0)
        .duration(750)
        .attr('r', (CitiesStore.getSelectedView() !== 'cartogram') ? nextProps.r / nextProps.z : nextProps.r)
        .attr('cx', nextProps.cx)
        .attr('cy', nextProps.cy)
        .style('fill', nextProps.color)
        .each('end', () => {
          this.setState({
            cx: nextProps.cx,
            cy: nextProps.cy,
            r: (CitiesStore.getSelectedView() !== 'cartogram') ? nextProps.r / nextProps.z : nextProps.r,
            color: nextProps.color
          });
        });
      d3.select(ReactDOM.findDOMNode(this)).selectAll('text')
        .transition()
        .delay((CitiesStore.getSelectedView() == 'scatterplot') ? Math.min((DimensionsStore.getNationalMapHeight() * 0.9 - nextProps.cy) * 10, 5000) : 0)
        .duration(750)
        .attr('x', nextProps.cx)
        .attr('y', nextProps.cy);
    }
  }

  render () {
    const labelSize = (8 * this.state.r  / 15 < 14) ? 14 : (8 * this.state.r  / 15 > 18) ? 18 : 8 * this.state.r  / 15;
    return (
      <g className='dorlingLabel'>
        <text
          x={ this.state.cx }
          y={ this.state.cy }
          textAnchor='middle'
          alignmentBaseline='middle'
          fontSize={ labelSize }
          key={'cityLabelhalo' + this.props.city_id}
          className='multistroke'
          stroke={'transparent'}
          fill='transparent'
        >
          {this.props.name.replace(/\w\S*/g, txt =>  txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase())}
        </text> 
        <text
          x={ this.state.cx }
          y={ this.state.cy }
          textAnchor='middle'
          alignmentBaseline='bottom'
          fontSize={ labelSize / this.props.z }
          key={'cityLabel' + this.props.city_id}
        >
          {this.props.name.replace(/\w\S*/g, txt =>  txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase())}
        </text> 

        <text
          x={ this.state.cx }
          y={ this.state.cy + labelSize / this.props.z}
          textAnchor='middle'
          alignmentBaseline='top'
          fontSize={ labelSize / this.props.z * 0.7 }
          key={'cityNumsLabel' + this.props.city_id}
          fill='#555'
        >
          { formatNumber(this.props.value) }
        </text> 
      </g>
    );
  }
}