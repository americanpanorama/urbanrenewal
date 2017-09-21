import * as React from 'react';
import * as d3 from 'd3';
import ReactTransitionGroup from 'react-addons-transition-group';
import Displacements from './DisplacementTimespanComponent.jsx';
import ProjectSnippet from './ProjectSnippetComponent.jsx';
import { getColorForRace, formatNumber } from '../../utils/HelperFunctions';

import DimensionsStore from '../../stores/DimensionsStore';
import CitiesStore from '../../stores/CitiesStore';

export default class Timeline extends React.Component {

  constructor (props) { super(props); }

  render() {
    const years = [1955,1956,1957,1958,1959,1960,1961,1962,1963,1964,1965,1966];

    const sortedProjects = Object.keys(this.props.projects)
      .map(project_id => this.props.projects[project_id])
      .filter(p => p.totalFamilies > 0)
      .sort((a,b)=> (a.project < b.project) ? -1 : (a.project > b.project) ? 1 : 0);

    const theMax = (this.props.state !== 'pr' && this.props.state !== 'vi' ) ? sortedProjects.reduce((max,project) => Math.max(max, project.whites || 0, project.nonwhite || 0), 0) : Math.max(...sortedProjects.map(project => project.totalFamilies)),
      height = (sortedProjects.length + 1) * 22;

    return (
      <svg 
        { ...DimensionsStore.getCityTimelineStyle() }
        height={ height }
        id='timeline'
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
          Families Displaced
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
              y={ i * 20 }
              fontWeight={ (p.the_geojson) ? 'bold' : '' }
              fill={ (!this.props.inspectedProject || this.props.inspectedProject == p.project_id) ? 'black' : '#aaa' }
              textAnchor='end'
              alignmentBaseline='hanging'
              id={ p.project_id  }
            >
              { p.project }
            </text>
            { (p.nonwhite || p.whites) ?
              <g>

                <line
                  x1={ DimensionsStore.getCityTimelineStyle().width * 0.75 }
                  x2={ DimensionsStore.getCityTimelineStyle().width * 0.75 }
                  y1={i * 20}
                  y2={20}
                  stroke='#aaa'
                  strokeWidth={0.5}
                />

                <rect
                  x={DimensionsStore.getCityTimelineStyle().width * 0.75  - ((p.nonwhite || 0) / theMax) * DimensionsStore.getCityTimelineStyle().width / 6}
                  y={i * 20}
                  width={ ((p.nonwhite || 0) / theMax) * DimensionsStore.getCityTimelineStyle().width / 6 }
                  height={14}
                  fillOpacity={ (!this.props.inspectedProject || this.props.inspectedProject == p.project_id) ? 1 : 0.25 }
                  className='poc'
                  id={ p.project_id  }
                />
                <text
                  x={ DimensionsStore.getCityTimelineStyle().width * 0.75  - ((p.nonwhite || 0) / theMax) * DimensionsStore.getCityTimelineStyle().width / 6 - 3}
                  y={ i * 20 + 1 }
                  fillOpacity={ (!this.props.inspectedProject || this.props.inspectedProject == p.project_id) ? 1 : 0.25 }
                  textAnchor='end'
                  alignmentBaseline='hanging'
                  fontSize={12}
                  fill='grey'
                >
                  { formatNumber(p.nonwhite) }
                </text>
                <rect
                  x={DimensionsStore.getCityTimelineStyle().width * 0.75}
                  y={i * 20}
                  width={ ((p.whites || 0) / theMax) * DimensionsStore.getCityTimelineStyle().width / 6 }
                  height={14}
                  fillOpacity={ (!this.props.inspectedProject || this.props.inspectedProject == p.project_id) ? 1 : 0.25 }
                  className='white'
                  id={ p.project_id  }
                />
                <text
                  x={ DimensionsStore.getCityTimelineStyle().width * 0.75 + ((p.whites || 0) / theMax) * DimensionsStore.getCityTimelineStyle().width / 6 + 3}
                  y={ i * 20 + 1 }
                  fillOpacity={ (!this.props.inspectedProject || this.props.inspectedProject == p.project_id) ? 1 : 0.25 }
                  textAnchor='start'
                  alignmentBaseline='hanging'
                  fontSize={12}
                  fill='grey'
                  id={ p.project_id  }
                >
                  { formatNumber(p.whites) }
                </text>
              </g> : 

              <g>
                <rect
                  x={DimensionsStore.getCityTimelineStyle().width * 0.5  }
                  y={i * 20}
                  width={ (p.totalFamilies / theMax) * DimensionsStore.getCityTimelineStyle().width / 3 }
                  height={14}
                  fillOpacity={ (!this.props.inspectedProject || this.props.inspectedProject == p.project_id) ? 1 : 0.25 }
                  className='territory'
                  id={ p.project_id  }
                />
                <text
                  x={ DimensionsStore.getCityTimelineStyle().width * 0.5 + (p.totalFamilies / theMax) * DimensionsStore.getCityTimelineStyle().width / 3 + 3}
                  y={ i * 20 + 1 }
                  fillOpacity={ (!this.props.inspectedProject || this.props.inspectedProject == p.project_id) ? 1 : 0.25 }
                  textAnchor='start'
                  alignmentBaseline='hanging'
                  fontSize={12}
                  fill='grey'
                  id={ p.project_id  }
                >
                  { formatNumber(p.totalFamilies) }
                </text>
              </g>
            }
          </g>
        )} 
      
      </svg>
    );
  }

}