import * as React from 'react';
import { PropTypes } from 'react';
import * as d3 from 'd3';
import ReactTransitionGroup from 'react-addons-transition-group';
import { getColorForRace } from '../utils/HelperFunctions';

import DimensionsStore from '../stores/DimensionsStore';

export default class Timeline extends React.Component {

  constructor (props) { super(props); }

  componentWillReceiveProps(nextProps) {}

  componentDidMount() {}

  componentDidUpdate() {}

  _calculateTickInterval(value) {
    let interval = -1;
    for (let num = 1; num <= 1000000000; num = num*10) {
      [1, 2.5, 5].forEach(multiplier => {
        let testNum = num * multiplier;
        if (interval == -1 && value / testNum <= 4 && value / testNum >= 1) {
          interval = testNum;
        }
      });
    }
    
    return interval;
  }

  render() {
    const years = [1955,1956,1957,1958,1959,1960,1961,1962,1963,1964,1965,1966];

    console.log(this.props);
    return (
      <svg 
        { ...DimensionsStore.getTimelineAttrs() }
        id='timeline'
      >

        {/* year labels */}
        { years.map(year => {
          let className = (year < this.props.yearSpan[0] || year > this.props.yearSpan[1]) ? 'yearLabel inactive' : (year == this.props.state.year) ? 'yearLabel selected' : 'yearLabel';
          return (
            <text
              dx={ DimensionsStore.getMainTimelineLabelXOffset(year) }
              dy={ DimensionsStore.getMainTimelineLabelY() }
              fill={ (year < this.props.yearSpan[0] || year > this.props.yearSpan[1]) ? '#454545' : (year == this.props.state.year) ? 'yellow' : 'white' }
              fontSize={ 14 }
              onClick={ this.props.onClick }
              id={ year }
              key={ 'year' + year }
              className={ className }
            >
              { (year % 5 == 0) ? year : "'" + (year - 1900) }
            </text>
          );
        })}

        {/* year bars */}
        <g className='bars'>
          { years.map(year => {
            if (this.props.yearsData[year]) {
              return (
                <rect
                  x={ DimensionsStore.getMainTimlineBarXOffset(year) }
                  y={ DimensionsStore.getMainTimelineBarY(year) }
                  width={ DimensionsStore.getMainTimelineBarWidth() }
                  height={ DimensionsStore.getMainTimelineBarHeight(year) }
                  fill={ 'blue' }
                  className={ (year == this.props.state.year && this.props.state.cat == 'families') ? 'bar selected' : 'bar' }
                />
              );
            }
          })}
        </g>

      </svg>
    );
  }

}