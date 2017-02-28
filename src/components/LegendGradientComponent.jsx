import * as React from 'react';
import { PropTypes } from 'react';
import * as d3 from 'd3';
import ReactTransitionGroup from 'react-addons-transition-group';
import Handle from './HandleComponent.jsx';

export default class LegendGradient extends React.Component {

  constructor (props) {
    super(props);
  }

  componentWillReceiveProps(nextProps) {

  }

  componentDidMount() {
  }

  componentDidUpdate() {
  }

  _pickHex(color1, color2, weight) {
    var p = weight;
    var w = p * 2 - 1;
    var w1 = (w/1+1) / 2;
    var w2 = 1 - w1;
    var rgb = [Math.round(color1[0] * w1 + color2[0] * w2),
        Math.round(color1[1] * w1 + color2[1] * w2),
        Math.round(color1[2] * w1 + color2[2] * w2)];
    return 'rgb(' + rgb + ')';
  }

  render() {
    let width = this.props.style.width,
      height = this.props.style.height,
      gradientLegend = {
        width: this.props.style.width - 100,
        gutter: 50
      },
      xForBottom = gradientLegend.gutter + ((100 - Math.round(this.props.poc[0] * 100)) * gradientLegend.width / 100),
      xForTop = gradientLegend.gutter + ((100 - Math.round(this.props.poc[1] * 100)) * gradientLegend.width / 100);

    return (
      <svg 
        width={width}  
        height={height}
      >
        <defs>
          <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop 
              offset="0%" 
              style={{stopColor:'rgb(125,200,125)', stopOpacity:1}} />
            <stop offset="100%" style={{stopColor:'rgb(100,150,200)', stopOpacity:1}} />
          </linearGradient>
        </defs>

        <g
          className='gradientLegend'
        >

          {/* category labels */}
          <text
            x={ gradientLegend.gutter }
            y={ 16 }
            fontSize={ 11 }
            fill='white'
            textAnchor='middle'
          >
            people of color
          </text>
          <text
            x={ gradientLegend.gutter + gradientLegend.width }
            y={ 91 }
            fontSize={ 11 }
            fill='white'
            textAnchor='middle'
          >
            whites
          </text>

          {/* percent labels */}

          <text
            x={ xForBottom }
            y={ 32 }
            fontSize={ 11 }
            fill='white'
            textAnchor='start'
          >
            { Math.round(this.props.poc[0] * 100) + '%' }
          </text>
          <text
            x={ xForBottom }
            y={ 75 }
            fontSize={ 11 }
            fill="white"
            textAnchor='start'
          >
            { (100 - Math.round(this.props.poc[0] * 100)) + '%' }
          </text>
          <text
            x={ xForTop }
            y={ 32 }
            fontSize={ 11 }
            fill='white'
            textAnchor='end'
          >
            { Math.round(this.props.poc[1] * 100) + '%' }
          </text>
          <text
            x={ xForTop }
            y={ 75 }
            fontSize={ 11 }
            fill="white"
            textAnchor='end'
          >
            { (100 - Math.round(this.props.poc[1] * 100)) + '%' }
          </text>

          {/* gradient rect with masks for disabled ranges */}
          <g transform={ 'translate(' + gradientLegend.gutter + ')' } >
            <rect 
              id="rect1" 
              x="0" 
              y="40" 
              width={ gradientLegend.width } 
              height="20" 
              fill="url(#grad1)"
            />
            { (this.props.poc[0] > 0) ?
              <rect
                x={gradientLegend.width - (this.props.poc[0] * gradientLegend.width) + 2 }
                y="40" 
                width={ (this.props.poc[0] * gradientLegend.width) - 1 } 
                height="20" 
                fill="#111"
                fillOpacity={ 0.9 }
              /> :
              ''
            }
            { (this.props.poc[1] < 1) ?
              <rect
                x={ 0 }
                y="40" 
                width={ (1 - this.props.poc[1]) * gradientLegend.width} 
                height="20" 
                fill="#111"
                fillOpacity={ 0.9 }
              /> :
              ''
            }

            {/* top and bottom handles */}
            <Handle
              percent={ this.props.poc[0] }
              max={ this.props.poc[1] }
              width={ gradientLegend.width } 
              onUpdate={ this.props.onDragUpdate }
            />

            <Handle
              percent={ this.props.poc[1] }
              min={ this.props.poc[0] }
              width={ gradientLegend.width } 
              onUpdate={ this.props.onDragUpdate }
            />


          </g>
        </g>
      </svg>
    );
  }

}