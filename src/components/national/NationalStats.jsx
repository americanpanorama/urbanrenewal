import * as React from 'react';

import DimensionsStore from '../../stores/DimensionsStore.js';
import CitiesStore from '../../stores/CitiesStore';

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
        familiesOfColor: DimensionsStore.getProjectStatProportionWidth(this.props.nonwhite/(this.props.nonwhite + this.props.whites + this.props.unspecified)) || 0,
        whiteFamilies: DimensionsStore.getProjectStatProportionWidth(this.props.whites/(this.props.nonwhite + this.props.whites + this.props.unspecified)) || 0,
        territoriesFamilies: DimensionsStore.getProjectStatProportionWidth(this.props.unspecified/(this.props.nonwhite + this.props.whites + this.props.unspecified)) || 0,
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

        <div className='context'>
          { (this.props.selectedYear == 1955) ? 
            <div>
              <p>The 1954 Housing Act greatly intensified federally-funded urban renewal initiatives that had been kickstarted by the 1949 Housing Act. The 1954 enabled cities to use some of the land cleared with federal funding for commercial and industrial in addition to residential purposes and to propose rehabilitation and conservation projects to improve rather than clear residential neighborhoods. Scores of federally-funded urban renewal projects razed neighborhoods and displaced thousands of people. </p>
              <p><span onClick={ this.props.onCityClicked } id={ CitiesStore.getCityIdFromSlug('newyorkNY')}>New York</span> early sought urban renewal funds, not just because of its size but because of the aggressive slum clearing policies of New York urban planner Robert Moses.</p>
            </div> : 
            (this.props.selectedYear == 1956) ? 
              <div>
                <p>The 1956 Federal-Aid Highway Act became another tool of urban renewal. Over the subsequent decade, many poorer neighborhoods, particularly African American neighborhoods, were destroyed for highway construction, and highways were carefully position to buttress segregation and insulate white and black neighborhoods from one another. Urban planners viewed highways as essential arteries that would enable middle-class white families to live in the suburbs but still work and shop in downtown central business districts.</p>
                <p>example?</p>
              </div> : 
            (this.props.selectedYear == 1958) ? 
              <div>
                <p>The map for 1858 evidences the expansion of urban renewal. Nearly a hundred cities and towns that had not received urban renewal grants launch projects involving displacements that year. These weren't large cities but instead mid-sized and small cities and towns. Bessemer, Alabama's <span onClick={ this.props.onProjectClick } id={1690}>Downtown 19th Street Project</span> would displace nearly 400 families; Tacoma, Washington's <span onClick={ this.props.onProjectClick } id={4062}>Center Street Project</span> nearly 100; and Springfield, Massachusetts's <span onClick={ this.props.onProjectClick } id={334}>North End Project</span> more than a thousand, all launched in 1958.</p>
              </div> : 
            (this.props.selectedYear == 1961) ? 
              <div>
                <p>Published in 1961, Jane Jacobs's <cite>The Death and Life of Great American Cities</cite> offered a damning critique of urban renewal in large American cities. While much of her criticism stemmed from what she considered the banal sterility of planned modernist urban spaces, she also condemned the human toil urban renewal took upon the communities it targeted. "People who get marked with the planners' hex signs are pushed about, expropriated, and uprooted much as if they were the subjects of a conquering power .... Whole communities are torn apart and sown to the winds, with a reaping of cynicism, resentment and despair."</p>
                <p>While Jacobs's ideas were eloquent and powerful, more immediately significant was the grassroots resistance to urban renewal mounted in cities throughout the United States. "You have depressed the values of our property by calling it blighted," charged a Los Angeles activist resisting the <span onClick={ this.props.onProjectClick } id={3826}>Temple</span> and <span onClick={ this.props.onProjectClick } id={3821}>Bunker Hill</span> projects. "They call us 'land-grabbers' without really knowing why," retorted a local planning official. "Perhaps they have a point, but under the concept of urban renewal, so do we" (<cite>Los Angeles Times</cite>, September 3, 1962). Nearly 3000 families were displaced by those two projects.</p>
              </div> :
            (this.props.selectedYear == 1965) ? 
              <div>
                <p>The map for 1965 underscores how federal urban renewal efforts impacted more than major cities. Nearly 600 localities appear on the map. Nearly a quarter of them had populations of 10,000 or less, another quarter 10,000 to 25,000.</p>
                <p>The absolute number of displacements in many of these towns seems comparatively small, but given their size they often impacted a larger proportion of these localities' citizens. Two or three percent of the citizens of Nanticoke, Pennsylvania, population 15,601 in 1960, Martins Ferry, Ohio, 11,919, and Demopolis, Alabama, 7,377, were displaced by the <span onClick={ this.props.onProjectClick } id={1322}>Market-Broadway project</span>, <span onClick={ this.props.onProjectClick } id={3101}>Hanover Street project</span>, and <span onClick={ this.props.onCityClicked } id={ CitiesStore.getCityIdFromSlug('demopolisAL')}>the Strawberry and Arch Street projects</span>, respectively. While these projects were smaller than many in large cities, more often than not they too disproportionately displaced families of color. People of color were less than 3% of the population of Martins Ferry but 50% of those displaced; they were 50% of the population of Demopolis but 89% of the displaced.</p> 
              </div> : ''
          }
        </div>



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
              { this._label('of color', this.props.nonwhite/(this.props.nonwhite + this.props.whites + this.props.unspecified), widths.familiesOfColor / 2)}

              <rect
                width={ widths.whiteFamilies }
                height={20}
                x={ widths.familiesOfColor }
                y={20}
                fill='#2ca02c'
                transform='translate(120)'
              />
              { this._label('white', this.props.whites/(this.props.nonwhite + this.props.whites + this.props.unspecified), widths.familiesOfColor + widths.whiteFamilies / 2) }

              <rect
                width={ widths.territoriesFamilies }
                height={20}
                x={ widths.familiesOfColor + widths.whiteFamilies }
                y={20}
                fill='#E18942'
                transform='translate(120)'
              />
              { this._label('unspecified', this.props.unspecified/(this.props.nonwhite + this.props.whites + this.props.unspecified), widths.familiesOfColor + widths.whiteFamilies + widths.territoriesFamilies / 2) }
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