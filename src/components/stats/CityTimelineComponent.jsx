import * as React from 'react';
import * as d3 from 'd3';
import ReactTransitionGroup from 'react-addons-transition-group';
import Displacements from './DisplacementTimespanComponent.jsx';
import ProjectSnippet from './ProjectSnippetComponent.jsx';
import ProjectDisplacementGraph from './ProjectDisplacementGraph.jsx';
import ProjectDisplacementGraphLabel from './ProjectDisplacementGraphLabel.jsx';
import { getColorForRace, getColorForProjectType, formatNumber } from '../../utils/HelperFunctions';

import DimensionsStore from '../../stores/DimensionsStore';
import CitiesStore from '../../stores/CitiesStore';

export default class Timeline extends React.Component {

  constructor (props) { super(props); }

  render() {
    console.log(this.props);
    return (
      <svg 
        { ...DimensionsStore.getCityTimelineStyle() }
        height={ this.props.displacementProjects.length * 20 + 42 + 20 }
        className='project'
      >

        <text
          x={ DimensionsStore.getCityTimelineStyle().width / 2 - 60 }
          y={ 34 }
          className='label projects'
        >
          Project
        </text>

        { (this.props.displacementProjects.find(p => p.project_type)) ?
          <g>
            { (this.props.selectedYear) ?
              <text
                x={ DimensionsStore.getCityTimelineStyle().width / 2 - 10 }
                y={ 14 }
                className='label displacements'
              >
                Type & Stage
              </text> : ''
            }

            <text
              x={ DimensionsStore.getCityTimelineStyle().width / 2 - 10 }
              y={ 34 }
              className='label displacements'
            >
              {(this.props.selectedYear) ? 'in ' + this.props.selectedYear : 'Type'}
            </text> 
          </g>: ''
        }

        <text
          x={ DimensionsStore.getCityTimelineStyle().width * 0.75 }
          y={ 14 }
          className='label displacements'
        >
          Families
        </text>
        <text
          x={ DimensionsStore.getCityTimelineStyle().width * 0.75 }
          y={ 34 }
          className='label displacements'
        >
          Displaced
        </text>

        { this.props.displacementProjects.map((p, i) => 
          <ProjectDisplacementGraph
            { ...p }
            inspectedProject={ this.props.inspectedProject }
            onProjectInspected={this.props.onProjectInspected}
            onProjectOut={this.props.onProjectOut}
            onProjectSelected={this.props.onProjectSelected}
            key={ 'projectData' + p.project_id }
          />
        )} 
      
      </svg>
    );
  }

}