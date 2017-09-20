import * as React from 'react';

import DimensionsStore from  '../../stores/DimensionsStore.js';

export default class LegendDorlings extends React.Component {

  constructor (props) { super(props); }

  render() {
    return (
      <svg 
        { ...DimensionsStore.getLegendDorlingsDimensions() }  
        className='legendDorlings'
      >
          <circle
            { ...DimensionsStore.getLegendDorlingsCircleDimensions(this.props.dorlingScale) }  
            r={ DimensionsStore.getDorlingRadius(this.props.dorlingIncrements[0]) }
            fill='transparent'
            transform={"scale(" + this.props.dorlingScale +")"}
          />

          { this.props.dorlingIncrements.map((value, i) => (
            <g key={ 'dorlinglegend' + value }>
              <circle
                { ...DimensionsStore.getLegendDorlingsCircleDimensions(this.props.dorlingScale) }  
                r={ DimensionsStore.getDorlingRadius(value) }
                transform={ 'translate(0,' + ((DimensionsStore.getDorlingRadius(this.props.dorlingIncrements[0]) - DimensionsStore.getDorlingRadius(value)) * this.props.dorlingScale) + ') scale(' + this.props.dorlingScale +")"}
                fill={ 'transparent' }
                className='increment'
              />
              <text
                { ...DimensionsStore.getLegendDorlingsTextPositioning(value, this.props.dorlingScale) }
                transform={ 'scale(' + this.props.dorlingScale +")"}
              >
                { value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") }
              </text>
            </g>
          )) }
      </svg>
    );
  }
}