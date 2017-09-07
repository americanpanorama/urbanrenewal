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
          <svg
            width={18}
            height={18}
          >
            <line
              x1={1}
              x2={1}
              y1={0}
              y2={7}
              stroke='#111'
              strokeWidth={2}
            />

            <line
              x1={1}
              x2={1}
              y1={11}
              y2={18}
              stroke='#111'
              strokeWidth={2}
            />

            <line
              x1={17}
              x2={17}
              y1={0}
              y2={7}
              stroke='#111'
              strokeWidth={2}
            />

            <line
              x1={17}
              x2={17}
              y1={11}
              y2={18}
              stroke='#111'
              strokeWidth={2}
            />

            <line
              y1={1}
              y2={1}
              x1={0}
              x2={7}
              stroke='#111'
              strokeWidth={2}
            />

            <line
              y1={1}
              y2={1}
              x1={11}
              x2={18}
              stroke='#111'
              strokeWidth={2}
            />

            <line
              y1={17}
              y2={17}
              x1={0}
              x2={7}
              stroke='#111'
              strokeWidth={2}
            />

            <line
              y1={17}
              y2={17}
              x1={11}
              x2={18}
              stroke='#111'
              strokeWidth={2}
            />
          </svg>
        </button>
      </div>
    );
  }
}