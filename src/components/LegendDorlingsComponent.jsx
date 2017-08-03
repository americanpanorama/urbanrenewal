import * as React from 'react';
import * as d3 from 'd3';
import Handle from './HandleComponent.jsx';
import CitiesStore from '../stores/CitiesStore.js';
import GeographyStore from '../stores/GeographyStore.js';
import DimensionsStore from  '../stores/DimensionsStore.js';
import { getColorForRace } from '../utils/HelperFunctions.js';

export default class LegendDorlings extends React.Component {

  constructor (props) { super(props); }

  render() {
    let maxValue = 1,
      maxLegendDorling = 1,
      legendIncrements = [1],
      scale = (CitiesStore.getSelectedView() == 'cartogram') ? GeographyStore.getZ() : 1,
      maxRepresentable = DimensionsStore.getValueFromDorlingRadius(DimensionsStore.getDorlingsMaxRadius()) / scale;
    // get the value for the max radius

    legendIncrements = DimensionsStore.getLegendDimensionsIntervals();
    maxLegendDorling = legendIncrements[0];

    console.log(maxRepresentable);
    if (CitiesStore.getSelectedCategory() == 'funding') {
      maxValue = CitiesStore.getCategoryMaxForCity('urban renewal grants dispursed');
      //maxLegendDorling = 200000000;
      //legendIncrements = [maxLegendDorling, 100000000, 50000000, 10000000, 1000000];
    } else {
      maxValue = CitiesStore.getCategoryMaxForCity('totalFamilies');
      //maxLegendDorling = 3000;
      //legendIncrements = [maxLegendDorling, 1500, 500, 100];
    }

    let r =  d3.scale.sqrt()
      .domain([0, maxValue])
      .range([0, 50]);

    console.log(DimensionsStore.getLegendDorlingsDimensions(), DimensionsStore.getLegendDorlingsCircleDimensions());
      
    return (
      <svg 
        { ...DimensionsStore.getLegendDorlingsDimensions() }  
        className='legendDorlings'
      >
          <circle
            { ...DimensionsStore.getLegendDorlingsCircleDimensions(scale) }  
            r={ DimensionsStore.getDorlingRadius(maxLegendDorling) }
            key='dorlinglegendbackground'
            className={ CitiesStore.getSelectedCategory() }
            transform={"scale(" + ((CitiesStore.getSelectedView() == 'cartogram') ? GeographyStore.getZ() : 1) +")"}
          />

          { legendIncrements.map((value, i) => (
            <g key={ 'dorlinglegend' + value }>
              <circle
                { ...DimensionsStore.getLegendDorlingsCircleDimensions(scale) }  
                r={ DimensionsStore.getDorlingRadius(value) }
                transform={ 'translate(0,' + ((DimensionsStore.getDorlingRadius(maxLegendDorling) - DimensionsStore.getDorlingRadius(value)) * scale) + ') scale(' + ((CitiesStore.getSelectedView() == 'cartogram') ? GeographyStore.getZ() : 1) +")"}
                fill={ 'transparent' }
                className='increment'
                
              />
              <text
                { ...DimensionsStore.getLegendDorlingsTextPositioning(value, scale) }
                transform={ 'scale(' + ((CitiesStore.getSelectedView() == 'cartogram') ? GeographyStore.getZ() : 1) +")"}
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