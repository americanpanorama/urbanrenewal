import * as React from 'react';

import * as d3 from 'd3';
import ReactTransitionGroup from 'react-addons-transition-group';

import PolygonD3 from './PolygonD3.jsx';
import GeoState from './GeoState.jsx';
import Highways from './HighwaysComponent.jsx';
import Dorlings from './DorlingsComponent.jsx';

import CitiesStore from '../../stores/CitiesStore.js';
import GeographyStore from '../../stores/GeographyStore';
import HighwaysStore from '../../stores/HighwaysStore';
import DimensionsStore from '../../stores/DimensionsStore';
import HelperFunctions from '../../utils/HelperFunctions.js';

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
          transform={'translate('+this.state.x+','+this.state.y+') scale(' + this.state.z*.9 + ')'}
        >

          {/* the states */}
          { GeographyStore.getStatesGeojson().map(polygon => {
            return (
              <path
                key={ polygon.id }
                d={ GeographyStore.getPath(polygon.geometry) }
                strokeWidth={ 1 / this.state.z }
                stroke={ 'transparent' }
                className='stateMap'
              />
            );
          })}

          {/* dorlings */}
          <ReactTransitionGroup component='g' className='transitionGroup'>
            { CitiesStore.getDorlings().map((cityData, i) => (
              <Dorlings
                { ...cityData }
                dorlingXY={ CitiesStore.getDorlingXY(cityData.city_id) }
                r={ DimensionsStore.getDorlingRadius(cityData.value) / this.props.z }
                key={'cityCircle' + cityData.city_id }
                zoom={ this.props.z }
                strokeWidth={ 0.5/this.props.z }
                onCityClicked={ this.props.onCityClicked }
                selected={ (CitiesStore.getSelectedCity() == cityData.city_id) }
              />
            ))}
          </ReactTransitionGroup> 
            
        </g>


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