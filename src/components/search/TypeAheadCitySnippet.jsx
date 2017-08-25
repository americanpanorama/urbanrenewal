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