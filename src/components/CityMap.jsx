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

  componentDidMount() {
    AppActions.mapInitialized(this.refs.the_map.leafletElement);
  }

  _isRetina(){ 
    return ((window.matchMedia && (window.matchMedia('only screen and (min-resolution: 124dpi), only screen and (min-resolution: 1.3dppx), only screen and (min-resolution: 48.8dpcm)').matches || window.matchMedia('only screen and (-webkit-min-device-pixel-ratio: 1.3), only screen and (-o-min-device-pixel-ratio: 2.6/2), only screen and (min--moz-device-pixel-ratio: 1.3), only screen and (min-device-pixel-ratio: 1.3)').matches)) || (window.devicePixelRatio && window.devicePixelRatio > 1.3));
  }

  _basemapUrl() {
    let url = (MapStateStore.isAboveZoomThreshold()) ? tileLayers.layers[0].urlLabels : tileLayers.layers[0].urlNoLabels;
    url = (this._isRetina()) ? url.replace('0/{z}', '{z}').replace('.png', '@2x.png') : url;
    return url;
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

  render () {
    console.log(this.props);

    const max = Math.max(...Object.keys(this.props.cityData.projects)
      .filter(id => this.props.cityData.projects[id].totalFamilies)
      .map(id => this.props.cityData.projects[id].totalFamilies));

    return (
      <div>
        <Map 
          ref='the_map' 
          center={ (this.props.lat && this.props.lng) ? [ this.props.lat, this.props.lng ] : [0,0] } 
          zoom={ this.props.zoom || 12 }  
          className='the_map'
          style={ {
            height: DimensionsStore.getNationalMapHeight()

          } }
        >

          {/* base map */}
          <TileLayer
            //url="https://stamen-tiles-d.a.ssl.fastly.net/toner-lite/{z}/{x}/{y}.png"
            url='https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png'
          />

          { (this.props.cityData.tracts) ? 
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
