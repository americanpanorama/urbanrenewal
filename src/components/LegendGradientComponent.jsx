import * as React from 'react';
import { PropTypes } from 'react';
import * as d3 from 'd3';
import ReactTransitionGroup from 'react-addons-transition-group';
import Handle from './HandleComponent.jsx';
import CitiesStore from '../stores/CitiesStore.js';
import DimensionsStore from  '../stores/DimensionsStore.js';

export default class LegendGradient extends React.Component {

  constructor (props) { super(props); }

  render() {
    let maxValue = 1,
      maxLegendDorling = 1,
      legendIncrements = [1];
    if (CitiesStore.getSelectedCategory() == 'funding') {
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
        width={ DimensionsStore.getLegendWidth() }  
        height={150}
        className='legend'
      >
        <defs>
          <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" style={{stopColor:'rgb(44,160,44)', stopOpacity:1}} />
            <stop offset="50%" style={{stopColor:'rgb(200,200,200)', stopOpacity:1}} />
            <stop offset="100%" style={{stopColor:'rgb(163, 135, 190)', stopOpacity:1}} />
          </linearGradient>
        </defs>

        <rect
          x={0}
          y={0}
          width={ DimensionsStore.getLegendWidth() }  
          height={150}
          className='legendBackground'
        />

        <g
          className='gradientLegend'
        >

          {/* category labels */}
          <text
            x={ DimensionsStore.getLegendGradientLabelsX() }
            y={ DimensionsStore.getLegendGradientTopLabelY() }
            fontSize={ 15 }
            textAnchor='middle'
            alignmentBaseline='bottom'
          >
            people of color
          </text>
          <text
            x={ DimensionsStore.getLegendGradientLabelsX() }
            y={ DimensionsStore.getLegendGradientBottomLabelY() }
            fontSize={ 15 }
            textAnchor='middle'
            alignmentBaseline='hanging'

          >
            whites
          </text>

          <g>
            {/* percent labels */}
            { (this.props.percent) ? 
              <g 
                className='percent'
                
              > 
                <text
                  x={ DimensionsStore.getLegendGradientDimensions().x }
                  y={ DimensionsStore.getLegendGradientTopTextY() }
                >
                  { this.props.percent + '%' }
                </text> 
                <text
                  x={ 78 }
                  y={ DimensionsStore.getLegendGradientBottomTextY() }
                >
                  { (100 - this.props.percent) + '%' }
                </text>
              </g> :
              <g className='percent'>
                 <text
                    x={ DimensionsStore.getLegendGradientDimensions().x }
                    y={ DimensionsStore.getLegendGradientBottomTextY() }
                    className='whites left'
                  >
                    { (100 - Math.round(this.props.poc[1] * 100)) + '%' }
                  </text>
                  <text
                    x={ DimensionsStore.getLegendGradientDimensions().x + DimensionsStore.getLegendGradientDimensions().width }
                    y={ DimensionsStore.getLegendGradientBottomTextY() }
                    className='whites right'
                  >
                    { (100 - Math.round(this.props.poc[0] * 100)) + '%' }
                  </text>
                  <text
                    x={ DimensionsStore.getLegendGradientDimensions().x }
                    y={ DimensionsStore.getLegendGradientTopTextY() }
                    className='poc left'
                  >
                    { Math.round(this.props.poc[1] * 100) + '%' }
                  </text>
                  <text
                    x={ DimensionsStore.getLegendGradientDimensions().x + DimensionsStore.getLegendGradientDimensions().width }
                    y={ DimensionsStore.getLegendGradientTopTextY() }
                    className='poc right'
                  >
                    { Math.round(this.props.poc[0] * 100) + '%' }
                  </text>
              </g>
            }

            {/* gradient rect with masks for disabled ranges */}
            <rect 
              id="rect1" 
              { ... DimensionsStore.getLegendGradientDimensions() }
              fill="url(#grad1)"
            />
            {(this.props.poc[0] > 0) ?
              <rect
                x={ DimensionsStore.getLegendGradientPercentX(this.props.poc[0]) }
                y={ DimensionsStore.getLegendGradientDimensions().y }
                width={ DimensionsStore.getLegendGradientPercentX(0) - DimensionsStore.getLegendGradientPercentX(this.props.poc[0]) }
                height={ DimensionsStore.getLegendGradientDimensions().height } 
                fill='black'
                fillOpacity={ 0.9 }
                //className='mask'
              /> :
              ''
            }
            {(this.props.poc[1] < 1) ?
              <rect
                x={ DimensionsStore.getLegendGradientPercentX(1) }
                y={ DimensionsStore.getLegendGradientDimensions().y }
                width={ DimensionsStore.getLegendGradientPercentX(this.props.poc[1]) - DimensionsStore.getLegendGradientPercentX(1) }
                height={ DimensionsStore.getLegendGradientDimensions().height } 
                fill='black'
                fillOpacity={ 0.9 }
              /> :
              ''
            }

            {/* top and bottom handles */}
            { (!this.props.percent) ? 
              <g>
                <Handle
                  percent={ this.props.poc[0] }
                  max={ this.props.poc[1] }
                  onUpdate={ this.props.onDragUpdate }
                />

                <Handle
                  percent={ this.props.poc[1] }
                  min={ this.props.poc[0] }
                  onUpdate={ this.props.onDragUpdate }
                />
              </g> :
              ''  
            } 
            

             { (this.props.percent) ? 
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
            }
          </g>
        </g>

        <g className='dorlingLegend'>
          <circle
            cx={ 150 }
            cy={ 150}
            r={ DimensionsStore.getDorlingRadius(maxLegendDorling) }
            key='dorlinglegendbackground'
            className={ CitiesStore.getSelectedCategory() }
          />

          { legendIncrements.map(value => (
            <g key={ 'dorlinglegend' + value }>
              <circle
                cx={ 150 }
                cy={ 150 }
                r={ DimensionsStore.getDorlingRadius(value) }
                transform={ 'translate(0,' + (DimensionsStore.getDorlingRadius(maxLegendDorling) - DimensionsStore.getDorlingRadius(value)) + ')'}
                className='increment'
                
              />
              <text
                x={ 80 }
                y={ 150 + (DimensionsStore.getDorlingRadius(maxLegendDorling) - DimensionsStore.getDorlingRadius(value)) - DimensionsStore.getDorlingRadius(value)  }
              >
                { (CitiesStore.getSelectedCategory() == 'families') ? value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + ' families' : '$' + (value/1000000) + 'M' }
              </text>

              />
            </g>
          )) }
        </g>
      </svg>
    );
  }

}