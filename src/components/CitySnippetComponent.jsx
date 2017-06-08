import React from 'react';
import d3 from 'd3';

import CitiesStore from '../stores/CitiesStore';

export default class CitySnippet extends React.Component {

  constructor () { super();}

  render () {
    console.log(this.props);

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
        { (this.props.displayPop && this.props.pop_1960) ?
          <div className='populationStats'><span className='catName'>Population (1960):</span> <span className='subcatData'>{ this.props.pop_1960.toLocaleString() }</span></div> :
          ''
        }
        
        { (this.props.displayPop && this.props.pop_1960 && this.props.white_1960 && this.props.nonwhite_1960) ?
          <ul>
            <li>{ Math.round(this.props.nonwhite_1960 / this.props.pop_1960 * 100) + '% people of color'}</li>
            <li>{ Math.round(this.props.white_1960 / this.props.pop_1960 * 100) + '% white'}</li>
          </ul> : ''
        }

        { (this.props.displayPop && this.props.pop_1960 && this.props.white_1960 && this.props.nonwhite_1960) ?
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
        }

      </div>
    );
  }
}