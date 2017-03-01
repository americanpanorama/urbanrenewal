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
      headerHeight = 35,
      footerHeight = 35,
      contentHeight = height - headerHeight - footerHeight,
      yearLabelSize = 14,
      yearLabelHeight = 20,
      yearLabelY = contentHeight / 2,
      topY = contentHeight / 2 - yearLabelHeight / 2,
      bottomY = contentHeight / 2 + yearLabelHeight / 2,
      maxBarHeight = topY,
      maxFamilies = Object.keys(this.props.yearsData).reduce((candidate, year) => (!this.props.yearsData[year].totalFamilies || candidate > this.props.yearsData[year].totalFamilies) ? candidate : this.props.yearsData[year].totalFamilies, 0),
      familiesTickInterval = this._calculateTickInterval(maxFamilies),
      familiesTickHeight = topY / (maxFamilies / familiesTickInterval),
      maxFunding = Object.keys(this.props.yearsData).reduce((candidate, year) => (!this.props.yearsData[year][68] || candidate > this.props.yearsData[year][68]) ? candidate : this.props.yearsData[year][68], 0),
      fundingTickInterval = this._calculateTickInterval(maxFunding),
      fundingTickHeight = topY / (maxFunding / fundingTickInterval);

    return (
      <svg 
        width={width}  
        height={height}
        id='timeline'
      >

        <defs>
          <filter x="0" y="0" width="1" height="1" id="textBackground">
            <feFlood floodColor="#232d37"/>
            <feComposite in="SourceGraphic"/>
          </filter>
        </defs>

        {/* header */}
        <text
          dx={ width }
          dy={ 0 }
          fill='white'
          fontSize={ 20 }
          textAnchor='end'
          alignmentBaseline='hanging'
        >
          { this.props.name }
        </text>

        {/* category labels */}
        <g>
          <text
            dx={ rightMargin + 20 }
            dy={ 0 }
            fill='white'
            fontSize={ 15 }
            textAnchor='start'
            alignmentBaseline='hanging'
          >
            families displaced
          </text>
          <text
            dx={ rightMargin + 20 }
            dy={ height - 4 }
            fill='white'
            fontSize={ 15 }
            textAnchor='start'
            alignmentBaseline='baseline'
          >
            funding
          </text>
        </g>

    
        <g 
          transform={'translate(0,' + headerHeight + ')'}
        >  
          {/* axes */}
          { [...Array(Math.floor(maxFamilies /familiesTickInterval)).keys()].map(iterator => {
            return (
              <text
                dx={ rightMargin }
                dy={ topY - (iterator + 1) * familiesTickHeight}
                fontSize={ 11 }
                fill='white'
                textAnchor='end'
                alignmentBaseline='middle'
                key={ 'topAxesTick' + iterator }
              >
                { (maxFamilies > 4000) ? ((iterator + 1) * familiesTickInterval / 1000) + 'K' : (iterator + 1) * familiesTickInterval }
              </text>
            );
          }) }

          { [...Array(Math.floor(maxFunding /fundingTickInterval)).keys()].map(iterator => {
            let abbr = ((iterator + 1) * fundingTickInterval >= 1000000000) ? 'B' :
              ((iterator + 1) * fundingTickInterval >= 1000000) ? 'M' :
              ((iterator + 1) * fundingTickInterval >= 1000) ? 'K' :
              '',
              divisor = ((iterator + 1) * fundingTickInterval >= 1000000000) ? 1000000000 :
              ((iterator + 1) * fundingTickInterval >= 1000000) ? 1000000 :
              ((iterator + 1) * fundingTickInterval >= 1000) ? 1000 :
              '',
              displayNum = ((iterator + 1) * fundingTickInterval / divisor);
            return (
              <text
                dx={ rightMargin }
                dy={ bottomY + (iterator + 1) * fundingTickHeight}
                fontSize={ 11 }
                fill='white'
                textAnchor='end'
                alignmentBaseline='middle'
                key={ 'bottomAxesTick' + iterator }
              >
                { '$' + displayNum + abbr }
              </text>
            );
          }) }
        </g>

        <g 
          transform={'translate(' + rightMargin +',' + headerHeight + ')'}
        >
          {/* year labels */}
          { years.map(year => {
            return (
              <text
                dx={ (year - firstYear) * yearWidth + yearMiddleOffset }
                dy={ yearLabelY + 2 }
                fill={ (year == this.props.state.year) ? 'yellow' : 'white' }
                fontSize={ (year % 5 == 0) ? yearLabelSize : yearLabelSize - 2 }
                textAnchor='middle'
                alignmentBaseline='middle'
                onClick={ this.props.onClick }
                id={ year }
                key={ 'year' + year }

              >
                { (year % 5 == 0) ? year : "'" + (year - 1900) }
              </text>
            );
          })}

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
              if (this.props.yearsData[year] && this.props.yearsData[year].totalFamilies) {
                return (
                  <g>
                    <rect
                      x={ (year - firstYear) * yearWidth  + barOffset}
                      y={ topY - (maxBarHeight * (this.props.yearsData[year].totalFamilies / maxFamilies)) }
                      width={ barWidth }
                      height={ maxBarHeight * (this.props.yearsData[year].totalFamilies / maxFamilies) }
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
                          key={ 'toptickLine' + year + iterator }
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
              if (this.props.yearsData[year] && this.props.yearsData[year][68]) {
                return (
                  <g>
                    <rect
                      x={ (year - firstYear) * yearWidth + barOffset}
                      y={ bottomY }
                      width={ barWidth }
                      height={ maxBarHeight * this.props.yearsData[year][68] / maxFunding }
                      fill={ '#9E7B9B' }
                      onClick={ this.props.onClick }
                      id={ year }
                      key={ 'yearDataMoney' + year }
                    />

                    { [...Array(Math.floor(this.props.yearsData[year][68] /fundingTickInterval)).keys()].map(iterator => {
                      return (
                        <rect
                          x={ (year - firstYear) * yearWidth  + barOffset }
                          y={ bottomY + (iterator + 1) * fundingTickHeight}
                          width={ barWidth }
                          height={ 1 }
                          fill='#111'
                          key={ 'bottomtickLine' + year + iterator }
                        />
                      );
                    }) }
                  </g>
                );
              }
            })}
          </g>

          {/* no data available */}
          <rect
            x={ (1966 - firstYear) * yearWidth }
            y={ topY - maxBarHeight / 2 - 4 }
            width={ 1 }
            height={ 8 }
            fill='silver'
          />
          <rect
            x={ (1973 - firstYear) * yearWidth - 1 }
            y={ topY - maxBarHeight / 2 - 4 }
            width={ 1 }
            height={ 8 }
            fill='silver'
          />
          <rect
            x={ (1966 - firstYear) * yearWidth }
            y={ topY - maxBarHeight / 2 }
            width={ yearWidth * 7 }
            height={ 1 }
            fill='silver'
          />
          <text
            dx={ (1969 - firstYear) * yearWidth + yearMiddleOffset }
            dy={ topY - maxBarHeight / 2 }
            fill='silver'
            fontSize={ 12 }
            textAnchor='middle'
            alignmentBaseline='middle'
            filter="url(#textBackground)"
          >
            no displacement data available
          </text>

        </g>




      </svg>
    );
  }

}