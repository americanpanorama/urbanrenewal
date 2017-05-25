import * as React from 'react';
import { PropTypes } from 'react';
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
    let firstYear = 1954,
      years = [...Array(19).keys()].map(num => num+firstYear),
      width = this.props.style.width,
      rightMargin = 150,
      contentWidth = width - rightMargin,
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

    let _processProjects = () => {
      let projects=[];
      
      Object.keys(this.props.projects).map((projectId) => {
        projects.push(this.props.projects[projectId]);
      });
      // sort to put the longest first
      projects = projects.sort((a,b) => (b.endYear - b.startYear) - (a.endYear - a.startYear));

      // calculate "grid" placement for each project
      let rows = [new Array(years.length)];
      projects.forEach((project, i) => {
        let availableRow = false;
        rows.forEach((row, rowNum) => {
          let canFit = true;
            
          // test whether the project can fit in the space
          for (let col = years.indexOf(project.startYear); col <= years.indexOf(project.endYear); col ++) {
            if (rows[rowNum][col]) {
              canFit = false;
            }
            // for one year spans pad it
            if (project.startYear == project.endYear) {
              if ((col > 0 && rows[rowNum][col-1]) || (col <= years.indexOf(project.endYear) && rows[rowNum][col+1])) {
                canFit = false;
              }
            }
          }
          if (canFit && !availableRow) {
            availableRow = rowNum;
          }
        });

        projects[i].row = (availableRow !== false) ? availableRow : rows.length;
        if (!availableRow) {
          rows.push(new Array(years.length));
        }
        for (let col = years.indexOf(project.startYear); col <= years.indexOf(project.endYear); col ++) {
          rows[projects[i].row][col] = 'x';
          // for one year spans pad it
          if (project.startYear == project.endYear) {
            if (col > 0) {
              rows[projects[i].row][col-1] = 'x';
            } 
            if (col <= years.indexOf(project.endYear)) {
              rows[projects[i].row][col+1] = 'x';
            } 
          }
        }
      });

      projectsRows = rows.length;

      return projects;
    };

    let _projectTimespanHeight = () => projectsRows * projectRowHeight; 

    let processedProjects = _processProjects();

    return (
      <svg 
        width={width}  
        height={height}
        id='timeline'
      >
        {/* vertical ticks 
        <g transform={'translate(' + rightMargin + ')'}>
          { years.map(year => {
            return (
              <rect
                x={ xOffsetForYear(year) }
                y={ headerHeight - _projectTimespanHeight() }
                width={ 0.5 }
                height={ height }
                fill='#323B44'
                key={ 'verticalTick' + year }
              />
            );
          })} 
        </g> */}

        <g 
          transform={'translate(0,' + headerHeight + ')'}
        >  

          {/* header */}
          <text
            dx={ rightMargin / 2 }
            dy={ yearLabelY + 2 }
            fontSize={ 20 }
            textAnchor='middle'
            alignmentBaseline='middle'
          >
            { this.props.name }
          </text>

          <text
            dx={ rightMargin - 30 }
            dy={ maxBarHeight * 0.5 }
            fontSize={ 15 }
            textAnchor='end'
            alignmentBaseline='middle'
          >
            families displaced
          </text>
          <text
            dx={ rightMargin - 30 }
            dy={ bottomY + maxBarHeight * 0.5 }
            fontSize={ 15 }
            textAnchor='end'
            alignmentBaseline='middle'
          >
            funding
          </text>

          {/* axes */}
          { [...Array(Math.floor(maxFamilies /familiesTickInterval)).keys()].map(iterator => {
            return (
              <text
                dx={ rightMargin }
                dy={ topY - (iterator + 1) * familiesTickHeight}
                key={ 'topAxesTick' + iterator }
                className='axisLabel'
              >
                { (maxFamilies > 4000) ? ((iterator + 1) * familiesTickInterval / 1000) + 'K' : (iterator + 1) * familiesTickInterval }
              </text>
            );
          }) }

          { [...Array(Math.floor(maxFunding /fundingTickInterval)).keys()].map(iterator => {
            let abbr = ((iterator + 1) * fundingTickInterval >= 1000000000) ? 'B' :
              ((iterator + 1) * fundingTickInterval >= 1000000) ? 'M' :
              ((iterator + 1) * fundingTickInterval >= 1000) ? 'K' :
              '',
              divisor = ((iterator + 1) * fundingTickInterval >= 1000000000) ? 1000000000 :
              ((iterator + 1) * fundingTickInterval >= 1000000) ? 1000000 :
              ((iterator + 1) * fundingTickInterval >= 1000) ? 1000 :
              '',
              displayNum = ((iterator + 1) * fundingTickInterval / divisor);
            return (
              <text
                dx={ rightMargin }
                dy={ bottomY + (iterator + 1) * fundingTickHeight}
                key={ 'bottomAxesTick' + iterator }
                className='axisLabel'
              >
                { '$' + displayNum + abbr }
              </text>
            );
          }) }
        </g>

        <g 
          transform={'translate(' + rightMargin +',' + headerHeight + ')'}
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

          {/* families data */}
          {/* baseline */}
          <rect
            x={ xOffsetForYear(this.props.yearSpan[0]) }
            y={ topY }
            width={ (this.props.yearSpan[1] - this.props.yearSpan[0] + 1) * yearWidth }
            className='baseline families'
          />
          <g className='bars'>
            { years.map(year => {
              if (this.props.yearsData[year] && this.props.yearsData[year].totalFamilies) {
                return (
                  <g key={ 'yearData' + year }>
                    <rect
                      x={ xOffsetForYearBar(year) }
                      y={ topY - (maxBarHeight * (this.props.yearsData[year].totalFamilies / maxFamilies)) }
                      width={ barWidth }
                      height={ maxBarHeight * (this.props.yearsData[year].totalFamilies / maxFamilies) }
                      fill={ HelperFunctions.getColorForRace(this.props.yearsData[year].percentFamiliesOfColor) }
                      className={ (year == this.props.state.year && this.props.state.cat == 'families') ? 'bar selected' : 'bar' }
                    />

                    { [...Array(Math.floor(this.props.yearsData[year].totalFamilies /familiesTickInterval)).keys()].map(iterator => {
                      return (
                        <rect
                          x={ (year - firstYear) * yearWidth  + barOffset }
                          y={ topY - (iterator + 1) * familiesTickHeight}
                          width={ barWidth }
                          key={ 'toptickLine' + year + iterator }
                          className='grid'
                        />
                      );
                    }) }

                    {/* invisible rect that makes the full year space clickable--useful generally but particularly for short areas */}
                    <rect
                      x={ xOffsetForYear(year) }
                      y={ topY - maxBarHeight }
                      width={ yearWidth }
                      height={ maxBarHeight }
                      onClick={ this.props.onClick }
                      id={ year + '|families' }
                      key={ 'clickableyearData' + year }
                      className='clickableBar'
                    />
                  </g>
                );
              }
            })}
          </g>

          {/* funding */}
          {/* baseline */}
          <rect
            x={ xOffsetForYear(this.props.yearSpan[0]) }
            y={ bottomY }
            width={ (this.props.yearSpan[1] - this.props.yearSpan[0] + 1) * yearWidth }
            className='baseline funding'
          />
          <g>
            { years.map(year => {
              if (this.props.yearsData[year] && this.props.yearsData[year]['urban renewal grants dispursed']) {
                return (
                  <g className='bars' key={ 'yearDataMoney' + year }>
                    <rect
                      x={ xOffsetForYearBar(year) }
                      y={ bottomY }
                      width={ barWidth }
                      height={ maxBarHeight * this.props.yearsData[year]['urban renewal grants dispursed'] / maxFunding }
                      className={ (year == this.props.state.year && this.props.state.cat == 'funding') ? 'bar funding selected' : 'bar funding' }
                    />

                    { [...Array(Math.floor(this.props.yearsData[year]['urban renewal grants dispursed'] /fundingTickInterval)).keys()].map(iterator => {
                      return (
                        <rect
                          x={ xOffsetForYearBar(year) }
                          y={ bottomY + (iterator + 1) * fundingTickHeight}
                          width={ barWidth }
                          key={ 'bottomtickLine' + year + iterator }
                          className='grid'
                        />
                      );
                    }) }

                    {/* invisible rect that makes the full year space clickable--useful generally but particularly for short areas */}
                    <rect
                      x={ xOffsetForYear(year) }
                      y={ bottomY }
                      width={ yearWidth }
                      height={ maxBarHeight }
                      onClick={ this.props.onClick }
                      id={ year + '|funding' }
                      className='clickableBar'
                    />
                  </g>
                );
              }
            })}
          </g>

          <Timespan
            width={ yearsSpanWidth(1967, 1973) }
            height={ 8 }
            x={ xOffsetForYear(1967) }
            y={ topY - maxBarHeight / 2 - 4 }
            text='no displacement data available'
          />          
        </g>

        { (this.props.projects) ? 
          <g>

            <text
              dx={ rightMargin - 30 }
              dy={ headerHeight }
              fontSize={ 15 }
              textAnchor='end'
              alignmentBaseline='middle'
            >
              projects
            </text>

            {processedProjects.map((project, i) => {
              //if (this.props.year >= this.props.projects[projectId].startYear && this.props.year <= this.props.projects[projectId].endYear) {
              if (true) {
                return(
                  <Timespan
                    inSelectedYear={ (this.props.year >= project.startYear && this.props.year <= project.endYear) }
                    width={ yearsSpanWidth(project.startYear, project.endYear + 1) - barOffset * 2 }
                    height={ projectRowHeight }
                    x={ rightMargin + xOffsetForYear(project.startYear) + barOffset }
                    y={ headerHeight - ((project.row + 1) * 14 )  }
                    offset={ barOffset }
                    text={ project.project.replace(/\b\w/g, l => l.toUpperCase()) }
                    key={ 'projectSpan' + i }
                  />
                );
              }
            }) }
          </g>:
          '' 
        }
      </svg>
    );
  }

}