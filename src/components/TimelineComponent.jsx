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
    console.log(this.props);
    let width = this.props.style.width,
      height = this.props.style.height;
    let years = [...Array(19).keys()].map(num => num+1954);
    return (
      <svg 
        width={width}  
        height={height}
      >
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
                dx={ 100 + (year - 1954) * ((width - 200) / years.length) }
                dy={ 80 }
                fill='white'
                onClick={ this.props.onClick }
                id={ year }
                key={ 'year' + year }
              >
                { year }
              </text>
            );
          })}
        </g>
        <g>
          { years.map(year => {
            if (this.props.yearsData[year].totalFamilies) {
              return (
                <rect
                  x={ 100 + (year - 1954) * ((width - 200) / years.length)}
                  y={ 60 - (this.props.yearsData[year].totalFamilies / 4000) }
                  width={ (width-200) / years.length - 20 }
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
                  x={ 100 + (year - 1954) * ((width - 200) / years.length)}
                  y={ 90 }
                  width={ (width-200) / years.length - 20 }
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
      </svg>
    );
  }

}