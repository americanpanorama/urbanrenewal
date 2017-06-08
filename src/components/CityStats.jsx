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
        { Object.keys(this.props.projects).map(project_id => {
          if (this.props.projects[project_id].yearsData[this.props.year] && (this.props.projects[project_id].yearsData[this.props.year]['white families'] || this.props.projects[project_id].yearsData[this.props.year]['non-white families'])) {
            return (
              <div>
                { project_id + this.props.projects[project_id].project + " " + this.props.projects[project_id].yearsData[this.props.year]['white families'] + " " + this.props.projects[project_id].yearsData[this.props.year]['non-white families']}
              </div>
            );
          }
        })


        }
      </div>
    );
  }

}