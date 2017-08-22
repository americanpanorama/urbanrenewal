import * as React from 'react';

import * as d3 from 'd3';
import ReactTransitionGroup from 'react-addons-transition-group';
import Timespan from './TimespanComponent.jsx';
import { HelperFunctions } from '../utils/HelperFunctions';

export default class Timeline extends React.Component {

  constructor (props) {
    super(props);
  }

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
    let firstYear = 1955,
      years = [...Array(12).keys()].map(num => num+firstYear),
      width = this.props.style.width,
      contentWidth = width,
      yearWidth = contentWidth / years.length,
      yearMiddleOffset = yearWidth / 2,
      barWidth = Math.round(yearWidth * 0.6666),
      barOffset = (yearWidth - barWidth) / 2,
      height = this.props.style.height,
      headerHeight = 100,
      footerHeight = 0,
      contentHeight = height - headerHeight - footerHeight,
      yearLabelSize = 14,
      yearLabelHeight = 20,
      yearLabelY = contentHeight / 2,
      topY = contentHeight / 2 - yearLabelHeight / 2,
      bottomY = contentHeight / 2 + yearLabelHeight / 2,
      maxBarHeight = topY,
      maxFamilies = Object.keys(this.props.yearsData).reduce((candidate, year) => (!this.props.yearsData[year].totalFamilies || candidate > this.props.yearsData[year].totalFamilies) ? candidate : this.props.yearsData[year].totalFamilies, 0),
      familiesTickInterval = this._calculateTickInterval(maxFamilies),
      familiesTickHeight = topY / (maxFamilies / familiesTickInterval),
      maxFunding = Object.keys(this.props.yearsData).reduce((candidate, year) => (!this.props.yearsData[year]['urban renewal grants dispursed'] || candidate > this.props.yearsData[year]['urban renewal grants dispursed']) ? candidate : this.props.yearsData[year]['urban renewal grants dispursed'], 0),
      fundingTickInterval = this._calculateTickInterval(maxFunding),
      fundingTickHeight = topY / (maxFunding / fundingTickInterval),
      projectsRows = 0,
      projectRowHeight = 12;

      
    let yearsSpanWidth = (year1, year2) => yearWidth * (year2-year1) - 1,
      xOffsetForYear = (year) => (year - firstYear) * yearWidth,
      xOffsetForYearMiddle = (year) => xOffsetForYear(year) + yearMiddleOffset,
      xOffsetForYearBar = (year) => xOffsetForYear(year) + barOffset;
    let _projectTimespanHeight = () => projectsRows * projectRowHeight; 

    return (

        <g 
          transform={'translate(0,0)'}
          className='timeline'
        >
          {/* year labels */}
          { years.map(year => {
            let className = (year < this.props.yearSpan[0] || year > this.props.yearSpan[1]) ? 'yearLabel inactive' : (year == this.props.state.year) ? 'yearLabel selected' : 'yearLabel';
            return (
              <text
                dx={ xOffsetForYearMiddle(year) }
                dy={ yearLabelY + 2 }
                fill={ (year < this.props.yearSpan[0] || year > this.props.yearSpan[1]) ? '#454545' : (year == this.props.state.year) ? 'yellow' : 'white' }
                fontSize={ (year % 5 == 0) ? yearLabelSize : yearLabelSize - 2 }
                onClick={ this.props.onClick }
                id={ year }
                key={ 'year' + year }
                className={ className }
              >
                { (year % 5 == 0) ? year : "'" + (year - 1900) }
              </text>
            );
          })}

          <rect 
            x={xOffsetForYear(this.props.state.year)}
            y='0'
            width={yearWidth}
            height={height}
            fill='transparent'
            stroke='yellow'
            strokeWidth='4'
          />
      </g>
    );
  }

}