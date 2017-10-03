import * as React from 'react';

import DimensionsStore from '../../stores/DimensionsStore.js';

export default class NationalStats extends React.Component {
  constructor (props) { super(props); }

  _label(label, percent, x, tb) {
    tb = tb || 'sub';
    if (DimensionsStore.getProjectStatProportionWidth(percent) >= 100) {
      return (
        <text
          x={ x }
          y={ 37 }
          transform='translate(120)'
          className='labelOnBar'
        >
          { Math.round(percent * 100) + '% ' + label }
        </text>
      );
    }

    else if (DimensionsStore.getProjectStatProportionWidth(percent) >= 20) {
      return (
        <g transform={ 'translate(' + (120 + x) + ' 30)'}>
          <text
            x={ 0 }
            y={ 7 }
            className='labelOnBar'
          >
            { Math.round(percent * 100) + '%' }
          </text>
          <line
            x1={ 0 }
            x2={ 0 }
            y1={ (tb == 'super') ? -10 : 10 }
            y2={ (tb == 'super') ? -18 : 18 }
            strokeWidth={1}
            stroke='black'
          /> 
          <text
            x={ 0 }
            y={ (tb == 'super') ? -18.5 : 31.5 }
          >
            { label }
          </text>
        </g>
      );
    }
  }

