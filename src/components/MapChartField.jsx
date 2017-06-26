import * as React from 'react';
import { PropTypes } from 'react';
import * as d3 from 'd3';
import ReactTransitionGroup from 'react-addons-transition-group';

import PolygonD3 from './PolygonD3.jsx';
import GeoState from './GeoState.jsx';

import CitiesStore from '../stores/CitiesStore.js';
import GeographyStore from '../stores/GeographyStore';
import DimensionsStore from '../stores/DimensionsStore';

export default class MapChartField extends React.Component {

  constructor (props) { 
    const shortside = Math.min(DimensionsStore.getNationalMapWidth() * 0.4, DimensionsStore.getNationalMapHeight() * 0.4);

    let l = Math.sqrt(2*shortside*shortside);

    super(props); 
    this.state = {
      x: this.props.x,
      y: this.props.y,
      z: this.props.z,
      dorlingZoom: this.props.z,
      scatterplotOpacity: (this.props.selectedView == 'scatterplot') ? 1 : 0,
      USMapOpacity: (this.props.selectedView == 'scatterplot') ? 0 : 1,
      maskHeight: 2*  Math.sqrt(l*l/2)
    };
  }

  componentWillEnter(callback) { callback(); }

  componentWillLeave(callback) { callback(); }

  componentWillReceiveProps(nextProps) {
    const shortside = Math.min(DimensionsStore.getNationalMapWidth() * 0.4, DimensionsStore.getNationalMapHeight() * 0.4);

    let l = Math.sqrt(2*shortside*shortside);
    if (this.props.z !== nextProps.z || this.props.x !== nextProps.x || this.props.y !== nextProps.y) {
      this.setState({
        dorlingZoom: nextProps.z
      });
      d3.select(this.refs['nationalMap'])
        .transition()
        .duration(5000)
        .attr("transform", "translate("+nextProps.x+","+nextProps.y+")scale(" + nextProps.z +")")
        .each('end', () => {
          this.setState({
            x: nextProps.x,
            y: nextProps.y,
            z: nextProps.z
          });
        });
    }
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
        .duration(5000)
        .attr('opacity', 0)
        .each('end', () => {
          this.setState({
            USMapOpacity: 0
          });
        });
      d3.select(this.refs['scatterplotMask'])
        .transition()
        .duration(10000)
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
        .duration(5000)
        .attr('opacity', 0)
        .each('end', () => {
          this.setState({
            scatterplotOpacity: 1
          });
        });
      d3.select(this.refs['baseMap'])
        .transition()
        .duration(5000)
        .attr('opacity', 1)
        .each('end', () => {
          this.setState({
            USMapOpacity: 0
          });
        });
      d3.select(this.refs['scatterplotMask'])
        .transition()
        .duration(10000)
        .attr('height', 2*  Math.sqrt(l*l/2))
        .each('end', () => {
          this.setState({
            maskHeight: 2*  Math.sqrt(l*l/2)
          });
        });
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    return true;
  }

