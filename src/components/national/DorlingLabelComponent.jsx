import * as React from 'react';
import ReactDOM from 'react-dom';
import d3 from 'd3';
import DimensionsStore from '../../stores/DimensionsStore.js';
import { formatNumber} from '../../utils/HelperFunctions';

export default class DorlingLabel extends React.Component {

  constructor (props) {
    super(props);
    this.state = {
      cx: this.props.cx,
      cy: this.props.cy
    };
  }

  componentWillEnter(callback) { callback(); }

  componentWillLeave(callback) { callback(); }

  componentWillReceiveProps(nextProps) {
    if (this.props.cx !== nextProps.cx || this.props.cy !== nextProps.cy ) {
      d3.select(ReactDOM.findDOMNode(this))
        .transition()
        .delay((this.props.selectedView == 'scatterplot') ? Math.min((DimenxsionsStore.getNationalMapHeight() * 0.9 - nextProps.cy) * 10, 5000) : 0)
        .duration(750)
        .attr('transform', 'translate(' + nextProps.cx + ' ' + nextProps.cy + ')');
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
          y={ 0 }
          textAnchor='middle'
          alignmentBaseline='bottom'
          fontSize={ labelSize }
          key={'cityLabelhalo' + this.props.city_id}
          className='multistroke'
          stroke={'transparent'}
          fill='transparent'
        >
          {this.props.name.replace(/\w\S*/g, txt =>  txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase())}
        </text> 
        <text
          x={ 0 }
          y={ 0 }
          textAnchor='middle'
          alignmentBaseline='bottom'
          fontSize={ labelSize / this.props.z }
          key={'cityLabel' + this.props.city_id}
          fill={ (this.props.color !== 'transparent') ? '#111' : 'transparent'}
        >
          {this.props.name.replace(/\w\S*/g, txt =>  txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase())}
        </text> 

        <text
          x={ 0 }
          y={ labelSize / this.props.z}
          textAnchor='middle'
          alignmentBaseline='top'
          fontSize={ labelSize / this.props.z * 0.7 }
          key={'cityNumsLabel' + this.props.city_id}
          fill={ (this.props.color !== 'transparent') ? '#555' : 'transparent'}
        >
          { formatNumber(this.props.value) }
        </text> 
      </g>
    );
  }
}