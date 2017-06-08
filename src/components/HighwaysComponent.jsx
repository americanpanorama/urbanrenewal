import * as React from 'react';
import { PropTypes } from 'react';
import ReactDOM from 'react-dom';
import d3 from 'd3';

import HighwaysStore from '../stores/HighwaysStore';

export default class Highways extends React.Component {

  constructor (props) {
    super(props);
    this.state = {
      strokeWidth: 3/this.props.zoom
    };
  }

  componentWillEnter(callback) {
    d3.select(ReactDOM.findDOMNode(this))
      .transition()
      .duration(2000)
      .attr('stroke-width', 1/this.props.zoom)
      .each('end', () => {
        this.setState({
          strokeWidth: 1/this.props.zoom
        });
        callback();
      });
  }

  componentWillLeave(callback) {
    callback();
  }

  render () {
    return (
      <path
        d={ this.props.d }
        strokeWidth={ this.state.strokeWidth }
        className='highway'
      />
    );
  }
}