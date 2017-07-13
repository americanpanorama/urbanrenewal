import * as React from 'react';
import { PropTypes } from 'react';
import * as d3 from 'd3';
import ReactTransitionGroup from 'react-addons-transition-group';
import { getColorForRace, formatNumber } from '../utils/HelperFunctions';

export default class Timespan extends React.Component {

  render() {
    return (
      <g
        transform={'translate(' + this.props.x + ', ' + this.props.y + ')'}
      >
        <defs>
          <filter x="0" y="0" width="1" height="1" id="textBackground">
            <feFlood floodColor="#232d37"/>
            <feComposite in="SourceGraphic"/>
          </filter>
        </defs>

        {/* <rect
          x={ 0 }
          y={ 0 }
          width={ 0.5 }
          height={ this.props.height }
          fill='silver'
        />
        <rect
          x={ this.props.width - 1 }
          y={ 0 }
          width={ 0.5 }
          height={ this.props.height }
          fill='silver'
        /> */}

        <rect
          x={ 0 }
          y={ 0 }
          width={ this.props.width }
          height={ this.props.height }
          fill={ getColorForRace(this.props.projectData.percentFamiliesOfColor) }
          fillOpacity={ this.props.projectData.totalFamilies / (1 + this.props.projectData.endYear - this.props.projectData.startYear) / this.props.maxForYear }
          stroke={ getColorForRace(this.props.projectData.percentFamiliesOfColor) }
          strokeWidth='1'
        />
        <text
          dx={ this.props.width / 2 }
          dy={ this.props.height / 2 + 1 }
          fill={ (this.props.inSelectedYear) ? 'silver' : '#445'}
          fontSize={ 13 }
          textAnchor='middle'
          alignmentBaseline='middle'
          //filter="url(#textBackground)"
        >
          { this.props.text + ' - ' + formatNumber(this.props.projectData.totalFamilies)  }
        </text>
      </g>
    );
  }
}