import * as React from 'react';
import { PropTypes } from 'react';
import * as d3 from 'd3';
import ReactTransitionGroup from 'react-addons-transition-group';

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
        <circle
          cx={ 0 }
          cy={ this.props.height / 2 }
          r={ 2 }
          fill={ (this.props.inSelectedYear) ? 'silver' : '#445'}
        />
        <circle
          cx={ this.props.width - 3 }
          cy={ this.props.height / 2 }
          r={ 2 }
          fill={ (this.props.inSelectedYear) ? 'silver' : '#445'}
        />
        <rect
          x={ 0 }
          y={ this.props.height / 2 }
          width={ this.props.width }
          height={ 0.5 }
          fill={ (this.props.inSelectedYear) ? 'silver' : '#445'} //'#FB9F89'
        />
        <text
          dx={ this.props.width / 2 }
          dy={ this.props.height / 2 + 3 }
          fill={ (this.props.inSelectedYear) ? 'silver' : '#445'}
          fontSize={ 12 }
          textAnchor='middle'
          alignmentBaseline='middle'
          filter="url(#textBackground)"
        >
          { this.props.text }
        </text>
      </g>
    );
  }
}