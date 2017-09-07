import * as React from 'react';

import { getColorForRace } from '../../utils/HelperFunctions';

export default class LegendCityNoFootprints extends React.Component {
  render () {
    const width=120,
      centerX = width /2,
      height=130,
      header=30,
      centerY=header + (height-header)/2;
    return (
       <svg
        width={width}
        height={height}
        className='cityMapBubble footprint'
      >
        <text
          x={ centerX }
          y={ 0 }
          textAnchor='middle'
          alignmentBaseline='hanging'
          fill='grey'
          fontStyle='italic'
        >
          No project maps yet 
        </text>

        <text
          x={ centerX }
          y={ 15 }
          textAnchor='middle'
          alignmentBaseline='hanging'
          fill='grey'
          fontStyle='italic'
        >
          available for these cities
        </text>

        <circle
          cx={ centerX }
          cy={ centerY}
          r={25}
          fill={getColorForRace(0.7)}
        />

        <text
          x={ centerX }
          y={ centerY - 20}
          textAnchor='middle'
          fill='black'
          className='shadow'
        >
          CITY
        </text>

        <text
          x={ centerX }
          y={ centerY }
          textAnchor='middle'
          fill='grey'
          className='shadow'
          fontSize='smaller'
        >
          # displacements
        </text>

        <text
          x={ centerX }
          y={ centerY + 20}
          textAnchor='middle'
          fill='black'
          className='shadow'
        >
          # projects
        </text>



      </svg>
    );
  }
}