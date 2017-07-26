import * as React from 'react';
import { PropTypes } from 'react';
import * as d3 from 'd3';
import ReactTransitionGroup from 'react-addons-transition-group';
import Displacements from './DisplacementTimespanComponent.jsx';
import { getColorForRace, formatNumber } from '../utils/HelperFunctions';

import DimensionsStore from '../stores/DimensionsStore';
import CitiesStore from '../stores/CitiesStore';

export default class Timeline extends React.Component {

  constructor (props) { super(props); }

  render() {
    console.log(this.props);
    const projects = CitiesStore.getProjectTimelineBars(this.props.city_id),
      maxForYear = Math.max(...projects.map(p => p.totalFamilies/(Math.min(p.endYear, 1966) - Math.max(p.startYear,1955) + 1))),
      years = [1955,1956,1957,1958,1959,1960,1961,1962,1963,1964,1965,1966];

    return (
      <svg 
        { ...DimensionsStore.getCityTimelineStyle() }
        height={ projects.length * 25 + 25 + 100 }
        id='timeline'
      >

        { years.map(year => {
          if (this.props.yearsData && this.props.yearsData[year] && this.props.yearsData[year].totalFamilies) {
            return (
              <circle
                cx={DimensionsStore.getMainTimlineXOffset(year)}
                cy={30}
                r={ DimensionsStore.getDorlingRadius(this.props.yearsData[year].totalFamilies * 5) }
                fill={ getColorForRace(this.props.yearsData[year].percentFamiliesOfColor) }
              />
            );
          }
        })}

        { years.map(year => {
          return (
            <g>
              

              { (this.props.yearsData && this.props.yearsData[year] && this.props.yearsData[year].totalFamilies) ? 
                <text
                  x={ DimensionsStore.getMainTimlineXOffset(year) }
                  y={ 30 }
                  key={'citytimelinedisplacments' + year}
                  textAnchor='middle'
                  alignmentBaseline='middle'
                > 
                  { formatNumber(this.props.yearsData[year].totalFamilies) }
                </text> : ''
              }
              <text
                x={ DimensionsStore.getMainTimlineXOffset(year) }
                y={ 12 }
                key={'citytimeline' + year}
              >
                { year }
              </text>
            </g>
          );
        })}

        { (this.props.projects) ? 
          <g>
            { projects.map((project, i) => {
              //if (this.props.year >= this.props.projects[projectId].startYear && this.props.year <= this.props.projects[projectId].endYear) {
              if (true) {
                return(
                  <Displacements
                    inSelectedYear={ (this.props.year >= project.startYear && this.props.year <= project.endYear) }
                    width={ DimensionsStore.getTimelineYearsSpanWidth(project.startYear, project.endYear + 1)  }
                    height={ DimensionsStore.getTimelineProjectHeight() }
                    x={ DimensionsStore.getMainTimlineXOffset(project.startYear) }
                    y={ 70 + ((project.row + 1) * DimensionsStore.getTimelineProjectHeight() * 1.2 )  }
                    text={ project.project.replace(/\b\w/g, l => l.toUpperCase()) }
                    key={ 'projectSpan' + i }
                    maxForYear={ maxForYear }
                    projectData={ project }
                    maxForYear={ projects[0].totalFamilies/ (projects[0].endYear-projects[0].startYear+1)}
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