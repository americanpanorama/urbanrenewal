import * as React from 'react';
import { beeswarm } from 'd3-beeswarm';

import DimensionsStore from '../../stores/DimensionsStore.js';
import { getColorForRace } from '../../utils/HelperFunctions';

export default class ProjectStats extends React.Component {
  constructor (props) { 
    super(props); 
    this.state = {
      hoverProject: null
    };

    this.onProjectHover= this.onProjectHover.bind(this);
    this.onProjectOut= this.onProjectOut.bind(this);
  }

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

  onProjectHover(e) {
    if (this.props.stats.projects.find(p => p.project_id == e.target.id).city_id == this.props.projects[this.props.project_id].city_id) {
      this.props.onProjectInspected(e);
    }
    this.setState({
      hoverProject: e.target.id
    });
  }

  onProjectOut(e) {
    if (this.props.stats.projects.find(p => p.project_id == e.target.id).city_id == this.props.projects[this.props.project_id].city_id) {
      this.props.onProjectOut();
    }
    this.setState({
      hoverProject: null
    });
  }

  render() {  
    let theProject = this.props.projects[this.props.project_id] || {},
      houses = (theProject && theProject.houses_sub_standard && theProject.houses_standard) ?  theProject.houses_sub_standard + theProject.houses_standard : 0,
      acres = (theProject && theProject.reuse_residential && theProject.reuse_commercial && theProject.reuse_industrial && theProject.reuse_public) ? theProject.reuse_residential + theProject.reuse_commercial + theProject.reuse_industrial + theProject.reuse_public : 0;


      // widths = {
      //   familiesOfColor: DimensionsStore.getProjectStatProportionWidth(theProject.percentFamiliesOfColor),
      //   whiteFamilies: DimensionsStore.getProjectStatProportionWidth(1 - theProject.percentFamiliesOfColor),
      //   substandard: DimensionsStore.getProjectStatProportionWidth(theProject.houses_sub_standard/(theProject.houses_sub_standard + theProject.houses_standard)),
      //   standard: DimensionsStore.getProjectStatProportionWidth(theProject.houses_standard/(theProject.houses_sub_standard + theProject.houses_standard)),
      //   residential: DimensionsStore.getProjectStatProportionWidth(theProject.reuse_residential/acres),
      //   commercial: DimensionsStore.getProjectStatProportionWidth(theProject.reuse_commercial/acres),
      //   industrial: DimensionsStore.getProjectStatProportionWidth(theProject.reuse_industrial/acres),
      //   public: DimensionsStore.getProjectStatProportionWidth(theProject.reuse_public/acres)
      // };

    const funding = [{funding: this.props.stats.medianFunding, project_id: 'median'}].concat(this.props.stats.projects.filter(f => f)),
      maxFunding = Math.max(...funding.map(p => p.funding)),
      fundingTicks = (maxFunding <= 10000000) ? [1000000, 2000000, 3000000, 4000000, 5000000, 6000000, 7000000, 8000000, 9000000, 10000000] : [1000000,10000000,20000000,30000000,40000000,50000000,60000000];

    var swarm = beeswarm()
      .data(funding)                                 // set the data to arrange
      .distributeOn(d => (maxFunding - d.funding) / maxFunding * 200)                  // set the value accessor to distribute on
      .radius(2)                                  // set the radius for overlapping detection
      .orientation('vertical')                  // set the orientation of the arrangement
                                                    // could also be 'vertical'
      .side('symetric')                           // set the side(s) available for accumulation
                                                    // could also be 'positive' or 'negative'
      .arrange();    

    const fundingMid = swarm.reduce((max,p) => Math.max(Math.abs(p.x), max), 0);

    const inspectedProject = (this.state.hoverProject) ? this.props.stats.projects.find(p => p.project_id == this.state.hoverProject) : [],
      inspectedProjectHover = (this.state.hoverProject) ? swarm.find(p => p.datum.project_id == this.state.hoverProject) : [];


    return (
      <div className='projectStats'>
        <div 
          onClick={ this.props.resetView }
          className='closeicon'
        >x</div>

        <h2>{ this.props.city + ', ' + this.props.state.toUpperCase() }</h2>

        { (this.props.selected) ?
          <div 
            onClick={ this.props.onProjectClick }
            className='closeicon'
          >x</div> : ''
        }


        <h3>{ theProject.project + ' — ' + theProject.start_year + ((theProject.end_year !== theProject.start_year) ? '-' + theProject.end_year : '') + ''}</h3>

        <div className='legend'>
          <svg width={20} height={12}><circle cx={6} cy={6} r={5} stroke='black' fill='#aaa' /></svg>{ theProject.project}<br />
          <svg width={20} height={12}><circle cx={6} cy={6} r={2.5} stroke='black' strokeWidth={1.5} fill='#aaa' /></svg>Other projects in { this.props.city }<br />
          <svg width={20} height={12}><circle cx={6} cy={6} r={2.5} stroke='grey' fill='transparent' /></svg>Projects in comparably sized cities (populations of {this.props.cityCat})<br />
          <svg width={20} height={12}>
            <line x1={2} y1={2} x2={10} y2={10} stroke='maroon' />
            <line x1={10} y1={2} x2={2} y2={10} stroke='maroon' />
            </svg>Median values
        </div>

        { (theProject.totalFamilies > 0) ?
          <svg
            { ...DimensionsStore.getProjectStatsOverallDimensions() }
            width={198}
            height={300}
            className='projectStat'
          >

            <g transform='translate(45, 5)'>
              <text 
                x={75}
                y={ 20 }
                className='stat'
              >
                <tspan className='strong'>{theProject.totalFamilies.toLocaleString()}</tspan> families displaced
              </text>

              <text 
                x={ 75}
                y={ 40 }
                fontWeight={200}
              >
                <tspan className='strong'>{ (Math.round((1-theProject.percentFamiliesOfColor) * 100)) + '%'}</tspan> white/<tspan  className='strong'>{ (Math.round(theProject.percentFamiliesOfColor * 100)) +'%'}</tspan> of color
              </text>



              <g transform='translate(0, 50)'>
                <rect 
                  x={0}
                  y={0}
                  width={150}
                  height={ 200 }
                  fill='#eee'
                />
                { [...Array(5).keys()].map(quarter =>
                  <line
                    x1={quarter * 150/4}
                    x2={quarter * 150/4}
                    y1={0}
                    y2={200}
                    className='tick'
                    key={ 'xtick' + quarter }
                  />
                )}

                { [0,500,1000,1500,2000,2500,3000, 3500,4000,4500].map(tick => {
                  if ((this.props.stats.projects[this.props.stats.projects.length-1].totalFamilies - tick) / this.props.stats.projects[this.props.stats.projects.length-1].totalFamilies * 200 > 0) {
                    return (
                      <g key={ 'ytick' + tick }>
                        <line
                          x1={0}
                          x2={150}
                          y1={(this.props.stats.projects[this.props.stats.projects.length-1].totalFamilies - tick) / this.props.stats.projects[this.props.stats.projects.length-1].totalFamilies * 200}
                          y2={(this.props.stats.projects[this.props.stats.projects.length-1].totalFamilies - tick) / this.props.stats.projects[this.props.stats.projects.length-1].totalFamilies * 200}
                          className='tick'
                          
                        />

                        <text
                          x={-5}
                          y={(this.props.stats.projects[this.props.stats.projects.length-1].totalFamilies - tick) / this.props.stats.projects[this.props.stats.projects.length-1].totalFamilies * 200 + 6}
                          className='tickLabel yTickLabel'
                        >
                          { tick }
                        </text>
                      </g>
                    );
                  }
                })}

              {/* JSX Comment 
                <text
                  x={-45}
                  y={100}
                  transform='rotate(270 -45 100)'
                >
                  families displaced
                </text>



              
                <line
                  x1={ theProject.percentFamiliesOfColor * 150}
                  y1={ (this.props.stats.projects[this.props.stats.projects.length-1].totalFamilies - theProject.totalFamilies) / this.props.stats.projects[this.props.stats.projects.length-1].totalFamilies * 200 }
                  x2={75}
                  y2={ ((this.props.stats.projects[this.props.stats.projects.length-1].totalFamilies - theProject.totalFamilies) / this.props.stats.projects[this.props.stats.projects.length-1].totalFamilies * 200 > 150) ? (this.props.stats.projects[this.props.stats.projects.length-1].totalFamilies - theProject.totalFamilies) / this.props.stats.projects[this.props.stats.projects.length-1].totalFamilies * 200 - 15 : (this.props.stats.projects[this.props.stats.projects.length-1].totalFamilies - theProject.totalFamilies) / this.props.stats.projects[this.props.stats.projects.length-1].totalFamilies * 200 + 20 }
                  stroke='#111'
                /> */}

                { this.props.stats.projects.map(pr => {
                  if (pr.city_id !== theProject.city_id) {
                    return (
                      <circle
                        cx={ pr.percentFamiliesOfColor * 150}
                        cy={ (this.props.stats.projects[this.props.stats.projects.length-1].totalFamilies - pr.totalFamilies) / this.props.stats.projects[this.props.stats.projects.length-1].totalFamilies * 200 }
                        r={2.5}
                        fill='transparent'
                        stroke={ getColorForRace(pr.percentFamiliesOfColor) }
                        strokeOpacity={ (!this.state.hoverProject || pr.project_id == this.state.hoverProject) ? 1 : 0.3 }
                        onMouseEnter={ this.onProjectHover }
                        onMouseLeave={ this.onProjectOut }
                        onClick={ this.props.onProjectClick }
                        id={ pr.project_id }
                        key={ 'projectGraph' + pr.project_id }
                      />
                    );
                  }
                })}

                { this.props.stats.projects.map(pr => {
                  if (pr.city_id == theProject.city_id && pr.project_id !== theProject.project_id) {
                    return (
                      <circle
                        cx={ pr.percentFamiliesOfColor * 150}
                        cy={ (this.props.stats.projects[this.props.stats.projects.length-1].totalFamilies - pr.totalFamilies) / this.props.stats.projects[this.props.stats.projects.length-1].totalFamilies * 200 }
                        r={2.5}
                        fill={ getColorForRace(pr.percentFamiliesOfColor) }
                        fillOpacity={ (!this.state.hoverProject || pr.project_id == this.state.hoverProject) ? 1 : 0.3 }
                        stroke='#111'
                        strokeWidth={1.5}
                        strokeOpacity={ (!this.state.hoverProject || pr.project_id == this.state.hoverProject) ? 1 : 0.3 }
                        key={ 'projectGraph' + pr.project_id }
                        onMouseEnter={ this.onProjectHover }
                        onMouseLeave={ this.onProjectOut }
                        onClick={ this.props.onProjectClick }
                        id={ pr.project_id }
                      />
                    );
                  }
                })}

                <circle
                  cx={ theProject.percentFamiliesOfColor * 150}
                  cy={ (this.props.stats.projects[this.props.stats.projects.length-1].totalFamilies - theProject.totalFamilies) / this.props.stats.projects[this.props.stats.projects.length-1].totalFamilies * 200 }
                  r={7}
                  fill={ getColorForRace(theProject.percentFamiliesOfColor) }
                  fillOpacity={ (!this.state.hoverProject || theProject.project_id == this.state.hoverProject) ? 1 : 0.3 }
                  stroke={ '#111' }
                  strokeOpacity={ (!this.state.hoverProject || theProject.project_id == this.state.hoverProject) ? 1 : 0.3 }
                />

              {/* JSX Comment 
                <line
                  x1={ theProject.percentFamiliesOfColor * 150}
                  y1={ (this.props.stats.projects[this.props.stats.projects.length-1].totalFamilies - theProject.totalFamilies) / this.props.stats.projects[this.props.stats.projects.length-1].totalFamilies * 200 }
                  x2={158}
                  y2={ (this.props.stats.projects[this.props.stats.projects.length-1].totalFamilies - theProject.totalFamilies) / this.props.stats.projects[this.props.stats.projects.length-1].totalFamilies * 200 }
                  stroke='#111'
                />

                <line
                  x1={ theProject.percentFamiliesOfColor * 150}
                  y1={ (this.props.stats.projects[this.props.stats.projects.length-1].totalFamilies - theProject.totalFamilies) / this.props.stats.projects[this.props.stats.projects.length-1].totalFamilies * 200 }
                  x2={ theProject.percentFamiliesOfColor * 150}
                  y2={ -5 }
                  stroke='#111'
                /> */}




                <line
                  x1={ this.props.stats.medianPercentsFamiliesOfColor * 150 - 4 }
                  x2={ this.props.stats.medianPercentsFamiliesOfColor * 150 + 4 }
                  y1={ (this.props.stats.projects[this.props.stats.projects.length-1].totalFamilies - this.props.stats.medianDisplacements) / this.props.stats.projects[this.props.stats.projects.length-1].totalFamilies * 200 - 4 }
                  y2={ (this.props.stats.projects[this.props.stats.projects.length-1].totalFamilies - this.props.stats.medianDisplacements) / this.props.stats.projects[this.props.stats.projects.length-1].totalFamilies * 200 + 4 }
                  stroke={ 'maroon' }
                />

                <line
                  x1={ this.props.stats.medianPercentsFamiliesOfColor * 150 + 4 }
                  x2={ this.props.stats.medianPercentsFamiliesOfColor * 150 - 4 }
                  y1={ (this.props.stats.projects[this.props.stats.projects.length-1].totalFamilies - this.props.stats.medianDisplacements) / this.props.stats.projects[this.props.stats.projects.length-1].totalFamilies * 200 - 4 }
                  y2={ (this.props.stats.projects[this.props.stats.projects.length-1].totalFamilies - this.props.stats.medianDisplacements) / this.props.stats.projects[this.props.stats.projects.length-1].totalFamilies * 200 + 4 }
                  stroke={ 'maroon' }
                />

                <text 
                  x={0}
                  y={ 220 }
                  className='tickLabel left'
                >
                  100%
                </text>

                <text 
                  x={0}
                  y={ 235 }
                  className='tickLabel left'
                >
                  white
                </text>

                <text 
                  x={150}
                  y={ 220 }
                  className='tickLabel right'
                >
                  100%
                </text>

                <text 
                  x={150}
                  y={ 235 }
                  className='tickLabel right'
                >
                  of color
                </text>

                <text 
                  x={75}
                  y={ 228 }
                  fill='black'
                >
                  race
                </text>

                { (this.state.hoverProject) ? 
                  <g>
                    <text
                      x={inspectedProject.percentFamiliesOfColor * 150 }
                      y={((this.props.stats.projects[this.props.stats.projects.length-1].totalFamilies - inspectedProject.totalFamilies) / this.props.stats.projects[this.props.stats.projects.length-1].totalFamilies * 200 > 100) ? (this.props.stats.projects[this.props.stats.projects.length-1].totalFamilies - inspectedProject.totalFamilies) / this.props.stats.projects[this.props.stats.projects.length-1].totalFamilies * 200 - 21 : (this.props.stats.projects[this.props.stats.projects.length-1].totalFamilies - inspectedProject.totalFamilies) / this.props.stats.projects[this.props.stats.projects.length-1].totalFamilies * 200 + 29 }
                      className='shadow'
                      style={{
                        textAnchor: (inspectedProject.percentFamiliesOfColor < 0.33) ? 'start' : (inspectedProject.percentFamiliesOfColor > 0.66) ? 'end' : 'middle' ,
                        fontWeight: (inspectedProject.hasProjectGeojson) ? 400 : 200
                      }}
                    >
                      { inspectedProject.project}
                    </text> 
                    <text
                      x={inspectedProject.percentFamiliesOfColor * 150 }
                      y={((this.props.stats.projects[this.props.stats.projects.length-1].totalFamilies - inspectedProject.totalFamilies) / this.props.stats.projects[this.props.stats.projects.length-1].totalFamilies * 200 > 100) ? (this.props.stats.projects[this.props.stats.projects.length-1].totalFamilies - inspectedProject.totalFamilies) / this.props.stats.projects[this.props.stats.projects.length-1].totalFamilies * 200 - 5 : (this.props.stats.projects[this.props.stats.projects.length-1].totalFamilies - inspectedProject.totalFamilies) / this.props.stats.projects[this.props.stats.projects.length-1].totalFamilies * 200 + 45 }
                      className='shadow'
                      style={{
                        textAnchor: (inspectedProject.percentFamiliesOfColor < 0.33) ? 'start' : (inspectedProject.percentFamiliesOfColor > 0.66) ? 'end' : 'middle' 
                      }}
                    >
                      { inspectedProject.city + ', ' + inspectedProject.state.toUpperCase() }
                    </text> 
                  </g>: ''
                }


            </g>


            {/* JSX Comment 
              <text 
                x={75}
                y={ ((this.props.stats.projects[this.props.stats.projects.length-1].totalFamilies - theProject.totalFamilies) / this.props.stats.projects[this.props.stats.projects.length-1].totalFamilies * 200 > 150) ? (this.props.stats.projects[this.props.stats.projects.length-1].totalFamilies - theProject.totalFamilies) / this.props.stats.projects[this.props.stats.projects.length-1].totalFamilies * 300 - 70 : (this.props.stats.projects[this.props.stats.projects.length-1].totalFamilies - theProject.totalFamilies) / this.props.stats.projects[this.props.stats.projects.length-1].totalFamilies * 300 + 60 }
                className='statLabel'
                fill='black'
              >
                families displaced
              </text> */}






            {/* JSX Comment   {[...Array(theProject.totalFamilies).keys()].map(row => 
                <rect 
                  x={120 + row % 60 * 3}
                  y={Math.floor(row / 60) * 3}
                  width={2}
                  height={2}
                  className={ (row < Math.round(theProject.nonwhite)) ? 'poc' : 'white'}
                  key={'race'+row}
                />
              )} 

              <text 
                x={50}
                y={55}
                className='stat'
                fill='black'
              >
                {theProject.totalFamilies.toLocaleString()}
              </text>
              <text 
                x={50}
                y={75}
                className='statLabel'
                fill='black'
              >
                families displaced
              </text> */}



            {/* families of color 
              <rect
                width={ widths.familiesOfColor }
                height={20}
                x={0}
                y={20}
                fill='#a387be'
                transform='translate(120)'
              />
              { this._label('of color', theProject.percentFamiliesOfColor, widths.familiesOfColor / 2)}



              <rect
                width={ widths.whiteFamilies }
                height={20}
                x={ widths.familiesOfColor }
                y={20}
                fill='#2ca02c'
                transform='translate(120)'
              />
              { this._label('white', (1-theProject.percentFamiliesOfColor), widths.familiesOfColor + widths.whiteFamilies / 2) } */}
            </g>
          </svg> : ''
        }

      {/* JSX Comment 

        { (houses > 0) ?
          <svg
            { ...DimensionsStore.getProjectStatsOverallDimensions() }
            height={110}
            className='projectStat'
          >


            <g transform='translate(50)'>

              {[...Array(6000).keys()].map(row => 
                <rect 
                  x={120 + row % 70 * 4}
                  y={Math.floor(row / 70) * 4}
                  width={3}
                  height={3}
                  fill={ (row < Math.round(theProject.houses_standard/(theProject.houses_sub_standard + theProject.houses_standard) * 100)) ? 'maroon' : '#008080'}
                />
              )}

              <text 
                x={50}
                y={55}
                className='stat'
              >
                { houses.toLocaleString() }
              </text>
              <text 
                x={50}
                y={75}
                className='statLabel'
              >
                housing units razed
              </text>
  */}
              {/* JSX Comment
              <rect
                width={ widths.standard }
                height={20}
                x={0}
                y={20}
                fill='maroon'
                transform='translate(120)'
              />
              { this._label('standard', (theProject.houses_standard/(theProject.houses_sub_standard + theProject.houses_standard)), widths.standard / 2) }

              <rect
                width={ widths.substandard }
                height={20}
                x={ widths.standard}
                y={20}
                fill='#008080'
                transform='translate(120)'
              />
              { this._label('substandard', (theProject.houses_sub_standard/(theProject.houses_sub_standard + theProject.houses_standard)), widths.standard + widths.substandard / 2) }  */}

{/* JSX Comment 
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
              { this._label('residential', theProject.reuse_residential/acres, widths.residential / 2) }

              <rect
                width={ widths.commercial }
                height={20}
                x={ widths.residential}
                y={20}
                fill='#00008b'
                transform='translate(120)'
              />
              { this._label('commercial', theProject.reuse_commercial/acres, widths.residential + widths.commercial / 2, (widths.residential > 100) ? 'sub' : 'super') }

              <rect
                width={ widths.industrial }
                height={20}
                x={ widths.residential + widths.commercial }
                y={20}
                fill='#8b8b00'
                transform='translate(120)'
              />
              { this._label('industrial', theProject.reuse_industrial/acres, widths.residential + widths.commercial + widths.industrial / 2, (true || (widths.residential >= 100 && widths.commercial <= 100 && widths.commercial >= 10) || (widths.residential < 100 && widths.commercial > 100)) ? 'super' : 'sub') }

              <rect
                width={ widths.public }
                height={20}
                x={ widths.residential + widths.commercial + widths.industrial }
                y={20}
                fill='#8b008b'
                transform='translate(120)'
              />
              { this._label('public', theProject.reuse_public/acres, widths.residential + widths.commercial + widths.industrial + widths.public / 2) }
            </g>
          </svg> : ''
        }
*/}

        { (theProject.funding_dispursed) ?
          <svg
            { ...DimensionsStore.getProjectStatsOverallDimensions() }
            width={fundingMid * 2 + 60}
            height={300}
            className='projectStat'
          >

            <g transform='translate(60, 5)'>
              <text 
                x={fundingMid}
                y={ 20 }
                className='stat strong'
              >
                {'$' + theProject.funding_dispursed.toLocaleString()}
              </text>

              <text 
                x={ fundingMid }
                y={ 40 }
                fill='black'
                fontWeight={200}
              >
                in federal funding
              </text>

              <rect 
                x={0}
                y={50}
                width={fundingMid * 2 }
                height={ 200 }
                fill='#eee'
              />

              { fundingTicks.map(tick => {
                if ((maxFunding - tick) / maxFunding * 200 > 0) {
                  return (
                    <g 
                      transform='translate(0  50)'
                      key={ 'ytickfunding' + tick }
                    >
                      <line
                        x1={0}
                        x2={fundingMid * 2}
                        y1={(maxFunding - tick) / maxFunding * 200}
                        y2={(maxFunding - tick) / maxFunding * 200}
                        className='tick'
                      />

                      <text
                        x={-5}
                        y={(maxFunding - tick) / maxFunding * 200 + 6}
                        className='tickLabel yTickLabel'
                      >
                        { '$' + (tick/1000000) + 'M' }
                      </text>
                    </g>
                  );
                }
              })}

              <g transform={'translate(' + fundingMid + ' 50)'}>
                { swarm.map(p => {
                  if (p.datum.city_id !== theProject.city_id && p.datum.project_id !== 'median') {
                    return (
                      <circle
                        cx={p.x}
                        cy={p.y}
                        r={ ( p.datum.project_id == this.state.hoverProject) ? 5 : 2 }
                        key={ 'funding' + p.datum.project_id }
                        fill='steelblue'
                        fillOpacity={ ( p.datum.project_id == this.state.hoverProject) ? 1 : 0 }
                        stroke={ ( p.datum.project_id == this.state.hoverProject) ? '#111' : 'steelblue'}
                        strokeOpacity={ (!this.state.hoverProject || p.datum.project_id == this.state.hoverProject) ? 1 : 0.3 }
                        onMouseEnter={ this.onProjectHover }
                        onMouseLeave={ this.onProjectOut }
                        onClick={ this.props.onProjectClick }
                        id={ p.datum.project_id }
                      />
                    );
                  }
                })}

                { swarm.map(p => {
                  if (p.datum.city_id == theProject.city_id && p.datum.project_id !== theProject.project_id ) {
                    return (
                      <circle
                        cx={p.x}
                        cy={p.y}
                        r={ ( p.datum.project_id == this.state.hoverProject) ? 5 : 2 }
                        fill='steelblue'
                        fillOpacity={ (!this.state.hoverProject || p.datum.project_id == this.state.hoverProject) ? 1 : 0.3 }
                        stroke='#111'
                        strokeOpacity={ (!this.state.hoverProject || p.datum.project_id == this.state.hoverProject) ? 1 : 0.3 }
                        key={ 'funding' + p.datum.project_id }
                        onMouseEnter={ this.onProjectHover }
                        onMouseLeave={ this.onProjectOut }
                        onClick={ this.props.onProjectClick }
                        id={ p.datum.project_id }
                      />
                    );
                  }
                })}

                { swarm.map(p => {
                  if (p.datum.project_id == 'median' ) {
                    return (
                      <g key={ 'fundingMedian'  }>
                        <line
                          x1={ p.x - 4 }
                          x2={ p.x + 4 }
                          y1={ p.y - 4 }
                          y2={ p.y + 4 }
                          stroke={ 'maroon' }
                        />

                        <line
                          x1={ p.x + 4 }
                          x2={ p.x - 4 }
                          y1={ p.y - 4 }
                          y2={ p.y + 4 }
                          stroke={ 'maroon' }
                        />
                      </g>
                    );
                  }
                })}

                { swarm.map(p => {
                  if (p.datum.project_id == theProject.project_id ) {
                    return (
                      <circle
                        cx={p.x}
                        cy={p.y}
                        r={5}
                        fill='steelblue'
                        stroke='black'
                        key={ 'funding' + p.datum.project_id }
                      />
                    );
                  }
                })}

                { (this.state.hoverProject) ? 
                  <g>
                    <text
                      x={inspectedProjectHover.x }
                      y={ (inspectedProjectHover.y > 100) ? inspectedProjectHover.y - 21 : inspectedProjectHover.y + 29 }
                      className='shadow'
                      style={{
                        textAnchor: (inspectedProjectHover.x < fundingMid * -1/3)  ? 'start' : (inspectedProjectHover.x > fundingMid * 1/3) ? 'end' : 'middle',
                        fontWeight: (inspectedProjectHover.datum.hasProjectGeojson) ? 400 : 200
                      }}
                    >
                      { inspectedProjectHover.datum.project}
                    </text> 
                    <text
                      x={inspectedProjectHover.x }
                      y={ (inspectedProjectHover.y > 100) ? inspectedProjectHover.y - 5 : inspectedProjectHover.y + 45 }
                      className='shadow'
                      style={{
                        textAnchor: (inspectedProjectHover.x < fundingMid * -1/3)  ? 'start' : (inspectedProjectHover.x > fundingMid * 1/3) ? 'end' : 'middle' 
                      }}
                    >
                      { inspectedProjectHover.datum.city + ', ' + inspectedProjectHover.datum.state.toUpperCase() }
                    </text> 
                  </g>: ''
                }
              </g>
            </g>
          </svg>: ''
        }
      </div>
    );
  }

}