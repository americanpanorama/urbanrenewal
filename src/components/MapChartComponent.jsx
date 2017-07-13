import * as React from 'react';
import ReactDOM from 'react-dom';
import { PropTypes } from 'react';
import * as d3 from 'd3';
import ReactTransitionGroup from 'react-addons-transition-group';

import PolygonD3 from './PolygonD3.jsx';
import GeoState from './GeoState.jsx';
import Highways from './HighwaysComponent.jsx';
import Dorlings from './DorlingsComponent.jsx';
import DorlingLabel from './DorlingLabelComponent.jsx';
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
      d3.select(ReactDOM.findDOMNode(this))
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
    // if (this.props.z !== nextProps.z || this.props.x !== nextProps.x || this.props.y !== nextProps.y) {
    //   this.setState({
    //     dorlingZoom: nextProps.z
    //   });
    //   d3.select(this.refs['mapChart'])
    //     .transition()
    //     .duration(5000)
    //     .attr("transform", "translate("+nextProps.x+","+nextProps.y+")scale(" + nextProps.z +")")
    //     .each('end', () => {
    //       this.setState({
    //         x: nextProps.x,
    //         y: nextProps.y,
    //         z: nextProps.z
    //       });
    //     });
    // }

    if (this.props.selectedView !== 'scatterplot' && nextProps.selectedView == 'scatterplot') {
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
        ref='mapChart'
        transform={"translate("+this.state.x+","+this.state.y+")scale(" + this.state.z +")"}
      >

        <ReactTransitionGroup 
          component='g' 
          className=''
          
        >
          <MapChartField 
            { ...GeographyStore.getXYZ() }
            selectedView={ this.props.selectedView } 
          />

          { CitiesStore.getDorlingsForce().map((cityData, i) => {
            return (
              <Dorlings
                { ...cityData }
                { ...GeographyStore.getXYZ() }
                r={ DimensionsStore.getDorlingRadius(cityData.value) }
                key={'cityCircle' + cityData.city_id }
                strokeWidth={ 0.5/GeographyStore.getZ()}
                onCityClicked={ this.props.onCityClicked }
                onCityHover={ this.props.onCityHover }
                onCityOut={ this.props.onCityOut }
              />
            );  
          })}

          { CitiesStore.getDorlingsForce().map((cityData, i) => {
            const visibleRadius = (CitiesStore.getSelectedView() == 'cartogram') ? DimensionsStore.getDorlingRadius(cityData.value) * GeographyStore.getZ() : DimensionsStore.getDorlingRadius(cityData.value) ;
            if (DimensionsStore.dorlingHasLabel(cityData.city_id, visibleRadius)) {
              return (
                <DorlingLabel
                  { ...cityData }
                  { ...GeographyStore.getXYZ() }
                  r={ DimensionsStore.getDorlingRadius(cityData.value) }
                  key={'cityCircle' + cityData.city_id }
                  strokeWidth={ 0.5/GeographyStore.getZ()}
                  onCityClicked={ this.props.onCityClicked }
                  onCityHover={ this.props.onCityHover }
                  onCityOut={ this.props.onCityOut }
                />
              );
            }  
          })}
        </ReactTransitionGroup>

        (CitiesStore.getSelectedView() == 'cartogram') ? this.props.r : this.props.r / this.props.z



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

        
      </g>
    );
  }
}