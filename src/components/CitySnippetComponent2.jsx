import React from 'react';
import d3 from 'd3';

import CitiesStore from '../stores/CitiesStore';
import DimensionsStore from '../stores/DimensionsStore';

import { getColorForRace, formatNumber } from '../utils/HelperFunctions';

export default class CitySnippet extends React.Component {

  constructor () { super();}

  render () {    
    return (
      <div className='searchResult'>

        <svg 
          width={ DimensionsStore.getDorlingsMaxRadius() * 2 }
          height={ DimensionsStore.getDorlingsMaxRadius() * 2 }
        >
          <circle
            cx={0}
            cy={0}
            r={ DimensionsStore.getDorlingRadius(this.props.cityData.totalFamilies, {useAll: true}) }
            fill={ getColorForRace(this.props.cityData.percentFamiliesOfColor) }
            transform={'translate(' + DimensionsStore.getDorlingsMaxRadius() + ' ' + DimensionsStore.getDorlingsMaxRadius()  + ')' }
          />
          <text
            cx={0}
            cy={0}
            transform={'translate(' + DimensionsStore.getDorlingsMaxRadius() + ' ' + DimensionsStore.getDorlingsMaxRadius()  + ')' }
            textAnchor='middle'
            alignmentBaseline='middle'
          >
            { formatNumber(this.props.cityData.totalFamilies) }
          </text>
        </svg>

        <div
            style={{
              marginLeft: DimensionsStore.getDorlingsMaxRadius() * 2 + 20
            }}
        >

          <h3>{this.props.cityData.city.toUpperCase() + ', ' + this.props.cityData.state.toUpperCase() }</h3>
          <div>{ Object.keys(this.props.cityData.projects).length +  ' projects'}</div>
        </div>
      

      </div>
    );
  }
}