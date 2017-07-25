import * as React from 'react';
import { PropTypes } from 'react';
import * as d3 from 'd3';
import ReactTransitionGroup from 'react-addons-transition-group';
import { getColorForRace, formatNumber } from '../utils/HelperFunctions';

import DimensionsStore from '../stores/DimensionsStore';
import CitiesStore from '../stores/CitiesStore';

export default class Timeline extends React.Component {

  constructor (props) { super(props); }

  componentWillReceiveProps(nextProps) {}

  componentDidMount() {}

  componentDidUpdate() {}

  render() {
    const years = [1955,1956,1957,1958,1959,1960,1961,1962,1963,1964,1965,1966];

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
              { year }
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
          { DimensionsStore.getMainTimelineYAxisValues().map(d => <text { ...DimensionsStore.getMainTimelineYAxisAttrs(d) }>{ formatNumber(d) }</text> )}
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
                    { ...DimensionsStore.getMainTimelineBarAttrs(year, 'white') }
                    className={ (year == this.props.state.year && this.props.state.cat == 'families') ? 'white bar selected' : 'white bar' }
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
          height={1}
          fill='black'
        />

        {/* label for year */}
        <text { ...DimensionsStore.getMainTimelineYearLabelAttrs() }>
          { (CitiesStore.getSelectedYear()) ? CitiesStore.getSelectedYear() : 'All Years' }
        </text>

        <rect { ...DimensionsStore.getMainTimelineLegendBoxPOCAttrs() } />
        <text { ...DimensionsStore.getMainTimelineLegendLabelPOCAttrs() }>Displaced families of color</text>

        <rect { ...DimensionsStore.getMainTimelineLegendBoxWhiteAttrs() } />
        <text { ...DimensionsStore.getMainTimelineLegendLabelWhiteAttrs() }>Displaced white families</text>

      </svg>
    );
  }

}