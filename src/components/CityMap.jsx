import * as React from 'react';
import { PropTypes } from 'react';
import * as L from 'leaflet';

import DimensionsStore from '../stores/DimensionsStore';

// stores

// components
import { Map, TileLayer, GeoJSON } from 'react-leaflet';

// import cartodbConfig from '../../basemaps/cartodb/config.json';
// import cartodbLayers from '../../basemaps/cartodb/basemaps.json';
// import tileLayers from '../../basemaps/tileLayers.json';

export default class CityMap extends React.Component {

  constructor (props) {
    super(props);
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

    return (
      <div>
        <Map 
          ref='the_map' 
          center={ (this.props.cityData.lat && this.props.cityData.lng) ? [ this.props.cityData.lat, this.props.cityData.lng ] : [0,0] } 
          zoom={ 12 }  
          className='the_map'
          style={ {
            height: DimensionsStore.getNationalMapHeight()

          } }
        >

          {/* base map */}
          <TileLayer
            url="https://stamen-tiles-d.a.ssl.fastly.net/toner-lite/{z}/{x}/{y}.png"
          />

          { (this.props.cityData.tracts) ? 
            Object.keys(this.props.cityData.tracts).map(tractId => {
              return(
                <GeoJSON
                  data={ this.props.cityData.tracts[tractId].theGeojson }
                  key={ tractId }
                  style= { {
                    fillColor: this._pickHex([125,200,125], [100,150,200],  this.props.cityData.tracts[tractId].percentPeopleOfColor / 100),
                    fillOpacity: (this.props.cityData.tracts[tractId].medianIncome < 10000) ? 1 - ((this.props.cityData.tracts[tractId].medianIncome - 999) / 10000): 0,
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
              //console.log(this.props.cityData.projects[projectId]);
              if (this.props.cityData.projects[projectId].theGeojson) {
                return (
                  <GeoJSON
                    data={ this.props.cityData.projects[projectId].theGeojson }
                    key={ 'geojson' + this.props.cityData.projects[projectId].id }
                    style={ {
                      weight: 3,
                      color: 'black',
                      dashArray: '5, 5',
                      fillColor: 'purple'
                    } }
                  />
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
