import * as React from 'react';
import { PropTypes } from 'react';
import * as d3 from 'd3';
import ReactTransitionGroup from 'react-addons-transition-group';

import PolygonD3 from './PolygonD3.jsx';
import GeoState from './GeoState.jsx';
import Highways from './HighwaysComponent.jsx';
import Dorlings from './DorlingsComponent.jsx';
import MapChartField from './MapChartField.jsx';

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
      dorlingZoom: this.props.z,
      scatterplotOpacity: (this.props.selectedView == 'scatterplot') ? 1 : 0,
      USMapOpacity: (this.props.selectedView == 'scatterplot') ? 0 : 1,
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
    if (nextProps.selectedView == 'scatterplot') {
      d3.select(this.refs['scatterplotField'])
        .transition()
        .duration(0)
        .attr('opacity', 1)
        .each('end', () => {
          this.setState({
            scatterplotOpacity: 1
          });
        });
      d3.select(this.refs['baseMap'])
        .transition()
        .duration(0)
        .attr('opacity', 0)
        .each('end', () => {
          this.setState({
            USMapOpacity: 0
          });
        });
    }

    if (this.props.selectedView == 'scatterplot' && nextProps.selectedView !== 'scatterplot') {
      d3.select(this.refs['scatterplotField'])
        .transition()
        .duration(0)
        .attr('opacity', 0)
        .each('end', () => {
          this.setState({
            scatterplotOpacity: 1
          });
        });
      d3.select(this.refs['baseMap'])
        .transition()
        .duration(0)
        .attr('opacity', 1)
        .each('end', () => {
          this.setState({
            USMapOpacity: 0
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
      <g 
        width={ DimensionsStore.getNationalMapWidth() }  
        height={ DimensionsStore.getNationalMapHeight() }
        className='ussvg'
        onDoubleClick={ this.props.onMapClicked }
        onMouseUp={this.props.handleMouseUp }
        onMouseDown={this.props.handleMouseDown }
        onMouseMove={this.props.handleMouseMove }
      >

        <MapChartField selectedView={ this.props.selectedView } z={ this.props.z }/>



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
          { CitiesStore.getDorlingsForce().map((cityData, i) => {
            return (
              <Dorlings
                { ...cityData }
                r={ DimensionsStore.getDorlingRadius(cityData.value) / this.props.z }
                key={'cityCircle' + cityData.city_id }
                zoom={ this.props.z }
                strokeWidth={ 1/this.props.z }
                onCityClicked={ this.props.onCityClicked }
                onCityHover={ this.props.onCityHover }
                onCityOut={ this.props.onCityHover }
                selected={ (CitiesStore.getSelectedCity() == cityData.city_id) }
              />
            );  
          })}
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
            

        { (this.props.selectedView == 'scatterplot') ?
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
          </g>: ''
        }

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

        <text 
          x={30} 
          y={20} 
          fontSize={20}
          textAnchor='middle'
          fill='yellow'
          id='map'
          onClick={ this.props.onViewSelected }
        >
          map
        </text>

        <text 
          x={30} 
          y={50} 
          fontSize={20}
          textAnchor='middle'
          fill='yellow'
          id='cartogram'
          onClick={ this.props.onViewSelected }
        >
          cartogram
        </text>

        <text 
          x={30} 
          y={80} 
          fontSize={20}
          textAnchor='middle'
          fill='yellow'
          id='scatterplot'
          onClick={ this.props.onViewSelected }
        >
          scatterplot
        </text>

        
      </g>
    );
  }
}