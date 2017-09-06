import * as React from 'react';
import * as d3 from 'd3';

import DimensionsStore from '../../stores/DimensionsStore';

export default class ChartField extends React.Component {

  constructor (props) {
    super(props);
    this.state = {
      z: this.props.z,
      opacity: (this.props.selectedView == 'scatterplot') ? 1 : 0,
      maskHeight: (this.props.selectedView == 'scatterplot') ? 0 : DimensionsStore.getNationalMapHeight() / 2 +  Math.sqrt(DimensionsStore.getScatterplotLength()*DimensionsStore.getScatterplotLength()/2)
    };
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.selectedView == 'scatterplot') {
      d3.select(this.refs['scatterplotField'])
        .transition()
        .attr('opacity', 1);
      d3.select(this.refs['scatterplotMask'])
        .transition()
        .duration(5750)
        .attr('height', 0)
        .each('end', () => {
          this.setState({
            maskHeight: 0,
            scatterplotOpacity: 1
          });
        });
    }

    if (this.props.selectedView == 'scatterplot' && nextProps.selectedView !== 'scatterplot') {
      d3.select(this.refs['scatterplotField'])
        .transition()
        .duration(750)
        .attr('opacity', 0)
        .each('end', () => {
          this.setState({
            scatterplotOpacity: 0
          });
        });
      d3.select(this.refs['scatterplotMask'])
        .transition()
        .duration(750)
        .attr('height', 2*  Math.sqrt(DimensionsStore.getScatterplotLength()*DimensionsStore.getScatterplotLength()/2))
        .each('end', () => {
          this.setState({
            maskHeight: DimensionsStore.getNationalMapHeight() / 2 +  Math.sqrt(DimensionsStore.getScatterplotLength()*DimensionsStore.getScatterplotLength()/2)
          });
        });
    }
  }

  render() {
    const shortside = Math.min(DimensionsStore.getNationalMapWidth() * 0.4, DimensionsStore.getNationalMapHeight() * 0.4),
      scatterplotMaxY = DimensionsStore.getNationalMapHeight()/2 + shortside;
    return (
      <g>
        <defs>
          <linearGradient id="graphgradient2" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{stopColor:'rgb(163, 135, 190)', stopOpacity:0.5}} />
            <stop offset="40%" style={{stopColor:'rgb(163, 135, 190)', stopOpacity:0.5}} />
            <stop offset="50%" style={{stopColor:'rgb(128,128,128)', stopOpacity:0.5}} />
            <stop offset="60%" style={{stopColor:'rgb(44,160,44)', stopOpacity:0.5}} />
            <stop offset="100%" style={{stopColor:'rgb(44,160,44)', stopOpacity:0.5}} />
          </linearGradient>
          <linearGradient id="maskgradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="75%" style={{stopColor:'rgb(209,213,215)', stopOpacity:1}} />
            <stop offset="100%" style={{stopColor:'rgb(209,213,215)', stopOpacity:0}} />
          </linearGradient>
        </defs>

         <g 
          opacity={ this.state.opacity }
          transform={ 'translate('+DimensionsStore.getNationalMapWidth()/2+','+scatterplotMaxY + ') scale(' + this.state.z + ') rotate(225)' }
          ref='scatterplotField'
          className='scatterplotField'
        >
          <rect
            x={0}
            y={0}
            width={ DimensionsStore.getScatterplotLength() }
            height={ DimensionsStore.getScatterplotLength() }
            fill="url(#graphgradient2)"
          />

          { [...Array(11).keys()].map(decile => {
            return (
              <line
                x1={ DimensionsStore.getScatterplotLengthDecile(decile) }
                y1={0}
                x2={ DimensionsStore.getScatterplotLengthDecile(decile) }
                y2={ DimensionsStore.getScatterplotLength() }
                className='gridline'
                key={'xgridline' + decile}
              />
            );
          }) }

          { [...Array(11).keys()].map(decile => {
            return (
              <line
                y1={ DimensionsStore.getScatterplotLengthDecile(decile) }
                x1={0}
                y2={ DimensionsStore.getScatterplotLengthDecile(decile) }
                x2={ DimensionsStore.getScatterplotLength() }
                className='gridline'
                key={'ygridline' + decile}
              />
            );
          }) }

          <line
            x1={DimensionsStore.getScatterplotLength()}
            y1={0}
            x2={0}
            y2={DimensionsStore.getScatterplotLength()}
            className='proportional'
          />

          <g>
            <text
              x={ DimensionsStore.getScatterplotLength() * 0.5}
              y={ DimensionsStore.getScatterplotLength() * -0.12 }
              transform={'rotate(180 ' + DimensionsStore.getScatterplotLength() * 0.5 + ' ' + DimensionsStore.getScatterplotLength() * -0.12 + ')'}
            >
              WHITE POPULATION OF CITY (1960)
            </text>

            { [...Array(10).keys()].map(decile => {
              let x = (decile + 1) * DimensionsStore.getScatterplotLength()/10,
                y = DimensionsStore.getScatterplotLength() * -0.03;
              return (
                <text
                  x={ x }
                  y={ y }
                  textAnchor='middle'
                  alignmentBaseline='hanging'
                  transform={'rotate(180 ' + x + ' ' + y + ')'}
                  key={ 'xLabel' + decile }
                >
                  { 90 -decile * 10 + '%' }
                </text>
              );
            }) }
          </g>

          <g>
            <text
              x={ DimensionsStore.getScatterplotLength() * -0.12 }
              y={ DimensionsStore.getScatterplotLength() * 0.5 }
              transform={'rotate(90 ' + DimensionsStore.getScatterplotLength() * -0.12 + ' ' + DimensionsStore.getScatterplotLength()*0.5 + ')'}
            >
              RACE OF FAMILIES DISPLACED
            </text>

            <text
              x={ DimensionsStore.getScatterplotLength() * -0.07 }
              y={ DimensionsStore.getScatterplotLength() * 0.75 }
              transform={'rotate(90 ' + DimensionsStore.getScatterplotLength() * -0.07 + ' ' + DimensionsStore.getScatterplotLength()*0.75 + ')'}
            >
              % whites
            </text>

            <text
              x={ DimensionsStore.getScatterplotLength() * -0.07 }
              y={ DimensionsStore.getScatterplotLength() * 0.25 }
              transform={'rotate(90 ' + DimensionsStore.getScatterplotLength() * -0.07 + ' ' + DimensionsStore.getScatterplotLength()*0.25 + ')'}
            >
              % people of color
            </text>

            { [...Array(5).keys()].map(decile => {
              let x = DimensionsStore.getScatterplotLength() * -0.03,
                y = decile * DimensionsStore.getScatterplotLength()/10;
              return (
                <text
                  x={ x }
                  y={ y }
                  transform={'rotate(90 ' + x + ' ' + y + ')'}
                  key={ 'yLabelWhite' + decile }
                >
                  { 100 -decile * 10 + '%' }
                </text>
              );
            }) }

            { [...Array(5).reverse().keys()].map(decile => {
              let x = DimensionsStore.getScatterplotLength() * -0.03,
                y = DimensionsStore.getScatterplotLength() - decile * DimensionsStore.getScatterplotLength()/10;
              return (
                <text
                  x={ x }
                  y={ y }
                  transform={'rotate(90 ' + x + ' ' + y + ')'}
                  key={ 'yLabelPOC' + decile }
                >
                  { 100 - decile * 10 + '%' }
                </text>
              );
            }) }

            <text
              x={ DimensionsStore.getScatterplotLength() * -0.03 }
              y={ DimensionsStore.getScatterplotLength()/2 }
              transform={'rotate(90 ' + DimensionsStore.getScatterplotLength() * -0.03 + ' ' + DimensionsStore.getScatterplotLength()/2 + ')'}
            >
              { 'even' }
            </text>
          </g>
        </g>

        {/* masking for transition */}
        <rect
          x={ 0 }
          y={ 0 }
          width={  DimensionsStore.getNationalMapWidth() }
          height={ this.state.maskHeight }
          fill="url(#maskgradient)"
          ref='scatterplotMask'
        />
      </g>
    );
  }
}