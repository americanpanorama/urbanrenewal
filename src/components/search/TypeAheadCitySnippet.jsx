import React from 'react';
import { AppActionTypes } from '../../utils/AppActionCreator';
import CitySnippet from './CitySnippetComponent2.jsx';

import DimensionsStore from '../../stores/DimensionsStore';


export default class TypeAheadCitySnippet extends React.Component {

  constructor () {
    super();
  }

  render () {
    return (
      <div 
        className='searchResults'
        style={ DimensionsStore.getSearchResultsStyle() }
      >

        <svg 
          width={ DimensionsStore.getCityTimelineStyle().width }
          height={50}
        >
          <text
            x={ DimensionsStore.getCityTimelineStyle().width / 2 - 5 }
            y={ 0 }
            fontWeight='bold'
            textAnchor='end'
            alignmentBaseline='hanging'
            fill='grey'
          >
            City
          </text>
          <text
            x={  DimensionsStore.getCityTimelineStyle().width / 2 - 5  }
            y={ 20 }
            textAnchor='end'
            alignmentBaseline='hanging'
            fill='grey'
            fontStyle='italic'
          >
            Bold have project footprints
          </text>


          <text
            x={ DimensionsStore.getCityTimelineStyle().width * 0.75 }
            y={ 0 }
            fontWeight='bold'
            textAnchor='middle'
            alignmentBaseline='hanging'
            fill='grey'
          >
            Families Displaced
          </text>

          <text
            x={ DimensionsStore.getCityTimelineStyle().width * 0.75 - 3 }
            y={ 20 }
            textAnchor='end'
            alignmentBaseline='hanging'
            fill='grey'
          >
            of color
          </text>

          <text
            x={ DimensionsStore.getCityTimelineStyle().width * 0.75 + 3 }
            y={ 20 }
            textAnchor='start'
            alignmentBaseline='hanging'
            fill='grey'
          >
            white
          </text>
        </svg>


        { this.props.options.map(cityData => 
          <CitySnippet 
            cityData={ cityData } 
            onCityClick={ this.props.onOptionSelected } 
            displayState={ true } 
            key={ 'city' + cityData.city_id } 
          /> 
        )}
      </div>
    );
  }
}