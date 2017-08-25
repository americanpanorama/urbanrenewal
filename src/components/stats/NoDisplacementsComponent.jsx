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
        >

          <text
            x={ DimensionsStore.getCityTimelineStyle().width / 2 - 5 }
            y={ 0 }
            fontWeight='bold'
            textAnchor='end'
            alignmentBaseline='hanging'
            fill='grey'
          >
            Renewal Projects
          </text>

          <text
            x={ DimensionsStore.getCityTimelineStyle().width * 0.75 }
            y={ 0 }
            fontWeight='bold'
            textAnchor='middle'
            alignmentBaseline='hanging'
            fill='grey'
          >
            Duration
          </text>

          { sortedProjects.map((p, i) => 
            <g 
              key={ 'projectData' + p.project_id }
              onMouseEnter={ (p.the_geojson) ? this.props.onProjectInspected : null }
              onMouseLeave={ (p.the_geojson) ? this.props.onProjectOut : null }
              id={ p.project_id  }
              transform='translate(0 22)'
            >
              <text
                x={ DimensionsStore.getCityTimelineStyle().width / 2 - 5}
                y={ i * 20 }
                fontWeight={ (p.the_geojson) ? 'bold' : '' }
                fill={ (!this.props.inspectedProject || this.props.inspectedProject == p.project_id) ? 'black' : '#aaa' }
                textAnchor='end'
                alignmentBaseline='hanging'
                id={ p.project_id  }
              >
                { p.project }
              </text>

              <text
                x={ DimensionsStore.getCityTimelineStyle().width / 2 + 30 + (p.start_year-1955)/(1974-1955)*(DimensionsStore.getCityTimelineStyle().width / 2 - 60) - 5 }
                y={ i * 20 + 10 }
                fill={ (!this.props.inspectedProject || this.props.inspectedProject == p.project_id) ? 'grey' : '#aaa' }
                fontSize={'smaller'}
                textAnchor='end'
                alignmentBaseline='middle'
              >
                { p.start_year }
              </text>

              <text
                x={ DimensionsStore.getCityTimelineStyle().width / 2 + 30 + (p.end_year-1955)/(1974-1955)*(DimensionsStore.getCityTimelineStyle().width / 2 - 60) + 5 }
                y={ i * 20 + 10 }
                fill={ (!this.props.inspectedProject || this.props.inspectedProject == p.project_id) ? 'grey' : '#aaa' }
                fontSize={'smaller'}
                textAnchor='start'
                alignmentBaseline='middle'
              >
                { p.end_year }
              </text>
              <line
                x1={ DimensionsStore.getCityTimelineStyle().width / 2 + 30 + (p.start_year-1955)/(1974-1955)*(DimensionsStore.getCityTimelineStyle().width / 2 - 60) }
                x2={ DimensionsStore.getCityTimelineStyle().width / 2 + 30 + (p.end_year-1955)/(1974-1955)*(DimensionsStore.getCityTimelineStyle().width / 2 - 60) }
                y1={ i * 20 + 10 }
                y2={ i * 20 + 10 }
                stroke='grey'
              />

              <circle
                cx={ DimensionsStore.getCityTimelineStyle().width / 2 + 30 + (p.end_year-1955)/(1974-1955)*(DimensionsStore.getCityTimelineStyle().width / 2 - 60) }
                cy={ i * 20 + 10 }
                r={1.5}
                fill='grey'
              />

              <circle
                cx={ DimensionsStore.getCityTimelineStyle().width / 2 + 30 + (p.start_year-1955)/(1974-1955)*(DimensionsStore.getCityTimelineStyle().width / 2 - 60) }
                cy={ i * 20 + 10 }
                r={1.5}
                fill='grey'
              />

             

            </g>
          )} 
        
        </svg>
      </div>
    );
  }

}