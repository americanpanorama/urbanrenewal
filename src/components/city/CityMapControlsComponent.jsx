import * as React from 'react';

export default class LegendHOLC extends React.Component {

  constructor (props) { super(props); }

  render () {
    return (
       <div className='mapLegend holc'>
        <div><span className='colorkey A'> </span>A "Best"</div>
        <div><span className='colorkey B'> </span>B "Still Desirable"</div>
        <div><span className='colorkey C'> </span>C "Definitely Declining"</div>
        <div><span className='colorkey D'> </span>D "Hazardous"</div>

        <div className='link'><a href={ this.props.miurl }>See "Mapping Inequality" to explore redlining in { this.props.city }.</a></div>
      </div>
    );
  }
}