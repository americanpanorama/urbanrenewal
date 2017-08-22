import * as React from 'react';

import ReactDOM from 'react-dom';
import d3 from 'd3';
import CitiesStore from '../../stores/CitiesStore.js';
import DimensionsStore from '../../stores/DimensionsStore.js';

export default class Dorlings extends React.Component {

  constructor (props) {
    super(props);
    this.state = {
      r: (this.props.view == 'cartogram') ? this.props.r : this.props.r / this.props.z,
      color: this.props.color,
      cx: this.props.cx,
      cy: this.props.cy
    };
  }

  componentWillEnter(callback) { callback(); }

  componentWillLeave(callback) { callback(); }

  componentWillReceiveProps(nextProps) {
    if (this.props.z !== nextProps.z && this.props.view !== 'cartogram') {
      d3.select(ReactDOM.findDOMNode(this))
        .transition()
        .duration(0)
        .attr('r', nextProps.r / nextProps.z)
        .each('end', () => {
          this.setState({
            r: nextProps.r / nextProps.z
          });
        });
    }

    const shortside = Math.min(DimensionsStore.getNationalMapWidth() * 0.4, DimensionsStore.getNationalMapHeight() * 0.4),
      scatterplotMaxY = DimensionsStore.getNationalMapHeight()/2 + shortside;

    if (this.props.r !== nextProps.r || this.props.color !== nextProps.color || this.props.cx !== nextProps.cx || this.props.cy !== nextProps.cy ) {
      d3.select(ReactDOM.findDOMNode(this))
        .transition()
        .delay((nextProps.view == 'scatterplot' && this.props.view !== 'scatterplot') ? (1- nextProps.cy/scatterplotMaxY) * 5000 : 0)
        .duration(750)
        .attr('r', (nextProps.view !== 'cartogram') ? nextProps.r / nextProps.z : nextProps.r)
        .attr('cx', nextProps.cx)
        .attr('cy', nextProps.cy)
        .style('fill', nextProps.color)
        .each('end', () => {
          this.setState({
            cx: nextProps.cx,
            cy: nextProps.cy,
            r: (nextProps.view !== 'cartogram') ? nextProps.r / nextProps.z : nextProps.r,
            color: nextProps.color
          });
        });
    }
  }

  render () {
    const labelSize = (8 * this.state.r  / 15 < 14) ? 14 : (8 * this.state.r  / 15 > 18) ? 18 : 8 * this.state.r  / 15;
    let stroke = '#333';
    if (this.state.color == 'transparent' || CitiesStore.getSelectedView() == 'cartogram') {
      stroke = 'transparent';
    } 
    // else if (this.props.view == 'scatterplot' && CitiesStore.getCityData(this.props.city_id).nonwhite_1960/CitiesStore.getCityData(this.props.city_id).pop_1960 >= 0.2 && CitiesStore.getCityData(this.props.city_id).nonwhite_1960/CitiesStore.getCityData(this.props.city_id).pop_1960 <= 0.3 ) {
    //   stroke = 'red';
    // } 
    return (
      <circle className='dorling'
        cx={ this.state.cx }
        cy={ this.state.cy }
        r={ this.state.r }
        fill={ this.state.color }
        style={ {
          fillOpacity: (!CitiesStore.getHighlightedCity() || CitiesStore.getHighlightedCity() == this.props.city_id) ? 1 : 0.5,
          strokeWidth: (this.props.hasProjectGeojson) ? this.props.strokeWidth : this.props.strokeWidth,
          strokeOpacity: (!CitiesStore.getHighlightedCity() || CitiesStore.getHighlightedCity() == this.props.city_id) ? 1 : 0.1,
          stroke: stroke
        } }
        onClick={ (this.props.hasProjectGeojson) ? this.props.onCityClicked : this.props.onCityClicked}
        onMouseEnter={ this.props.onCityHover }
        onMouseLeave={ this.props.onCityOut }
        id={ this.props.city_id }
        key={ 'city' + this.props.city_id }
        className={ 'dorling ' + this.props.className }
      />
    );
  }
}