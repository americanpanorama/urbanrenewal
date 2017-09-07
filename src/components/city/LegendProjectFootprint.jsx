import * as React from 'react';

import { getColorForRace } from '../../utils/HelperFunctions';

export default class LegendProjectFootprint extends React.Component {
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
        className='footprint'
      >
        <path 
          stroke="#5B3000" 
          strokeWidth="3" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          fill={getColorForRace(0.2)}
          fillOpacity="0.2" 
          d="M20 60L0 20L45 -10L75 40z"
          transform='translate(22 50)'
        />

        <text
          x={ centerX}
          y={ centerY - 10}
          textAnchor='middle'
          fill='black'
          className='shadow'
        >
          Project
        </text>

        <text
          x={ centerX}
          y={ centerY + 10}
          textAnchor='middle'
          fill='grey'
          fontSize='smaller'
          className='shadow'
        >
          # displacements
        </text>

      </svg>
    );
  }
}