import React from 'react';
import d3 from 'd3';

import DimensionsStore from '../../stores/DimensionsStore';

import { getColorForRace, formatNumber } from '../../utils/HelperFunctions';

export default class CitySnippet extends React.Component {

  constructor () { super();}

  render () {
    let theMax=17383;
    return (
      <div
        className='searchResult'
        onClick={ this.props.onCityClick }
        id={ this.props.cityData.city_id }
        style={{
          width: DimensionsStore.getCityTimelineStyle().width,
          height: 30
        }}
      >
        <svg 
          width={ DimensionsStore.getCityTimelineStyle().width }
          height={30}
        >
            <text
              x={ DimensionsStore.getCityTimelineStyle().width / 2 - 5}
              y={ 24 }
              className={ (this.props.cityData.hasProjectGeojson) ? 'city hasProjectGeojson' : 'city' }
            >
              { this.props.cityData.city + ', ' +  this.props.cityData.state.toUpperCase() }
            </text>

            <line
              x1={ DimensionsStore.getCityTimelineStyle().width * 0.75 }
              x2={ DimensionsStore.getCityTimelineStyle().width * 0.75 }
              y1={0}
              y2={30}
              className='divider'
            />


            { (this.props.cityData.state !== 'pr' && this.props.cityData.state !== 'vi') ?
              <g>
                <rect
                  x={DimensionsStore.getCityTimelineStyle().width * 0.75  - ((this.props.cityData.nonwhite || 0) / theMax) * DimensionsStore.getCityTimelineStyle().width / 6}
                  y={6}
                  width={ ((this.props.cityData.nonwhite || 0) / theMax) * DimensionsStore.getCityTimelineStyle().width / 6 }
                  height={14}
                  className='poc'
                />
                <text
                  x={ DimensionsStore.getCityTimelineStyle().width * 0.75  - ((this.props.cityData.nonwhite || 0) / theMax) * DimensionsStore.getCityTimelineStyle().width / 6 - 3}
                  y={ 19 }
                  className='count poc'
                >
                  { formatNumber(this.props.cityData.nonwhite) }
                </text>
                <rect
                  x={DimensionsStore.getCityTimelineStyle().width * 0.75}
                  y={6}
                  width={ ((this.props.cityData.whites || 0) / theMax) * DimensionsStore.getCityTimelineStyle().width / 6 }
                  height={14}
                  className='white'
                />
                <text
                  x={ DimensionsStore.getCityTimelineStyle().width * 0.75 + ((this.props.cityData.whites || 0) / theMax) * DimensionsStore.getCityTimelineStyle().width / 6 + 3}
                  y={ `19` }
                  className='count white'
                >
                  { formatNumber(this.props.cityData.whites) }
                </text>
              </g> :
              <g>
                <rect
                  x={DimensionsStore.getCityTimelineStyle().width * 0.75 - (this.props.cityData.totalFamilies / theMax) * DimensionsStore.getCityTimelineStyle().width / 12}
                  y={6} 
                  width={ (this.props.cityData.totalFamilies / theMax) * DimensionsStore.getCityTimelineStyle().width / 6 }
                  height={14}
                  className='territory'
                />
                <text
                  x={ DimensionsStore.getCityTimelineStyle().width * 0.75 - (this.props.cityData.totalFamilies / theMax) * DimensionsStore.getCityTimelineStyle().width / 12- 3}
                  y={ 19 }
                  className='count territory'
                >
                  { formatNumber(this.props.cityData.totalFamilies) }
                </text>
                <text
                  x={ DimensionsStore.getCityTimelineStyle().width * 0.75 + (this.props.cityData.totalFamilies / theMax) * DimensionsStore.getCityTimelineStyle().width / 12 + 3}
                  y={ 19 }
                  className='count'
                >
                  (no racial data collected)
                </text>
              </g>

            }


        </svg>
      </div>

    );
  }
}