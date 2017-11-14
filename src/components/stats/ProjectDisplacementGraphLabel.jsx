import * as React from 'react';
import ReactDOM from 'react-dom';
import * as d3 from 'd3';

import DimensionsStore from '../../stores/DimensionsStore';

export default class ProjectDisplacementGraphLabel extends React.Component {

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
        .attr('transform', 'translate(0 ' + (nextProps.y) +')')
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
        transform={'translate(0 ' + (this.state.y) +')'}
      >
         <text
          x={ DimensionsStore.getCityTimelineStyle().width / 2 - 40 }
          y={ 14 }
          className='label projects'
        >
          {this.props.label}
        </text>

        <text
          x={ DimensionsStore.getCityTimelineStyle().width / 2 - 10 }
          y={ 14 }
          className='label displacements'
        >
          Type
        </text>

        <text
          x={ DimensionsStore.getCityTimelineStyle().width * 0.75 }
          y={ 14 }
          className='label displacements'
        >
          Families Displaced
        </text>
      </g>
    );
  }

}