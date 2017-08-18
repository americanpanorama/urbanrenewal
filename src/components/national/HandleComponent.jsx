var React = require('react');
import DimensionsStore from  '../../stores/DimensionsStore.js';

var Handle = React.createClass({

  getInitialState: function() {
    let xForPercent = DimensionsStore.getLegendGradientPercentX(this.props.percent);
    return {
      x: (this.props.max) ? xForPercent : xForPercent - 4, // the visible handle position
      deX: (this.props.max) ? xForPercent - 2 : xForPercent - 6, // the draggable element x
      deWidth: 8,
      percent: this.props.percent,
      isDragging: false,
      max: (this.props.max) ? this.props.max : 1,
      min: (this.props.min) ? this.props.min : 0,
      handleColor: 'yellow'
    };
  },

  hover: function(e) {
    // if it's the right slider, set the bottom just to the right of the top/max slider; if it's left set it 1/5 of the way to the left of the bar (i.e. a fictional percent of 120% or 1.2)
    const deX = (this.props.max) ? DimensionsStore.getLegendGradientPercentX(this.props.max) + 4 : DimensionsStore.getLegendGradientPercentX(1.2),
      deWidth = (this.props.max) ? DimensionsStore.getLegendGradientPercentX(-0.2) - deX : DimensionsStore.getLegendGradientPercentX(this.props.min) - deX - 4;

    this.setState({
      deX: deX,
      deWidth: deWidth
    });
  },

  selectElement: function(e) {
    this.setState({
      isDragging: true,
      mouseX: e.pageX,
      handleColor: 'red'
    });
  },

  deSelectElement: function() {
    this.setState({
      isDragging: false,
      deWidth: 8,
      deX: this.state.x - 2,
      handleColor: 'yellow'
    });
  },

  drag: function(e) {
    if (this.state.isDragging) {
      const leftOrRight = (this.props.max) ? 'right' : 'left',
        deltaX = e.pageX - this.state.mouseX;

      let newPercent = this.props.percent - deltaX/DimensionsStore.getLegendGradientInteriorDimensions().width;
      // don't let the right go lower than 0 or the bottom higher than the width
      newPercent = (newPercent > 1) ? 1 : (newPercent < 0) ? 0 : newPercent;

      this.props.onUpdate(newPercent, leftOrRight);

      this.setState({
        x: DimensionsStore.getLegendGradientPercentX(newPercent),
        percent: newPercent,
        mouseX: e.pageX
      });
    }
  },

  render: function() {
    return (
      <g>
        <rect 
          className='visibleHandle'
          id={ this.props.id }
          x={ this.state.x }
          y={ DimensionsStore.getLegendGradientInteriorDimensions().y - 2 }
          width={ 4  }
          height={ DimensionsStore.getLegendGradientInteriorDimensions().height + 4  }
          fill={ this.state.handleColor }
        />
        <rect className="handle"
          id={ this.props.id }
          x={ this.state.deX }
          y={ DimensionsStore.getLegendGradientInteriorDimensions().y - 4 }
          width={ this.state.deWidth }
          height={ DimensionsStore.getLegendGradientInteriorDimensions().height + 8 }
          fill={ 'transparent' }
          fillOpacity={ 0.5 }
          onMouseOver={ this.hover }
          onMouseDown={ this.selectElement }
          onMouseMove={ this.drag }
          onMouseUp={ this.deSelectElement }
          onMouseLeave={ this.deSelectElement } 
        />
      </g>
    );
  }

});

module.exports = Handle;