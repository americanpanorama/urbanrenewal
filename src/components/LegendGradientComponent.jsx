import * as React from 'react';
import { PropTypes } from 'react';
import * as d3 from 'd3';
import ReactTransitionGroup from 'react-addons-transition-group';
import Handle from './HandleComponent.jsx';
import CitiesStore from '../stores/CitiesStore.js';

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
      dorlingsWidth = 220,
      gradientWidth = width - dorlingsWidth,
      gutter = 30,
      barWidth = gradientWidth - gutter * 2,
      barHeight = 20,
      xForBottom = gutter + ((100 - Math.round(this.props.poc[0] * 100)) * barWidth / 100),
      xForTop = gutter + ((100 - Math.round(this.props.poc[1] * 100)) * barWidth / 100),
      mask = (this.props.percent) ? [this.props.percent/100 - 0.01, this.props.percent/100 + 0.01] : (this.props.poc) ? this.props.poc : [0,1];

    let maxValue = (this.props.state.cat == 'funding') ? CitiesStore.getCategoryMaxForCity('urban renewal grants dispursed') : CitiesStore.getCategoryMaxForCity('totalFamilies');
    let r = d3.scale.sqrt()
      .domain([0, maxValue ])
      .range([0, 50/this.props.state.zoom]);

    console.log(maxValue);

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
          transform='translate(200,0)'
        >

          {/* category labels */}
          <text
            x={ gutter }
            y={ height * 0.25 - 5 }
            fontSize={ 15 }
            fill='white'
            textAnchor='start'
            alignmentBaseline='middle'
          >
            people of color
          </text>
          <text
            x={ gutter + barWidth }
            y={ height * 0.75 + 5 }
            fontSize={ 15 }
            fill='white'
            textAnchor='end'
            alignmentBaseline='middle'
          >
            whites
          </text>

          {/* percent labels */}
          { (this.props.percent) ? 
            <g transform={ 'translate(' + gutter + ')' } >
              <text
                dx={ barWidth - (this.props.percent/100 * barWidth) }
                y={ height / 2 - barHeight / 2 - 9 }
                fill='white'
                textAnchor='middle'
                fontSize={ 11 }
                alignmentBaseline='middle'
              >
                { this.props.percent + '%' }
              </text> 
              <text
                dx={ barWidth - (this.props.percent/100 * barWidth) }
                y={ height / 2 + barHeight / 2 + 9 }
                fill='white'
                textAnchor='middle'
                fontSize={ 11 }
                alignmentBaseline='middle'
              >
                { (100 - this.props.percent) + '%' }
              </text>
            </g> :
            <g>
               <text
                  x={ xForBottom }
                  y={ height / 2 - barHeight / 2 - 9 }
                  fontSize={ 11 }
                  fill='white'
                  textAnchor='start'
                  alignmentBaseline='baseline'
                >
                  { Math.round(this.props.poc[0] * 100) + '%' }
                </text>
                <text
                  x={ xForBottom }
                  y={ height / 2 + barHeight / 2 + 9 }
                  fontSize={ 11 }
                  fill="white"
                  textAnchor='start'
                  alignmentBaseline='hanging'
                >
                  { (100 - Math.round(this.props.poc[0] * 100)) + '%' }
                </text>
                <text
                  x={ xForTop }
                  y={ height / 2 - barHeight / 2 - 9 }
                  fontSize={ 11 }
                  fill='white'
                  textAnchor='end'
                  alignmentBaseline='baseline'
                >
                  { Math.round(this.props.poc[1] * 100) + '%' }
                </text>
                <text
                  x={ xForTop }
                  y={ height / 2 + barHeight / 2 + 9 }
                  fontSize={ 11 }
                  fill="white"
                  textAnchor='end'
                  alignmentBaseline='hanging'
                >
                  { (100 - Math.round(this.props.poc[1] * 100)) + '%' }
                </text>
            </g>
          }

 

          {/* gradient rect with masks for disabled ranges */}
          <g transform={ 'translate(' + gutter + ')' } >
            <rect 
              id="rect1" 
              x="0" 
              y={ height / 2 - barHeight / 2 }
              width={ barWidth } 
              height={ barHeight } 
              fill="url(#grad1)"
            />
            { (mask[0] > 0) ?
              <rect
                x={barWidth - (mask[0] * barWidth) + 2 }
                y={ height / 2 - barHeight / 2 }
                width={ (mask[0] * barWidth) - 1 } 
                height="20" 
                fill="#111"
                fillOpacity={ 0.9 }
              /> :
              ''
            }
            { (mask[1] < 1) ?
              <rect
                x={ 0 }
                y={ height / 2 - barHeight / 2 }
                width={ (1 - mask[1]) * barWidth} 
                height="20" 
                fill="#111"
                fillOpacity={ 0.9 }
              /> :
              ''
            }

            {/* top and bottom handles */}
            { (!this.props.percent) ? 
              <g>
                <Handle
                  y={ height / 2 - barHeight / 2 - 5 }
                  height={ barHeight + 10 }
                  percent={ this.props.poc[0] }
                  max={ this.props.poc[1] }
                  width={ barWidth } 
                  onUpdate={ this.props.onDragUpdate }
                />

                <Handle
                  y={ height / 2 - barHeight / 2 - 5 }
                  height={ barHeight + 10 }
                  percent={ this.props.poc[1] }
                  min={ this.props.poc[0] }
                  width={ barWidth } 
                  onUpdate={ this.props.onDragUpdate }
                />
              </g> :
              ''  
            }
            

            {/* (this.props.percent) ? 
              <g>
                <rect
                  x={ barWidth - (this.props.percent/100 * barWidth) }
                  y={ height / 2 + barHeight / 2 + 5 }
                  width={ 1 }
                  height={ height-15 - (height / 2 + barHeight / 2 + 5) }
                  fill='silver'
                />
                <rect
                  x={ barWidth - (this.props.percent/100 * barWidth) }
                  y={ height / 2 + barHeight / 2 + 5 }
                  width={ 1 }
                  height={ 7 }
                  fill='silver'
                  transform={"rotate(-30 " + (barWidth - (this.props.percent/100 * barWidth)) + " " + (height / 2 + barHeight / 2 + 5) + ")" }
                />
                <rect
                  x={ barWidth - (this.props.percent/100 * barWidth) }
                  y={ height / 2 + barHeight / 2 + 5 }
                  width={ 1 }
                  height={ 7 }
                  fill='silver'
                  transform={"rotate(30 " + (barWidth - (this.props.percent/100 * barWidth)) + " " + (height / 2 + barHeight / 2 + 5) + ")" }
                />
                <rect
                  x={ barWidth - (this.props.percent/100 * barWidth) }
                  y={ height - 15 }
                  width={ width }
                  height={ 1 }
                  fill='silver'
                />
                <text
                  dx={ barWidth - (this.props.percent/100 * barWidth) }
                  dy={ height-15 }
                  fill='white'
                  textAnchor='middle'
                  alignmentBaseline='middle'
                >
                  { (this.props.percent >= 50) ? this.props.percent + '% people of color' :  (100 - this.props.percent) + '% whites' }
                </text> 
              </g>:
              '' 
            */}

          </g>
        </g>

        <g>
          <circle
            cx={ 150 }
            cy={ height/2 }
            r={ r(15000) }
            fill={ this._pickHex([125,200,125], [100,150,200], 0.5) }
          />

          { [10000, 5000, 1000, 100].map(value => (
            <g>
              <circle
                cx={ 150 }
                cy={ height/2 }
                r={ r(value) }
                fill='transparent'
                stroke='#111'
                strokeWidth={ 0.5 }
                transform={ 'translate(0,' + (r(15000) - r(value)) + ')'}
                key={ 'dorlinglegend' + value }
              />
              <text
                x={ 80 }
                y={ height/2 + (r(15000) - r(value)) - r(value)  }
                fill='white'
                fontSize={ 11 }
                textAnchor='end'
                alignmentBaseline='middle'
              >
                { value + ' families'}
              </text>

              />
            </g>
          )) }
        </g>
      </svg>
    );
  }

}