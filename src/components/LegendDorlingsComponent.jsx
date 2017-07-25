import * as React from 'react';
import * as d3 from 'd3';
import Handle from './HandleComponent.jsx';
import CitiesStore from '../stores/CitiesStore.js';
import DimensionsStore from  '../stores/DimensionsStore.js';
import { getColorForRace } from '../utils/HelperFunctions.js';

export default class LegendDorlings extends React.Component {

  constructor (props) { super(props); }

  render() {
    let maxValue = 1,
      maxLegendDorling = 1,
      legendIncrements = [1];
    if (CitiesStore.getSelectedCategory() == 'funding') {
      maxValue = CitiesStore.getCategoryMaxForCity('urban renewal grants dispursed');
      maxLegendDorling = 200000000;
      legendIncrements = [maxLegendDorling, 100000000, 50000000, 10000000, 1000000];
    } else {
      maxValue = CitiesStore.getCategoryMaxForCity('totalFamilies');
      maxLegendDorling = 4000;
      legendIncrements = [maxLegendDorling, 2500, 1000, 100];
    }

    let r =  d3.scale.sqrt()
      .domain([0, maxValue])
      .range([0, 50]);
      
    return (
      <svg 
        { ...DimensionsStore.getLegendDorlingsDimensions() }  
        className='legendDorlings'
      >
          <circle
            { ...DimensionsStore.getLegendDorlingsCircleDimensions() }  
            r={ DimensionsStore.getDorlingRadius(maxLegendDorling) }
            key='dorlinglegendbackground'
            className={ CitiesStore.getSelectedCategory() }
          />

          { legendIncrements.map((value, i) => (
            <g key={ 'dorlinglegend' + value }>
              <circle
                { ...DimensionsStore.getLegendDorlingsCircleDimensions() }  
                r={ DimensionsStore.getDorlingRadius(value) }
                transform={ 'translate(0,' + (DimensionsStore.getDorlingRadius(maxLegendDorling) - DimensionsStore.getDorlingRadius(value)) + ')'}
                fill={ 'transparent' }
                className='increment'
                
              />
              <text
                { ...DimensionsStore.getLegendDorlingsTextPositioning(value, maxLegendDorling) }
              >
                { (CitiesStore.getSelectedCategory() == 'families') ? value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + ' families' : '$' + (value/1000000) + 'M' }
              </text>

              />
            </g>
          )) }
      </svg>
    );
  }

}