  render() {
    let houses = (this.props.houses_sub_standard) ?  this.props.houses_sub_standard + this.props.houses_standard : 0,
      acres = 0,

      widths = {
        blighted_residential: DimensionsStore.getProjectStatProportionWidth(this.props.blighted_residential/this.props.total_projects) || 0,
        other_blighted: DimensionsStore.getProjectStatProportionWidth(this.props.other_blighted/this.props.total_projects) || 0,
        predominantly_open: DimensionsStore.getProjectStatProportionWidth(this.props.predominantly_open/this.props.total_projects) || 0,
        open_land: DimensionsStore.getProjectStatProportionWidth(this.props.open_land/this.props.total_projects) || 0,
        disaster_area: DimensionsStore.getProjectStatProportionWidth(this.props.disaster_area/this.props.total_projects) || 0,
        university_or_college_area: DimensionsStore.getProjectStatProportionWidth(this.props.university_or_college_area/this.props.total_projects) || 0,
        familiesOfColor: DimensionsStore.getProjectStatProportionWidth(this.props.percentFamiliesOfColor) || 0,
        whiteFamilies: DimensionsStore.getProjectStatProportionWidth(1 - this.props.percentFamiliesOfColor) || 0,
        substandard: DimensionsStore.getProjectStatProportionWidth(this.props.houses_sub_standard/(this.props.houses_sub_standard + this.props.houses_standard)) || 0,
        standard: DimensionsStore.getProjectStatProportionWidth(this.props.houses_standard/(this.props.houses_sub_standard + this.props.houses_standard)) || 0,
        residential: DimensionsStore.getProjectStatProportionWidth(this.props.reuse_residential/acres) || 0,
        commercial: DimensionsStore.getProjectStatProportionWidth(this.props.reuse_commercial/acres) || 0,
        industrial: DimensionsStore.getProjectStatProportionWidth(this.props.reuse_industrial/acres) || 0,
        public: DimensionsStore.getProjectStatProportionWidth(this.props.reuse_public/acres) || 0
      };

    return (
      <div className='projectStats'>
        <h2>{ 'Nationwide, ' + ((this.props.selectedYear) ? this.props.selectedYear : '1955-1966') }</h2>

        { (this.props.total_projects > 0) ?
          <svg
            { ...DimensionsStore.getProjectStatsOverallDimensions() }
            className='projectStat'
          >
            <g transform='translate(50)'>

              <text 
                x={50}
                y={25}
                className='stat'
              >
                {Math.round(this.props.total_projects).toLocaleString()}
              </text>
              <text 
                x={50}
                y={45}
                className='statLabel'
              >
                projects
              </text>

            {/* families of color */}
              <rect
                width={ widths.blighted_residential }
                height={20}
                x={0}
                y={20}
                fill='#7b7464'
                transform='translate(120)'
              />
              { this._label('blighted residential', this.props.blighted_residential/this.props.total_projects, widths.blighted_residential / 2)}

              <rect
                width={ widths.other_blighted }
                height={20}
                x={ widths.blighted_residential }
                y={20}
                fill='#79a4a7'
                transform='translate(120)'
              />
              { this._label('other blighted', this.props.other_blighted/this.props.total_projects, widths.blighted_residential + widths.other_blighted / 2)}

              <rect
                width={ widths.predominantly_open }
                height={20}
                x={ widths.blighted_residential + widths.other_blighted }
                y={20}
                fill='#ff8b3f'
                transform='translate(120)'
              />
              { this._label('other blighted', this.props.predominantly_open/this.props.total_projects, widths.blighted_residential + widths.other_blighted + widths.predominantly_open / 2)}

              <rect
                width={ widths.open_land }
                height={20}
                x={ widths.blighted_residential + widths.other_blighted + widths.predominantly_open}
                y={20}
                fill='#f4f134'
                transform='translate(120)'
              />
              { this._label('open land', this.props.open_land/this.props.total_projects, widths.blighted_residential + widths.other_blighted + widths.predominantly_open + widths.open_land / 2)}

              <rect
                width={ widths.disaster_area }
                height={20}
                x={ widths.blighted_residential + widths.other_blighted + widths.predominantly_open + widths.open_land }
                y={20}
                fill='#06a2e2'
                transform='translate(120)'
              />
              { this._label('disaster area', this.props.disaster_area/this.props.total_projects, widths.blighted_residential + widths.other_blighted + widths.predominantly_open + widths.open_land + widths.disaster_area / 2)}

              <rect
                width={ widths.university_or_college_area }
                height={20}
                x={ widths.blighted_residential + widths.other_blighted + widths.predominantly_open + widths.open_land + widths.disaster_area }
                y={20}
                fill='#fe5a3c'
                transform='translate(120)'
              />
              { this._label('other blighted', this.props.university_or_college_area/this.props.total_projects, widths.blighted_residential + widths.other_blighted + widths.predominantly_open + widths.open_land + widths.disaster_area + widths.university_or_college_area / 2)}
            
            </g>
          </svg> : ''
        }

        { (this.props.totalFamilies > 0) ?
          <svg
            { ...DimensionsStore.getProjectStatsOverallDimensions() }
            className='projectStat'
          >
            <g transform='translate(50)'>

              <text 
                x={50}
                y={25}
                className='stat'
              >
                {Math.round(this.props.totalFamilies).toLocaleString()}
              </text>
              <text 
                x={50}
                y={45}
                className='statLabel'
              >
                families displaced
              </text>

            {/* families of color */}
              <rect
                width={ widths.familiesOfColor }
                height={20}
                x={0}
                y={20}
                fill='#a387be'
                transform='translate(120)'
              />
              { this._label('of color', this.props.percentFamiliesOfColor, widths.familiesOfColor / 2)}

              <rect
                width={ widths.whiteFamilies }
                height={20}
                x={ widths.familiesOfColor }
                y={20}
                fill='#2ca02c'
                transform='translate(120)'
              />
              { this._label('white', (1-this.props.percentFamiliesOfColor), widths.familiesOfColor + widths.whiteFamilies / 2) }
            </g>
          </svg> : ''
        }

        { (houses > 0) ?
          <svg
            { ...DimensionsStore.getProjectStatsOverallDimensions() }
            className='projectStat'
          >
            <g transform='translate(50)'>
              <text 
                x={50}
                y={25}
                className='stat'
              >
                { Math.round(houses).toLocaleString() }
              </text>
              <text 
                x={50}
                y={45}
                className='statLabel'
              >
                housing units razed
              </text>

              <rect
                width={ widths.standard }
                height={20}
                x={0}
                y={20}
                fill='maroon'
                transform='translate(120)'
              />
              { this._label('standard', (this.props.houses_standard/(this.props.houses_sub_standard + this.props.houses_standard)), widths.standard / 2) }

              <rect
                width={ widths.substandard }
                height={20}
                x={ widths.standard}
                y={20}
                fill='#008080'
                transform='translate(120)'
              />
              { this._label('substandard', (this.props.houses_sub_standard/(this.props.houses_sub_standard + this.props.houses_standard)), widths.standard + widths.substandard / 2) }

            </g>
          </svg> : ''
        }
         
        { (acres > 0) ? 
          <svg
            { ...DimensionsStore.getProjectStatsOverallDimensions() }
            className='projectStat'
          >
            <g transform='translate(50)'>
              <text 
                x={50}
                y={25}
                className='stat'
              >
                { Math.round(acres * 10)/10 }
              </text>
              <text 
                x={50}
                y={45}
                className='statLabel'
              >
                acres redeveloped
              </text>

              <rect
                width={ widths.residential }
                height={20}
                x={0}
                y={20}
                fill='#8b4600'
                transform='translate(120)'
              />
              { this._label('residential', this.props.reuse_residential/acres, widths.residential / 2) }

              <rect
                width={ widths.commercial }
                height={20}
                x={ widths.residential}
                y={20}
                fill='#00008b'
                transform='translate(120)'
              />
              { this._label('commercial', this.props.reuse_commercial/acres, widths.residential + widths.commercial / 2, (widths.residential > 100) ? 'sub' : 'super') }

              <rect
                width={ widths.industrial }
                height={20}
                x={ widths.residential + widths.commercial }
                y={20}
                fill='#8b8b00'
                transform='translate(120)'
              />
              { this._label('industrial', this.props.reuse_industrial/acres, widths.residential + widths.commercial + widths.industrial / 2, (true || (widths.residential >= 100 && widths.commercial <= 100 && widths.commercial >= 10) || (widths.residential < 100 && widths.commercial > 100)) ? 'super' : 'sub') }

              <rect
                width={ widths.public }
                height={20}
                x={ widths.residential + widths.commercial + widths.industrial }
                y={20}
                fill='#8b008b'
                transform='translate(120)'
              />
              { this._label('public', this.props.reuse_public/acres, widths.residential + widths.commercial + widths.industrial + widths.public / 2) }
            </g>
          </svg> : ''
        }

        { (this.props.funding_dispursed) ?
          <svg
            { ...DimensionsStore.getProjectStatsOverallDimensions() }
            className='projectStat'
          >
            <g transform='translate(50)'>
              <text 
                x={50}
                y={25}
                className='stat'
              >
                {'$' + this.props.funding_dispursed.toLocaleString()}
              </text>
              <text 
                x={50}
                y={45}
                className='statLabel'
              >
                in federal funding
              </text>
            </g>
          </svg>: ''
        }
      </div>
    );
  }

}