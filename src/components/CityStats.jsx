import * as React from 'react';
import { PropTypes } from 'react';
import CitiesStore from '../stores/CitiesStore.js';


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
    return (
      <div className='cityStats'>
        <h2>{ this.props.city + ', ' + this.props.state }</h2>
        <div 
          onClick={ this.props.onCityClicked }
          id={ null }
        >close</div>
        <ul>
        { Object.keys(this.props.categories).map(category_id => {
          if (this.props.yearsData[this.props.year] && this.props.yearsData[this.props.year][category_id]) {
            return (
              <li 
                key={ 'cat' + category_id }
                id={ category_id }
                onClick={ this.props.onCategoryClicked }
                style={ { 
                  borderBottom: '4px solid ' + CitiesStore.getCategoryColor(category_id),
                  fontWeight: (CitiesStore.getSelectedCategory() == category_id) ? "bold" : "normal",
                  backgroundColor: (CitiesStore.getSelectedCategory() == category_id) ? CitiesStore.getCategoryColor(category_id) : "transparent",
                } }
              >
                { CitiesStore.getCategoryName(category_id) + ": " + this.formatValue(this.props.yearsData[this.props.year][category_id], CitiesStore.getCategoryUnit(category_id)) }
                { (CitiesStore.getSelectedCategory() == category_id) ?
                  <ul className='projects'>
                  { Object.keys(this.props.projects).map(project_id => {
                    if (this.props.projects[project_id].yearData[this.props.year] && this.props.projects[project_id].yearData[this.props.year][category_id] > 0) {
                      return (
                        <li 
                          key={ 'project' + project_id }
                        >
                          { this.props.projects[project_id].project + ": " + this.formatValue(this.props.projects[project_id].yearData[this.props.year][category_id], CitiesStore.getCategoryUnit(category_id))}
                        </li>
                      );
                    }
                  }) }
                  </ul> :
                  ''
                 }

              </li>
            );
          }
        }) }
        </ul>
      </div>
    );
  }

}