import * as React from 'react';
import { PropTypes } from 'react';
import CitiesStore from '../stores/CitiesStore.js';

export default class YearStats extends React.Component {

  constructor (props) {
    super(props);
  }

  componentWillReceiveProps(nextProps) {}

  componentDidMount() {}

  componentDidUpdate() {}

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
      <div className='YearStats'>
        <h2>{ this.props.year}</h2>
        <ul>
          { Object.keys(this.props.totals).map(category_id => 
            <li
              key={ 'category' + category_id }
              id={ category_id }
              onClick={ this.props.onCategoryClicked }
            >
              { CitiesStore.getCategoryName(category_id)+ ": " + this.formatValue(this.props.totals[category_id], CitiesStore.getCategoryUnit(category_id)) }
            </li>
          ) }
        </ul>
      </div>
    );
  }

}