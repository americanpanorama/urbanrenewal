import * as React from 'react';

import { getColorForRace, getColorForProjectType } from '../../utils/HelperFunctions';

export default class LegendProjectFootprint extends React.Component {
  render () {
    const width=120,
      centerX = width /2,
      height=130,
      header=0,
      centerY=45;

    return (
      <svg
        width={width}
        height={height}
        className='projectFootprint'
      >
        <path 
          d="M0 48L0 20L55 -10L110 48z"
          transform='translate(10 12)'
          fill={getColorForRace(0.2)}
          stroke={ getColorForProjectType('R') }
          className='boundary'
        />

        <text
          x={ centerX}
          y={ centerY - 10}
          className='shadow name'
        >
          Project
        </text>

        <text
          x={ centerX}
          y={ centerY + 10}
          className='shadow displacements'
        >
          # displacements
        </text>

        <g transform='translate(0 60)'>

          <circle
            cx={ centerX }
            cy={ centerY}
            r={25}
            fill={getColorForRace(0.7)}
          />

          <text
            x={ centerX }
            y={ centerY - 20}
            className='shadow name'
          >
            CITY (no maps)
          </text>

          <text
            x={ centerX }
            y={ centerY }
            className='shadow displacements'
          >
            # displacements
          </text>

          <text
            x={ centerX }
            y={ centerY + 20}
            className='shadow'
          >
            # projects
          </text>
        </g>

      </svg>
    );
  }
}