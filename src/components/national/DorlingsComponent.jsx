import * as React from 'react';

import ReactDOM from 'react-dom';
import d3 from 'd3';
import DimensionsStore from '../../stores/DimensionsStore.js';

export default class Dorlings extends React.Component {

  constructor (props) {
    super(props);
    this.state = {
      r: (this.props.view == 'cartogram') ? this.props.r : this.props.r / this.props.z,
      color: this.props.color,
      cx: this.props.coords[this.props.view].cx,
      cy: this.props.coords[this.props.view].cy,
      windowDimensions: DimensionsStore.getMapDimensions()
    };
  }

  componentWillReceiveProps(nextProps) {
    // resize the bubble on map or chart but not cartogram
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

    if (this.props.r !== nextProps.r || this.props.color !== nextProps.color || this.props.coords[this.props.view].cx !== nextProps.coords[nextProps.view].cx || this.props.coords[this.props.view].cy !== nextProps.coords[nextProps.view].cy ) {
      d3.select(ReactDOM.findDOMNode(this))
        .transition()
        .delay((nextProps.view == 'scatterplot' && this.props.view !== 'scatterplot') ? (1- nextProps.coords[nextProps.view].cy/scatterplotMaxY) * 5000 : 0)
        .duration((this.state.windowDimensions.width == DimensionsStore.getMapDimensions().width && this.state.windowDimensions.height == DimensionsStore.getMapDimensions().height) ? 750 : 0) // immediately replace on window resize
        .attr('r', (nextProps.view !== 'cartogram') ? nextProps.r / nextProps.z : nextProps.r)
        .attr('cx', nextProps.coords[nextProps.view].cx)
        .attr('cy', nextProps.coords[nextProps.view].cy)
        .style('fill', nextProps.color)
        .each('end', () => {
          this.setState({
            cx: nextProps.coords[nextProps.view].cx,
            cy: nextProps.coords[nextProps.view].cy,
            r: (nextProps.view !== 'cartogram') ? nextProps.r / nextProps.z : nextProps.r,
            color: nextProps.color,
            windowDimensions: DimensionsStore.getMapDimensions()
          });
        });
    }
  }

  render () {
    return (
      <circle className='dorling'
        cx={ this.state.cx }
        cy={ this.state.cy }
        r={ this.state.r }
        fill={ (this.props.percentFamiliesOfColor >= this.props.pocSpan[0] && this.props.percentFamiliesOfColor <= this.props.pocSpan[1]) ? this.state.color : 'transparent'}
        style={ {
          fillOpacity: (this.props.highlightedCities.length == 0) || this.props.highlightedCities.includes(this.props.city_id) ? 1 : 0.2,
          strokeWidth: this.props.strokeWidth,
          strokeOpacity: ((this.props.percentFamiliesOfColor >= this.props.pocSpan[0] && this.props.percentFamiliesOfColor <= this.props.pocSpan[1]) && (this.props.highlightedCities.length == 0 || this.props.highlightedCities.includes(this.props.city_id))) ? 1 : 0,
          stroke: this.props.stroke
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