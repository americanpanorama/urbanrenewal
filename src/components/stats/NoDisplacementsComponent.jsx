import * as React from 'react';
import * as d3 from 'd3';
import ReactTransitionGroup from 'react-addons-transition-group';
import Displacements from './DisplacementTimespanComponent.jsx';
import ProjectSnippet from './ProjectSnippetComponent.jsx';
import { getColorForRace, getColorForProjectType, formatNumber } from '../../utils/HelperFunctions';

import DimensionsStore from '../../stores/DimensionsStore';

export default class NoDisplacements extends React.Component {

  constructor (props) { super(props); }

  render() {

    const sortedProjects = (this.props.selectedYear) ?
      Object.keys(this.props.projects)
        .map(project_id => this.props.projects[project_id])
        .filter(p => !p.totalFamilies || p.totalFamilies == 0)
        .sort((a,b)=> (a.project < b.project) ? -1 : (a.project > b.project) ? 1 : 0)
        .sort((a,b)=> (a.completed_year < b.completed_year) ? -1 : (a.completed_year > b.completed_year) ? 1 : 0)
        .sort((a,b)=> (a.active_start_year < b.active_start_year) ? -1 : (a.active_start_year > b.active_start_year) ? 1 : 0)
        .sort((a,b)=> {
          if (a.planning_start_year && b.planning_start_year && (a.planning_start_year < b.planning_start_year)) {
            return -1;
          } else if (a.planning_start_year && (a.planning_start_year <= b.active_start_year)) {
            return -1;
          } else if (b.planning_start_year && (b.planning_start_year <= a.active_start_year)) {
            return 1;
          } else {
            return 0;
          }
        }) :
      Object.keys(this.props.projects)
        .map(project_id => this.props.projects[project_id])
        .filter(p => !p.totalFamilies || p.totalFamilies == 0)
        .sort((a,b)=> (a.project < b.project) ? -1 : (a.project > b.project) ? 1 : 0);


        
    const height = sortedProjects.length * 20 + 22;

    return (
      <div>
        <svg 
          { ...DimensionsStore.getCityTimelineStyle() }
          height={ height }
          className='project'
        >

          <text
            x={ DimensionsStore.getCityTimelineStyle().width / 2 - 20 }
            y={ 14 }
            className='label projects'
          >
            Renewal Projects
          </text>

          <text
            x={ DimensionsStore.getCityTimelineStyle().width * 0.75 }
            y={ 14 }
            className='label duration'
          >
            Duration
          </text>

          { sortedProjects.map((p, i) => 
            <g 
              key={ 'projectData' + p.project_id }
              onMouseEnter={ (p.the_geojson) ? this.props.onProjectInspected : null }
              onMouseLeave={ (p.the_geojson) ? this.props.onProjectOut : null }
              onClick={ this.props.onProjectSelected }
              id={ p.project_id  }
              transform='translate(0 22)'
            >
              <text
                x={ DimensionsStore.getCityTimelineStyle().width / 2 - 20}
                y={ i * 20 + 14}
                className={ 'project' + ((p.the_geojson) ? ' hasFootprint' : '') + ((this.props.inspectedProject && this.props.inspectedProject != p.project_id) ? ' notInspected' : '') }
                id={ p.project_id  }
              >
                { p.project }
              </text>

              { (p.project_type) ?
                <circle
                  cx={ DimensionsStore.getCityTimelineStyle().width / 2 - 10}
                  cy={ i * 20 + 7}
                  r={5}
                  fill={ getColorForProjectType(p.project_type) }
                /> : ''
              }

              { (p.planning_start_year && p.planning_start_year !== p.active_start_year) ?
                <text
                  x={ DimensionsStore.getCityTimelineStyle().width / 2 + 30 + (p.planning_start_year-1950)/(1974-1950)*(DimensionsStore.getCityTimelineStyle().width / 2 - 60) - 5 }
                  y={ i * 20 + 16 }
                  className={'startYear' + ((this.props.inspectedProject && this.props.inspectedProject != p.project_id) ? ' notInspected' : '') }
                >
                  { p.planning_start_year }
                </text> : 
                <text
                  x={ DimensionsStore.getCityTimelineStyle().width / 2 + 30 + (p.active_start_year-1950)/(1974-1950)*(DimensionsStore.getCityTimelineStyle().width / 2 - 60) - 5 }
                  y={ i * 20 + 16 }
                  className={'startYear' + ((this.props.inspectedProject && this.props.inspectedProject != p.project_id) ? ' notInspected' : '') }
                >
                  { p.active_start_year }
                </text>
              }

              <text
                x={ DimensionsStore.getCityTimelineStyle().width / 2 + 30 + (p.completed_year-1950)/(1974-1950)*(DimensionsStore.getCityTimelineStyle().width / 2 - 60) + 5 }
                y={ i * 20 + 16 }
                className={'endYear' + ((this.props.inspectedProject && this.props.inspectedProject != p.project_id) ? ' notInspected' : '') }
              >
                { p.completed_year }
              </text>

              { (p.planning_start_year && p.planning_start_year !== p.active_start_year) ?
                <line
                  x1={ DimensionsStore.getCityTimelineStyle().width / 2 + 30 + (p.planning_start_year-1950)/(1974-1950)*(DimensionsStore.getCityTimelineStyle().width / 2 - 60) }
                  x2={ DimensionsStore.getCityTimelineStyle().width / 2 + 30 + (p.active_start_year-1950)/(1974-1950)*(DimensionsStore.getCityTimelineStyle().width / 2 - 60) }
                  y1={ i * 20 + 10 }
                  y2={ i * 20 + 10 }
                  className={ 'duration' + ((this.props.inspectedProject && this.props.inspectedProject != p.project_id) ? ' notInspected' : '') }
                  strokeDasharray='2 3'
                /> : ''
              }

              <line
                x1={ DimensionsStore.getCityTimelineStyle().width / 2 + 30 + (p.active_start_year-1950)/(1974-1950)*(DimensionsStore.getCityTimelineStyle().width / 2 - 60) }
                x2={ DimensionsStore.getCityTimelineStyle().width / 2 + 30 + (p.completed_year-1950)/(1974-1950)*(DimensionsStore.getCityTimelineStyle().width / 2 - 60) }
                y1={ i * 20 + 10 }
                y2={ i * 20 + 10 }
                className={ 'duration' + ((this.props.inspectedProject && this.props.inspectedProject != p.project_id) ? ' notInspected' : '') }
              />

              { (p.planning_start_year && p.planning_start_year !== p.active_start_year) ?
                <circle
                  cx={ DimensionsStore.getCityTimelineStyle().width / 2 + 30 + (p.planning_start_year-1950)/(1974-1950)*(DimensionsStore.getCityTimelineStyle().width / 2 - 60) }
                  cy={ i * 20 + 10 }
                  r={1.5}
                  className={ 'duration' + ((this.props.inspectedProject && this.props.inspectedProject != p.project_id) ? ' notInspected' : '') }
                /> : ''
              }

              <circle
                cx={ DimensionsStore.getCityTimelineStyle().width / 2 + 30 + (p.completed_year-1950)/(1974-1950)*(DimensionsStore.getCityTimelineStyle().width / 2 - 60) }
                cy={ i * 20 + 10 }
                r={1.5}
                className={ 'duration' + ((this.props.inspectedProject && this.props.inspectedProject != p.project_id) ? ' notInspected' : '') }
              />

              <circle
                cx={ DimensionsStore.getCityTimelineStyle().width / 2 + 30 + (p.active_start_year-1950)/(1974-1950)*(DimensionsStore.getCityTimelineStyle().width / 2 - 60) }
                cy={ i * 20 + 10 }
                r={1.5}
                className={ 'duration' + ((this.props.inspectedProject && this.props.inspectedProject != p.project_id) ? ' notInspected' : '') }
              />

             

            </g>
          )} 
        
        </svg>
      </div>
    );
  }

}