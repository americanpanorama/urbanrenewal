import * as React from 'react';
import LegendProjectFootprint from './LegendProjectFootprint.jsx';
import LegendCityNoFootprints from './LegendCityNoFootprints.jsx';

import { getColorForProjectType } from '../../utils/HelperFunctions';

export default class LegendHOLC extends React.Component {

  constructor (props) { super(props); }

  render () {
    return (
       <div className='mapLegend'>

       <LegendProjectFootprint selectedYear={ this.props.selectedYear }/>

       <div className='projectFootprint'>
          <h4>Type of Project</h4>
          <div><span className='colorkey' style={{backgroundColor: getColorForProjectType('R', 1), borderColor: getColorForProjectType('R')}}> </span>Residential "Blighted"</div>
          <div><span className='colorkey' style={{backgroundColor: getColorForProjectType('OB', 1), borderColor:getColorForProjectType('OB')}}> </span>Non-residential "Blighted"</div>
          <div><span className='colorkey' style={{backgroundColor: getColorForProjectType('O', 1), borderColor: getColorForProjectType('O')}}> </span>Open Land</div>
          <div><span className='colorkey' style={{backgroundColor: getColorForProjectType('PO', 1), borderColor:getColorForProjectType('PO')}}> </span>Predominantly Open</div>
          <div><span className='colorkey' style={{backgroundColor: getColorForProjectType('D', 1), borderColor: getColorForProjectType('D')}}> </span>Disaster Area</div>
          <div><span className='colorkey' style={{backgroundColor: getColorForProjectType('U', 1), borderColor: getColorForProjectType('U')}}> </span>University or College</div>
          <div><span className='colorkey' style={{backgroundColor: getColorForProjectType('', 1), borderColor: getColorForProjectType('')}}> </span>Unknown or Unspecified</div>
        </div>

        { (this.props.selectedYear) ?
          <div className='projectFootprint legendStage'>
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

       <div className='redlining  holc'>
          <div className='link'><a href={ this.props.miurl }>See "Mapping Inequality" to explore redlining in { this.props.city }.</a></div>
     
          <div><span className='colorkey A'> </span>A "Best"</div>
          <div><span className='colorkey B'> </span>B "Still Desirable"</div>
          <div><span className='colorkey C'> </span>C "Definitely Declining"</div>
          <div><span className='colorkey D'> </span>D "Hazardous"</div>

        </div>
      </div>
    );
  }
}