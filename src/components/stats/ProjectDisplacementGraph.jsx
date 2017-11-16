import * as React from 'react';
import ReactDOM from 'react-dom';
import * as d3 from 'd3';

import DimensionsStore from '../../stores/DimensionsStore';
import { getColorForRace, getColorForProjectType, formatNumber } from '../../utils/HelperFunctions';

export default class ProjectDisplacementGraph extends React.Component {

  constructor (props) { 
    super(props); 

    this.state ={
      y: this.props.y
    };
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.y !== nextProps.y) {
      d3.select(ReactDOM.findDOMNode(this))
        .transition()
        .duration(750)
        .attr('transform', 'translate(0 ' + (nextProps.y + 22) +')')
        .each('end', () => {
          this.setState({
            y: this.props.y
          });
        });
    }
  }

  render() {
    return (
      <g 
        onMouseEnter={ (this.props.the_geojson) ? this.props.onProjectInspected : null }
        onMouseLeave={ (this.props.the_geojson) ? this.props.onProjectOut : null }
        onClick={ this.props.onProjectSelected }
        id={ this.props.project_id  }
        transform={'translate(0 ' + (this.state.y + 22) +')'}
      >
        {/* JSX Comment 
        <rect
          x={0}
          y={0}
          width={DimensionsStore.getCityTimelineStyle().width}
          height={20}
          fill={(this.props.status == 'planning') ? 'beige' : (this.props.status == 'active') ? 'yellow' : 'silver'} 
        />
        
        <line
          x1={DimensionsStore.getCityTimelineStyle().width / 2}
          x2={DimensionsStore.getCityTimelineStyle().width / 2}
          y1={0}
          y2={20}
          strokeWidth={(this.props.status == 'future') ? 0.5 : 2}
          //strokeWidth={DimensionsStore.getCityTimelineStyle().width}
          className='divider'

          strokeDasharray={(this.props.status == 'planning') ? '2 3' : (this.props.status == 'active') ? '5 5' : (this.props.status == 'completed') ? 'none' : '2 3' } 
        />*/}

        <text
          x={ DimensionsStore.getCityTimelineStyle().width / 2 - 23}
          y={ 0 + 14}
          className={ 'project' + ((this.props.the_geojson) ? ' hasFootprint' : '') + ((this.props.inspectedProject && this.props.inspectedProject != this.props.project_id) ? ' notInspected' : '') }
          id={ this.props.project_id  }
        >
          { this.props.project }
        </text>

        <circle
          cx={ DimensionsStore.getCityTimelineStyle().width / 2 - 10}
          cy={ 0 + 7}
          r={8}
          fill={ (this.props.status == 'planning' || this.props.status == 'active') ? getColorForProjectType(this.props.project_type) : 'transparent' }
          stroke={ getColorForProjectType(this.props.project_type) }
          strokeWidth={2}
        /> 
        <text
          x={ DimensionsStore.getCityTimelineStyle().width / 2 - 10}
          y={12}
          className={'stage ' +  this.props.status}
        >
          { this.props.status.substring(0,1).toUpperCase()}
        </text>

        { (this.props.nonwhite || this.props.whites) ?
          <g>

            <line
              x1={ DimensionsStore.getCityTimelineStyle().width * 0.75 }
              x2={ DimensionsStore.getCityTimelineStyle().width * 0.75 }
              y1={0}
              y2={20}
              className='divider'
            />

            <rect
              x={this.props.xNonwhite}
              y={0}
              width={ this.props.widthNonwhite }
              height={14}
              className={ 'poc' + ((this.props.inspectedProject && this.props.inspectedProject != this.props.project_id) ? ' notInspected' : '') }
              id={ this.props.project_id  }
            />
            <text
              x={ this.props.xNonwhite - 3}
              y={ 0 + 13}
              className={'count poc' + ((this.props.inspectedProject && this.props.inspectedProject != this.props.project_id) ? ' notInspected' : '')}
            >
              { formatNumber(this.props.nonwhite) }
            </text>
            <rect
              x={this.props.xWhite}
              y={0}
              width={ this.props.widthWhite }
              height={14}
              className={'white' + ((this.props.inspectedProject && this.props.inspectedProject != this.props.project_id) ? ' notInspected' : '')}
              id={ this.props.project_id  }
            />
            <text
              x={ this.props.xWhite+ this.props.widthWhite + 3}
              y={ 0 + 13 }
              className={'count white' + ((this.props.inspectedProject && this.props.inspectedProject != this.props.project_id) ? ' notInspected' : '')}
              id={ this.props.project_id  }
            >
              { formatNumber(this.props.whites) }
            </text>
          </g> : 

          <g>
            <rect
              x={DimensionsStore.getCityTimelineStyle().width * 0.5  }
              y={0}
              width={ (this.props.totalFamilies / this.props.theMax) * DimensionsStore.getCityTimelineStyle().width / 3 }
              height={14}
              className={'territory ' + +((this.props.inspectedProject && this.props.inspectedProject != this.props.project_id) ? ' notInspected' : '')}
              id={ this.props.project_id  }
            />
            <text
              x={ DimensionsStore.getCityTimelineStyle().width * 0.5 + (this.props.totalFamilies / this.props.theMax) * DimensionsStore.getCityTimelineStyle().width / 3 + 3}
              y={ 0 + 13 }
              className={'count territory '  + ((this.props.inspectedProject && this.props.inspectedProject != this.props.project_id) ? ' notInspected' : '')}
              id={ this.props.project_id  }
            >
              { formatNumber(this.props.totalFamilies) }
            </text>
          </g>
        }
      </g>
    );
  }

}