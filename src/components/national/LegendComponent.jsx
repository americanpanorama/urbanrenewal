import * as React from 'react';
import ReactDOM from 'react-dom';
import * as d3 from 'd3';

import LegendGradient from './LegendGradientComponent.jsx';
import LegendDorlings from './LegendDorlingsComponent.jsx';

import DimensionsStore from '../../stores/DimensionsStore';

export default class LegendAndControls extends React.Component {

  constructor (props) {
    super(props);
  }

  render () {
    return (
      <div 
        className='mapLegend'
        style={ DimensionsStore.getLegendDimensions() }
      >

        <h3>{ 'FAMILIES DISPLACED, ' + this.props.selectedYear }</h3>
        

        <LegendDorlings 
          dorlingScale={ this.props.dorlingScale }
          dorlingIncrements={ this.props.dorlingIncrements }
        />
        <LegendGradient
          poc={ this.props.poc }
          onDragUpdate={ this.props.onDragUpdate }
        />
      </div> 
    );
  }
}