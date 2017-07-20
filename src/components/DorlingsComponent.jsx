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
      r: (CitiesStore.getSelectedView() == 'cartogram') ? this.props.r : this.props.r / this.props.z,
      color: this.props.color,
      cx: this.props.cx,
      cy: this.props.cy
    };
  }

  componentWillEnter(callback) { callback(); }

  componentWillLeave(callback) { callback(); }

  componentWillReceiveProps(nextProps) {
    if (this.props.z !== nextProps.z && CitiesStore.getSelectedView() !== 'cartogram') {
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

    if (this.props.r !== nextProps.r || this.props.color !== nextProps.color || this.props.cx !== nextProps.cx || this.props.cy !== nextProps.cy ) {
      d3.select(ReactDOM.findDOMNode(this))
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
    }
  }

  render () {
    const labelSize = (8 * this.state.r  / 15 < 14) ? 14 : (8 * this.state.r  / 15 > 18) ? 18 : 8 * this.state.r  / 15;
    return (
      <circle className='dorling'
        cx={ this.state.cx }
        cy={ this.state.cy }
        r={ this.state.r }
        style={ {
          fill: this.state.color,
          fillOpacity: (!CitiesStore.getHighlightedCity() || CitiesStore.getHighlightedCity() == this.props.city_id) ? 1 : 0.5,
          strokeWidth: (this.props.hasProjectGeojson) ? this.props.strokeWidth * 3 : this.props.strokeWidth,
          strokeOpacity: (!CitiesStore.getHighlightedCity() || CitiesStore.getHighlightedCity() == this.props.city_id) ? 1 : 0.1,
          stroke: (this.state.color == 'transparent') ? 'transparent' : '#333'
        } }
        onClick={ (this.props.hasProjectGeojson) ? this.props.onCityClicked : false}
        onMouseEnter={ this.props.onCityHover }
        onMouseLeave={ this.props.onCityOut }
        id={ this.props.city_id }
        key={ 'city' + this.props.city_id }
        className={ 'dorling ' + this.props.className }
      />
    );
  }
}