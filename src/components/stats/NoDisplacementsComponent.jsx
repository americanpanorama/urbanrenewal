import * as React from 'react';
import * as d3 from 'd3';
import ReactTransitionGroup from 'react-addons-transition-group';
import Displacements from './DisplacementTimespanComponent.jsx';
//import ProjectSnippet from './ProjectSnippetComponent.jsx';
import NoDisplacementsProject from './NoDisplacementsProject.jsx';

import { getColorForRace, getColorForProjectType, formatNumber } from '../../utils/HelperFunctions';

import DimensionsStore from '../../stores/DimensionsStore';

export default class NoDisplacements extends React.Component {

  constructor (props) { super(props); }

  render() {
        
    const height = this.props.noDisplacementProjects.length * 20 + 142;
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

          { this.props.noDisplacementProjects.map((p, i) => 
            <NoDisplacementsProject 
              { ...p }
              selectedYear={this.props.selectedYear}
              inspectedProject={ this.props.inspectedProject }
              onProjectInspected={this.props.onProjectInspected}
              onProjectOut={this.props.onProjectOut}
              onProjectSelected={this.props.onProjectSelected}
              key={ 'projectData' + p.project_id }
            />
          )} 
        
        </svg>
      </div>
    );
  }

}