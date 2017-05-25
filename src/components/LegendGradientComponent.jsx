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

  _calculateTickInterval(value) {
    let interval = -1;
    for (let num = 1; num <= 1000000000; num = num*10) {
      [1, 2.5, 5].forEach(multiplier => {
        let testNum = num * multiplier;
        if (interval == -1 && value / testNum <= 4 && value / testNum >= 1) {
          interval = testNum;
        }
      });
    }
    
    return interval;
  }

  render() {
    let width = this.props.style.width,
      height = this.props.style.height,
      dorlingsWidth = 220,
      gradientWidth = 40,
      gutter = 70,
      marginVertical = 30,
      barWidth = 20,
      barHeight = 150 - marginVertical * 2,
      legendOffset = 10,
      handleOverhang = 5,
      xForBottom = gutter + ((100 - Math.round(this.props.poc[0] * 100)) * barWidth / 100),
      xForTop = gutter + ((100 - Math.round(this.props.poc[1] * 100)) * barWidth / 100),
      mask = (this.props.percent) ? [this.props.percent/100 - 0.01, this.props.percent/100 + 0.01] : (this.props.poc) ? this.props.poc : [0,1];

    let maxValue = 1,
      maxLegendDorling = 1,
      legendIncrements = [1];
    if (this.props.state.cat == 'funding') {
      maxValue = CitiesStore.getCategoryMaxForCity('urban renewal grants dispursed');
      maxLegendDorling = 200000000;
      legendIncrements = [maxLegendDorling, 100000000, 50000000, 10000000, 1000000];
    } else {
      maxValue = CitiesStore.getCategoryMaxForCity('totalFamilies');
      maxLegendDorling = 15000;
      legendIncrements = [maxLegendDorling, 10000, 5000, 1000, 100];
    }

    let r =  d3.scale.sqrt()
      .domain([0, maxValue])
      .range([0, 50]);


    return (
      <svg 
        width={width}  
        height={height}
      >
        <defs>
          <linearGradient id="grad1" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style={{stopColor:'rgb(125,200,125)', stopOpacity:1}} />
            <stop offset="50%" style={{stopColor:'rgb(150,150,150)', stopOpacity:1}} />
            <stop offset="100%" style={{stopColor:'rgb(100,150,200)', stopOpacity:1}} />
          </linearGradient>
        </defs>

        <g
          className='gradientLegend'
          transform={ 'translate(200)' }
        >

          {/* category labels */}
          <text
            x={ gutter - legendOffset }
            y={ 0 }
            fontSize={ 15 }
            textAnchor='end'
            alignmentBaseline='hanging'
          >
            people of color
          </text>
          <text
            x={ gutter + barWidth + legendOffset }
            y={ height }
            fontSize={ 15 }
            textAnchor='start'
          >
            whites
          </text>

          <g transform={ 'translate(' + gutter + ',' + marginVertical + ')' } >
            {/* percent labels */}
            { (this.props.percent) ? 
              <g 
                className='percent'
                
              > 
                <text
                  x={ legendOffset * -1 }
                  y={ barHeight - (barHeight * this.props.percent/100 ) }
                >
                  { this.props.percent + '%' }
                </text> 
                <text
                  x={ barWidth + legendOffset }
                  y={ barHeight - (barHeight * this.props.percent/100 ) }
                >
                  { (100 - this.props.percent) + '%' }
                </text>
              </g> :
              <g className='percent'>
                 <text
                    x={ legendOffset * -1 }
                    y={ barHeight - (barHeight * this.props.poc[0]) }
                    className='poc bottom'
                  >
                    { Math.round(this.props.poc[0] * 100) + '%' }
                  </text>
                  <text
                    x={ barWidth + legendOffset }
                    y={ barHeight - (barHeight * this.props.poc[0]) }
                    className='whites bottom'
                  >
                    { (100 - Math.round(this.props.poc[0] * 100)) + '%' }
                  </text>
                  <text
                    x={ legendOffset * -1 }
                    y={ barHeight - (barHeight * this.props.poc[1]) }
                    className='top poc'
                  >
                    { Math.round(this.props.poc[1] * 100) + '%' }
                  </text>
                  <text
                    x={ barWidth + legendOffset }
                    y={ barHeight - (barHeight * this.props.poc[1]) }
                    className='top whites'
                  >
                    { (100 - Math.round(this.props.poc[1] * 100)) + '%' }
                  </text>
              </g>
            }

            {/* gradient rect with masks for disabled ranges */}
            <rect 
              id="rect1" 
              x="0" 
              y={ 0 }
              width={ barWidth } 
              height={ barHeight } 
              fill="url(#grad1)"
            />
            { (mask[0] > 0) ?
              <rect
                x={ 0 }
                y={ (1 - mask[0]) * barHeight }
                width={ barWidth }
                height={ (mask[0] * barHeight) } 
                className='mask'
              /> :
              ''
            }
            { (mask[1] < 1) ?
              <rect
                x={ 0 }
                y={ 0 }
                width={ barWidth }
                height={ barHeight - (mask[1] * barHeight) } 
                className='mask'
              /> :
              ''
            }

            {/* top and bottom handles */}
            { (!this.props.percent) ? 
              <g>
                <Handle
                  height={ barHeight }
                  width={ barWidth }
                  handleOverhang={ handleOverhang }
                  percent={ this.props.poc[0] }
                  max={ this.props.poc[1] }
                  width={ barWidth } 
                  onUpdate={ this.props.onDragUpdate }
                />

                <Handle
                  height={ barHeight }
                  width={ barWidth  }
                  handleOverhang={ handleOverhang }
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


        <g className='dorlingLegend'>
          <circle
            cx={ 150 }
            cy={ height/2 }
            r={ r(maxLegendDorling) }
            key='dorlinglegendbackground'
            className={ this.props.state.cat }
          />

          { legendIncrements.map(value => (
            <g key={ 'dorlinglegend' + value }>
              <circle
                cx={ 150 }
                cy={ height/2 }
                r={ r(value) }
                transform={ 'translate(0,' + (r(maxLegendDorling) - r(value)) + ')'}
                className='increment'
                
              />
              <text
                x={ 80 }
                y={ height/2 + (r(maxLegendDorling) - r(value)) - r(value)  }
              >
                { (this.props.state.cat == 'families') ? value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + ' families' : '$' + (value/1000000) + 'M' }
              </text>

              />
            </g>
          )) }
        </g>
      </svg>
    );
  }

}