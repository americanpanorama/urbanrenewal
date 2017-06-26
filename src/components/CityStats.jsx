import * as React from 'react';
import { PropTypes } from 'react';
import CitiesStore from '../stores/CitiesStore.js';
import DimensionsStore from '../stores/DimensionsStore.js';
import CityTimelineComponent from './CityTimelineComponent.jsx';


export default class CityStats extends React.Component {
  constructor (props) { super(props); }

  formatValue(value, category) {
    let formatted = '';
    switch(category) {
    case 'dollars':
      formatted = '$';
      break;
    }
    formatted += value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");

    return formatted;
  }

  render() {
    console.log(this.props);
    return (
      <div className='cityStats'>
        <h2>{ this.props.city + ', ' + this.props.state }</h2>
        <div 
          onClick={ this.props.onCityClicked }
          id={ null }
        >close</div>

        <div>
          { Math.round(this.props.totalFamilies).toLocaleString() + ' families displaced, ' + Math.round(this.props.percentFamiliesOfColor * 100) + '% of which were families of color.'}
        </div>



        <CityTimelineComponent {...this.props } style={{width: 200}}/>
        { Object.keys(this.props.projects).map(project_id => {
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
              {/* project_id + this.props.projects[project_id].project + " " + this.props.projects[project_id].yearsData[this.props.year]['white families'] + " " + this.props.projects[project_id].yearsData[this.props.year]['non-white families'] */}
            </div>
          );
        })


        }
      </div>
    );
  }

}