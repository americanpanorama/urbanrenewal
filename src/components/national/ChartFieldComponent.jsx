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
      scatterplotMaxY = DimensionsStore.getNationalMapHeight() * 12.5 / 31 + shortside;
    return (
      <g>
        <defs>
          <linearGradient id="graphgradient2" x1="100%" y1="0%" x2="0%" y2="0%">
            <stop offset="0%" style={{stopColor:'rgb(163, 135, 190)', stopOpacity:0.66}} />
            <stop offset="50%" style={{stopColor:'rgb(200,200,200)', stopOpacity:0.66}} />
            <stop offset="100%" style={{stopColor:'rgb(44,160,44)', stopOpacity:0.66}} />
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
            //fill='#F5F5F3'
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
              fontSize='1.5em'
            >
              {'PERCENTAGE OF THE CITY THAT WAS WHITE (' + this.props.popYear + ')'}
            </text>

            { [...Array(11).keys()].map(decile => {
              let x = (decile) * DimensionsStore.getScatterplotLength()/10,
                y = DimensionsStore.getScatterplotLength() * -0.03;
              return (
                <text
                  x={ x }
                  y={ y }
                  textAnchor='middle'
                  alignmentBaseline='hanging'
                  transform={'rotate(180 ' + x + ' ' + y + ')'}
                  key={ 'xLabel' + decile }
                  fillOpacity={ (!this.props.percentWhitePop) ? 1 : 0.1 }
                >
                  { 100 -decile * 10 + '%' }
                </text>
              );
            }) }

            { (this.props.percentWhitePop) ? 
              <text
                x={ (1-this.props.percentWhitePop) * DimensionsStore.getScatterplotLength() }
                y={ DimensionsStore.getScatterplotLength() * -0.03 }
                textAnchor='middle'
                alignmentBaseline='hanging'
                fontWeight='bold'
                transform={'rotate(180 ' + (1-this.props.percentWhitePop) * DimensionsStore.getScatterplotLength() + ' ' + DimensionsStore.getScatterplotLength() * -0.03 + ')'}
              >
                { Math.round(this.props.percentWhitePop * 100) + '% white/' + Math.round((1 -this.props.percentWhitePop) * 100) + '% of color'}
              </text> : ''
            }
          </g>

          <g>
            <text
              x={ DimensionsStore.getScatterplotLength() * -0.12 }
              y={ DimensionsStore.getScatterplotLength() * 0.5 }
              fontSize='1.5em'
              transform={'rotate(90 ' + DimensionsStore.getScatterplotLength() * -0.12 + ' ' + DimensionsStore.getScatterplotLength()*0.5 + ')'}
            >
              PERCENTAGE OF FAMILIES DISPLACED WHO WERE WHITE
            </text>

            {/* JSX Comment 
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
            */}

            { [...Array(0).keys()].map(decile => {
              let x = DimensionsStore.getScatterplotLength() * -0.03,
                y = decile * DimensionsStore.getScatterplotLength()/10;
              return (
                <text
                  x={ x }
                  y={ y }
                  transform={'rotate(90 ' + x + ' ' + y + ')'}
                  fillOpacity={ (!this.props.percentFamiliesOfColor) ? 1 : 0.1 }
                  key={ 'yLabelWhite' + decile }
                >
                  { 100 -decile * 10 + '%' }
                </text>
              );
            }) }


            { [...Array(11).reverse().keys()].map(decile => {
              let x = DimensionsStore.getScatterplotLength() * -0.03,
                y = DimensionsStore.getScatterplotLength() - decile * DimensionsStore.getScatterplotLength()/10;
              return (
                <text
                  x={ x }
                  y={ y }
                  transform={'rotate(90 ' + x + ' ' + y + ')'}
                  key={ 'yLabelPOC' + decile }
                  fillOpacity={ (!this.props.percentFamiliesOfColor) ? 1 : 0.1 }
                >
                  { 100 - decile * 10 + '%' }
                </text>
              );
            }) }

          {/* JSX Comment 
            <text
              x={ DimensionsStore.getScatterplotLength() * -0.03 }
              y={ DimensionsStore.getScatterplotLength()/2 }
              transform={'rotate(90 ' + DimensionsStore.getScatterplotLength() * -0.03 + ' ' + DimensionsStore.getScatterplotLength()/2 + ')'}
              fillOpacity={ (!this.props.percentFamiliesOfColor) ? 1 : 0.1 }
            >
              { 'even' }
            </text> */}

            { (this.props.percentFamiliesOfColor) ?
              <text
                x={ DimensionsStore.getScatterplotLength() * -0.03 }
                y={ DimensionsStore.getScatterplotLength() * (1 - this.props.percentFamiliesOfColor) }
                transform={'rotate(90 ' + DimensionsStore.getScatterplotLength() * -0.03 + ' ' + DimensionsStore.getScatterplotLength() * (1 - this.props.percentFamiliesOfColor) + ')'}
                fontWeight='bold'
              >
                { Math.round((1 -this.props.percentFamiliesOfColor) * 100) + '% white/' + (100 - Math.round((1-this.props.percentFamiliesOfColor) * 100)) + '% of color' }
              </text> : ''
            }

            <text
              x={ DimensionsStore.getScatterplotLength() * -0.35 }
              y={ DimensionsStore.getScatterplotLength() * 0.63 }
              fontSize='0.8em'
              className='inadequate'
              transform={'rotate(135 ' + DimensionsStore.getScatterplotLength() * -0.35 + ' ' + DimensionsStore.getScatterplotLength()*0.63 + ')'}
            >
              insufficient data for some cities
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