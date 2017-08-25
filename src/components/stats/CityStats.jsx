import * as React from 'react';

import DimensionsStore from '../../stores/DimensionsStore.js';
import CityTimelineComponent from './CityTimelineComponent.jsx';
import NoDisplacements from './NoDisplacementsComponent.jsx';
import converter from 'number-to-words';

export default class CityStats extends React.Component {
  constructor (props) { super(props); }

  render() {
    return (
      <div className='cityStats'>
        <div 
          onClick={ this.props.onCityClicked }
          id={ null }
          className='closeicon'
        >x</div>

        <h2>{ this.props.city + ', ' + this.props.state.toUpperCase() }</h2>

        <p className='summary'>
          An estimated <strong>{ Math.round(this.props.totalFamilies).toLocaleString() + ' '}</strong> families were displaced,<br /><strong>{' ' + Math.round(this.props.percentFamiliesOfColor * 100) + '% '}</strong> of which were families of color.
        </p>

        <p className='footprintExplanation'>Project footprints are available for project in bold below.<br /> Hover over to highlight on map.</p>

        <CityTimelineComponent {...this.props } />

        <p className='footprintExplanation'>The following projects either did not involve displacements or happened after 1966 when the federal government stopped collecting displacement data.</p>

        <NoDisplacements {...this.props} />


        { (true) ? 
          <div>
            <h3>Population</h3>
            <table className='population-stats'>
              <tbody>
                <tr>
                  <th></th>
                  <th>1950</th>
                  <th>1960</th>
                  <th>1970</th>
                </tr>
                <tr>
                  <td>total</td>
                  <td className='total' key='total1950'>{ this.props.pop_1950.toLocaleString() }</td>
                  <td className='total' key='total1960'>{ this.props.pop_1960.toLocaleString()}</td>
                  <td className='total' key='total1970'>{ this.props.pop_1970.toLocaleString()}</td>
                </tr>

                <tr>
                  <td>white</td>
                  <td>not available</td>
                  <td>{ Math.round(1000 * this.props.white_1960 / this.props.pop_1960) / 10  + '%'}</td>
                  <td>{ Math.round(1000 * this.props.white_1970 / this.props.pop_1970) / 10  + '%'}</td>
                </tr>

                <tr>
                  <td>of color</td>
                  <td>not available</td>
                  <td>{ Math.round(1000 * this.props.nonwhite_1960 / this.props.pop_1960) / 10  + '%'}</td>
                  <td>{ Math.round(1000 * this.props.nonwhite_1970 / this.props.pop_1970) / 10  + '%'}</td>
                </tr>

                
              </tbody>
            </table>
          </div> :
          ''
        }
      </div>
    );
  }

}