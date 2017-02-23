var React = require('react');

var Handle = React.createClass({

  getInitialState: function() {
    return {
      x: this.props.width - (this.props.percent * this.props.width) - 2, // the visible handle position
      deX: this.props.width - (this.props.percent * this.props.width) - 4, // the draggable element x
      deWidth: 8,
      pocBottom: this.props.percent, // the value
      isDragging: false,
      max: (this.props.max) ? this.props.max : 1,
      min: (this.props.min) ? this.props.min : 0,
    };
  },

  hover: function(e) {
    this.setState({
      deX: (this.props.max) ? this.props.width - (this.props.max * this.props.width) + 4 : -2 ,
      deWidth: (this.props.max) ? (this.props.max * this.props.width) - 4 : (this.props.min) ? this.props.width - (this.props.min * this.props.width) - 4 : this.props.width
      
    });
  },

  selectElement: function(e) {
    this.setState({
      isDragging: true,
      mouseX: e.pageX,
      mouseY: e.pageY
    });
  },

  deSelectElement: function() {
    this.setState({
      isDragging: false,
      deWidth: 8,
      deX: this.state.x - 2
    });
  },

  drag: function(e) {

    if (this.state.isDragging) {
      var idx = e.target.id;
      let deltaX = e.pageX - this.state.mouseX,
        newX = this.state.x + deltaX,
        newValue = (this.props.width - newX)/this.props.width,
        topOrBottom = (this.props.max) ? 'bottom' : 'top';


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
          y={ 35 }
          width={ 4 }
          height={ 30 }
          fill='yellow'
        />
        <rect className="handle"
          id={ this.props.id }
          x={ this.state.deX }
          y={ 0 }
          width={ this.state.deWidth }
          height={ 100 }
          fill={ 'silver' }
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