import * as React from 'react';

import { AppActions, AppActionTypes } from '../../utils/AppActionCreator';
import { getColorForRace, formatNumber } from '../../utils/HelperFunctions';

// stores
import DimensionsStore from '../../stores/DimensionsStore';
import GeographyStore from '../../stores/GeographyStore';

// components
import { Map, TileLayer, GeoJSON, Tooltip, LayerGroup, Marker, CircleMarker} from 'react-leaflet';
import UrbanRenewalPolygon from './UrbanRenewalPolygon.jsx';

export default class CityMap extends React.Component {

  constructor (props) {
    super(props);
    this.state = {
      viewport: {
        center: (this.props.lat && this.props.lng) ? [ this.props.lat, this.props.lng ] : [0,0],
        zoom: this.props.zoom || 14
      },
      moving: false
    };

    const handlers = ['onMove','onMoveEnd'];
    handlers.map(handler => { this[handler] = this[handler].bind(this); });

  }

  componentDidMount() { 
    AppActions.mapInitialized(this.refs.the_map.leafletElement); 
  }

  componentDidUpdate() {
    // bring urban renewal projects and city markers to top so they're not underneath census tracts or HOLC neighborhoods
    Object.keys(this.props.projects).map(projectId => {
      if (this.props.projects[projectId].the_geojson) {
        this.refs['projectFootprint' + projectId].leafletElement.bringToFront();
      }
    });

    this.props.cities.forEach(cityData => {
      if (!cityData.hasProjectGeojson) {
        this.refs['cityMarker' + cityData.city_id].leafletElement.bringToFront();
      }
    });

    // hide project labels that overlap
    let boundingBoxes = [],
      projects = Object.keys(this.props.projects)
        .filter(id => this.refs['labelFor' + id])
        .map(id => {return {id: id, type: 'project'}; }),
      cities = this.props.cities
        .filter(cityData => !cityData.hasProjectGeojson)
        .map(cityData => {return {id: cityData.city_id, type: 'city'};}),
      projectsAndCities = projects.concat(cities)
        .sort((a,b) => {
          if (a.type == 'project' && this.props.inspectedProjectStats == a.id || this.props.inspectedProject == a.id) {
            return -1;
          } 
          if (b.type == 'project' && this.props.inspectedProjectStats == b.id || this.props.inspectedProject == b.id) {
            return 1;
          } 
          if (a.type == 'city' && this.props.inspectedCity == a.id) {
            return -1;
          } 
          if (b.type == 'city' && this.props.inspectedCity == b.id) {
            return 1;
          } 
          if (a.type=='project' && b.type=='city') {
            return -1;
          } 
          if (a.type=='city' && b.type=='project') {
            return 1;
          } 
          if (a.type=='project' && b.type=='project') {
            return this.props.projects[b.id].totalFamilies - this.props.projects[a.id].totalFamilies;
          } else {
            return this.props.cities.find(cityData=>cityData.city_id == b.id).totalFamilies - this.props.cities.find(cityData=>cityData.city_id == a.id).totalFamilies;
          }
        });

    projectsAndCities.forEach(item => {
      let theLabel = (item.type == 'project') ? this.refs['labelFor' + item.id] : this.refs['labelForCity' + item.id],
        collides = false;

      // get the bounding box for the label
      const styles = window.getComputedStyle(theLabel.leafletElement._container),
        x1 = parseInt(styles.transform.match(/[0-9., -]+/)[0].split(", ")[4]),
        y1 = parseInt(styles.transform.match(/[0-9., -]+/)[0].split(", ")[5]),
        x2 = x1 + parseInt(styles.width),
        y2 = y1 + parseInt(styles.height),
        bb = [ [x1,y1], [x2,y2] ];

      // check for collision
      boundingBoxes.forEach(boundingBox => {
        if (this.intersect(boundingBox, bb)) {
          theLabel.leafletElement._container.style.visibility = 'hidden';
          collides = true;
        } 
      });

      if (!collides) {
        boundingBoxes.push(bb);
      }
    });

 
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.lat !== nextProps.lat || this.props.lng !== nextProps.lng || this.props.zoom !== nextProps.zoom) {
      this.setState({
        viewport: {
          center: [ nextProps.lat, nextProps.lng ],
          zoom: nextProps.zoom   
        }
      });
    }
  }

  onMove() { this.setState({ moving: true }); }

  onMoveEnd() {
    this.setState({ moving: false }); 
    this.props.onMoveend(); 
  }

  isMoving() { return this.state.moving; }

  intersect(a, b) { return (a[0][0] <= b[1][0] && b[0][0] <= a[1][0] && a[0][1] <= b[1][1] && b[0][1] <= a[1][1]); }

  render () {
    return (
      <div
        style={ {
          paddingTop: DimensionsStore.getDimensions().containerPadding,
          marginLeft: DimensionsStore.getDimensions().containerPadding
        } }
      >
        <Map 
          ref='the_map' 
          center={ (this.props.lat && this.props.lng) ? [ this.props.lat, this.props.lng ] : (this.props.cityData.center) ? (this.props.cityData.center) : [0,0] } 
          zoom={ this.props.zoom || 14 }  
          minZoom={ 11 }
          className='the_map'
          attributionControl={false}
          style={ {
            width: DimensionsStore.getMapDimensions().width,
            height: DimensionsStore.getNationalMapHeight()
          } }
          viewport={ this.state.viewport }
          //onViewportChanged={ this.props.onMoveend }
          onMove={ this.onMove }
          onMoveend={ this.onMoveEnd }
        >

          {/* base map */}
          <TileLayer url={ (DimensionsStore.isRetina()) ? 'https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}@2x.png' : 'https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png' } />

          {/* city outlines */}
          { this.props.cities_geoms.map((city_geom, i) =>
            <GeoJSON
              data={ city_geom }
              key={ 'city_geom' + i}
              style= { {
                fillColor: 'transparent',
                color: '#999',
                dashArray: '5, 5',
                weight: 2 //(this.props.tracts[tractId].medianIncome < 5000) ? 10 - 10 * (1 - ((this.props.tracts[tractId].medianIncome - 999) / 5000)): 0
              } }
              className='city_boundary'
            />
          )}

          {/* race and income data in census tracts */}
          { (this.props.holc_areas.length == 0 || (!this.props.HOLCSelected && this.props.tracts)) ? 
            Object.keys(this.props.tracts).map(tractId => {
              return(
                <GeoJSON
                  data={ this.props.tracts[tractId].the_geojson }
                  key={ 'tract' + tractId }
                  style= { {
                    fillColor: getColorForRace(this.props.tracts[tractId].percentPeopleOfColor / 100),
                    //fillColor: 'transparent',
                    //fillOpacity: (this.props.tracts[tractId].medianIncome < 10000) ? (1 - ((this.props.tracts[tractId].medianIncome - 999) / 10000)) / 3: 0,
                    //fillOpacity: (this.props.tracts[tractId].medianIncome < 5000) ? 0.7 - (1 - ((this.props.tracts[tractId].medianIncome - 999) / 5000)): 0.05,
                    fillOpacity: (this.props.tracts[tractId].percentBelow  / 100) * 0.9,
                    weight: 0, //(this.props.tracts[tractId].medianIncome < 5000) ? 10 - 10 * (1 - ((this.props.tracts[tractId].medianIncome - 999) / 5000)): 0,
                    color: getColorForRace(this.props.tracts[tractId].percentPeopleOfColor / 100),
                  } }
                  className='tract'
                />
              ); 
            }) : 
            ''
          }

        {/* redlining areas */}
          { this.props.HOLCSelected && this.props.holc_areas.map((area, i) => 
            <GeoJSON
              data={area.the_geojson}
              key={ 'holc' + i }
              className={'holc ' + area.grade }
              style={{
                //fillColor: (area.grade == 'D') ? 'red' : (area.grade == 'C') ? 'yellow' : (area.grade == 'B') ? 'blue' : 'green',
                strokeColor: (area.grade == 'D') ? 'red' : (area.grade == 'C') ? 'yellow' : (area.grade == 'B') ? 'blue' : 'green'
              }}
            />
          )}

          { /* cities without projects */ }
          { this.props.cities.map(cityData => {
            if (!cityData.hasProjectGeojson) {
              return (
                <CircleMarker
                  center={[ cityData.lat, cityData.lng ]}
                  radius={ Math.max(DimensionsStore.getDorlingRadius(cityData.totalFamilies) * 3, 10) }
                  weight={ 0 }
                  fillColor={ getColorForRace(cityData.percentFamiliesOfColor) }
                  fillOpacity={ 0.8 }
                  onClick={ this.props.onCitySelected }
                  onMouseOver={ this.props.onCityHover }
                  onMouseOut={ this.props.onCityOut }
                  id={ cityData.city_id }
                  style={{
                    fillColor:  getColorForRace(cityData.percentPeopleOfColor),
                    weight: 0
                  }}
                  key={'cityMarker' + cityData.city_id }
                  ref={'cityMarker' + cityData.city_id }

                  
                >
                  <Tooltip
                    direction='center'
                    offset={[0,0]} 
                    opacity={1} 
                    permanent={true}
                    className='cityMapCityLabel'
                    ref={ 'labelForCity' + cityData.city_id }
                  >
                    <span

                    >
                      { cityData.city.toUpperCase() }
                      <br />
                       <span className='displacements'>{ formatNumber(cityData.totalFamilies) }</span>
                      <br />
                      { Object.keys(cityData.projects).length + ' project' + ((Object.keys(cityData.projects).length > 1) ? 's' : '') }
                    </span>
                  </Tooltip>
                </CircleMarker>
              );
            }

          })}

          {/* projects */}
          { (this.props.projects) ?
            Object.keys(this.props.projects).map(projectId => {
              if (this.props.projects[projectId].the_geojson) {
                return (
                  <LayerGroup 
                    className='projectFootprint' 
                    key={ 'geojson' + projectId } 
                  >
                    <UrbanRenewalPolygon
                      data={ this.props.projects[projectId].the_geojson }
                      onMouseOver={ this.props.onProjectHover }
                      onMouseOut={ this.props.onProjectUnhover }
                      onClick={ this.props.onProjectClick }
                      id={ projectId }
                      style={ {
                        weight: 3,
                        color: (this.props.inspectedProject == projectId || this.props.inspectedProject == null) ?  '#5B3000' : 'grey',
                        //dashArray: '5, 5',
                        fillColor: (this.props.projects[projectId].totalFamilies) ?getColorForRace(this.props.projects[projectId].percentFamiliesOfColor) : '#eee',
                        fillOpacity: (this.props.inspectedProjectStats == projectId || this.props.inspectedProject == projectId) ? 1 : 0,
                      } }
                      ref={ 'projectFootprint' + projectId }
                    >
                      { (this.props.inspectedProject == projectId || this.props.inspectedProject == null) ?
                        <Tooltip 
                          direction='center'
                          offset={[0,0]} 
                          opacity={1} 
                          permanent={true}
                          className='projectLabel'
                          ref={ 'labelFor' + projectId }
                        >
                          <span
                            onClick={ this.props.onProjectHover }
                            id={ projectId }
                          >
                            {this.props.projects[projectId].project.replace(/\b\w/g, l => l.toUpperCase())}
                            <br />
                            <span className='displacements'>
                              {(this.props.projects[projectId].totalFamilies > 0) ? formatNumber(this.props.projects[projectId].totalFamilies) : ''}
                            </span>
                          </span>
                        </Tooltip> : ''
                      }
                    </UrbanRenewalPolygon>
                  </LayerGroup>
                );
              }
            }) : ''
          }

        </Map>
      </div>


    );
  }
}
