import * as React from 'react';

import * as d3 from 'd3';
import ReactTransitionGroup from 'react-addons-transition-group';
import Displacements from './DisplacementTimespanComponent.jsx';
import { getColorForRace, formatNumber } from '../../utils/HelperFunctions';

import DimensionsStore from '../../stores/DimensionsStore';
import CitiesStore from '../../stores/CitiesStore';

export default class Timeline extends React.Component {

  constructor (props) { super(props); }

  render() {
    const years = [1955,1956,1957,1958,1959,1960,1961,1962,1963,1964,1965,1966];

    return (
      <svg 
        { ...DimensionsStore.getCityTimelineStyle() }
        height={ (DimensionsStore.getDorlingRadius(CitiesStore.getMaxDisplacementsInCityForYear(), {useYear:true}) * 2 + DimensionsStore.getMainTimelineFontSize() ) + this.props.projectBars.length * 25 + 25 }
        id='timeline'
      >

        { years.map(year => {
          if (this.props.yearsData && this.props.yearsData[year] && this.props.yearsData[year].totalFamilies) {
            return (
              <circle 
                { ...DimensionsStore.getTimelineXDorlingAttrs(year, this.props.yearsData[year].totalFamilies, getColorForRace(this.props.yearsData[year].percentFamiliesOfColor) ) } 
                onClick={ this.props.onYearClick } 
                id={ year }
              />
            );
          }
        })}

        { years.map(year => {
          if (this.props.yearsData && this.props.yearsData[year] && this.props.yearsData[year].totalFamilies) {
            return (
              <text { ...DimensionsStore.getTimelineXDorlingLabelAttrs(year, this.props.yearsData[year].totalFamilies) }> 
                { formatNumber(this.props.yearsData[year].totalFamilies) }
              </text>
            );
          }
        })}

        <g transform={'translate(0 ' + (DimensionsStore.getDorlingRadius(CitiesStore.getMaxDisplacementsInCityForYear(), {useYear:true}) * 2) + ')'}>
          { years.map(year => 
            <text 
              { ...DimensionsStore.getTimelineXAxisAttrs(year) }
              onClick={ this.props.onYearClick } 
              id={ year }
            >
              { year }
            </text>
          )}
        </g>

        { (this.props.projects) ? 
          <g transform={'translate(0 ' + (DimensionsStore.getDorlingRadius(CitiesStore.getMaxDisplacementsInCityForYear(), {useYear:true}) * 2 + DimensionsStore.getMainTimelineFontSize() ) + ')'}>
            { this.props.projectBars.map((project, i) => 
              <Displacements
                inSelectedYear={ (this.props.year >= project.start_year && this.props.year <= project.end_year) }
                width={ DimensionsStore.getTimelineYearsSpanWidth(project.start_year, project.end_year + 1)  }
                height={ DimensionsStore.getTimelineProjectHeight() }
                x={ DimensionsStore.getTimelineXOffset(project.start_year) }
                y={ ((project.row + 1) * DimensionsStore.getTimelineProjectHeight() * 1.2 )  }
                text={ project.project.replace(/\b\w/g, l => l.toUpperCase()) }
                key={ 'projectSpan' + i }
                projectData={ project }
                maxForYear={ this.props.projectBars[0].totalFamilies/ (this.props.projectBars[0].end_year-this.props.projectBars[0].start_year+1)}
                onProjectInspected={ this.props.onProjectInspected }
                onProjectOut={ this.props.onProjectOut }
              />
            ) }
          </g>:
          '' 
        }
      </svg>
    );
  }

}