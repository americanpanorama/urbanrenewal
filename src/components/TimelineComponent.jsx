import * as React from 'react';
import { PropTypes } from 'react';

export default class Timeline extends React.Component {

  constructor (props) {
    super(props);
  }

  componentWillReceiveProps(nextProps) {

  }

  componentDidMount() {
  }

  componentDidUpdate() {
  }

  render() {
    let years = [...Array(25).keys()].map(num => num+1949);
    return (
      <div id='timeline'>
        { years.map(year => { 
          return (
            <span 
              onClick={ this.props.onClick } 
              key={ 'year' + year} 
              id={ year }
              className={ (year == this.props.year) ? 'selected' : ''}
            >
              { year - 1900 }
            </span>
          ); })
        }
      </div>
    );
  }

}