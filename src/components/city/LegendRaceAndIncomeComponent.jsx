import * as React from 'react';
import LegendProjectFootprint from './LegendProjectFootprint.jsx';
import LegendCityNoFootprints from './LegendCityNoFootprints.jsx';

import DimensionsStore from '../../stores/DimensionsStore';

import { getColorForRace, getColorForProjectType } from '../../utils/HelperFunctions';

export default class LegendRaceAndIncome extends React.Component {

  render () {
    return (
      <div 
        className='mapLegend demographics'
        style={{
          maxWidth: DimensionsStore.getMapDimensions().width - 20
        }}
      >
        <div className='legendComponents'>

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

        { (this.props.selectedYear) ?
          <div className='projectFootprint'>
            <h4>Stage of Project</h4>
            <div>
              <svg width={65} height={20}>
                <line
                  x1={0}
                  x2={40}
                  y1={10}
                  y2={10}
                  strokeWidth={3}
                  stroke='black'
                />
                <circle
                  cx={ 53 }
                  cy={ 10 }
                  r={8}
                  fill='transparent'
                  stroke={ getColorForProjectType('R') }
                  strokeWidth={2}
                /> 
                <text
                  x={53}
                  y={15}
                  className={'stage completed ' }
                >
                  C
                </text>
              </svg> 
              Completed
              <span className='tooltip projectType'>"'slum area or deteriorated or deteriorating area' predominately residential in character"</span>
            </div>
            <div>
              <svg width={65} height={20}>
                <line
                  x1={0}
                  x2={40}
                  y1={10}
                  y2={10}
                  strokeWidth={3}
                  stroke='black'
                  strokeDasharray='15 5'
                />
                <circle
                  cx={ 53 }
                  cy={ 10 }
                  r={8}
                  fill={ getColorForProjectType('R') }
                  stroke={ getColorForProjectType('R') }
                  strokeWidth={2}
                /> 
                <text
                  x={53}
                  y={15}
                  className={'stage' }
                >
                  A
                </text>
              </svg> 
              Actively Executing
              <span className='tooltip projectType'>"'slum area or deteriorated or deteriorating area' other than an area predominately residential in character"</span>
            </div>
            <div>
              <svg width={65} height={20}>
                <line
                  x1={0}
                  x2={40}
                  y1={10}
                  y2={10}
                  strokeWidth={3}
                  stroke='black'
                  strokeDasharray='2 5'
                />
                <circle
                  cx={ 53 }
                  cy={ 10 }
                  r={8}
                  fill={ getColorForProjectType('R') }
                  stroke={ getColorForProjectType('R') }
                  strokeWidth={2}
                /> 
                <text
                  x={53}
                  y={15}
                  className={'stage' }
                >
                  P
                </text>
              </svg> 
              Planning stage
              <span className='tooltip projectType'>"open land necessary for sound community growth which is to be developed for predominantly residential uses"</span>
            </div>
            <div>
              <svg width={65} height={20}>
                <line
                  x1={0}
                  x2={40}
                  y1={10}
                  y2={10}
                  strokeWidth={1}
                  stroke='black'
                  strokeDasharray='2 5'
                />
                <circle
                  cx={ 53 }
                  cy={ 10 }
                  r={8}
                  fill='transparent'
                  stroke={ getColorForProjectType('R') }
                  strokeWidth={2}
                /> 
                <text
                  x={53}
                  y={15}
                  className={'stage completed ' }
                >
                  F
                </text>
              </svg> 
              Future, post-{ this.props.selectedYear }
              <span className='tooltip projectType'>"land which is predominantly open and which because of obsolete platting, diversity of ownership, deterioration of structures or of site improvements, or otherwise, substantially impairs or arrest the sound growth fo the community"</span>
            </div>
          </div> : ''
        }


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
      </div> 
    );
  }
}