var React = require('react');

var Handle = React.createClass({

  getInitialState: function() {
    let xForPercent = this.props.width - (this.props.percent * this.props.width);
    return {
      x: (this.props.max) ? xForPercent : xForPercent - 4, // the visible handle position
      deX: (this.props.max) ? xForPercent - 2 : xForPercent - 6, // the draggable element x
      deWidth: 8,
      isDragging: false,
      max: (this.props.max) ? this.props.max : 1,
      min: (this.props.min) ? this.props.min : 0,
      handleColor: 'yellow'
    };
  },

  hover: function(e) {
    // if it's the bottom slider, set the bottom just to the right of the top/max slider
    let deX = (this.props.max) ? this.props.width - (this.props.max * this.props.width) + 8 : -200;

    let deWidth = 200 - 8; // the 8 is to keep a min distance between them
    // if it's the bottom, extend from the max to 200 past the width
    if (this.props.max) {
      deWidth += this.props.max * this.props.width;
    } 
    // if it's the top, extend from 200 below the leftmost point to the min
    else {
      deWidth += this.props.width - (this.props.min * this.props.width);
    }


    this.setState({
      deX: deX,
      deWidth: deWidth
      
    });
  },

  selectElement: function(e) {
    this.setState({
      isDragging: true,
      mouseX: e.pageX,
      mouseY: e.pageY,
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
      var idx = e.target.id;
      let deltaX = e.pageX - this.state.mouseX,
        topOrBottom = (this.props.max) ? 'bottom' : 'top';

      let newX = this.state.x + deltaX;
      // don't let the top go lower than 0 or the bottom higher than the width
      if (topOrBottom == 'top' && this.state.x + deltaX <= 0) {
        newX = 0;
      } else if (topOrBottom == 'bottom' && this.state.x + deltaX >= this.props.width) {
        newX = this.props.width;
      }
      let newValue = (this.props.width - newX)/this.props.width;
        
      this.props.onUpdate(newValue, topOrBottom);

      this.setState({
        x: newX,
        mouseX: e.pageX,
        mouseY: e.pageY,
        value: newX
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
          y={ this.props.y }
          width={ 4 }
          height={ this.props.height }
          fill={ this.state.handleColor }
        />
        <rect className="handle"
          id={ this.props.id }
          x={ this.state.deX }
          y={ 0 }
          width={ this.state.deWidth }
          height={ 100 }
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