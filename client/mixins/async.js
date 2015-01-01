
module.exports = {
  loadedComponent: null,

  load: function() {
    if (this.constructor.loadedComponent) {
      return;
    }

    this.bundle(function(component) {
      this.constructor.loadedComponent = component;
      this.forceUpdate();
    }.bind(this));
  },

  componentDidMount: function() {
    setTimeout(this.load, 1000); // feel it good
  },

  render: function() {
    var component = this.constructor.loadedComponent;
    return component ? component(this.props) : this.preRender();
  }
};
