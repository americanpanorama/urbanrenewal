import * as React from 'react';
import * as d3 from 'd3';
import ReactTransitionGroup from 'react-addons-transition-group';
import Displacements from './DisplacementTimespanComponent.jsx';
import ProjectSnippet from './ProjectSnippetComponent.jsx';
import { getColorForRace, formatNumber } from '../../utils/HelperFunctions';

import DimensionsStore from '../../stores/DimensionsStore';

export default class NoDisplacements extends React.Component {

  constructor (props) { super(props); }

  render() {

    const sortedProjects = Object.keys(this.props.projects)
        .map(project_id => this.props.projects[project_id])
        .filter(p => !p.totalFamilies || p.totalFamilies == 0)
        .sort((a,b)=> (a.project < b.project) ? -1 : (a.project > b.project) ? 1 : 0),
      height = sortedProjects.length * 20 + 22;

    return (
      <div>
        <svg 
          { ...DimensionsStore.getCityTimelineStyle() }
          height={ height }
          className='project'
        >

          <text
            x={ DimensionsStore.getCityTimelineStyle().width / 2 - 5 }
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
                x={ DimensionsStore.getCityTimelineStyle().width / 2 - 5}
                y={ i * 20 + 14}
                className={ 'project' + ((p.the_geojson) ? ' hasFootprint' : '') + ((this.props.inspectedProject && this.props.inspectedProject != p.project_id) ? ' notInspected' : '') }
                id={ p.project_id  }
              >
                { p.project }
              </text>

              <text
                x={ DimensionsStore.getCityTimelineStyle().width / 2 + 30 + (p.start_year-1955)/(1974-1955)*(DimensionsStore.getCityTimelineStyle().width / 2 - 60) - 5 }
                y={ i * 20 + 16 }
                className={'startYear' + ((this.props.inspectedProject && this.props.inspectedProject != p.project_id) ? ' notInspected' : '') }
              >
                { p.start_year }
              </text>

              <text
                x={ DimensionsStore.getCityTimelineStyle().width / 2 + 30 + (p.end_year-1955)/(1974-1955)*(DimensionsStore.getCityTimelineStyle().width / 2 - 60) + 5 }
                y={ i * 20 + 16 }
                className={'endYear' + ((this.props.inspectedProject && this.props.inspectedProject != p.project_id) ? ' notInspected' : '') }
              >
                { p.end_year }
              </text>

              <line
                x1={ DimensionsStore.getCityTimelineStyle().width / 2 + 30 + (p.start_year-1955)/(1974-1955)*(DimensionsStore.getCityTimelineStyle().width / 2 - 60) }
                x2={ DimensionsStore.getCityTimelineStyle().width / 2 + 30 + (p.end_year-1955)/(1974-1955)*(DimensionsStore.getCityTimelineStyle().width / 2 - 60) }
                y1={ i * 20 + 10 }
                y2={ i * 20 + 10 }
                className={ 'duration' + ((this.props.inspectedProject && this.props.inspectedProject != p.project_id) ? ' notInspected' : '') }
              />

              <circle
                cx={ DimensionsStore.getCityTimelineStyle().width / 2 + 30 + (p.end_year-1955)/(1974-1955)*(DimensionsStore.getCityTimelineStyle().width / 2 - 60) }
                cy={ i * 20 + 10 }
                r={1.5}
                className={ 'duration' + ((this.props.inspectedProject && this.props.inspectedProject != p.project_id) ? ' notInspected' : '') }
              />

              <circle
                cx={ DimensionsStore.getCityTimelineStyle().width / 2 + 30 + (p.start_year-1955)/(1974-1955)*(DimensionsStore.getCityTimelineStyle().width / 2 - 60) }
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