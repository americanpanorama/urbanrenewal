import * as React from 'react';
import { getColorForRace } from '../../utils/HelperFunctions';

export default class LegendRaceAndIncome extends React.Component {

  render () {
    return (
      <div 
        className='mapLegend demographics'
      >
        <span className='tooltip'>The poverty line in 1960 was approximately $3000 for average-sized families. Census tracts with no families below $3000 in annual income are full transparent, invisible. The deeper the color the higher percentage of families whose income was below the poverty line.</span>
        <svg
          width={135}
          height={130}
          style={{ margin: '10px 0 0 5px' }}
        >

          { [0,1,2,3,4].map(income => {
            return (
              [1,0.75,0.5,0.25,0].map((perc, i) => {
                return (
                  <rect
                    x={25 + income * 15}
                    y={20 + i * 15}
                    width={15}
                    height={15}
                    fill={ getColorForRace(perc) }
                    fillOpacity={ (0.9 - 0.9 * (income * 2500 / 10000)) }
                    stroke={ getColorForRace(perc) }
                    strokeWidth={0.5}
                    strokeOpacity={0.1}
                  />
                );
              })
            );
          })}
          <text
            x={0}
            y={62.5}
            textAnchor='middle'
            alignmentBaseline='hanging'
            transform='rotate(270 0,57.5)'
            fill='black'
          >
            people of color
          </text>
          <text
            x={103}
            y={20}
            alignmentBaseline='hanging'
            fill='black'
            fontSize='0.9em'
          >
            100%
          </text>
          <text
            x={103}
            y={95}
            alignmentBaseline='baseline'
            fill='black'
            fontSize='0.9em'
          >
            0%
          </text>
          <text
            x={25 + (75/2)}
            y={0}
            textAnchor='middle'
            alignmentBaseline='hanging'
            fill='black'
          >
            families impoverished
          </text>
          <text
            x={25 + 15/2}
            y={20 + 77}
            textAnchor='middle'
            alignmentBaseline='hanging'
            fill='black'
            fontSize='0.9em'
          >
            100%
          </text>
          <text
            x={25 + 75 - 15/2}
            y={20 + 77}
            textAnchor='middle'
            alignmentBaseline='hanging'
            fill='black'
            fontSize='0.9em'
          >
            0%
          </text>b
        </svg>
      </div> 
    );
  }
}