import * as React from 'react';
import { PropTypes } from 'react';
import ReactDOM from 'react-dom';
import * as d3 from 'd3';

export default class PolygonD3 extends React.Component {

  constructor (props) { 
    super(props); 
    this.state={
      zoom: this.props.zoom
    };
  }

  componentWillEnter(callback) {
    callback();
  }

  componentWillLeave(callback) {
    callback();
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.zoom !== nextProps.zoom) {
      d3.select(ReactDOM.findDOMNode(this))
        .transition()
        .duration(750)
        .attr("transform", "scale(" + nextProps.zoom +")")
        .each('end', () => {
          this.setState({
            zoom: nextProps.zoom
          });
        });
    }
  }

  render () {
    return (
      <path
        key={ this.props.key }
        d={ this.props.d }
        style={ this.props.style }
        transform={ "scale(" + this.state.zoom +")" }
        onClick={ this.props.onMapClicked }
      />
    );
  }
}