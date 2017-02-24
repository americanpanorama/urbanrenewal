import * as React from 'react';
import { PropTypes } from 'react';
import * as d3 from 'd3';
import ReactTransitionGroup from 'react-addons-transition-group';
import Handle from './HandleComponent.jsx';

export default class Timeline extends React.Component {

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
        width: 160,
        gutter: 20
      };


    let years = [...Array(19).keys()].map(num => num+1954);
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
        <text
          dx={ 40 }
          dy={ 40 }
          fill='white'
        >
          families displaced
        </text>
        <text
          dx={ 40 }
          dy={ 100 }
          fill='white'
        >
          funding
        </text>
        <g>
          { years.map(year => {
            return (
              <text
                dx={ 100 + (year - 1954) * ((width - 400) / years.length) }
                dy={ 80 }
                fill='white'
                fontSize={ (year % 5 == 0) ? 14 : 12 }
                onClick={ this.props.onClick }
                id={ year }
                key={ 'year' + year }
              >
                { (year % 5 == 0) ? year : "'" + (year - 1900) }
              </text>
            );
          })}
        </g>
        <g>
          { years.map(year => {
            if (this.props.yearsData[year].totalFamilies) {
              return (
                <rect
                  x={ 100 + (year - 1954) * ((width - 400) / years.length)}
                  y={ 60 - (this.props.yearsData[year].totalFamilies / 4000) }
                  width={ (width-400) / years.length - 20 }
                  height={ this.props.yearsData[year].totalFamilies / 4000 }
                  fill={ this._pickHex([125,200,125], [100,150,200], this.props.yearsData[year].percentFamiliesOfColor) }
                  onClick={ this.props.onClick }
                  id={ year }
                  key={ 'yearData' + year }
                />
              );
            }
          })}
        </g>
        <g>
          { years.map(year => {
            if (this.props.yearsData[year][68]) {
              return (
                <rect
                  x={ 100 + (year - 1954) * ((width - 400) / years.length)}
                  y={ 90 }
                  width={ (width-400) / years.length - 20 }
                  height={ this.props.yearsData[year][68] / 100000000 }
                  fill={ 'yellow' }
                  onClick={ this.props.onClick }
                  id={ year }
                  key={ 'yearDataMoney' + year }
                />
              );
            }
          })}
        </g>
        <g
          className='gradientLegend'
          transform={ 'translate(' + (width - 200) + ')' }
        >
          <text
            x={ 6 }
            y={ 16 }
            fontSize={ 11 }
            fill='white'
          >
            people of color
          </text>
          <text
            x={ 194 }
            y={ 91 }
            fontSize={ 11 }
            fill='white'
            textAnchor='end'
          >
            whites
          </text>
          
          { [0, Math.round(this.props.poc[0] * 100), Math.round(this.props.poc[1] * 100), 100].map(percent => {
            return (
              <g>
                <line
                  x1={ gradientLegend.gutter + ((100 - percent) * gradientLegend.width / 100) }
                  x2={ gradientLegend.gutter + ((100 - percent) * gradientLegend.width / 100) }
                  y1={ 36 }
                  y2={ 64 }
                  stroke='white'
                  strokeWidth={ 1 }
                  key={ 'tick' + percent}
                /> 
                <text
                  x={ gradientLegend.gutter + ((100 - percent) * gradientLegend.width / 100) }
                  y={ 32 }
                  fontSize={ 11 }
                  fill={ ((percent !== 100 || this.props.poc[1] <= 0.85) && (percent !== 0 || this.props.poc[0] >= 0.15)) ? 'white' : 'transparent'  }
                  textAnchor='middle'
                  key={ 'POCtick' + percent }
                >
                  { percent + '%' }
                </text>

                <text
                  x={ gradientLegend.gutter + ((100 - percent) * gradientLegend.width / 100) }
                  y={ 75 }
                  fontSize={ 11 }
                  fill={ ((percent !== 100 || this.props.poc[1] <= 0.85) && (percent !== 0 || this.props.poc[0] >= 0.15)) ? 'white' : 'transparent'  }
                  textAnchor='middle'
                  key={ 'whitetick' + percent }
                >
                  { (100 - percent) + '%' }
                </text>
              </g>

            );
          })}
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
                x={ 1 }
                y="40" 
                width={ (1 - this.props.poc[1]) * gradientLegend.width - 3} 
                height="20" 
                fill="#111"
                fillOpacity={ 0.9 }
              /> :
              ''
            }


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