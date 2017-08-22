import * as React from 'react';

import * as d3 from 'd3';
import ReactTransitionGroup from 'react-addons-transition-group';
import { getColorForRace, formatNumber } from '../../utils/HelperFunctions';

export default class Timespan extends React.Component {

  render() {
    return (
      <g
        transform={'translate(' + this.props.x + ', ' + this.props.y + ')'}
      >
        <rect
          x={ 0 }
          y={ 0 }
          rx={ this.props.height / 2 }
          ry={ this.props.height / 2 }
          width={ this.props.width }
          height={ this.props.height }
          fill={ getColorForRace(this.props.projectData.percentFamiliesOfColor) }
          fillOpacity={ this.props.projectData.totalFamilies / (1 + this.props.projectData.end_year - this.props.projectData.start_year) / this.props.maxForYear }
          stroke={ getColorForRace(this.props.projectData.percentFamiliesOfColor) }
          strokeWidth='1'
          onMouseEnter={ this.props.onProjectInspected }
          onMouseLeave={ this.props.onProjectOut }
          id={ this.props.projectData.project_id }
        />
        <text
          dx={ this.props.width / 2 }
          dy={ this.props.height / 2 + 1 }
          fill={ (this.props.inSelectedYear) ? 'silver' : '#445'}
          fontSize={ 13 }
          textAnchor='middle'
          alignmentBaseline='middle'
          onMouseEnter={ this.props.onProjectInspected }
          onMouseLeave={ this.props.onProjectOut }
          id={ this.props.projectData.project_id }
        >
          { this.props.text + ' - ' + formatNumber(this.props.projectData.totalFamilies)  }
        </text>
      </g>
    );
  }
}