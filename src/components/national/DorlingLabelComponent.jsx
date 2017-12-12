import * as React from 'react';
import ReactDOM from 'react-dom';
import d3 from 'd3';
import DimensionsStore from '../../stores/DimensionsStore.js';
import { formatNumber, roughNumber } from '../../utils/HelperFunctions';

export default class DorlingLabel extends React.Component {

  constructor (props) {
    super(props);
    this.state = {
      cx: this.props.coords[this.props.view].cx,
      cy: this.props.coords[this.props.view].cy,
      windowDimensions: DimensionsStore.getMapDimensions()
    };
  }

  componentWillEnter(callback) { callback(); }

  componentWillLeave(callback) { callback(); }

  componentWillReceiveProps(nextProps) {
    // if (this.props.coords[this.props.view].cx !== nextProps.coords[this.props.view].cy || this.props.coords[this.props.view].cy !== nextProps.coords[this.props.view].cy ) {
    //   d3.select(ReactDOM.findDOMNode(this))
    //     .transition()
    //     .delay((this.props.view == 'scatterplot') ? Math.min((DimensionsStore.getNationalMapHeight() * 0.9 - nextProps.coords[this.props.view].cy) * 10, 5000) : 0)
    //     .duration(750)
    //     .attr('transform', 'translate(' + nextProps.coords[this.props.view].cx + ' ' + nextProps.coords[this.props.view].cy + ')');
    // }
    const shortside = Math.min(DimensionsStore.getNationalMapWidth() * 0.4, DimensionsStore.getNationalMapHeight() * 0.4),
      scatterplotMaxY = DimensionsStore.getNationalMapHeight()/2 + shortside;

    if (this.props.r !== nextProps.r || this.props.color !== nextProps.color || this.props.coords[this.props.view].cx !== nextProps.coords[nextProps.view].cx || this.props.coords[this.props.view].cy !== nextProps.coords[nextProps.view].cy ) {
      d3.select(ReactDOM.findDOMNode(this))
        .transition()
        .delay((nextProps.view == 'scatterplot' && this.props.view !== 'scatterplot') ? (1- nextProps.coords[nextProps.view].cy/scatterplotMaxY) * 5000 : 0)
        .duration((this.state.windowDimensions.width == DimensionsStore.getMapDimensions().width && this.state.windowDimensions.height == DimensionsStore.getMapDimensions().height) ? 750 : 0) // immediately replace on window resize
        .attr('transform', 'translate(' + nextProps.coords[this.props.view].cx + ' ' + nextProps.coords[this.props.view].cy + ')')
        .each('end', () => {
          this.setState({
            cx: nextProps.coords[nextProps.view].cx,
            cy: nextProps.coords[nextProps.view].cy,
            windowDimensions: DimensionsStore.getMapDimensions()
          });
        });
    }
  }

  render () {
    const labelSize = (8 * this.props.r  / 15 < 13) ? 13 : (8 * this.props.r  / 15 > 18) ? 18 : 8 * this.props.r  / 15;
    return (
      <g 
        className='dorlingLabel'
        transform={ 'translate(' +  this.state.cx + ' ' + this.state.cy + ')' }
      >
        <text
          x={ 0 }
          y={ -1 }
          fontSize={ labelSize / this.props.z }
          key={'cityLabel' + this.props.city_id}
          className={ (this.props.color == 'transparent' || this.props.percentFamiliesOfColor < this.props.pocSpan[0] || this.props.percentFamiliesOfColor > this.props.pocSpan[1]) ? 'hidden' : ''}
        >
          {this.props.name.replace(/\w\S*/g, txt =>  txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase())}
        </text> 

        <text
          x={ 0 }
          y={ 1 + labelSize / this.props.z * 0.8  }
          fontSize={ labelSize / this.props.z * 0.8 }
          key={'cityNumsLabel' + this.props.city_id}
          className={ (this.props.color == 'transparent' || this.props.percentFamiliesOfColor < this.props.pocSpan[0] || this.props.percentFamiliesOfColor > this.props.pocSpan[1]) ? 'hidden' : 'displacements'}
        >
          { (this.props.roughNumber) ? '~' + formatNumber(roughNumber(this.props.value)) : formatNumber(this.props.value) }
        </text> 
      </g>
    );
  }
}