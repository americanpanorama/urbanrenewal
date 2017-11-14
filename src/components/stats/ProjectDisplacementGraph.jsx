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
        <text
          x={ DimensionsStore.getCityTimelineStyle().width / 2 - 20}
          y={ 0 + 14}
          className={ 'project' + ((this.props.the_geojson) ? ' hasFootprint' : '') + ((this.props.inspectedProject && this.props.inspectedProject != this.props.project_id) ? ' notInspected' : '') }
          id={ this.props.project_id  }
        >
          { this.props.project }
        </text>
        { (this.props.project_type) ?
          <circle
            cx={ DimensionsStore.getCityTimelineStyle().width / 2 - 10}
            cy={ 0 + 7}
            r={5}
            fill={ getColorForProjectType(this.props.project_type) }
          /> : ''
        }

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