import * as React from 'react';
import ReactDOM from 'react-dom';
import * as d3 from 'd3';

import DimensionsStore from '../../stores/DimensionsStore';
import { getColorForRace, getColorForProjectType, formatNumber } from '../../utils/HelperFunctions';

export default class ProjectDisplacementGraph extends React.Component {

  constructor (props) { 
    super(props); 

    this.state ={
      y: this.props.y,
      xYear: DimensionsStore.getCityTimelineStyle().width / 2 + 30 + (this.props.selectedYear-1950)/(1974-1950)*(DimensionsStore.getCityTimelineStyle().width / 2 - 60),
      strokeYear: (this.props.status == 'planning' || this.props.status == 'active') ? "steelblue" : 'transparent' 
    };
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.y !== nextProps.y) {
      d3.select(ReactDOM.findDOMNode(this))
        .transition()
        .duration(750)
        .attr('transform', 'translate(0 ' + (nextProps.y + 42) +')')
        .each('end', () => {
          this.setState({
            y: nextProps.y
          });
        });
    };

    if (this.props.selectedYear !== nextProps.selectedYear) {
      const newX = DimensionsStore.getCityTimelineStyle().width / 2 + 30 + (nextProps.selectedYear-1950)/(1974-1950)*(DimensionsStore.getCityTimelineStyle().width / 2 - 60),
        newColor = (nextProps.status == 'planning' || nextProps.status == 'active') ? "steelblue" : 'transparent';
      d3.select(this.refs['selectedYearLine'])
        .transition()
        .duration(750)
        .attr('stroke', newColor )
        .attr('x1', newX)
        .attr('x2', newX)
        .each('end', () => {
          this.setState({
            xYear: newX,
            strokeYear: newColor
          });
        });
    };
  }

  render() {
    return (
      <g 
        onMouseEnter={ (this.props.the_geojson) ? this.props.onProjectInspected : null }
        onMouseLeave={ (this.props.the_geojson) ? this.props.onProjectOut : null }
        onClick={ this.props.onProjectSelected }
        id={ this.props.project_id  }
        transform={'translate(0 ' + (this.state.y + 42) +')'}
      >
        <text
          x={ DimensionsStore.getCityTimelineStyle().width / 2 - 23}
          y={ 14}
          className={ 'project' + ((this.props.the_geojson) ? ' hasFootprint' : '') + ((this.props.inspectedProject && this.props.inspectedProject != this.props.project_id) ? ' notInspected' : '') }
          id={ this.props.project_id  }
        >
          { this.props.project }
        </text>

        <circle
          cx={ DimensionsStore.getCityTimelineStyle().width / 2 - 10}
          cy={ 0 + 7}
          r={8}
          fill={ (!this.props.status|| this.props.status == 'planning' || this.props.status == 'active') ? getColorForProjectType(this.props.project_type) : 'transparent' }
          stroke={ getColorForProjectType(this.props.project_type) }
          strokeWidth={2}
        /> 

        { (this.props.status) ?
          <text
            x={ DimensionsStore.getCityTimelineStyle().width / 2 - 10}
            y={12}
            className={'stage ' +  this.props.status}
          >
            { this.props.status.substring(0,1).toUpperCase()}
          </text> : ''
        }

        { (this.props.planning_start_year && this.props.planning_start_year !== this.props.active_start_year) ?
          <text
            x={ DimensionsStore.getCityTimelineStyle().width / 2 + 30 + (this.props.planning_start_year-1950)/(1974-1950)*(DimensionsStore.getCityTimelineStyle().width / 2 - 60) - 5 }
            y={ 13 }
            className={'startYear' + ((this.props.inspectedProject && this.props.inspectedProject != this.props.project_id) ? ' notInspected' : '') }
          >
            { this.props.planning_start_year }
          </text> : 
          <text
            x={ DimensionsStore.getCityTimelineStyle().width / 2 + 30 + (this.props.active_start_year-1950)/(1974-1950)*(DimensionsStore.getCityTimelineStyle().width / 2 - 60) - 5 }
            y={ 13 }
            className={'startYear' + ((this.props.inspectedProject && this.props.inspectedProject != this.props.project_id) ? ' notInspected' : '') }
          >
            { this.props.active_start_year }
          </text>
        }

        <text
          x={ DimensionsStore.getCityTimelineStyle().width / 2 + 30 + (this.props.completed_year-1950)/(1974-1950)*(DimensionsStore.getCityTimelineStyle().width / 2 - 60) + 5 }
          y={ 13 }
          className={'endYear' + ((this.props.inspectedProject && this.props.inspectedProject != this.props.project_id) ? ' notInspected' : '') }
        >
          { this.props.completed_year }
        </text>

        { (this.props.planning_start_year && this.props.planning_start_year !== this.props.active_start_year) ?
          <line
            x1={ DimensionsStore.getCityTimelineStyle().width / 2 + 30 + (this.props.planning_start_year-1950)/(1974-1950)*(DimensionsStore.getCityTimelineStyle().width / 2 - 60) }
            x2={ DimensionsStore.getCityTimelineStyle().width / 2 + 30 + (this.props.active_start_year-1950)/(1974-1950)*(DimensionsStore.getCityTimelineStyle().width / 2 - 60) }
            y1={ 7 }
            y2={ 7 }
            className={ 'duration' + ((this.props.inspectedProject && this.props.inspectedProject != this.props.project_id) ? ' notInspected' : '') }
            strokeDasharray='2 3'
          /> : ''
        }

        <line
          x1={ DimensionsStore.getCityTimelineStyle().width / 2 + 30 + (this.props.active_start_year-1950)/(1974-1950)*(DimensionsStore.getCityTimelineStyle().width / 2 - 60) }
          x2={ DimensionsStore.getCityTimelineStyle().width / 2 + 30 + (this.props.completed_year-1950)/(1974-1950)*(DimensionsStore.getCityTimelineStyle().width / 2 - 60) }
          y1={ 7 }
          y2={ 7 }
          className={ 'duration' + ((this.props.inspectedProject && this.props.inspectedProject != this.props.project_id) ? ' notInspected' : '') }
        />

        { (this.props.planning_start_year && this.props.planning_start_year !== this.props.active_start_year) ?
          <circle
            cx={ DimensionsStore.getCityTimelineStyle().width / 2 + 30 + (this.props.planning_start_year-1950)/(1974-1950)*(DimensionsStore.getCityTimelineStyle().width / 2 - 60) }
            cy={ 7 }
            r={1.5}
            className={ 'duration' + ((this.props.inspectedProject && this.props.inspectedProject != this.props.project_id) ? ' notInspected' : '') }
          /> : ''
        }

        <circle
          cx={ DimensionsStore.getCityTimelineStyle().width / 2 + 30 + (this.props.completed_year-1950)/(1974-1950)*(DimensionsStore.getCityTimelineStyle().width / 2 - 60) }
          cy={ 7 }
          r={1.5}
          className={ 'duration' + ((this.props.inspectedProject && this.props.inspectedProject != this.props.project_id) ? ' notInspected' : '') }
        />

        <circle
          cx={ DimensionsStore.getCityTimelineStyle().width / 2 + 30 + (this.props.active_start_year-1950)/(1974-1950)*(DimensionsStore.getCityTimelineStyle().width / 2 - 60) }
          cy={ 7 }
          r={1.5}
          className={ 'duration' + ((this.props.inspectedProject && this.props.inspectedProject != this.props.project_id) ? ' notInspected' : '') }
        />

        <line
          x1={ this.state.xYear }
          x2={ this.state.xYear }
          y1={ 0 }
          y2={ 20 }
          stroke={this.state.strokeYear}
          strokeWidth={5}
          strokeOpacity={0.3}

          ref='selectedYearLine'
        /> 

      </g>
    );
  }

}