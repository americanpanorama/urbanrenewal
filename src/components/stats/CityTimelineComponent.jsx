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

  constructor (props) { 
    super(props); 

  }

  render() {
    let labels = [];
    const activeCount = this.props.displacementProjects.reduce((count, p) => (p.status == 'active') ? count + 1 : count, 0),
      planningCount = this.props.displacementProjects.reduce((count, p) => (p.status == 'planning') ? count + 1 : count, 0),
      completedCount = this.props.displacementProjects.reduce((count, p) => (p.status == 'completed') ? count + 1 : count, 0),
      futureCount = this.props.displacementProjects.reduce((count, p) => (p.status == 'future') ? count + 1 : count, 0),
      activeHeight = activeCount * 20 + ((activeCount > 0) ? 42 : 0),
      planningHeight = planningCount * 20 + ((planningCount > 0) ? 42 : 0),
      completedHeight = completedCount * 20 + ((completedCount > 0) ? 42 : 0),
      futureHeight = futureCount * 20 + ((futureCount > 0) ? 42 : 0),
      height = activeHeight + planningHeight + completedHeight + futureHeight;

    if (activeCount > 0) {
      labels.push({label: 'Stage in ' + this.props.selectedYear + ': Active', y: 0});
    }
    if (planningCount > 0) {
      labels.push({label: 'Stage in ' + this.props.selectedYear + ': Planning', y: activeHeight});
    }
    if (completedCount > 0) {
      labels.push({label: 'Completed by ' + this.props.selectedYear, y: activeHeight + planningHeight});
    }
    if (futureCount > 0) {
      labels.push({label: 'Post ' + this.props.selectedYear + ' projects', y: activeHeight + planningHeight + completedHeight});
    }

    console.log(this.props.displacementProjects);
    return (
      <svg 
        { ...DimensionsStore.getCityTimelineStyle() }
        height={ height }
        className='project'
      >

        { labels.map(label => <ProjectDisplacementGraphLabel {...label } />) }

      {/* JSX Comment


        <text
          x={ DimensionsStore.getCityTimelineStyle().width / 2 - 40 }
          y={ 14 }
          className='label projects'
        >
          Projects Actively Executing in { this.props.selectedYear }
        </text>

        { (this.props.displacementProjects.find(p => p.project_type)) ?
          <text
            x={ DimensionsStore.getCityTimelineStyle().width / 2 - 10 }
            y={ 14 }
            className='label displacements'
          >
            Type
          </text> : ''
        }

        <text
          x={ DimensionsStore.getCityTimelineStyle().width * 0.75 }
          y={ 14 }
          className='label displacements'
        >
          Families Displaced
        </text>



      

        <text
          x={ DimensionsStore.getCityTimelineStyle().width / 2 - 40 }
          y={ this.state.activeHeight + this.state.activeOffset + 14 }
          className='label projects'
        >
          Projects Being Planned in { this.props.selectedYear }
        </text>

        { (this.state.sortedProjects.find(p => p.project_type)) ?
          <text
            x={ DimensionsStore.getCityTimelineStyle().width / 2 - 10 }
            y={ this.state.activeHeight + this.state.activeOffset + 14 }
            className='label displacements'
          >
            Type
          </text> : ''
        }

        <text
          x={ DimensionsStore.getCityTimelineStyle().width * 0.75 }
          y={ this.state.activeHeight + this.state.activeOffset + 14 }
          className='label displacements'
        >
          Families Displaced
        </text>

     */}


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