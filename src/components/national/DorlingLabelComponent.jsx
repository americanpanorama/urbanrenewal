import * as React from 'react';
import ReactDOM from 'react-dom';
import d3 from 'd3';
import DimensionsStore from '../../stores/DimensionsStore.js';
import { formatNumber, roughNumber } from '../../utils/HelperFunctions';

export default class DorlingLabel extends React.Component {

  constructor (props) {
    super(props);
    this.state = {
      cx: this.props.coords[this.props.selectedView].cx,
      cy: this.props.coords[this.props.selectedView].cy
    };
  }

  componentWillEnter(callback) { callback(); }

  componentWillLeave(callback) { callback(); }

  componentWillReceiveProps(nextProps) {
    if (this.props.coords[this.props.selectedView].cx !== nextProps.coords[this.props.selectedView].cy || this.props.coords[this.props.selectedView].cy !== nextProps.coords[this.props.selectedView].cy ) {
      d3.select(ReactDOM.findDOMNode(this))
        .transition()
        .delay((this.props.selectedView == 'scatterplot') ? Math.min((DimensionsStore.getNationalMapHeight() * 0.9 - nextProps.coords[this.props.selectedView].cy) * 10, 5000) : 0)
        .duration(750)
        .attr('transform', 'translate(' + nextProps.coords[this.props.selectedView].cx + ' ' + nextProps.coords[this.props.selectedView].cy + ')');
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
          className={ (this.props.color == 'transparent') ? 'hidden' : ''}
        >
          {this.props.name.replace(/\w\S*/g, txt =>  txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase())}
        </text> 

        <text
          x={ 0 }
          y={ 1 + labelSize / this.props.z * 0.8  }
          fontSize={ labelSize / this.props.z * 0.8 }
          key={'cityNumsLabel' + this.props.city_id}
          className={ (this.props.color == 'transparent') ? 'hidden' : 'displacements'}
        >
          { (this.props.roughNumber) ? '~' + formatNumber(roughNumber(this.props.value)) : formatNumber(this.props.value) }
        </text> 
      </g>
    );
  }
}