import * as React from 'react';

export default class LegendAndControls extends React.Component {

  constructor (props) {
    super(props);
  }

  render () {
    return (
      <div id='mapChartToggle'>
        <div
          className={ (this.props.selectedView == 'map') ? 'selected' : '' }
          onClick={ this.props.onViewSelected }
          id='map'
        >
          <span className='tooltip'>Shows displacements in cities.</span>
          <img src='static/map.png' />
          map
        </div>

        <div
          className={ (this.props.selectedView == 'cartogram') ? 'selected' : '' }
          onClick={ this.props.onViewSelected }
          id='cartogram'
        >
          <span className='tooltip'>Shows all cities with no overlap keeping them as close as possible to their actual location.</span>
          <img src='static/cartogram.png' />
          cartogram
        </div>

        <div
          className={ (this.props.selectedView == 'scatterplot') ? 'selected' : '' }
          onClick={ this.props.onViewSelected }
          id='scatterplot'
        >
          <span className='tooltip'>Charts percentage of displacements by race relative to the racial demographics of the overall city.</span>
          <img src='static/scatterplot.png' />
          chart
        </div>
      </div>
    );
  }
}