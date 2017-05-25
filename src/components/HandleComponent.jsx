var React = require('react');

var Handle = React.createClass({

  getInitialState: function() {
    let yForPercent = this.props.height - (this.props.percent * this.props.height);
    return {
      y: (this.props.max) ? yForPercent : yForPercent - 4, // the visible handle position
      deY: (this.props.max) ? yForPercent - 2 : yForPercent - 6, // the draggable element x
      deHeight: 8,
      isDragging: false,
      max: (this.props.max) ? this.props.max : 1,
      min: (this.props.min) ? this.props.min : 0,
      handleColor: 'yellow'
    };
  },

  hover: function(e) {
    // if it's the bottom slider, set the bottom just to the right of the top/max slider
    let deY = (this.props.max) ? this.props.height - (this.props.max * this.props.height) : -200;

    let deHeight = 200 - 8; // the 8 is to keep a min distance between them
    // if it's the bottom, extend from the max to 200 past the height
    if (this.props.max) {
      deHeight += this.props.max * this.props.height;
    } 
    // if it's the top, extend from 200 below the leftmost point to the min
    else {
      deHeight += this.props.height - (this.props.min * this.props.height);
    }


    this.setState({
      deY: deY,
      deHeight: deHeight
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
      deHeight: 8,
      deY: this.state.y - 2,
      handleColor: 'yellow'
    });
  },

  drag: function(e) {

    if (this.state.isDragging) {
      var idY = e.target.id;
      let deltaY = e.pageY - this.state.mouseY,
        topOrBottom = (this.props.max) ? 'bottom' : 'top';

      let newY = this.state.y + deltaY;
      // don't let the top go lower than 0 or the bottom higher than the width
      if (topOrBottom == 'top' && this.state.y + deltaY <= 0) {
        newY = 0;
      } else if (topOrBottom == 'bottom' && this.state.y + deltaY >= this.props.height) {
        newY = this.props.height;
      }
      let newValue = (this.props.height - newY)/this.props.height;
        
      this.props.onUpdate(newValue, topOrBottom);

      this.setState({
        y: newY,
        mouseY: e.pageY,
        mouseX: e.pageX,
        value: newY
      });
    }
  },

  render: function() {
    return (
      <g>
        <rect 
          className='visibleHandle'
          id={ this.props.id }
          x={ this.props.handleOverhang * -1 }
          y={ this.state.y }
          width={ this.props.width + this.props.handleOverhang * 2 }
          height={ 4  }
          fill={ this.state.handleColor }
        />
        <rect className="handle"
          id={ this.props.id }
          x={ (100 - this.props.width) / -2 }
          y={ this.state.deY }
          width={ 100 }
          height={ this.state.deHeight }
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