import * as React from 'react';

export default class LegendAndControls extends React.Component {

  constructor (props) { super(props); }

  render () {
    return (
      <div id='mapChartControls'>
        <div
          className="zoom-in" 
          title="Zoom in" 
          role="button" 
          aria-label="Zoom in"
          onClick={ this.props.onZoomIn } 
          id='zoomInButton'
        >
          +
        </div>
        <div
          className="zoom-out" 
          title="Zoom out" 
          role="button" 
          aria-label="Zoom out"
          onClick={ this.props.onZoomOut }
        >
          -
        </div>

        {/* button for national view*/}
        <button
          className='resetView'
          onClick={ this.props.resetView }
        >
          <img src='static/us-outline.svg' />
        </button>
      </div>
    );
  }
}