import * as React from 'react';
import LegendProjectFootprint from './LegendProjectFootprint.jsx';
import LegendCityNoFootprints from './LegendCityNoFootprints.jsx';

import { getColorForRace } from '../../utils/HelperFunctions';

export default class LegendRaceAndIncome extends React.Component {

  render () {
    return (
      <div 
        className='mapLegend demographics'
      >
       <LegendProjectFootprint selectedYear={ this.props.selectedYear } />
       <LegendCityNoFootprints />

        <span className='tooltip'>The poverty line in 1960 was approximately $3000 for average-sized families. Census tracts with no families below $3000 in annual income are full transparent, invisible. The deeper the color the higher percentage of families whose income was below the poverty line.</span>
        <svg
          width={150}
          height={130}
          className='demographics'
        >

          { [0,1,2,3,4].map(income => {
            return (
              [1,0.75,0.5,0.25,0].map((perc, i) => {
                return (
                  <rect
                    x={30 + i * 15}
                    y={25 + income * 15}
                    width={15}
                    height={15}
                    fill={ getColorForRace(perc) }
                    fillOpacity={ (0.9 - 0.9 * (income * 2500 / 10000)) }
                    stroke={ getColorForRace(perc) }
                  />
                );
              })
            );
          })}
          <text
            x={16}
            y={62.5}
            transform='rotate(270 16,62.5)'
            fill='black'
          >
            Greater Poverty →
          </text>
          <text
            x={113}
            y={39.5}
            className='quantities y'
          >
            100%
          </text>
          <text
            x={113}
            y={99.5}
            className='quantities y'
          >
            0%
          </text>
          <text
            x={30 + (75/2)}
            y={16}
          >
            Race
          </text>
          <text
            x={37.5}
            y={112}
            className='quantities'
          >
            100%
          </text>
          <text
            x={37.5}
            y={124}
            className='quantities'
          >
            of color
          </text>
          <text
            x={97.5}
            y={112}
            className='quantities'
          >
            100%
          </text>
          <text
            x={97.5}
            y={124}
            className='quantities'
          >
            white
          </text>
        </svg>
      </div> 
    );
  }
}