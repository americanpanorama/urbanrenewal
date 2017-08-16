import * as React from 'react';
import { PropTypes } from 'react';
import * as d3 from 'd3';

import PolygonD3 from './PolygonD3.jsx';
import GeoState from './GeoState.jsx';

import CitiesStore from '../stores/CitiesStore.js';
import GeographyStore from '../stores/GeographyStore';
import DimensionsStore from '../stores/DimensionsStore';

export default class MapChartField extends React.Component {

  constructor (props) { 
    super(props); 
    this.state = {
      x: this.props.x,
      y: this.props.y,
      z: this.props.z,
      scatterplotOpacity: (this.props.selectedView == 'scatterplot') ? 1 : 0,
      USMapOpacity: (this.props.selectedView == 'scatterplot') ? 0 : 1,
      maskHeight: (this.props.selectedView == 'scatterplot') ? 0 : DimensionsStore.getNationalMapHeight() / 2 +  Math.sqrt(DimensionsStore.getScatterplotLength()*DimensionsStore.getScatterplotLength()/2)
    };
  }

  componentWillEnter(callback) { callback(); }

  componentWillLeave(callback) { callback(); }

  componentWillReceiveProps(nextProps) {
    // if (this.props.z !== nextProps.z || this.props.x !== nextProps.x || this.props.y !== nextProps.y) {
    //   d3.select(this.refs['nationalMap'])
    //     .transition()
    //     .duration(750)
    //     .attr("transform", "translate("+nextProps.x+","+nextProps.y+")scale(" + nextProps.z +")")
    //     .each('end', () => {
    //       this.setState({
    //         x: nextProps.x,
    //         y: nextProps.y,
    //         z: nextProps.z
    //       });
    //     });
    // }
    if (nextProps.selectedView == 'scatterplot') {
      // d3.select(this.refs['scatterplotField'])
      //   .transition()
      //   .duration(2000)
      //   .attr('opacity', 1)
      //   .each('end', () => {
      //     this.setState({
      //       scatterplotOpacity: 1
      //     });
      //   });
      d3.select(this.refs['scatterplotField'])
        .transition()
        .attr('opacity', 1);
      d3.select(this.refs['baseMap'])
        .transition()
        .duration(5750*2/3)
        .attr('opacity', 0)
        .each('end', () => {
          this.setState({
            USMapOpacity: 0
          });
        });
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
      d3.select(this.refs['baseMap'])
        .transition()
        .duration(750)
        .attr('opacity', 1)
        .each('end', () => {
          this.setState({
            USMapOpacity: 0
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

  shouldComponentUpdate(nextProps, nextState) {
    return true;
  }

  render () {
    const transform = (false && CitiesStore.getSelectedView() == 'scatterplot') ? 'translate('+DimensionsStore.getNationalMapWidth()/2+','+DimensionsStore.getNationalMapHeight()*0.9 + ') scale(' + this.state.z + ') rotate(225)' : 'translate('+this.state.x+','+this.state.y+') scale(' + this.state.z + ')';

    const shortside = Math.min(DimensionsStore.getNationalMapWidth() * 0.4, DimensionsStore.getNationalMapHeight() * 0.4),
      scatterplotMaxY = DimensionsStore.getNationalMapHeight()/2 + shortside;

    return (
        <g>
         <g 
          opacity={ this.state.scatterplotOpacity }
          transform={ 'translate('+DimensionsStore.getNationalMapWidth()/2+','+scatterplotMaxY + ') scale(' + this.state.z + ') rotate(225)' }
          ref='scatterplotField'
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
                stroke='silver'
                strokeWidth={1}
                strokeOpacity={0.2}
                key={'x' + decile}
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
                stroke='silver'
                strokeWidth={1}
                strokeOpacity={0.2}
                key={'y' + decile}
              />
            );
          }) }

          <line
            x1={DimensionsStore.getScatterplotLength()}
            y1={0}
            x2={0}
            y2={DimensionsStore.getScatterplotLength()}
            stroke='yellow'
            strokeWidth={2}
          />

          <g>
            <text
              x={ DimensionsStore.getScatterplotLength() * 0.5}
              y={ DimensionsStore.getScatterplotLength() * -0.12 }
              textAnchor='middle'
              style={{fill:'white', fontSize: '1.3em'}}
              transform={'rotate(180 ' + DimensionsStore.getScatterplotLength() * 0.5 + ' ' + DimensionsStore.getScatterplotLength() * -0.12 + ')'}
            >
              WHITE POPULATION OF CITY (1960)
            </text>

          {/* JSX Comment 
            <text
              x={ DimensionsStore.getScatterplotLength() * 0.5}
              y={ DimensionsStore.getScatterplotLength() * -0.07 }
              textAnchor='middle'
              style={{fill:'white'}}
              transform={'rotate(180 ' + DimensionsStore.getScatterplotLength() * 0.5 + ' ' +  DimensionsStore.getScatterplotLength() * -0.07 + ')'}
            >
              % white
            </text> */}

            { [...Array(10).keys()].map(decile => {
              let x = (decile + 1) * DimensionsStore.getScatterplotLength()/10,
                y = DimensionsStore.getScatterplotLength() * -0.03;
              return (
                <text
                  x={ x }
                  y={ y }
                  textAnchor='middle'
                  style={{fill:'white'}}
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
              textAnchor='middle'
              style={{fill:'white', fontSize: '1.3em'}}
              transform={'rotate(90 ' + DimensionsStore.getScatterplotLength() * -0.12 + ' ' + DimensionsStore.getScatterplotLength()*0.5 + ')'}
            >
              RACE OF FAMILIES DISPLACED
            </text>

            <text
              x={ DimensionsStore.getScatterplotLength() * -0.07 }
              y={ DimensionsStore.getScatterplotLength() * 0.75 }
              textAnchor='middle'
              style={{fill:'white'}}
              transform={'rotate(90 ' + DimensionsStore.getScatterplotLength() * -0.07 + ' ' + DimensionsStore.getScatterplotLength()*0.75 + ')'}
            >
              % whites
            </text>

            <text
              x={ DimensionsStore.getScatterplotLength() * -0.07 }
              y={ DimensionsStore.getScatterplotLength() * 0.25 }
              textAnchor='middle'
              style={{fill:'white'}}
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
                  textAnchor='middle'
                  style={{fill:'white'}}
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
                  textAnchor='middle'
                  style={{fill:'white'}}
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
              textAnchor='middle'
              style={{fill:'white'}}
              transform={'rotate(90 ' + DimensionsStore.getScatterplotLength() * -0.03 + ' ' + DimensionsStore.getScatterplotLength()/2 + ')'}
            >
              { 'even' }
            </text>
          </g>

        {/* JSX Comment 
          <line
            x1={DimensionsStore.getScatterplotLength() * 0.55}
            y1={DimensionsStore.getScatterplotLength() * 0.55}
            x2={DimensionsStore.getScatterplotLength() * 0.85}
            y2={DimensionsStore.getScatterplotLength() * 0.85}
            stroke='#222'
            strokeWidth={3}
            strokeOpacity={0.7}
            markerEnd="url(#arrow)"
          />

          <line
            x1={DimensionsStore.getScatterplotLength() * 0.7}
            y1={DimensionsStore.getScatterplotLength() * 0.275}
            x2={DimensionsStore.getScatterplotLength() * 0.5}
            y2={DimensionsStore.getScatterplotLength() * 0.075}
            stroke='#222'
            strokeWidth={3}
            strokeOpacity={0.7}
            markerEnd="url(#arrow)"
          />

          <rect
            x={ DimensionsStore.getScatterplotLength() * 0.2}
            y={ 0 }
            width={ DimensionsStore.getScatterplotLength() * 0.2 }
            height={ DimensionsStore.getScatterplotLength() * 0.4 }
            fill="orange"
            fillOpacity={0.4}
            stroke="orange"
            strokeWidth={2}
          />

          <rect
            x={ 0 }
            y={ DimensionsStore.getScatterplotLength() * 0.666 }
            width={ DimensionsStore.getScatterplotLength() * 0.1 }
            height={ DimensionsStore.getScatterplotLength() * 0.333 }
            fill="pink"
            fillOpacity={0.4}
            stroke="pink"
            strokeWidth={2}
          />

          <rect
            x={ DimensionsStore.getScatterplotLength() * 0.1 }
            y={ DimensionsStore.getScatterplotLength() * 0.333 }
            width={ DimensionsStore.getScatterplotLength() * 0.1 }
            height={ DimensionsStore.getScatterplotLength() * 0.333 }
            fill="maroon"
            fillOpacity={0.4}
            stroke="maroon"
            strokeWidth={2}
          />  */}

          

        </g>

        <g>
          <switch>
            <foreignObject 
              { ...DimensionsStore.getScatterplotExplanationAttrs() }
              requiredFeatures="http://www.w3.org/TR/SVG11/feature#Extensibility"
            >
              <p xmlns="http://www.w3.org/1999/xhtml"  style={{backgroundColor: 'rgba(200,200,200,0.8)', padding: '10px', borderRadius: '10px'}}>James Baldwin famously characterized urban renewal as "Negro removal." Charting the percentage of families of color displaced by federally-funded urban renewal projects against the percentage of people of color in cities reinforces Baldwin's point. Cities below the yellow line, which is most cities, displaced families of color disproportionately relative to their overall population. For example, the bottom left of the graph shows cities like <span>Cincinnati</span>, 
                Norfolk, Cleveland, St. Louis, Philadelphia, Detroit where people of color were 20% to 30% of the overall population but made up two-thirds or more of those displaced. On the far right are usually smaller white cities with tiny populations of color. With people of color being less than 10% of those cities populations, though the majority of families displaced were white, families of color were still <em>disproportionately</em> displaced by most of these cities.</p>
            </foreignObject>
            <text x="20" y="20">No automatic linewrapping.</text>
          </switch> 
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

        <g 
          ref='nationalMap'
        >
          <defs>
            <linearGradient id="graphgradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" style={{stopColor:'rgb(163, 135, 190)', stopOpacity:1}} />
              <stop offset="50%" style={{stopColor:'rgb(255,231,97)', stopOpacity:1}} />
              <stop offset="100%" style={{stopColor:'rgb(44,160,44)', stopOpacity:1}} />
            </linearGradient>
            <linearGradient id="graphgradient2" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{stopColor:'rgb(163, 135, 190)', stopOpacity:0.5}} />
              <stop offset="40%" style={{stopColor:'rgb(163, 135, 190)', stopOpacity:0.5}} />
              <stop offset="50%" style={{stopColor:'rgb(128,128,128)', stopOpacity:0.5}} />
              <stop offset="60%" style={{stopColor:'rgb(44,160,44)', stopOpacity:0.5}} />
              <stop offset="100%" style={{stopColor:'rgb(44,160,44)', stopOpacity:0.5}} />
            </linearGradient>
            <linearGradient id="maskgradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="75%" style={{stopColor:'rgb(128,128,128)', stopOpacity:1}} />
              <stop offset="100%" style={{stopColor:'rgb(128,128,128)', stopOpacity:0}} />
            </linearGradient>
            <filter id="glow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="6 6" result="glow"/>
            </filter>
            <marker id="arrow" markerWidth="10" markerHeight="10" refX="0" refY="3" orient="auto" markerUnits="strokeWidth">
              <path d="M0,0 L0,6 L9,3 z" fill="#222" />
            </marker>
          </defs>

          <g 
            opacity={this.state.USMapOpacity}
            ref='baseMap'
          >

            {/* background: the states for map and cartogram, gradient field for scatterplot */}
            { GeographyStore.getStatesGeojson().map(polygon => {
              return (
                <path
                  key={ 'statepolygon' + polygon.id }
                  d={ GeographyStore.getPath(polygon.geometry) }
                  strokeWidth={ (CitiesStore.getSelectedView() == 'cartogram') ? 0.1 / this.state.z : 1 / this.state.z }
                  stroke={ (CitiesStore.getSelectedView() == 'cartogram') ? 'white' : 'silver' }
                  fillOpacity={(CitiesStore.getSelectedView() == 'cartogram') ? 0.75 : 1}
                  className='stateMap'
                  style={{
                    filter: (CitiesStore.getSelectedView() == 'map') ? '' : 'url(#glow)'
                  }}
                />
              );
            }) }

            {/* for outline hovers 
            { GeographyStore.getStatesGeojson().map(polygon => {
              return (
                <GeoState
                  state={this.props.state}
                  key={ polygon.id }
                  d={ GeographyStore.getPath(polygon.geometry) }
                  onStateClicked={ this.props.onStateClicked }
                  id={ polygon.id }
                />
              );
            })} */}
          </g>
        </g>
      </g>
    );
  }
}