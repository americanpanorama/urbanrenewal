import * as React from 'react';
import { PropTypes } from 'react';
import * as d3 from 'd3';
import ReactTransitionGroup from 'react-addons-transition-group';
import Displacements from './DisplacementTimespanComponent.jsx';
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
      rightMargin = 150,
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
      yearLabelY = contentHeight,
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
      projects = projects.sort((a,b) => b.totalFamilies - a.totalFamilies);

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

        { (this.props.projects) ? 
          <g>
            {processedProjects.map((project, i) => {
              //if (this.props.year >= this.props.projects[projectId].startYear && this.props.year <= this.props.projects[projectId].endYear) {
              if (true) {
                return(
                  <Displacements
                    inSelectedYear={ (this.props.year >= project.startYear && this.props.year <= project.endYear) }
                    width={ yearsSpanWidth(project.startYear, project.endYear + 1) - barOffset * 2 }
                    height={ projectRowHeight }
                    x={ xOffsetForYear(project.startYear) + barOffset }
                    y={ ((project.row + 1) * 14 )  }
                    offset={ 0 }
                    text={ project.project.replace(/\b\w/g, l => l.toUpperCase()) }
                    key={ 'projectSpan' + i }
                    maxForYear={ this.props.maxForYear }
                    projectData={ project }
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