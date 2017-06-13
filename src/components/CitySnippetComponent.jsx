import React from 'react';
import d3 from 'd3';

import CitiesStore from '../stores/CitiesStore';
import DimensionsStore from '../stores/DimensionsStore';

export default class CitySnippet extends React.Component {

  constructor () { super();}

  render () {
    let makeArc = function(sa, ea) {
      let path = d3.svg.arc()
        .outerRadius(30)
        .innerRadius(0)
        .startAngle(sa)
        .endAngle(ea);

      return path();
    };
    
    return (

      <div 
        className='city-snippet' 
        onClick={ this.props.onCityClick } 
        id={ this.props.city_id }
      >
        <h1>
          {/* href for indexing */}
          <a 
            href={ '//dsl.richmond.edu/panorama/redlining/#city=' + this.props.slug }
            onClick={ ()=>false }
          >
            { this.props.city.toUpperCase() + ((this.props.displayState) ? ', ' + this.props.state : '') }
          </a>
        </h1>

        <svg
          width={ DimensionsStore.getCitySnippetWidth() }
          height={20}
          
        >
          <text
            x={ DimensionsStore.getCitySnippetWidth() * 1/3 - 5 }
            y={4}
            textAnchor='end'
            alignmentBaseline='hanging'
            fontSize={ 12 }
          >
            <tspan fontWeight='bold' alignmentBaseline='hanging'>
              { Math.round(this.props.yearsData[CitiesStore.getSelectedYear()].totalFamilies).toLocaleString() + ' ' }
            </tspan>
            Families
          </text>

          <rect
            x={DimensionsStore.getCitySnippetWidth() * 1/3}
            y={4}
            width={DimensionsStore.getCitySnippetWidth()* 2/3 * this.props.yearsData[CitiesStore.getSelectedYear()].percentFamiliesOfColor}
            height={12}
            className='poc'
          />

          <rect
            x={DimensionsStore.getCitySnippetWidth()* 1/3 + DimensionsStore.getCitySnippetWidth()* 2/3* this.props.yearsData[CitiesStore.getSelectedYear()].percentFamiliesOfColor}
            y={4}
            width={DimensionsStore.getCitySnippetWidth()* 2/3* (1 - this.props.yearsData[CitiesStore.getSelectedYear()].percentFamiliesOfColor) }
            height={12}
            className='white'
          />

          { (this.props.displayPop && this.props.pop_1960 && this.props.white_1960 && this.props.nonwhite_1960) ?
            <g>
              <circle
                cx={DimensionsStore.getCitySnippetWidth()* 1/3 + DimensionsStore.getCitySnippetWidth() * 2/3 * this.props.nonwhite_1960 / this.props.pop_1960}
                cy={2}
                r={1}
                fill='black'
              /> 
              <circle
                cx={DimensionsStore.getCitySnippetWidth()* 1/3 + DimensionsStore.getCitySnippetWidth() * 2/3 * this.props.nonwhite_1960 / this.props.pop_1960}
                cy={18}
                r={1}
                fill='black'
              />
              <line
                x1={DimensionsStore.getCitySnippetWidth()* 1/3 + DimensionsStore.getCitySnippetWidth() * 2/3 * this.props.nonwhite_1960 / this.props.pop_1960}
                x2={DimensionsStore.getCitySnippetWidth()* 1/3 + DimensionsStore.getCitySnippetWidth() * 2/3 * this.props.nonwhite_1960 / this.props.pop_1960}
                y1={2}
                y2={18}
                strokeWidth={0.5}
                stroke='black'
              />
            </g>: ''
          }




          { (this.props.yearsData[CitiesStore.getSelectedYear()].percentFamiliesOfColor > 0.2) ?
            <text
              x={ DimensionsStore.getCitySnippetWidth()* 1/3 + DimensionsStore.getCitySnippetWidth()* 2/3* this.props.yearsData[CitiesStore.getSelectedYear()].percentFamiliesOfColor - 5 }
              y={6}
              textAnchor='end'
              alignmentBaseline='hanging'
              fontSize={ 8 }
              fill='white'
            >
              { Math.round(this.props.yearsData[CitiesStore.getSelectedYear()].percentFamiliesOfColor * 100) + '%' }
            </text> : ''
          }



          { (this.props.yearsData[CitiesStore.getSelectedYear()].percentFamiliesOfColor < 0.8) ?
            <text
              x={ DimensionsStore.getCitySnippetWidth()* 1/3 + DimensionsStore.getCitySnippetWidth()* 2/3* this.props.yearsData[CitiesStore.getSelectedYear()].percentFamiliesOfColor + 5 }
              y={6}
              textAnchor='beginning'
              alignmentBaseline='hanging'
              fontSize={ 8 }
              fill='white'
            >
              { Math.round((1 -this.props.yearsData[CitiesStore.getSelectedYear()].percentFamiliesOfColor) * 100) + '%' }
            </text> : ''
          }
        </svg>

        {/* (this.props.displayPop && this.props.pop_1960) ?
          <div className='populationStats'><span className='catName'>Population (1960):</span> <span className='subcatData'>{ this.props.pop_1960.toLocaleString() }</span></div> :
          ''
        }
        
        { (this.props.displayPop && this.props.pop_1960 && this.props.white_1960 && this.props.nonwhite_1960) ?
          <ul>
            <li>{ Math.round(this.props.nonwhite_1960 / this.props.pop_1960 * 100) + '% people of color'}</li>
            <li>{ Math.round(this.props.white_1960 / this.props.pop_1960 * 100) + '% white'}</li>
          </ul> : ''
        */}

        {/* (this.props.displayPop && this.props.pop_1960 && this.props.white_1960 && this.props.nonwhite_1960) ?
          <svg
            width={ DimensionsStore.getCitySnippetWidth() }
            height={60}
            
          >
            <text
              x={ DimensionsStore.getCitySnippetWidth()/2 }
              y={32}
              textAnchor='end'
              fontSize={ 10 }
            >
              { 'Population 1960: ' + this.props.pop_1960.toLocaleString() }
            </text>

            <rect
              x={DimensionsStore.getCitySnippetWidth()/2}
              y={16}
              width={DimensionsStore.getCitySnippetWidth()/2 * this.props.nonwhite_1960 / this.props.pop_1960}
              height={12}
              className='poc'
            />

            <rect
              x={DimensionsStore.getCitySnippetWidth()/2 + DimensionsStore.getCitySnippetWidth()/2 * this.props.nonwhite_1960 / this.props.pop_1960}
              y={16}
              width={DimensionsStore.getCitySnippetWidth()/2 *this.props.white_1960 / this.props.pop_1960 }
              height={12}
              className='white'
            />


          </svg> : ''
        */}


        {/* (this.props.displayPop && this.props.pop_1960 && this.props.white_1960 && this.props.nonwhite_1960) ?
          <svg
            width={60}
            height={60}
            
          >
            <g transform='translate(30 30)'>
              <path
                d={ makeArc(0, Math.PI*2 * (this.props.nonwhite_1960 / this.props.pop_1960))}
                fill='green'
              />
              <path
                d={ makeArc(Math.PI*2 * (this.props.nonwhite_1960 / this.props.pop_1960), Math.PI*2)}
                fill='blue'
              />
            </g>

          </svg> : ''
        }

        { (this.props.displayPop && this.props.pop_1960 && this.props.white_1960 && this.props.nonwhite_1960) ?
          <svg
            width={60}
            height={60}
            
          >
            <g transform='translate(30 30)'>
              <path
                d={ makeArc(0, Math.PI*2 * this.props.yearsData[CitiesStore.getSelectedYear()].percentFamiliesOfColor) }
                fill='green'
              />
              <path
                d={ makeArc(Math.PI*2 * this.props.yearsData[CitiesStore.getSelectedYear()].percentFamiliesOfColor, Math.PI*2)}
                fill='blue'
              />
            </g>

          </svg> : ''
        */}

      </div>
    );
  }
}