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
import HelperFunctions from '../utils/HelperFunctions.js';

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

    var nodes = CitiesStore.getDorlingsForce().reverse();

    for (var alpha = 1; alpha > 0; alpha = alpha - 0.01) {


      var q = d3.geom.quadtree(nodes, DimensionsStore.getNationalMapWidth(), DimensionsStore.getNationalMapHeight());
      nodes.forEach(node => { 
        node.y += (node.y0 - node.y) * alpha *0.15;
        node.x += (node.x0 - node.x) * alpha *0.15;

        // collide 
        var k = 0.5;
        var nr = node.r,
          nx1 = node.x - nr,
          nx2 = node.x + nr,
          ny1 = node.y - nr,
          ny2 = node.y + nr;
        q.visit(function(quad, x1, y1, x2, y2) {
          if (quad.point && (quad.point !== node)) {
            var x = node.x - quad.point.x,
              y = node.y - quad.point.y,
              l = x * x + y * y,
              r = nr + quad.point.r;
            if (l < r * r) {
              l = ((l = Math.sqrt(l)) - r) / l * k;
              node.x -= x *= l;
              node.y -= y *= l;
              quad.point.x += x;
              quad.point.y += y;
            }
          }
          return x1 > nx2 || x2 < nx1 || y1 > ny2 || y2 < ny1;
        });

        //collide(.5);
        node.cx = node.x;
        node.cy = node.y;
      });
    };

    var gravity = function(k) {
      return function(d) {
        d.x += (d.x0 - d.x) * k;
        d.y += (d.y0 - d.y) * k;
      };
    };

    var collide = function(k) {
      var q = d3.geom.quadtree(nodes);
      return function(node) {
        var nr = node.r,
          nx1 = node.x - nr,
          nx2 = node.x + nr,
          ny1 = node.y - nr,
          ny2 = node.y + nr;
        q.visit(function(quad, x1, y1, x2, y2) {
          if (quad.point && (quad.point !== node)) {
            var x = node.x - quad.point.x,
              y = node.y - quad.point.y,
              l = x * x + y * y,
              r = nr + quad.point.r;
            if (l < r * r) {
              l = ((l = Math.sqrt(l)) - r) / l * k;
              node.x -= x *= l;
              node.y -= y *= l;
              quad.point.x += x;
              quad.point.y += y;
            }
          }
          return x1 > nx2 || x2 < nx1 || y1 > ny2 || y2 < ny1;
        });
      };
    };

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
    console.log(l);

    return (
      <g 
        width={ DimensionsStore.getNationalMapWidth() }  
        height={ DimensionsStore.getNationalMapHeight() }
        className='ussvg'
        onDoubleClick={ this.props.onMapClicked }
        onMouseUp={this.props.handleMouseUp }
        onMouseDown={this.props.handleMouseDown }
        onMouseMove={this.props.handleMouseMove }
        transform={'translate('+DimensionsStore.getNationalMapWidth()/2+','+DimensionsStore.getNationalMapHeight()*0.9 + ') scale(' + this.state.z + ') rotate(225)'}
      >
          <rect
            x={0}
            y={0}
            width={l}
            height={l}
            fill='white'
          />

          { [...Array(10).keys()].map(decile => {
            console.log(decile);
            return (
              <line
                x1={l*decile/10}
                y1={0}
                x2={l*decile/10}
                y2={l}
                stroke='silver'
              />
            );
          })}


          {/* dorlings */}
          { nodes.map((cityData, i) => (
            <g>
              <circle
                cx={ (CitiesStore.getCityData(cityData.city_id).pop_1960) ? (CitiesStore.getCityData(cityData.city_id).nonwhite_1960 / CitiesStore.getCityData(cityData.city_id).pop_1960) * l : -100 }
                cy={ l - CitiesStore.getCityData(cityData.city_id).percentFamiliesOfColor * l }
                r={ DimensionsStore.getDorlingRadius(cityData.value) / this.props.z }
                style={ {
                  fill: cityData.color,
                  fillOpacity: 1,
                  strokeWidth: 1/this.props.z
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
                    
      </g>
    );
  }
}