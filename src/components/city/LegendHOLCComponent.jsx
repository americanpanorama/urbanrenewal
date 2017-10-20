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

       <LegendCityNoFootprints />

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