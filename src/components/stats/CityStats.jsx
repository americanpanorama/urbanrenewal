import * as React from 'react';

import CitiesStore from '../../stores/CitiesStore.js';
import DimensionsStore from '../../stores/DimensionsStore.js';
import CityTimelineComponent from './CityTimelineComponent.jsx';
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

        <h2>{ this.props.city + ', ' + this.props.state }</h2>

        <div className='summary'>
          An estimated <strong>{ Math.round(this.props.totalFamilies).toLocaleString() + ' '}</strong> families were displaced through { converter.toWords(this.props.projectsWithDisplacements) } urban renewal projects, <strong>{' ' + Math.round(this.props.percentFamiliesOfColor * 100) + '% '}</strong> of which were families of color.
        </div>

        <div>
          { (this.props.hasProjectGeojson) ?
            'Project maps are available for this city. Click bubble to view.' :
            ''
          }
        </div>

        { (true) ? 
          <table className='population-stats'>
            <tbody>
              <tr>
                <th></th>
                <th>1950</th>
                <th>1960</th>
                <th>1970</th>
              </tr>
              <tr>
                <td>Population</td>
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
          </table> :
          ''
        }



        <CityTimelineComponent {...this.props } />
        {/* Object.keys(this.props.projects).map(project_id => {
          return (
            <div key={ 'projectDetails' + project_id }>
              <svg
                width={ DimensionsStore.getCitySnippetWidth() }
                height={20}
                
              >
                <rect
                  x={DimensionsStore.getCitySnippetWidth() * 1/3}
                  y={4}
                  width={DimensionsStore.getCitySnippetWidth()* 2/3 * this.props.projects[project_id].percentFamiliesOfColor}
                  height={12}
                  className='poc'
                />

                <rect
                  x={DimensionsStore.getCitySnippetWidth()* 1/3 + DimensionsStore.getCitySnippetWidth()* 2/3* this.props.projects[project_id].percentFamiliesOfColor}
                  y={4}
                  width={DimensionsStore.getCitySnippetWidth()* 2/3* (1 - this.props.projects[project_id].percentFamiliesOfColor) }
                  height={12}
                  className='white'
                />

                { (this.props.projects[project_id].percentFamiliesOfColor > 0.2) ?
                  <text
                    x={ DimensionsStore.getCitySnippetWidth()* 1/3 + DimensionsStore.getCitySnippetWidth()* 2/3* this.props.projects[project_id].percentFamiliesOfColor - 5 }
                    y={6}
                    textAnchor='end'
                    alignmentBaseline='hanging'
                    fontSize={ 8 }
                    fill='white'
                  >
                    { Math.round(this.props.projects[project_id].percentFamiliesOfColor * 100) + '%' }
                  </text> : ''
                }



                { (this.props.projects[project_id].percentFamiliesOfColor < 0.8) ?
                  <text
                    x={ DimensionsStore.getCitySnippetWidth()* 1/3 + DimensionsStore.getCitySnippetWidth()* 2/3* this.props.projects[project_id].percentFamiliesOfColor + 5 }
                    y={6}
                    textAnchor='beginning'
                    alignmentBaseline='hanging'
                    fontSize={ 8 }
                    fill='white'
                  >
                    { Math.round((1 -this.props.projects[project_id].percentFamiliesOfColor) * 100) + '%' }
                  </text> : ''
                }

              </svg>
              { project_id + this.props.projects[project_id].project + " " + this.props.projects[project_id].yearsData[this.props.year]['white families'] + " " + this.props.projects[project_id].yearsData[this.props.year]['non-white families'] }
            </div>
          );
        }) */}
      </div>
    );
  }

}