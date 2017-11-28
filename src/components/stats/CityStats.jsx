import * as React from 'react';

import DimensionsStore from '../../stores/DimensionsStore.js';
import CityTimelineComponent from './CityTimelineComponent.jsx';
import CitySnippet from '../search/CitySnippetComponent2.jsx';
import NoDisplacements from './NoDisplacementsComponent.jsx';
import converter from 'number-to-words';

import { getColorForProjectType, roughNumber } from '../../utils/HelperFunctions';

export default class CityStats extends React.Component {
  constructor (props) { super(props); }

  render() {
    const someWithNoDisplacements = (Object.keys(this.props.projects).map(project_id => this.props.projects[project_id]).filter(p => !p.totalFamilies || p.totalFamilies == 0).length > 0); 

    return (
      <div className='cityStats'>
        { (this.props.selected) ?
          <div 
            onClick={ this.props.resetView }
            className='closeicon'
          >x</div> :''
        }

        <h2>{ this.props.city.toUpperCase() + ', ' + this.props.state.toUpperCase() }</h2>

        <p className='summary'>
          By the late 1960s, an estimated <strong>{ Math.round(this.props.totalFamilies).toLocaleString() + ' '}</strong> families<br /> had been displaced by urban renewal projects in { this.props.city },<br /><strong>{' ' + Math.round(this.props.percentFamiliesOfColor * 100) + '% '}</strong> of which were families of color.
        </p>

        { (this.props.selectedYear && this.props.yearsData[this.props.selectedYear] && this.props.yearsData[this.props.selectedYear].totalFamilies > 0) ?
          <p className='summary'>
            We estimate that roughly <strong>{ roughNumber(this.props.yearsData[this.props.selectedYear].totalFamilies).toLocaleString() + ' '}</strong><br />of those families were displaced in { this.props.selectedYear }<br /> and that <strong>{' ' + Math.round(this.props.yearsData[this.props.selectedYear].percentFamiliesOfColor * 100) + '% '}</strong> of those families were of color.
          </p> : 
          <p className='summary'>&nbsp;<br />&nbsp;<br />&nbsp;</p>
        }


        <p className='footprintExplanation'>
          Project footprints are available for projects in bold below.<br />
          Hover over to highlight on map, click to select.<br />
          See map legend for key to type {(this.props.selectedYear) ? 'and stage' : ''} icon.
        </p>

        <CityTimelineComponent {...this.props } />

        { (someWithNoDisplacements) ? 
          <div>
            <p className='footprintExplanation'>The following projects either did not involve displacements or happened after 1966 when the federal government stopped collecting displacement data.</p>
            <NoDisplacements {...this.props} />
          </div> : ''
        }

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
                  <td className='total' key='total1950'>{ (this.props.pop_1950) ? this.props.pop_1950.toLocaleString() : 'not available'}</td>
                  <td className='total' key='total1960'>{ (this.props.pop_1960) ? this.props.pop_1960.toLocaleString() : 'not available'}</td>
                  <td className='total' key='total1970'>{ (this.props.pop_1970) ? this.props.pop_1970.toLocaleString() : 'not available'}</td>
                </tr>

                <tr>
                  <td>white</td>
                  <td>not available</td>
                  <td>{ (this.props.white_1960 && this.props.pop_1960) ? Math.round(1000 * this.props.white_1960 / this.props.pop_1960) / 10  + '%' : ''}</td>
                  <td>{ (this.props.white_1970 && this.props.pop_1970) ? Math.round(1000 * this.props.white_1970 / this.props.pop_1970) / 10  + '%' : ''}</td>
                </tr>

                <tr>
                  <td>of color</td>
                  <td>not available</td>
                  <td>{ (this.props.nonwhite_1960 && this.props.pop_1960) ? Math.round(1000 * this.props.nonwhite_1960 / this.props.pop_1960) / 10  + '%' : ''}</td>
                  <td>{ (this.props.nonwhite_1970 && this.props.pop_1970) ? Math.round(1000 * this.props.nonwhite_1970 / this.props.pop_1970) / 10  + '%' : ''}</td>
                </tr>

                
              </tbody>
            </table>
          </div> :
          ''
        }

        { (this.props.otherCities.length > 1) ?
          <div>
            <h3>Nearby Cities</h3>
            { Object.keys(this.props.otherCities).map(otherCityId => {
              if (this.props.otherCities[otherCityId].city_id !== this.props.city_id) {
                return (
                  <CitySnippet 
                    cityData={ this.props.otherCities[otherCityId] } 
                    onCityClick={ this.props.onCityClicked } 
                    displayState={ true } 
                    key={ 'city' + otherCityId } 
                  /> 
                );
              }
            })}  
          </div> : ''
        }
      </div>
    );
  }

}