import React from 'react';
import d3 from 'd3';

import DimensionsStore from '../../stores/DimensionsStore';

import { getColorForRace, formatNumber } from '../../utils/HelperFunctions';

export default class CitySnippet extends React.Component {

  constructor () { super();}

  render () {
    return (
      <div 
        className='searchResult'
        onClick={ this.props.onCityClick }
        id={ this.props.projectData.project_id }
      >
        <svg 
          width={ DimensionsStore.getDorlingsMaxRadius() * 2 }
          height={ DimensionsStore.getDorlingsMaxRadius() * 2 }
        >
          <circle
            cx={0}
            cy={0}
            r={ DimensionsStore.getDorlingRadius(this.props.projectData.totalFamilies, {useAll: true}) }
            fill={ getColorForRace(this.props.projectData.percentFamiliesOfColor) }
            transform={'translate(' + DimensionsStore.getDorlingsMaxRadius() + ' ' + DimensionsStore.getDorlingsMaxRadius()  + ')' }
          />
          <text
            cx={0}
            cy={0}
            transform={'translate(' + DimensionsStore.getDorlingsMaxRadius() + ' ' + DimensionsStore.getDorlingsMaxRadius()  + ')' }
            textAnchor='middle'
            alignmentBaseline='middle'
          >
            { formatNumber(this.props.projectData.totalFamilies) }
          </text>
        </svg>

        <div
            style={{
              marginLeft: DimensionsStore.getDorlingsMaxRadius() * 2 + 20
            }}
        >

          <h3>{ this.props.projectData.project.toUpperCase() }</h3>
          
        </div>
      

      </div>
    );
  }
}