import * as React from 'react';
import { PropTypes } from 'react';
import * as d3 from 'd3';
import ReactTransitionGroup from 'react-addons-transition-group';

import PolygonD3 from './PolygonD3.jsx';
import GeoStates from './GeoStates.jsx';
import Highways from './HighwaysComponent.jsx';
import Dorlings from './DorlingsComponent.jsx';

import CitiesStore from '../stores/CitiesStore.js';
import GeographyStore from '../stores/GeographyStore';
import HighwaysStore from '../stores/HighwaysStore';

export default class USMap extends React.Component {

  constructor (props) { 
    super(props); 
    this.state = {
      x: this.props.state.x,
      y: this.props.state.y,
      zoom: this.props.state.zoom,
      dorlingZoom: this.props.state.zoom
    };
  }

  componentWillEnter(callback) { callback(); }

  componentWillLeave(callback) { callback(); }

  componentWillReceiveProps(nextProps) {
    if (this.props.state.zoom !== nextProps.state.zoom || this.props.state.x !== nextProps.state.x || this.props.state.y !== nextProps.state.y) {
      this.setState({
        dorlingZoom: nextProps.state.zoom
      });
      d3.select(this.refs['nationalMap'])
        .transition()
        .duration(750)
        .attr("transform", "translate("+nextProps.state.x+","+nextProps.state.y+")scale(" + nextProps.state.zoom +")")
        .each('end', () => {
          this.setState({
            x: nextProps.state.x,
            y: nextProps.state.y,
            zoom: nextProps.state.zoom
          });
        });
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    return true;
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

  // A modified d3.geo.albersUsa to include Puerto Rico.
  albersUsaPr() {
    var ε = 1e-6;

    var lower48 = d3.geo.albers();

    // EPSG:3338
    var alaska = d3.geo.conicEqualArea()
        .rotate([154, 0])
        .center([-2, 58.5])
        .parallels([55, 65]);

    // ESRI:102007
    var hawaii = d3.geo.conicEqualArea()
        .rotate([157, 0])
        .center([-3, 19.9])
        .parallels([8, 18]);

    // XXX? You should check that this is a standard PR projection!
    var puertoRico = d3.geo.conicEqualArea()
        .rotate([66, 0])
        .center([0, 18])
        .parallels([8, 18]);

    var point,
      pointStream = {point: function(x, y) { point = [x, y]; }},
      lower48Point,
      alaskaPoint,
      hawaiiPoint,
      puertoRicoPoint;

    function albersUsa(coordinates) {
      var x = coordinates[0], y = coordinates[1];
      point = null;
      (lower48Point(x, y), point)
          || (alaskaPoint(x, y), point)
          || (hawaiiPoint(x, y), point)
          || (puertoRicoPoint(x, y), point);
      return point;
    }

    albersUsa.invert = function(coordinates) {
      var k = lower48.scale(),
        t = lower48.translate(),
        x = (coordinates[0] - t[0]) / k,
        y = (coordinates[1] - t[1]) / k;
      return (y >= .120 && y < .234 && x >= -.425 && x < -.214 ? alaska
          : y >= .166 && y < .234 && x >= -.214 && x < -.115 ? hawaii
          : y >= .204 && y < .234 && x >= .320 && x < .380 ? puertoRico
          : lower48).invert(coordinates);
    };

    // A naïve multi-projection stream.
    // The projections must have mutually exclusive clip regions on the sphere,
    // as this will avoid emitting interleaving lines and polygons.
    albersUsa.stream = function(stream) {
      var lower48Stream = lower48.stream(stream),
        alaskaStream = alaska.stream(stream),
        hawaiiStream = hawaii.stream(stream),
        puertoRicoStream = puertoRico.stream(stream);
      return {
        point: function(x, y) {
          lower48Stream.point(x, y);
          alaskaStream.point(x, y);
          hawaiiStream.point(x, y);
          puertoRicoStream.point(x, y);
        },
        sphere: function() {
          lower48Stream.sphere();
          alaskaStream.sphere();
          hawaiiStream.sphere();
          puertoRicoStream.sphere();
        },
        lineStart: function() {
          lower48Stream.lineStart();
          alaskaStream.lineStart();
          hawaiiStream.lineStart();
          puertoRicoStream.lineStart();
        },
        lineEnd: function() {
          lower48Stream.lineEnd();
          alaskaStream.lineEnd();
          hawaiiStream.lineEnd();
          puertoRicoStream.lineEnd();
        },
        polygonStart: function() {
          lower48Stream.polygonStart();
          alaskaStream.polygonStart();
          hawaiiStream.polygonStart();
          puertoRicoStream.polygonStart();
        },
        polygonEnd: function() {
          lower48Stream.polygonEnd();
          alaskaStream.polygonEnd();
          hawaiiStream.polygonEnd();
          puertoRicoStream.polygonEnd();
        }
      };
    };

    albersUsa.precision = function(_) {
      if (!arguments.length) return lower48.precision();
      lower48.precision(_);
      alaska.precision(_);
      hawaii.precision(_);
      puertoRico.precision(_);
      return albersUsa;
    };

    albersUsa.scale = function(_) {
      if (!arguments.length) return lower48.scale();
      lower48.scale(_);
      alaska.scale(_ * .35);
      hawaii.scale(_);
      puertoRico.scale(_);
      return albersUsa.translate(lower48.translate());
    };

    albersUsa.translate = function(_) {
      if (!arguments.length) return lower48.translate();
      var k = lower48.scale(), x = +_[0], y = +_[1];

      lower48Point = lower48
          .translate(_)
          .clipExtent([[x - .455 * k, y - .238 * k], [x + .455 * k, y + .238 * k]])
          .stream(pointStream).point;

      alaskaPoint = alaska
          .translate([x - .307 * k, y + .201 * k])
          .clipExtent([[x - .425 * k + ε, y + .120 * k + ε], [x - .214 * k - ε, y + .234 * k - ε]])
          .stream(pointStream).point;

      hawaiiPoint = hawaii
          .translate([x - .205 * k, y + .212 * k])
          .clipExtent([[x - .214 * k + ε, y + .166 * k + ε], [x - .115 * k - ε, y + .234 * k - ε]])
          .stream(pointStream).point;

      puertoRicoPoint = puertoRico
          .translate([x + .150 * k, y + .224 * k])
          .clipExtent([[x + .120 * k, y + .204 * k], [x + .180 * k, y + .234 * k]])
          .stream(pointStream).point;

      return albersUsa;
    };

    return albersUsa.scale(1070);
  }

  render () {
    let width = this.props.style.width,
      height = this.props.style.height,
      scale = Math.min(1.36 * width, 2.08 * height); // I calculated these with trial and error--sure there's a more precise way as this will be fragile if the width changes

    let projection = this.albersUsaPr()
      .scale(scale)
      .translate([width / 2, height / 2]);

    // calculate scale
    // let easternmost = projection([-66.95, 44.815])[0],
    //   westernmost = projection([-124.732, 48.164])[0],
    //   northernmost = projection([-95.153, 49.384])[1],
    //   southernmost = projection([-81.086, 25.11])[1];

    let path = d3.geo.path()
      .projection(projection);

    let r = d3.scale.sqrt()
      .domain([0, (this.props.state.cat == 'funding') ? CitiesStore.getCategoryMaxForCity('urban renewal grants dispursed') : CitiesStore.getCategoryMaxForCity('totalFamilies') ])
      .range([0, 50/this.state.dorlingZoom]);

    return (
      <svg 
        width={width}  
        height={height}
        className='ussvg'
        onDoubleClick={ this.props.onMapClicked }
        onMouseUp={this.props.handleMouseUp }
        onMouseDown={this.props.handleMouseDown }
        onMouseMove={this.props.handleMouseMove }
      >
        <g 
          ref='nationalMap'
          transform={'translate('+this.state.x+','+this.state.y+')scale(' + this.state.zoom + ')'}
        >
          <GeoStates 
            path={ path }
            state={ this.props.state }
          />
          <ReactTransitionGroup component='g' className='transitionGroup'>
            { HighwaysStore.getHighwaysList().map(polygon => {
              if (polygon.properties.year_open <= this.props.state.year) {
                return (
                  <Highways 
                    key={ 'highwaysOpened' + polygon.properties.year_open }
                    d={ path(polygon.geometry) }
                    polygon={ polygon }
                    zoom={ this.props.state.zoom }
                  />
                );
              }
            })}
          </ReactTransitionGroup>
          <ReactTransitionGroup component='g' className='transitionGroup'>
            { CitiesStore.getDorlings(this.props.state.year, this.props.state.cat).filter(cityData => projection(cityData.lngLat) !== null).map((cityData, i) => (
              <Dorlings
                r={ r(cityData.value) >= 2/this.props.state.zoom ? r(cityData.value) : 2/this.props.state.zoom }
                cx={ projection(cityData.lngLat)[0] }
                cy={ projection(cityData.lngLat)[1] }
                key={'cityCircle' + cityData.city_id }
                zoom={ this.props.state.zoom }
                color={ cityData.color }
                strokeWidth={ 1/this.props.state.zoom }
                city_id={ cityData.city_id }
                onCityClicked={ this.props.onCityClicked }
                selected={ (CitiesStore.getSelectedCity() == cityData.city_id) }
              />
            ))}
          </ReactTransitionGroup>

          {/* selected city on top */}
          <ReactTransitionGroup component='g' className='transitionGroup'>
            { CitiesStore.getDorlings(this.props.state.year, this.props.state.cat).filter(cityData => CitiesStore.getSelectedCity() == cityData.city_id).map((cityData, i) => (
              <Dorlings
                r={ r(cityData.value) >= 2/this.props.state.zoom ? r(cityData.value) : 2/this.props.state.zoom }
                cx={ projection(cityData.lngLat)[0] }
                cy={ projection(cityData.lngLat)[1] }
                key={'cityCircleSelected' + cityData.city_id }
                zoom={ this.props.state.zoom }
                color='transparent'
                strokeWidth={ 3/this.props.state.zoom }
                className='selected'
              />
            ))}
          </ReactTransitionGroup>  

          { (this.props.state.zoom >= 4) ?
            CitiesStore.getDorlings(this.props.state.year, this.props.state.cat).filter(cityData => projection(cityData.lngLat) !== null).map((cityData, i) => (
                <text
                  x={ projection(cityData.lngLat)[0] }
                  y={ projection(cityData.lngLat)[1] - r(cityData.value) - 1 }
                  fontSize={ 16 / this.props.state.zoom }
                  key={ 'cityLabel' + cityData.city_id }
                  onClick={ this.props.onCityClicked }
                  id={ cityData.city_id }
                  className='cityLabel'
                > 
                  { cityData.name.replace(/\b\w/g, l => l.toUpperCase()) }
                </text>
            )) :
            ''
          }
            
        </g>

        <text
          x={30} 
          y={50} 
          fontSize={60}
          fill='yellow'
          textAnchor='middle'

        >
          +
        </text>
        <text 
          x={30} 
          y={80} 
          fontSize={60}
          textAnchor='middle'
          fill='yellow'
          onClick={ this.props.zoomOut }
        >
          -
        </text>

        <text 
          x={30} 
          y={100} 
          fontSize={20}
          textAnchor='middle'
          fill='yellow'
          
          onClick={ this.props.resetView }
        >
          reset
        </text>
        
      </svg>
    );
  }
}