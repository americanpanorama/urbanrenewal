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

  componentWillReceiveProps(nextProps) {
    if (this.props.project_id !== nextProps.project_id) {
      this.setState({hoverProject: null});
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
    const theProject = this.props.projects[this.props.project_id] || {};

    if (!theProject.project_id) {
      return <div />;
    }

    let projectsWithDisplacements = this.props.stats.projects.filter(p => p.totalFamilies > 0),
      maxDisplacements= projectsWithDisplacements[projectsWithDisplacements.length-1].totalFamilies || 0,
      displacementTicks = (maxDisplacements < 500) ? [0,100,200,300,400] : 
        (maxDisplacements < 3000) ? [0,500,1000,1500,2000,2500,3000] :
        [0,1000,2000,3000,4000,5000],
      inspectedProject = (this.state.hoverProject) ? this.props.stats.projects.find(p => p.project_id == this.state.hoverProject) : this.props.stats.projects.find(p => p.project_id == this.props.project_id),
      funding = [{funding: this.props.stats.medianFunding, project_id: 'median'}].concat(this.props.stats.projects.filter(p => p.funding && Math.sign(theProject.totalFamilies) == Math.sign(p.totalFamilies))),
      maxFunding = Math.max(...funding.map(p => p.funding)) || 1,
      fundingTicks = (maxFunding <= 10000000) ? [2000000, 3000000, 4000000, 5000000, 6000000, 7000000, 8000000, 9000000, 10000000] : 
        (maxFunding < 30000000) ? [5000000,10000000,15000000,20000000,25000000] :
        [10000000,20000000,30000000,40000000,50000000,60000000],
      fundingMid = 1;

    let swarm = beeswarm()
      .data(funding)                                 // set the data to arrange
      .distributeOn(d => (maxFunding - d.funding) / maxFunding * 200)                  // set the value accessor to distribute on
      .radius(2)                                  // set the radius for overlapping detection
      .orientation('vertical')                  // set the orientation of the arrangement
                                                    // could also be 'vertical'
      .side('symetric')                           // set the side(s) available for accumulation
                                                    // could also be 'positive' or 'negative'
      .arrange();

    let inspectedProjectHover = (this.state.hoverProject) ? swarm.find(p => p.datum.project_id == this.state.hoverProject)  : swarm.find(p => p.datum.project_id == this.props.project_id);

    fundingMid = swarm.reduce((max,p) => Math.max(Math.abs(p.x), max), 0);

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

        { (theProject.totalFamilies > 0) ?
          <svg
            { ...DimensionsStore.getProjectStatsOverallDimensions() }
            width={203}
            height={325}
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
                { theProject.nonwhite } of color ({ (Math.round(theProject.percentFamiliesOfColor * 100)) +'%'})
              </text>

              <text 
                x={ 75}
                y={ 58 }
                fontWeight={200}
              >
                { theProject.whites } white ({(Math.round((1-theProject.percentFamiliesOfColor) * 100)) + '%'})
              </text>



              <g transform='translate(0, 70)'>
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

                { displacementTicks.map(tick => {
                  if ((maxDisplacements - tick) / maxDisplacements * 200 > 0) {
                    return (
                      <g key={ 'ytick' + tick }>
                        <line
                          x1={0}
                          x2={150}
                          y1={(maxDisplacements - tick) / maxDisplacements * 200}
                          y2={(maxDisplacements - tick) / maxDisplacements * 200}
                          className='tick'
                          
                        />

                        <text
                          x={-5}
                          y={(maxDisplacements - tick) / maxDisplacements * 200 + 6}
                          className='tickLabel yTickLabel'
                        >
                          { tick }
                        </text>
                      </g>
                    );
                  }
                })}

                { projectsWithDisplacements.map(pr => {
                  if (pr.city_id !== theProject.city_id) {
                    return (
                      <circle
                        cx={ (1-pr.percentFamiliesOfColor) * 150}
                        cy={ (maxDisplacements - pr.totalFamilies) / maxDisplacements * 200 }
                        r={ ( pr.project_id == this.state.hoverProject) ? 5 : 2.5 }
                        fill={getColorForRace(pr.percentFamiliesOfColor)}
                        fillOpacity={ ( pr.project_id == this.state.hoverProject) ? 1 : 0 }
                        stroke={ getColorForRace(pr.percentFamiliesOfColor) }
                        strokeOpacity={ (!this.state.hoverProject || pr.project_id == this.state.hoverProject || this.props.project_id == this.state.hoverProject) ? 1 : 0.3 }
                        onMouseEnter={ this.onProjectHover }
                        onMouseLeave={ this.onProjectOut }
                        onClick={ this.props.onProjectClick }
                        id={ pr.project_id }
                        key={ 'projectGraph' + pr.project_id }
                      />
                    );
                  }
                })}

                { projectsWithDisplacements.map(pr => {
                  if (pr.city_id == theProject.city_id && pr.project_id !== theProject.project_id) {
                    return (
                      <circle
                        cx={ (1-pr.percentFamiliesOfColor) * 150}
                        cy={ (maxDisplacements - pr.totalFamilies) / maxDisplacements * 200 }
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
                  cx={ (1-theProject.percentFamiliesOfColor )* 150}
                  cy={ (maxDisplacements - theProject.totalFamilies) / maxDisplacements * 200 }
                  r={5}
                  fill={ getColorForRace(theProject.percentFamiliesOfColor) }
                  fillOpacity={ (!this.state.hoverProject || theProject.project_id == this.state.hoverProject) ? 1 : 0.3 }
                  stroke={ '#111' }
                  strokeOpacity={ (!this.state.hoverProject || theProject.project_id == this.state.hoverProject) ? 1 : 0.3 }
                />

                <line
                  x1={ this.props.stats.medianPercentsFamiliesOfColor * 150 - 4 }
                  x2={ this.props.stats.medianPercentsFamiliesOfColor * 150 + 4 }
                  y1={ (maxDisplacements - this.props.stats.medianDisplacements) / maxDisplacements * 200 - 4 }
                  y2={ (maxDisplacements - this.props.stats.medianDisplacements) / maxDisplacements * 200 + 4 }
                  stroke={ 'maroon' }
                />

                <line
                  x1={ this.props.stats.medianPercentsFamiliesOfColor * 150 + 4 }
                  x2={ this.props.stats.medianPercentsFamiliesOfColor * 150 - 4 }
                  y1={ (maxDisplacements - this.props.stats.medianDisplacements) / maxDisplacements * 200 - 4 }
                  y2={ (maxDisplacements - this.props.stats.medianDisplacements) / maxDisplacements * 200 + 4 }
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
                  of color
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
                  white
                </text>

                <text 
                  x={75}
                  y={ 228 }
                  fill='black'
                >
                  race
                </text>


                <text
                  x={(1-inspectedProject.percentFamiliesOfColor) * 150 }
                  y={((maxDisplacements - inspectedProject.totalFamilies) / maxDisplacements * 200 > 100) ? (maxDisplacements - inspectedProject.totalFamilies) / maxDisplacements * 200 - 25 : (maxDisplacements - inspectedProject.totalFamilies) / maxDisplacements * 200 + 29 }
                  className='shadow'
                  style={{
                    textAnchor: (inspectedProject.percentFamiliesOfColor < 0.33) ? 'end' : (inspectedProject.percentFamiliesOfColor > 0.75) ? 'start' : 'middle' ,
                    fontWeight: (inspectedProject.hasProjectGeojson) ? 400 : 200
                  }}
                >
                  { inspectedProject.project}
                </text> 
                <text
                  x={(1-inspectedProject.percentFamiliesOfColor) * 150 }
                  y={((maxDisplacements - inspectedProject.totalFamilies) / maxDisplacements * 200 > 100) ? (maxDisplacements - inspectedProject.totalFamilies) / maxDisplacements * 200 - 8 : (maxDisplacements - inspectedProject.totalFamilies) / maxDisplacements * 200 + 45 }
                  className='shadow'
                  style={{
                    textAnchor: (inspectedProject.percentFamiliesOfColor < 0.33) ? 'end' : (inspectedProject.percentFamiliesOfColor > 0.75) ? 'start' : 'middle' 
                  }}
                >
                  { inspectedProject.city + ', ' + inspectedProject.state.toUpperCase() }
                </text> 


            </g>

            </g>
          </svg> : ''
        }

        { (theProject.funding_dispursed) ?
          <svg
            { ...DimensionsStore.getProjectStatsOverallDimensions() }
            width={Math.max(200, fundingMid * 2 + 60)}
            height={320}
            className='projectStat'
          >

            <g transform='translate(60)'>
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
                y={70}
                width={fundingMid * 2 }
                height={ 200 }
                fill='#eee'
              />

              { fundingTicks.map(tick => {
                if ((maxFunding - tick) / maxFunding * 200 > 0) {
                  return (
                    <g 
                      transform='translate(0  70)'
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

              <g transform={'translate(' + fundingMid + ' 70)'}>
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
                        fillOpacity={ (!this.state.hoverProject || theProject.project_id == this.state.hoverProject) ? 1 : 0.3 }
                        stroke='#111'
                        strokeOpacity={ (!this.state.hoverProject || theProject.project_id == this.state.hoverProject) ? 1 : 0.3 }
                        key={ 'funding' + p.datum.project_id }
                      />
                    );
                  }
                })}


                <text
                  x={inspectedProjectHover.x }
                  y={ (inspectedProjectHover.y > 100) ? inspectedProjectHover.y - 25 : inspectedProjectHover.y + 29 }
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
                  y={ (inspectedProjectHover.y > 100) ? inspectedProjectHover.y - 8 : inspectedProjectHover.y + 45 }
                  className='shadow'
                  style={{
                    textAnchor: (inspectedProjectHover.x < fundingMid * -1/3)  ? 'start' : (inspectedProjectHover.x > fundingMid * 1/3) ? 'end' : 'middle' 
                  }}
                >
                  { inspectedProjectHover.datum.city + ', ' + inspectedProjectHover.datum.state.toUpperCase() }
                </text> 

              </g>
            </g>
          </svg>: ''
        }

        { (theProject.totalFamilies > 0 || theProject.funding) ?
          <div className='legend'>
            <h4>
              Projects with{ (theProject.totalFamilies == 0) ? 'out' : '' }  displacements<br />
              in cities with populations {this.props.cityCat}
            </h4>
            <ul>
              {/* JSX Comment 
              <li><svg width={20} height={12}><circle cx={6} cy={6} r={5} stroke='black' fill='#aaa' /></svg>{ theProject.project}</li>*/}
              <li><svg width={20} height={12}><circle cx={6} cy={6} r={2.5} stroke='black' strokeWidth={1.5} fill='#aaa' /></svg>Other projects in { this.props.city }</li>
              <li><svg width={20} height={12}><circle cx={6} cy={6} r={2.5} stroke='grey' fill='transparent' /></svg>Projects in other cities</li>
              <li><svg width={20} height={12}>
                <line x1={2} y1={2} x2={10} y2={10} stroke='maroon' />
                <line x1={10} y1={2} x2={2} y2={10} stroke='maroon' />
                </svg>Median values
              </li>
            </ul>
          </div> : ''
        }

        <p onClick={this.props.onContactUsToggle } className='invitation'>If you have maps, photos, or information about { theProject.project } you're willing to share with us, we encourage you to contact us.</p>

        { (Object.keys(theProject.citations).length > 0) ? 
          <div className='citations'>
            <h3>{(Object.keys(theProject.citations).length == 1) ? 'Source' : 'Sources'} for Project Footprint</h3>
            <ul>
            { Object.keys(theProject.citations).map(citation_id => {
              if (theProject.citations[citation_id].links.length == 0) {
                return (
                  <li key={'citation_' + citation_id}>{theProject.citations[citation_id].citation}</li>
                );
              } else if (theProject.citations[citation_id].links.length == 1) {
                return (
                  <li key={'citation_' + citation_id}>
                    <a href={theProject.citations[citation_id].links[0]} target='_blank'>{theProject.citations[citation_id].citation}</a>
                  </li>
                );
              } else {
                return (
                  <li key={'citation_' + citation_id}>
                    { theProject.citations[citation_id].citation }
                    { theProject.citations[citation_id].links.map((link, i) => <span key={'link'+link}>{(i<theProject.citations[citation_id].links-1) ? ', ' : ' '}<a href={link} target='_blank' >Image {(i+1)}</a></span>  )}
                  </li>
                );
              }

            })}
            </ul>
          </div> : ''
        }

      </div>
    );
  }
}