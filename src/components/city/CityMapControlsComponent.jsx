import * as React from 'react';

export default class LegendHOLC extends React.Component {

  constructor (props) { super(props); }

  render () {
    return (
      <div id='mapChartToggle'>
        <div 
          className={ (this.props.selectedCityView == 'pr') ? 'selected' : '' }
          onClick={ this.props.onCityViewSelected } 
          id='pr'
        >  
          <span className='tooltip'>View the racial demographics and median incomes from the 1960s census.</span>   
          Poverty & Race    
        </div>    

        { (this.props.hasHOLCData) ?
          <div    
            className={ (this.props.selectedCityView == 'holc') ? 'selected' : '' }  
            onClick={ this.props.onCityViewSelected } 
            id='holc'   
          >   
            <span className='tooltip'>View the grades assigned by the Home Owners' Loan Corporation assessing 'neighborhood security' in the 1930s.</span>    
            1930s redlining grades    
          </div> : ''
        }

      </div>
    );
  }
}