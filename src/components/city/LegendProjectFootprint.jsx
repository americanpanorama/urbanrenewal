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
        className='projectFootprint'
      >
        { (this.props.selectedYear) ?
          <g>
            <line
              x1={0}
              x2={20}
              y1={8}
              y2={8}
              className='boundary'
            />

            <text
              x={ 24 }
              y={ 12 }
              className='note'
            >
              { 'Active in ' + this.props.selectedYear }
            </text>

            <line
              x1={0}
              x2={20}
              y1={25}
              y2={25}
              className='boundary inactive'
            />

            <text
              x={ 24 }
              y={ 27 }
              className='note'
            >
              { 'Inactive in ' + this.props.selectedYear }
            </text>
          </g> : ''
        }


        <path 
          d="M20 60L0 20L45 -10L75 40z"
          transform='translate(22 50)'
          fill={getColorForRace(0.2)}
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

      </svg>
    );
  }
}