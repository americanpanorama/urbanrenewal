import * as React from 'react';


import GeographyStore from '../stores/GeographyStore';

export default class USMap extends React.Component {

  constructor (props) { 
    super(props); 
    this.state = {
      outlineColor: 'transparent',
      fillColor: 'transparent'
    };

    const handlers = ['stateHover', 'stateOut'];
    handlers.map(handler => { this[handler] = this[handler].bind(this); });
  }

  stateHover() {
    this.setState({outlineColor: 'black', fillColor: 'silver'});
  }

  stateOut() {
    this.setState({outlineColor: 'transparent', fillColor: 'transparent'});
  }

  render () {
    return (
        <path
          key={ this.props.id }
          d={ this.props.d }
          fill={ this.state.fillColor }
          strokeWidth={ 1 / GeographyStore.getZ() }
          onMouseEnter={ this.stateHover }
          onMouseLeave={ this.stateOut }
          stroke={ this.state.outlineColor }
          onClick={ this.props.onStateClicked }
          id={ this.props.id }
        />
    );
  }
}