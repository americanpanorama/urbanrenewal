import * as React from 'react';
import { PropTypes } from 'react';
import * as d3 from 'd3';
import ReactTransitionGroup from 'react-addons-transition-group';

import PolygonD3 from './PolygonD3.jsx';
import GeoState from './GeoState.jsx';
import Highways from './HighwaysComponent.jsx';
import Dorlings from './DorlingsComponent.jsx';

import CitiesStore from '../stores/CitiesStore.js';
import GeographyStore from '../stores/GeographyStore';
import HighwaysStore from '../stores/HighwaysStore';
import DimensionsStore from '../stores/DimensionsStore';
import { getColorForRace } from '../utils/HelperFunctions.js';

export default class USMap extends React.Component {

  constructor (props) { 
    super(props); 
    this.state = {
      x: this.props.x,
      y: this.props.y,
      z: this.props.z,
      dorlingZoom: this.props.z
    };
  }

  componentWillEnter(callback) { callback(); }

  componentWillLeave(callback) { callback(); }

  componentWillReceiveProps(nextProps) {
    if (this.props.z !== nextProps.z || this.props.x !== nextProps.x || this.props.y !== nextProps.y) {
      this.setState({
        dorlingZoom: nextProps.z
      });
      d3.select(this.refs['nationalMap'])
        .transition()
        .duration(750)
        .attr("transform", "translate("+nextProps.x+","+nextProps.y+")scale(" + nextProps.z +")")
        .each('end', () => {
          this.setState({
            x: nextProps.x,
            y: nextProps.y,
            z: nextProps.z
          });
        });
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    return true;
  }

  render () {

    var nodes = CitiesStore.getDorlingsForce();

  

    // var force = d3.layout.force()
    //   .charge(0)
    //   .gravity(0)
    //   .size([DimensionsStore.getNationalMapWidth(), DimensionsStore.getNationalMapHeight()])
    //   .nodes(nodes)
    //   .on("tick", tick)
    //   .start();

    console.log(nodes);
    console.log(CitiesStore.getCityData(168).percentFamiliesOfColor);
    console.log(CitiesStore.getCityData(168).nonwhite_1960);

    const shortside = Math.min(DimensionsStore.getNationalMapWidth() * 0.4, DimensionsStore.getNationalMapHeight() * 0.4);

    let l = Math.sqrt(2*shortside*shortside);

    return (
      <g 
        width={ DimensionsStore.getNationalMapWidth() }  
        height={ DimensionsStore.getNationalMapHeight() }
        className='ussvg'
        onDoubleClick={ this.props.onMapClicked }
        onMouseUp={this.props.handleMouseUp }
        onMouseDown={this.props.handleMouseDown }
        onMouseMove={this.props.handleMouseMove }
      >

        <g transform={'translate('+DimensionsStore.getNationalMapWidth()/2+','+DimensionsStore.getNationalMapHeight()*0.9 + ') scale(' + this.state.z + ') rotate(225)'}>

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
            <marker id="arrow" markerWidth="10" markerHeight="10" refX="0" refY="3" orient="auto" markerUnits="strokeWidth">
              <path d="M0,0 L0,6 L9,3 z" fill="#fff" />
            </marker>
          </defs>

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


          {/* dorlings */}
          { nodes.map((cityData, i) => (
            <g>
              <circle
                cx={ (CitiesStore.getCityData(cityData.city_id).pop_1960 && CitiesStore.getCityData(cityData.city_id).nonwhite_1960) ? (CitiesStore.getCityData(cityData.city_id).nonwhite_1960 / CitiesStore.getCityData(cityData.city_id).pop_1960) * l : -900 }
                cy={ l - CitiesStore.getCityData(cityData.city_id).percentFamiliesOfColor * l }
                r={ DimensionsStore.getDorlingRadius(cityData.value/2) / this.props.z }
                style={ {
                  fill: cityData.color,
                  fillOpacity: 1,
                  strokeWidth: 1/this.props.z,
                } }
                onClick={ this.props.onCityClicked }
                id={ cityData.city_id }
                key={ 'city' + cityData.city_id }
                className={ 'dorling ' }
              />
              { (DimensionsStore.getDorlingRadius(cityData.value) / this.props.z > 15) ?
                <text
                  x={ (CitiesStore.getCityData(cityData.city_id).pop_1960) ? (CitiesStore.getCityData(cityData.city_id).nonwhite_1960 / CitiesStore.getCityData(cityData.city_id).pop_1960) * l : -100 }
                  y={ l - CitiesStore.getCityData(cityData.city_id).percentFamiliesOfColor * l }
                  textAnchor='middle'
                  alignmentBaseline='middle'
                  fontSize={ 12 }
                  transform={'rotate(135 ' + ((CitiesStore.getCityData(cityData.city_id).pop_1960) ? (CitiesStore.getCityData(cityData.city_id).nonwhite_1960 / CitiesStore.getCityData(cityData.city_id).pop_1960) * l : -100) + ' ' +  (l - CitiesStore.getCityData(cityData.city_id).percentFamiliesOfColor * l )+ ')'}
                >
                  {cityData.name.replace(/\w\S*/g, txt =>  txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase())}
                </text> : ''
              }
            </g>
          ))}

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

          {/* JSX Comment 
            <line
              x1={ l * 1.025 }
              y1={ l * 0.6 }
              x2={ l * 1.025 }
              y2={l * 0.8 }
              stroke='white'
              strokeWidth={1}
              markerEnd='url(#arrow)'
            />

            <line
              x1={ l * 1.025 }
              y1={ l * 0.4}
              x2={ l * 1.025 }
              y2={l * 0.2}
              stroke='white'
              strokeWidth={1}
              markerEnd='url(#arrow)'

            /> */}

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


        <g>

          <switch>
            <foreignObject 
              x={DimensionsStore.getNationalMapWidth() * 0.72}
              y={DimensionsStore.getNationalMapHeight() * 0.7}
              width="200" 
              height="200"
              style={{color: 'white'}} 
              requiredFeatures="http://www.w3.org/TR/SVG11/feature#Extensibility"
            >
              <p xmlns="http://www.w3.org/1999/xhtml">Cities on the yellow line had project where displacements of families by race were proportional to their overall racial demographics. Those few above displaced more white families, the majority below more families of color. For example, Cincinnati is near the bottom because while 22% of its population in 1960 were people of color, 95% of the families displaced by its projects were of color.</p>
            </foreignObject>
            <text x="20" y="20">No automatic linewrapping.</text>
          </switch>

          {/* 
          <text
            x={ DimensionsStore.getNationalMapWidth() / 2 +  shortside * 0.85 }
            y={ DimensionsStore.getNationalMapHeight() * 0.68}
            style={{
              fill: 'white',
              fontSize: '1.15em'
            }}
            textAnchor='middle'
          >
            Greater the disproportionality
          </text>
          <text
            x={ DimensionsStore.getNationalMapWidth() / 2 +  shortside * 0.85}
            y={ DimensionsStore.getNationalMapHeight() * 0.7}
            style={{
              fill: 'white',
              fontSize: '1.15em'
            }}
            textAnchor='middle'
          >
            of people of color displaced 
          </text>
          <text
            x={ DimensionsStore.getNationalMapWidth() / 2 +  shortside * 0.85}
            y={ DimensionsStore.getNationalMapHeight() * 0.72}
            style={{
              fill: 'white',
              fontSize: '1.15em'
            }}
            textAnchor='middle'
          >
            relative to racial
          </text>
          <text
            x={ DimensionsStore.getNationalMapWidth() / 2 +  shortside * 0.85}
            y={ DimensionsStore.getNationalMapHeight() * 0.74}
            style={{
              fill: 'white',
              fontSize: '1.15em'
            }}
            textAnchor='middle'
          >
            demography of the city
          </text>

          <line
            x1={ DimensionsStore.getNationalMapWidth() / 2 +  shortside * 0.85}
            y1={ DimensionsStore.getNationalMapHeight() * 0.75}
            x2={ DimensionsStore.getNationalMapWidth() / 2 +  shortside * 0.85}
            y2={DimensionsStore.getNationalMapHeight() * 0.9}
            stroke='white'
            strokeWidth={2}
            markerEnd='url(#arrow)'
          />*/}

        </g> 

 
                    
      </g>
    );
  }
}