  render () {
    const shortside = Math.min(DimensionsStore.getNationalMapWidth() * 0.4, DimensionsStore.getNationalMapHeight() * 0.4);

    let l = Math.sqrt(2*shortside*shortside);

    const transform = (false && CitiesStore.getSelectedView() == 'scatterplot') ? 'translate('+DimensionsStore.getNationalMapWidth()/2+','+DimensionsStore.getNationalMapHeight()*0.9 + ') scale(' + this.state.z + ') rotate(225)' : 'translate('+this.state.x+','+this.state.y+') scale(' + this.state.z + ')';

    return (
        <g>
         <g 
          opacity={ this.state.scatterplotOpacity }
          transform={ 'translate('+DimensionsStore.getNationalMapWidth()/2+','+DimensionsStore.getNationalMapHeight()*0.9 + ') scale(' + this.state.z + ') rotate(225)' }
          ref='scatterplotField'
        >
          <rect
            x={0}
            y={0}
            width={l}
            height={l}
            fill="url(#graphgradient2)"
          />

          { [...Array(11).keys()].map(decile => {
            return (
              <line
                x1={l*decile/10}
                y1={0}
                x2={l*decile/10}
                y2={l}
                stroke='silver'
                strokeWidth={1}
                key={'x' + decile}
              />
            );
          }) }

          { [...Array(11).keys()].map(decile => {
            return (
              <line
                y1={l*decile/10}
                x1={0}
                y2={l*decile/10}
                x2={l}
                stroke='silver'
                strokeWidth={1}
                key={'y' + decile}
              />
            );
          }) }

          <line
            x1={l}
            y1={0}
            x2={0}
            y2={l}
            stroke='yellow'
            strokeWidth={3}
          />

          <g>
            <text
              x={ l * 0.5}
              y={ l * 1.1 }
              textAnchor='middle'
              style={{fill:'white', fontSize: '1.3em'}}
              transform={'rotate(180 ' + l * 0.5 + ' ' + l*1.1 + ')'}
            >
              OVERALL POPULATION
            </text>

            <text
              x={ l * 0.5}
              y={ l * 1.05 }
              textAnchor='middle'
              style={{fill:'white'}}
              transform={'rotate(180 ' + l * 0.5 + ' ' + l*1.05 + ')'}
            >
              % white
            </text>

            { [...Array(10).keys()].map(decile => {
              let x = decile * l/10,
                y = l * 1.01;
              return (
                <text
                  x={ x }
                  y={ y }
                  textAnchor='middle'
                  style={{fill:'white'}}
                  transform={'rotate(180 ' + x + ' ' + y + ')'}
                >
                  { 100 -decile * 10 + '%' }
                </text>
              );
            }) }
          </g>

          <g>
            <text
              x={ l * 1.1}
              y={ l * 0.5 }
              textAnchor='middle'
              style={{fill:'white', fontSize: '1.3em'}}
              transform={'rotate(90 ' + l * 1.1 + ' ' + l*0.5 + ')'}
            >
              DISPLACEMENTS
            </text>

            <text
              x={ l * 1.05 }
              y={ l * 0.75 }
              textAnchor='middle'
              style={{fill:'white'}}
              transform={'rotate(90 ' + l * 1.05 + ' ' + l*0.75 + ')'}
            >
              % whites
            </text>

            <text
              x={ l * 1.05 }
              y={ l * 0.25 }
              textAnchor='middle'
              style={{fill:'white'}}
              transform={'rotate(90 ' + l * 1.05 + ' ' + l*0.25 + ')'}
            >
              % people of color
            </text>

            { [...Array(5).keys()].map(decile => {
              let x = l * 1.01,
                y = decile * l/10;
              return (
                <text
                  x={ x }
                  y={ y }
                  textAnchor='middle'
                  style={{fill:'white'}}
                  transform={'rotate(90 ' + x + ' ' + y + ')'}
                >
                  { 100 -decile * 10 + '%' }
                </text>
              );
            }) }

            { [...Array(5).reverse().keys()].map(decile => {
              let x = l * 1.01,
                y = l - decile * l/10;
              return (
                <text
                  x={ x }
                  y={ y }
                  textAnchor='middle'
                  style={{fill:'white'}}
                  transform={'rotate(90 ' + x + ' ' + y + ')'}
                >
                  { 100 - decile * 10 + '%' }
                </text>
              );
            }) }

            <text
              x={ l * 1.01 }
              y={ l/2 }
              textAnchor='middle'
              style={{fill:'white'}}
              transform={'rotate(90 ' + l * 1.01 + ' ' + l/2 + ')'}
            >
              { 'even' }
            </text>
          </g>

          

        </g>

        {/* masking for transition */}
        <rect
          x={ DimensionsStore.getNationalMapWidth() / 2 - Math.sqrt(l*l/2) }
          y={ DimensionsStore.getNationalMapHeight() / 2 - Math.sqrt(l*l/2) }
          width={ 2 * Math.sqrt(l*l/2) }
          height={ this.state.maskHeight }
          fill="url(#maskgradient)"
          ref='scatterplotMask'
        />

        <g 
          ref='nationalMap'
          transform={ 'translate('+this.state.x+','+this.state.y+') scale(' + this.state.z + ')' }
        >
          <defs>
            <linearGradient id="graphgradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" style={{stopColor:'rgb(163, 135, 190)', stopOpacity:1}} />
              <stop offset="50%" style={{stopColor:'rgb(255,231,97)', stopOpacity:1}} />
              <stop offset="100%" style={{stopColor:'rgb(44,160,44)', stopOpacity:1}} />
            </linearGradient>
            <linearGradient id="graphgradient2" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{stopColor:'rgb(44,160,44)', stopOpacity:1}} />
              <stop offset="50%" style={{stopColor:'rgb(128,128,128)', stopOpacity:1}} />
              <stop offset="100%" style={{stopColor:'rgb(163, 135, 190)', stopOpacity:1}} />
            </linearGradient>
            <linearGradient id="maskgradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="75%" style={{stopColor:'rgb(128,128,128)', stopOpacity:1}} />
              <stop offset="100%" style={{stopColor:'rgb(128,128,128)', stopOpacity:0}} />
            </linearGradient>
            <marker id="arrow" markerWidth="10" markerHeight="10" refX="0" refY="3" orient="auto" markerUnits="strokeWidth">
              <path d="M0,0 L0,6 L9,3 z" fill="#fff" />
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
                  strokeWidth={ 1 / this.state.z }
                  stroke={ 'silver' }
                  className='stateMap'
                />
              );
            }) }

            {/* for outline hovers */}
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
            })}
          </g>
        </g>
      </g>
    );
  }
}