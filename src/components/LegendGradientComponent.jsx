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
    return (
      <svg { ...DimensionsStore.getLegendGradientDimensions() }>
        <defs>
          <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" style={{stopColor:'rgb(44,160,44)', stopOpacity:1}} />
            <stop offset="50%" style={{stopColor:'rgb(255,231,97)', stopOpacity:1}} />
            <stop offset="100%" style={{stopColor:'rgb(163, 135, 190)', stopOpacity:1}} />
          </linearGradient>
        </defs>

        <g transform={ 'translate(' + DimensionsStore.getLegendGradientHorizontalGutter() + ' 0)'}>

          <rect 
            { ... DimensionsStore.getLegendGradientInteriorDimensions() }
            fill="url(#grad1)"
          />



          {/* category labels */}
          <text { ...DimensionsStore.getLegendGradientPOCLabelAttrs() }>% families of color displaced</text>
          <text { ...DimensionsStore.getLegendGradientWhitesLabelAttrs() }>% white families displaced</text>

          <g>
            {/* percent labels */}
            { (this.props.percent) ? 
              <g 
                className='percent'
              > 
                <text
                  x={ DimensionsStore.getLegendGradientInteriorDimensions().x }
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
              <g>
                {[1, 0.75, 0.5, 0.25, 0].map(perc => <text { ...DimensionsStore.getLegendGradientPercentAttrs(perc, 'poc') } key={'gradientLabelPoc' + perc}>{(perc * 100) + '%'}</text> )}
                {[1, 0.75, 0.5, 0.25, 0].map(perc => <text { ...DimensionsStore.getLegendGradientPercentAttrs(perc, 'white') } key={'gradientLabelWhite' + perc}>{(perc * 100) + '%'}</text> )}
              </g>
            }

            {/* gradient rect with masks for disabled ranges */}
            {(this.props.poc[0] > 0) ?
              <rect
                x={ DimensionsStore.getLegendGradientPercentX(this.props.poc[0]) }
                y={ DimensionsStore.getLegendGradientInteriorDimensions().y }
                width={ DimensionsStore.getLegendGradientPercentX(0) - DimensionsStore.getLegendGradientPercentX(this.props.poc[0]) }
                height={ DimensionsStore.getLegendGradientInteriorDimensions().height } 
                fill='black'
                fillOpacity={ 0.9 }
                //className='mask'
              /> :
              ''
            }
            {(this.props.poc[1] < 1) ?
              <rect
                x={ DimensionsStore.getLegendGradientPercentX(1) }
                y={ DimensionsStore.getLegendGradientInteriorDimensions().y }
                width={ DimensionsStore.getLegendGradientPercentX(this.props.poc[1]) - DimensionsStore.getLegendGradientPercentX(1) }
                height={ DimensionsStore.getLegendGradientInteriorDimensions().height } 
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
          

           {/* (this.props.percent) ? 
            <g>
              <rect
                x={ getLegendGradientInteriorDimensions().x - (this.props.percent/100 * getLegendGradientInteriorDimensions().x) }
                y={ height / 2 + barHeight / 2 + 5 }
                width={ 1 }
                height={ height-15 - (height / 2 + barHeight / 2 + 5) }
                fill='silver'
              />
              <rect
                x={ getLegendGradientInteriorDimensions().x - (this.props.percent/100 * getLegendGradientInteriorDimensions().x) }
                y={ height / 2 + barHeight / 2 + 5 }
                width={ 1 }
                height={ 7 }
                fill='silver'
                transform={"rotate(-30 " + (getLegendGradientInteriorDimensions().x - (this.props.percent/100 * getLegendGradientInteriorDimensions().x)) + " " + (height / 2 + barHeight / 2 + 5) + ")" }
              />
              <rect
                x={ getLegendGradientInteriorDimensions().x - (this.props.percent/100 * getLegendGradientInteriorDimensions().x) }
                y={ height / 2 + barHeight / 2 + 5 }
                width={ 1 }
                height={ 7 }
                fill='silver'
                transform={"rotate(30 " + (getLegendGradientInteriorDimensions().x - (this.props.percent/100 * getLegendGradientInteriorDimensions().x)) + " " + (height / 2 + barHeight / 2 + 5) + ")" }
              />
              <rect
                x={ getLegendGradientInteriorDimensions().x - (this.props.percent/100 * getLegendGradientInteriorDimensions().x) }
                y={ height - 15 }
                width={ width }
                height={ 1 }
                fill='silver'
              />
              <text
                dx={ getLegendGradientInteriorDimensions().x - (this.props.percent/100 * getLegendGradientInteriorDimensions().x) }
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
      </svg>
    );
  }

}