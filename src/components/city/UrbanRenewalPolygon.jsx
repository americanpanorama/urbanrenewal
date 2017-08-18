import { PropTypes } from 'react';
import {GeoJSON}  from 'react-leaflet';

export default class UrbanRenewalPolygon extends GeoJSON {

  componentWillReceiveProps(nextProps) {
    if (nextProps.data !== this.props.data) {
      this.leafletElement.clearLayers();
    }
    if (nextProps.className !== this.props.className) {
      this.leafletElement.options.className = nextProps.className;
    }

    if (nextProps.fillOpacity !== this.props.fillOpacity) {
      this.leafletElement.options.fillOpacity = nextProps.fillOpacity;
    }
  }

  componentDidUpdate(prevProps) {
    if (prevProps.data !== this.props.data) {
      this.leafletElement.addData(this.props.data);
    }
    this.setStyleIfChanged(prevProps.style, this.props.style);
  }
}

UrbanRenewalPolygon.propTypes = {
  data: PropTypes.object.isRequired
};