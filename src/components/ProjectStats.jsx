import * as React from 'react';
import { PropTypes } from 'react';
import CitiesStore from '../stores/CitiesStore.js';
import DimensionsStore from '../stores/DimensionsStore.js';

export default class ProjectStats extends React.Component {
  constructor (props) { super(props); }

  _label(label, percent, x, tb) {
    tb = tb || 'sub';
    if (DimensionsStore.getProjectStatProportionWidth(percent) >= 100) {
      return (
        <text
          x={ x }
          y={ 30 }
          fontSize={14}
          fill='white'
          textAnchor='middle'
          alignmentBaseline='middle'
          transform='translate(120)'
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
            y={ 0 }
            fontSize={14}
            fill='white'
            textAnchor='middle'
            alignmentBaseline='middle'
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
            y={ (tb == 'super') ? -25 : 25 }
            fontSize={13}
            fill='black'
            textAnchor='middle'
            alignmentBaseline='middle'
          >
            { label }
          </text>
        </g>
      );
    }
  }

  render() {
    let theProject = this.props.projects[this.props.project_id],
      houses = theProject.houses_sub_standard + theProject.houses_standard,
      acres = theProject.reuse_residential + theProject.reuse_commercial + theProject.reuse_industrial + theProject.reuse_public,

      widths = {
        familiesOfColor: DimensionsStore.getProjectStatProportionWidth(theProject.percentFamiliesOfColor),
        whiteFamilies: DimensionsStore.getProjectStatProportionWidth(1 - theProject.percentFamiliesOfColor),
        substandard: DimensionsStore.getProjectStatProportionWidth(theProject.houses_sub_standard/(theProject.houses_sub_standard + theProject.houses_standard)),
        standard: DimensionsStore.getProjectStatProportionWidth(theProject.houses_standard/(theProject.houses_sub_standard + theProject.houses_standard)),
        residential: DimensionsStore.getProjectStatProportionWidth(theProject.reuse_residential/acres),
        commercial: DimensionsStore.getProjectStatProportionWidth(theProject.reuse_commercial/acres),
        industrial: DimensionsStore.getProjectStatProportionWidth(theProject.reuse_industrial/acres),
        public: DimensionsStore.getProjectStatProportionWidth(theProject.reuse_public/acres)
      };

    return (
      <div className='projectStats'>
        <div 
          onClick={ this.props.onProjectClicked }
          id={ null }
          className='closeicon'
        >x</div>

        <h2>{ this.props.city + ', ' + this.props.state }</h2>

        <h3>{ theProject.project }</h3>

        { (theProject.funding_dispursed) ?
          <div className='summary'>
            <strong>${ theProject.funding_dispursed.toLocaleString() }</strong> in federal funding.
          </div> : ''
        }

        <svg
          { ...DimensionsStore.getProjectStatsOverallDimensions() }
        >
          <g transform='translate(50)'>

            <text 
              x={50}
              y={25}
              fontWeight='bold'
              textAnchor='middle'
              fontSize='1.3em'
            >
              {theProject.totalFamilies.toLocaleString()}
            </text>
            <text 
              x={50}
              y={45}
              textAnchor='middle'
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
            { this._label('of color', theProject.percentFamiliesOfColor, widths.familiesOfColor / 2)}

            <rect
              width={ widths.whiteFamilies }
              height={20}
              x={ widths.familiesOfColor }
              y={20}
              fill='#2ca02c'
              transform='translate(120)'
            />
            { this._label('white', (1-theProject.percentFamiliesOfColor), widths.familiesOfColor + widths.whiteFamilies / 2) }
          </g>
        </svg>

        <svg
          { ...DimensionsStore.getProjectStatsOverallDimensions() }
        >
          <g transform='translate(50)'>
            <text 
              x={50}
              y={25}
              fontWeight='bold'
              textAnchor='middle'
              fontSize='1.3em'
            >
              { houses.toLocaleString() }
            </text>
            <text 
              x={50}
              y={45}
              textAnchor='middle'
            >
              houses razed
            </text>

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
            { this._label('substandard', (theProject.houses_sub_standard/(theProject.houses_sub_standard + theProject.houses_standard)), widths.standard + widths.substandard / 2) }

          </g>
        </svg>
        
        <svg
          { ...DimensionsStore.getProjectStatsOverallDimensions() }
        >
          <g transform='translate(50)'>
            <text 
              x={50}
              y={25}
              fontWeight='bold'
              textAnchor='middle'
              fontSize='1.3em'
            >
              { Math.round(acres * 10)/10 }
            </text>
            <text 
              x={50}
              y={45}
              textAnchor='middle'
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



        </svg>



        { (false) ? 
          <table className='population-stats'>
            <tbody>
              <tr>
                <th></th>
                <th>1950</th>
                <th>1960</th>
                <th>1970</th>
              </tr>
              <tr>
                <td>Population</td>
                <td className='total' key='total1950'>{ this.props.pop_1950.toLocaleString() }</td>
                <td className='total' key='total1960'>{ this.props.pop_1960.toLocaleString()}</td>
                <td className='total' key='total1970'>{ this.props.pop_1970.toLocaleString()}</td>
              </tr>

              <tr>
                <td>white</td>
                <td>not available</td>
                <td>{ Math.round(1000 * this.props.white_1960 / this.props.pop_1960) / 10  + '%'}</td>
                <td>{ Math.round(1000 * this.props.white_1970 / this.props.pop_1970) / 10  + '%'}</td>
              </tr>

              <tr>
                <td>of color</td>
                <td>not available</td>
                <td>{ Math.round(1000 * this.props.nonwhite_1960 / this.props.pop_1960) / 10  + '%'}</td>
                <td>{ Math.round(1000 * this.props.nonwhite_1970 / this.props.pop_1970) / 10  + '%'}</td>
              </tr>

              
            </tbody>
          </table> :
          ''
        }

      </div>
    );
  }

}