import * as React from 'react';
import * as L from 'leaflet';

import { AppActions, AppActionTypes } from '../../utils/AppActionCreator';
import { getColorForRace, formatNumber } from '../../utils/HelperFunctions';

// stores
import DimensionsStore from '../../stores/DimensionsStore';
import GeographyStore from '../../stores/GeographyStore';

// components
import { Map, TileLayer, GeoJSON, Tooltip, LayerGroup} from 'react-leaflet';
import UrbanRenewalPolygon from './UrbanRenewalPolygon.jsx';

export default class CityMap extends React.Component {

  constructor (props) {
    super(props);
    this.state = {
      viewport: {
        center: (this.props.lat && this.props.lng) ? [ this.props.lat, this.props.lng ] : [0,0],
        zoom: this.props.zoom || 12   
      }
    };
  }

  componentDidMount() { AppActions.mapInitialized(this.refs.the_map.leafletElement); }

  componentDidUpdate() {
    // hide project labels that overlap
    let boundingBoxes = [],
      projectIds = Object.keys(this.props.projects).filter(id => this.refs['labelFor' + id]).sort((a,b) => !(this.props.inspectedProjectStats == a || this.props.inspectedProject == a) || this.props.projects[b].totalFamilies - this.props.projects[a].totalFamilies);
    projectIds.forEach(projectId => {
      let theLabel = this.refs['labelFor' + projectId],
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
          center={ (this.props.lat && this.props.lng) ? [ this.props.lat, this.props.lng ] : [0,0] } 
          zoom={ this.props.zoom || 12 }  
          minZoom={ 11 }
          className='the_map'
          style={ {
            width: DimensionsStore.getMapDimensions().width,
            height: DimensionsStore.getNationalMapHeight()
          } }
          viewport={ this.state.viewport }
          onViewportChanged={ this.props.onMoveend }
        >

          {/* base map */}
          <TileLayer url={ (DimensionsStore.isRetina()) ? 'https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}@2x.png' : 'https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png' } />

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
                    fillOpacity: (this.props.tracts[tractId].medianIncome < 5000) ? 0.7 - (1 - ((this.props.tracts[tractId].medianIncome - 999) / 5000)): 0.05,
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
                        weight: 5,
                        color: (this.props.inspectedProject == projectId || this.props.inspectedProject == null) ?  'red' : 'grey',
                        dashArray: '10, 5',
                        fillColor: getColorForRace(this.props.projects[projectId].percentFamiliesOfColor),
                        fillOpacity: (this.props.inspectedProjectStats == projectId || this.props.inspectedProject == projectId) ? 0.8 : 0,
                      } }
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
