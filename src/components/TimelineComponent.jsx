import * as React from 'react';
import { PropTypes } from 'react';
import * as d3 from 'd3';
import ReactTransitionGroup from 'react-addons-transition-group';

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
    let firstYear = 1954,
      years = [...Array(19).keys()].map(num => num+firstYear),
      width = this.props.style.width,
      rightMargin = 50,
      contentWidth = width - rightMargin,
      yearWidth = contentWidth / years.length,
      yearMiddleOffset = yearWidth / 2,
      barWidth = Math.round(yearWidth * 0.6666),
      barOffset = (yearWidth - barWidth) / 2,
      height = this.props.style.height,
      yearLabelSize = 14,
      yearLabelHeight = 20,
      yearLabelY = height / 2 + yearLabelSize / 2,
      topY = height / 2 - yearLabelHeight / 2,
      bottomY = height / 2 + yearLabelHeight / 2,
      maxFamilies = Object.keys(this.props.yearsData).reduce((candidate, year) => (!this.props.yearsData[year].totalFamilies || candidate > this.props.yearsData[year].totalFamilies) ? candidate : this.props.yearsData[year].totalFamilies, 0),
      familiesTickInterval = 50000,
      familiesTickHeight = topY / (maxFamilies / familiesTickInterval);

    console.log(familiesTickHeight, maxFamilies % familiesTickInterval);
      
    

    return (
      <svg 
        width={width}  
        height={height}
        id='timeline'
      >

        {/* category labels */}
        <g>
          <text
            dx={ 80 }
            dy={ 20 }
            fill='white'
            fontSize={ 15 }
            textAnchor='start'
            alignmentBaseline='baseline'
          >
            families displaced
          </text>
          <text
            dx={ 80 }
            dy={ 150 }
            fill='white'
            fontSize={ 15 }
            textAnchor='start'
            alignmentBaseline='hanging'
          >
            funding
          </text>
        </g>

      
          {/* axes */}
          { [...Array(Math.floor(maxFamilies /familiesTickInterval)).keys()].map(iterator => {
            console.log(iterator);
            return (
              <text
                dx={ rightMargin }
                dy={ topY - (iterator + 1) * familiesTickHeight}
                fontSize={ 10 }
                fill='white'
                textAnchor='end'
                alignmentBaseline='middle'
                key={ 'topAxesTick' + iterator }
              >
                { ((iterator + 1) * familiesTickInterval / 1000) + 'K' }
              </text>
            );
          }) }

        <g 
          transform={'translate(' + rightMargin +')'}
        >




          {/* year labels */}
          { years.map(year => {
            return (
              <text
                dx={ (year - firstYear) * yearWidth + yearMiddleOffset }
                dy={ (year % 5 == 0) ? yearLabelY : yearLabelY - 1 }
                fill={ (year == this.props.state.year) ? 'lightblue' : 'white' }
                fontSize={ (year % 5 == 0) ? yearLabelSize : yearLabelSize - 2 }
                textAnchor='middle'
                onClick={ this.props.onClick }
                id={ year }
                key={ 'year' + year }

              >
                { (year % 5 == 0) ? year : "'" + (year - 1900) }
              </text>
            );
          })}
        

          {/* selected year */}
          <rect
            x={ (this.props.state.year - firstYear) * yearWidth + barOffset }
            y={ 60 }
            width={ barWidth}
            height={ 30 }
            onClick={ this.props.onClick }
            id={ this.props.state.year }
            stroke='none'
          />

          <text
            dx={ (this.props.state.year - firstYear) * yearWidth + yearMiddleOffset }
            dy={ 80 }
            fill='white'
            fontSize={ (this.props.state.year % 5 == 0) ? 14 : 12 }
            textAnchor='middle'
            onClick={ this.props.onClick }
            id={ this.props.state.year }
            key={ 'year' + this.props.state.year }
          >
            { (this.props.state.year % 5 == 0) ? this.props.state.year : "'" + (this.props.state.year - 1900) }
          </text>

          {/* families data */}
          {/* baseline */}
          <rect
            x={ 0 }
            y={ topY }
            width={ contentWidth }
            height={ 1 }
            fill={ this._pickHex([125,200,125], [100,150,200], 0.5) }
          />
          <g>
            { years.map(year => {
              if (this.props.yearsData[year].totalFamilies) {
                return (
                  <g>
                    <rect
                      x={ (year - firstYear) * yearWidth  + barOffset}
                      y={ topY - (topY * (this.props.yearsData[year].totalFamilies / maxFamilies)) }
                      width={ barWidth }
                      height={ topY * (this.props.yearsData[year].totalFamilies / maxFamilies) }
                      fill={ this._pickHex([125,200,125], [100,150,200], this.props.yearsData[year].percentFamiliesOfColor) }
                      onClick={ this.props.onClick }
                      id={ year }
                      key={ 'yearData' + year }
                      stroke={ (year == this.props.state.year) ? 'yellow' : 'none' }
                      strokeWidth={ 2 }
                    />

                    { [...Array(Math.floor(this.props.yearsData[year].totalFamilies /familiesTickInterval)).keys()].map(iterator => {
                      return (
                        <rect
                          x={ (year - firstYear) * yearWidth  + barOffset }
                          y={ topY - (iterator + 1) * familiesTickHeight}
                          width={ barWidth }
                          height={ 1 }
                          fill='#111'
                          key={ 'tickLine' + year + iterator }
                        />
                      );
                    }) }
                  </g>
                );
              }
            })}
          </g>


          {/* funding */}
          {/* baseline */}
          <rect
            x={ 0 }
            y={ bottomY }
            width={ contentWidth }
            height={ 1 }
            fill={ '#9E7B9B' }
          />
          <g>
            { years.map(year => {
              if (this.props.yearsData[year][68]) {
                return (
                  <rect
                    x={ (year - firstYear) * yearWidth + barOffset}
                    y={ bottomY }
                    width={ barWidth }
                    height={ this.props.yearsData[year][68] / 100000000 }
                    fill={ '#9E7B9B' }
                    onClick={ this.props.onClick }
                    id={ year }
                    key={ 'yearDataMoney' + year }
                  />
                );
              }
            })}
          </g>

        </g>


      </svg>
    );
  }

}