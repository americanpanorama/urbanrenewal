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
          style={{
            backgroundImage: 'url(static/map.png)'
          }}
        >
          <span className='tooltip'>Shows displacements in cities.</span>
          map
        </div>

        <div
          className={ (this.props.selectedView == 'cartogram') ? 'selected' : '' }
          onClick={ this.props.onViewSelected }
          id='cartogram'
          style={{
            backgroundImage: 'url(static/cartogram.png)'
          }}
        >
          <span className='tooltip'>Shows all cities with no overlap keeping them as close as possible to their actual location.</span>
          cartogram
        </div>

        <div
          className={ (this.props.selectedView == 'scatterplot') ? 'selected' : '' }
          onClick={ this.props.onViewSelected }
          id='scatterplot'
          style={{
            backgroundImage: 'url(static/scatterplot.png)'
          }}
        >
          <span className='tooltip'>Charts percentage of displacements by race relative to the racial demographics of the overall city.</span>
          chart
        </div>
      </div>
    );
  }
}