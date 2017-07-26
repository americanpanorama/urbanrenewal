import * as React from 'react';
import { PropTypes } from 'react';
import * as L from 'leaflet';
import { AppActions, AppActionTypes } from '../utils/AppActionCreator';
import { getColorForRace, formatNumber } from '../utils/HelperFunctions';

import DimensionsStore from '../stores/DimensionsStore';
import GeographyStore from '../stores/GeographyStore';

// stores

// components
import { Map, TileLayer, GeoJSON, Marker, Tooltip, FeatureGroup, LayerGroup} from 'react-leaflet';

// import cartodbConfig from '../../basemaps/cartodb/config.json';
// import cartodbLayers from '../../basemaps/cartodb/basemaps.json';
// import tileLayers from '../../basemaps/tileLayers.json';

export default class CityMap extends React.Component {

  constructor (props) {
    super(props);
  }

  shouldComponentUpdate(nextProps) {
    // a little hacky, but you don't want to update until the stores complete figuring out the bounding box
    if (nextProps.lat == 0 || nextProps.lng == 0) {
      return false;
    }

    const unmoved = (this.refs.the_map.leafletElement.getCenter().lat ==  nextProps.lat && this.refs.the_map.leafletElement.getCenter().lng ==  nextProps.lng && this.refs.the_map.leafletElement.getZoom() ==  nextProps.zoom);
    // update if basemap is changed
    if (unmoved && this.props.HOLCSelected !== nextProps.HOLCSelected) {
      return true;
    }
    // prevent rerendering on map move--new props but dom already updated by leaflet
    return !unmoved;
  }

  componentDidMount() { AppActions.mapInitialized(this.refs.the_map.leafletElement); }

  _isRetina(){ 
    return ((window.matchMedia && (window.matchMedia('only screen and (min-resolution: 124dpi), only screen and (min-resolution: 1.3dppx), only screen and (min-resolution: 48.8dpcm)').matches || window.matchMedia('only screen and (-webkit-min-device-pixel-ratio: 1.3), only screen and (-o-min-device-pixel-ratio: 2.6/2), only screen and (min--moz-device-pixel-ratio: 1.3), only screen and (min-device-pixel-ratio: 1.3)').matches)) || (window.devicePixelRatio && window.devicePixelRatio > 1.3));
  }

  _basemapUrl() {
    let url = (MapStateStore.isAboveZoomThreshold()) ? tileLayers.layers[0].urlLabels : tileLayers.layers[0].urlNoLabels;
    url = (this._isRetina()) ? url.replace('0/{z}', '{z}').replace('.png', '@2x.png') : url;
    return url;
  }

  render () {
    const max = Math.max(...Object.keys(this.props.cityData.projects)
      .filter(id => this.props.cityData.projects[id].totalFamilies)
      .map(id => this.props.cityData.projects[id].totalFamilies));

    console.log(this.props.lat);

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
          className='the_map'
          style={ {
            width: DimensionsStore.getMapDimensions().width,
            height: DimensionsStore.getNationalMapHeight()
          } }
          onMoveend={ this.props.onMoveend }

        >

          {/* base map */}
          <TileLayer
            //url="https://stamen-tiles-d.a.ssl.fastly.net/toner-lite/{z}/{x}/{y}.png"
            url='https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png'
          />

          { (this.props.cityData.holc_areas.length == 0 || (!this.props.HOLCSelected && this.props.cityData.tracts)) ? 
            Object.keys(this.props.cityData.tracts).map(tractId => {
              return(
                <GeoJSON
                  data={ this.props.cityData.tracts[tractId].theGeojson }
                  key={ tractId }
                  style= { {
                    fillColor: getColorForRace(this.props.cityData.tracts[tractId].percentPeopleOfColor / 100),
                    //fillColor: 'transparent',
                    fillOpacity: (this.props.cityData.tracts[tractId].medianIncome < 10000) ? (1 - ((this.props.cityData.tracts[tractId].medianIncome - 999) / 10000)) / 3: 0,
                    weight: 0.3
                  } }
                  className='tract'
                />
              ); 
            }) : 
            ''
          }

          { this.props.HOLCSelected && this.props.cityData.holc_areas.map((area, i) => 
            <GeoJSON
              data={area.theGeojson}
              key={ 'holc' + i }
              className={'holc ' + area.grade }
              style={{
                //fillColor: (area.grade == 'D') ? 'red' : (area.grade == 'C') ? 'yellow' : (area.grade == 'B') ? 'blue' : 'green',
                strokeColor: (area.grade == 'D') ? 'red' : (area.grade == 'C') ? 'yellow' : (area.grade == 'B') ? 'blue' : 'green'
              }}
            />
          )}

          { (this.props.cityData.projects) ?
            Object.keys(this.props.cityData.projects).map(projectId => {
              if (this.props.cityData.projects[projectId].theGeojson) {
                return (
                  <LayerGroup key={ 'geojson' + this.props.cityData.projects[projectId].id }>
                    <GeoJSON
                      data={ this.props.cityData.projects[projectId].theGeojson }
                      key={ 'geojson' + this.props.cityData.projects[projectId].id }
                      style={ {
                        weight: 5,
                        color: 'red' || getColorForRace(this.props.cityData.projects[projectId].percentFamiliesOfColor),
                        dashArray: '10, 5',
                        fillColor: 'transparent' || getColorForRace(this.props.cityData.projects[projectId].percentFamiliesOfColor),
                        fillOpacity: this.props.cityData.projects[projectId].totalFamilies / max
                      } }
                    >
                      <Tooltip 
                        direction='center'
                        offset={[0,0]} 
                        opacity={1} 
                        permanent={true}
                        className='projectLabel'
                      >
                        <span>{this.props.cityData.projects[projectId].project + '-' + formatNumber(this.props.cityData.projects[projectId].totalFamilies) }</span>
                      </Tooltip>
                    </GeoJSON>
                  </LayerGroup>
                );
              }
            }) :
            ''
          }

        </Map>

        <div className='miLink'>
          <a href={ 'https://dsl.richmond.edu/panorama/redlining/#loc=' + [GeographyStore.getLatLngZoom().zoom, GeographyStore.getLatLngZoom().lat, GeographyStore.getLatLngZoom().lng].join('/') + "&opacity=0" }>Mapping Inequality</a>
        </div>

      {/* JSX Comment 
        <div>
          <h2>{ this.props.cityData.city }</h2>
          <div>Population (YEAR): XXXX</div>
          <div>XX% white; XX% African American</div>
          { (this.props.cityData.projects) ?
            Object.keys(this.props.cityData.projects).map(projectId => {
              return (
                <div key={ 'project' + this.props.cityData.projects[projectId].id }>
                  <h3>{ this.props.cityData.projects[projectId].project }</h3>
                  { (this.props.cityData.projects[projectId].yearData && this.props.cityData.projects[projectId].yearData[this.props.year] && this.props.cityData.projects[projectId].yearData[this.props.year][71]) ?  
                    <div>{ 'Families of color displaced: ' + this.props.cityData.projects[projectId].yearData[this.props.year][72] }</div> :
                    ''
                  }
                  { (this.props.cityData.projects[projectId].yearData && this.props.cityData.projects[projectId].yearData[this.props.year] && this.props.cityData.projects[projectId].yearData[this.props.year][71]) ?  
                    <div>{ 'White families displaced: ' + this.props.cityData.projects[projectId].yearData[this.props.year][71] }</div> :
                    ''
                  }
                </div>
              );
            }) :
            ''
          }
        </div> */}


      </div>


    );
  }
}
