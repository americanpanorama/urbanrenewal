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

        <h3>{ 'Family Displacements by City, ' + this.props.selectedYear }</h3>
        
        { (this.props.selectedView == 'map') ?
          <svg
            height={20}
            width={ DimensionsStore.getLegendDorlingsDimensions().width }
            style={{ position: 'absolute', left: 25, bottom: 18 }}
          >
            <line
              x1={0}
              x2={30}
              y1={(DimensionsStore.getLegendFontSize()+ 2)/2}
              y2={(DimensionsStore.getLegendFontSize()+ 2)/2}
              strokeWidth={2 }
              stroke='steelblue'
            />

            <text x={33} y={DimensionsStore.getLegendFontSize()+ 2} fontSize={DimensionsStore.getLegendFontSize()+ 2}>interstates</text>

          </svg>
          : ''
        }

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