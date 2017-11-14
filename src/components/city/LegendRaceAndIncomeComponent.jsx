import * as React from 'react';
import LegendProjectFootprint from './LegendProjectFootprint.jsx';
import LegendCityNoFootprints from './LegendCityNoFootprints.jsx';

import { getColorForRace, getColorForProjectType } from '../../utils/HelperFunctions';

export default class LegendRaceAndIncome extends React.Component {

  render () {
    return (
      <div 
        className='mapLegend demographics'
      >

       <LegendProjectFootprint selectedYear={ this.props.selectedYear } />

      <div className='projectFootprint'>
        <h4>Type of Project</h4>
        <div>
          <span className='colorkey' style={{backgroundColor: getColorForProjectType('R', 1), borderColor: getColorForProjectType('R')}}> </span>
          Residential "Blighted"
          <span className='tooltip projectType'>"'slum area or deteriorated or deteriorating area' predominately residential in character"</span>
        </div>
        <div>
          <span className='colorkey' style={{backgroundColor: getColorForProjectType('OB', 1), borderColor:getColorForProjectType('OB')}}> </span>
          Non-residential "Blighted"
          <span className='tooltip projectType'>"'slum area or deteriorated or deteriorating area' other than an area predominately residential in character"</span>
        </div>
        <div>
          <span className='colorkey' style={{backgroundColor: getColorForProjectType('O', 1), borderColor: getColorForProjectType('O')}}> </span>
          Open Land
          <span className='tooltip projectType'>"open land necessary for sound community growth which is to be developed for predominantly residential uses"</span>
        </div>
        <div>
          <span className='colorkey' style={{backgroundColor: getColorForProjectType('PO', 1), borderColor:getColorForProjectType('PO')}}> </span>
          Predominantly Open
          <span className='tooltip projectType'>"land which is predominantly open and which because of obsolete platting, diversity of ownership, deterioration of structures or of site improvements, or otherwise, substantially impairs or arrest the sound growth fo the community"</span>
        </div>
        <div>
          <span className='colorkey' style={{backgroundColor: getColorForProjectType('D', 1), borderColor: getColorForProjectType('D')}}> </span>
          Disaster Area
          <span className='tooltip projectType'>"disaster area, for whith assistance is authorized under Title I of the Housing Act of 1949, as amended by the Housing Act of 1956"</span>
        </div>
        <div>
          <span className='colorkey' style={{backgroundColor: getColorForProjectType('U', 1), borderColor: getColorForProjectType('U')}}> </span>
          University or College
          <span className='tooltip projectType'>"urban renewal project (located in or near a college or university area) assisted under Section 112, added to Title I of the Housing Act of 1959"</span>
        </div>
        <div><span className='colorkey' style={{backgroundColor: getColorForProjectType('', 1), borderColor: getColorForProjectType('')}}> </span>Unknown or Unspecified</div>

      </div>

      <LegendCityNoFootprints />

      <div className='gradient'>
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

          <span className='tooltip'>The poverty line in 1960 was approximately $3000 for average-sized families. Census tracts with no families below $3000 in annual income are full transparent, invisible. The deeper the color the higher percentage of families whose income was below the poverty line.</span>
        </div>
      </div> 
    );
  }
}