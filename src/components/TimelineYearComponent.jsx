import * as React from 'react';

import * as d3 from 'd3';
import ReactTransitionGroup from 'react-addons-transition-group';
import { getColorForRace, formatNumber } from '../utils/HelperFunctions';

import DimensionsStore from '../stores/DimensionsStore';

export default class Timeline extends React.Component {

  constructor (props) { super(props); }

  componentWillReceiveProps(nextProps) {}

  componentDidMount() {}

  componentDidUpdate() {}

  render() {
    const years = [1950,1951,1952,1953,1954,1955,1956,1957,1958,1959,1960,1961,1962,1963,1964,1965,1966];

    return (
      <svg 
        { ...DimensionsStore.getTimelineAttrs() }
        id='timeline'
      >

        {/* x axis: years */}
        <g className='xAxis'>
          { years.map(year =>
            <text
              { ...DimensionsStore.getMainTimelineXAxisAttrs(year) }
              onClick={ this.props.onClick }
              id={ year }
            >
              { (year % 5 == 0 && DimensionsStore.getMainTimelineBarWidth() > 7) ? year : (year % 5 == 0) ? '\'' + (year-1900) : (DimensionsStore.getMainTimelineBarWidth() > 7) ? '\'' + (year-1900) : '•' }
            </text>
          )}

          <text
            { ...DimensionsStore.getMainTimelineXAxisAllYearsAttrs() }
            onClick={ this.props.onClick }
            className='all'
          >
            All Years
          </text>
        </g>

        {/* y axis: displacements */}
        <g className='yAxis'>
          { DimensionsStore.getMainTimelineYAxisValues().map(d => <text { ...DimensionsStore.getMainTimelineYAxisAttrs(d) }>{ d.toLocaleString() }</text> )}
        </g>

        {/* year bars */}
        <g className='bars'>
          { years.map(year => {
            if (this.props.yearsData[year]) {
              return (
                <g key={'barsFor' + year}>
                  <rect
                    { ...DimensionsStore.getMainTimelineBarAttrs(year, 'nonwhite') }
                    className={ (year == this.props.state.year && this.props.state.cat == 'families') ? 'nonwhite bar selected' : 'nonwhite bar' }
                    onClick={ this.props.onClick }
                    id={ year }
                  />
                 <rect
                    { ...DimensionsStore.getMainTimelineBarAttrs(year, 'whites') }
                    className={ (year == this.props.state.year && this.props.state.cat == 'families') ? 'white bar selected' : 'white bar' }
                    onClick={ this.props.onClick }
                    id={ year }
                  />
                 <rect
                    { ...DimensionsStore.getMainTimelineBarAttrs(year, 'unspecified') }
                    className={ (year == this.props.state.year && this.props.state.cat == 'families') ? 'territory bar selected' : 'territory bar' }
                    onClick={ this.props.onClick }
                    id={ year }
                  />
                </g>
              );
            }
          })}
        </g>

        {/* grid lines */}
        <g className='grid'>
          { DimensionsStore.getMainTimelineYAxisValues().map(d => <rect { ...DimensionsStore.getMainTimelineGridAttrs(d)} /> )}
        </g>

        <rect
          x={0}
          y={ DimensionsStore.getMainTimelineBarBottom() }
          width={DimensionsStore.getMainTimelineBarFieldWidth()}
          height={0.5}
          fill='#555'
        />

        {/* label for year */}
        <text { ...DimensionsStore.getMainTimelineYearLabelAttrs() }>Nationwide Family Displacements by Race</text>

        <rect { ...DimensionsStore.getMainTimelineLegendBoxPOCAttrs() } />
        <text { ...DimensionsStore.getMainTimelineLegendLabelPOCAttrs() }>of color</text>

        <rect { ...DimensionsStore.getMainTimelineLegendBoxWhiteAttrs() } />
        <text { ...DimensionsStore.getMainTimelineLegendLabelWhiteAttrs() }>white</text>

        <rect { ...DimensionsStore.getMainTimelineLegendBoxPRVIAttrs() } />
        <text { ...DimensionsStore.getMainTimelineLegendLabelPRVIAttrs() }>unspecified (US territories)</text>
      </svg>
    );
  }

}