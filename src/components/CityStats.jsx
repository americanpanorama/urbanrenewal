import * as React from 'react';
import { PropTypes } from 'react';

export default class CityStats extends React.Component {

  constructor (props) {
    super(props);
  }

  componentWillReceiveProps(nextProps) {

  }

  componentDidMount() {
  }

  componentDidUpdate() {
  }

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
        <ul>
        { this.props.categories.map(category => {
          if (this.props.yearsData[this.props.year][category.category]) {
            return (
              <li key={ 'cat' + category.category_id }>{ category.category + ": " + this.formatValue(this.props.yearsData[this.props.year][category.category], category.unit) }</li>
            );
          }
        }) }
        </ul>
        <h3>Projects</h3>
        <ul>
        { Object.keys(this.props.projects).map(project_id => {
          if (this.props.projects[project_id].yearData[this.props.year]) {
            return (
              <li key={ 'project' + project_id }>{ this.props.projects[project_id].project }</li>
            );
          }
        }) }
        </ul>
      </div>
    );
  }

}