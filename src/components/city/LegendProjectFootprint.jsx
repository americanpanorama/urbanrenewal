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
        { (this.props.selectedYear) ?
          <g>
            <line
              x1={0}
              x2={20}
              y1={8}
              y2={8}
              strokeWidth={3}
              stroke='black'
            />

            <text
              x={ 24 }
              y={ 0 }
              textAnchor='start'
              alignmentBaseline='hanging'
              fill='grey'
              fontStyle='italic'
            >
              { 'Active in ' + this.props.selectedYear }
            </text>

            <line
              x1={0}
              x2={20}
              y1={25}
              y2={25}
              strokeWidth={3}
              stroke='black'
              strokeDasharray='5, 10'
            />

            <text
              x={ 24 }
              y={ 15 }
              textAnchor='start'
              alignmentBaseline='hanging'
              fill='grey'
              fontStyle='italic'
            >
              { 'Inactive in ' + this.props.selectedYear }
            </text>
          </g> : ''
        }


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