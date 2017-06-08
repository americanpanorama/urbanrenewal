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
        <g 
          ref='nationalMap'
          transform={'translate('+this.state.x+','+this.state.y+') scale(' + this.state.z + ')'}
        >

          {/* the states */}
          { GeographyStore.getStatesGeojson().map(polygon => {
            return (
              <path
                key={ polygon.id }
                d={ GeographyStore.getPath(polygon.geometry) }
                strokeWidth={ 1 / this.state.z }
                stroke={ 'silver' }
                className='stateMap'
              />
            );
          })}

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

          {/* highways 
          <ReactTransitionGroup component='g' className='transitionGroup'>
            { HighwaysStore.getHighwaysList().map(polygon => {
              if (polygon.properties.year_open <= this.props.state.year) {
                return (
                  <Highways 
                    key={ 'highwaysOpened' + polygon.properties.year_open }
                    d={ GeographyStore.getPath(polygon.geometry) }
                    polygon={ polygon }
                    zoom={ this.props.z }
                  />
                );
              }
            })}
          </ReactTransitionGroup> */}


          {/* dorlings */}
          <ReactTransitionGroup component='g' className='transitionGroup'>
            { CitiesStore.getDorlings().map((cityData, i) => (
              <Dorlings
                { ...cityData }
                r={ DimensionsStore.getDorlingRadius(cityData.value) }
                key={'cityCircle' + cityData.city_id }
                zoom={ this.props.z }
                strokeWidth={ 1/this.props.z }
                onCityClicked={ this.props.onCityClicked }
                selected={ (CitiesStore.getSelectedCity() == cityData.city_id) }
              />
            ))}
          </ReactTransitionGroup> 

          {/* selected city on top 
          <ReactTransitionGroup component='g' className='transitionGroup'>
            { CitiesStore.getDorlings(this.props.state.year, this.props.cat).filter(cityData => CitiesStore.getSelectedCity() == cityData.city_id).map((cityData, i) => (
              <Dorlings
                r={ r(cityData.value) >= 2/this.props.z ? r(cityData.value) : 2/this.props.z }
                cx={ GeographyStore.projectedX(cityData.lngLat) }
                cy={ GeographyStore.projectedY(cityData.lngLat) }
                key={'cityCircleSelected' + cityData.city_id }
                zoom={ this.props.z }
                color='transparent'
                strokeWidth={ 3/this.props.z }
                className='selected'
              />
            ))}
          </ReactTransitionGroup>  */}

          {/*  (this.props.z >= 4) ?
            CitiesStore.getDorlings(this.props.state.year, this.props.cat).filter(cityData => GeographyStore.getProjection()(cityData.lngLat) !== null).map((cityData, i) => (
                <text
                  x={ GeographyStore.getProjection()(cityData.lngLat)[0] }
                  y={ GeographyStore.getProjection()(cityData.lngLat)[1] - r(cityData.value) - 1 }
                  fontSize={ 16 / this.props.z }
                  key={ 'cityLabel' + cityData.city_id }
                  onClick={ this.props.onCityClicked }
                  id={ cityData.city_id }
                  className='cityLabel'
                > 
                  { cityData.name.replace(/\b\w/g, l => l.toUpperCase()) }
                </text>
            )) :
            ''
          */}
            
        </g>

      {/* JSX Comment 
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
        </text>*/}

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
        
      </g>
    );
  }
}