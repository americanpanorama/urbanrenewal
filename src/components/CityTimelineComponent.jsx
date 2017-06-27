import * as React from 'react';
import { PropTypes } from 'react';
import * as d3 from 'd3';
import ReactTransitionGroup from 'react-addons-transition-group';
import Displacements from './DisplacementTimespanComponent.jsx';
import { HelperFunctions } from '../utils/HelperFunctions';

import DimensionsStore from '../stores/DimensionsStore';
import CitiesStore from '../stores/CitiesStore';

export default class Timeline extends React.Component {

  constructor (props) { super(props); }

  render() {
    const projects = CitiesStore.getProjectTimelineBars(this.props.city_id),
      years = [1955,1956,1957,1958,1959,1960,1961,1962,1963,1964,1965,1966];

    return (
      <svg 
        { ...DimensionsStore.getCityTimelineStyle() }
        height={ projects.length * 25 + 25 }
        id='timeline'
      >

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
                    x={ DimensionsStore.getTimelineXOffsetForYear(project.startYear) }
                    y={ ((project.row + 1) * DimensionsStore.getTimelineProjectHeight() + 3 )  }
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

        { years.map(year => {
          return (
            <text
              x={ DimensionsStore.getTimelineXOffsetForYear(year) }
              y={ 12 }
            >
              { year }
            </text>
          );
        })}
      </svg>
    );
  }

}