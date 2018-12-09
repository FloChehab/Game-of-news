import CONFIG from "../../config";
import React from "react";
import ReactDOM from "react-dom";
import Proptypes from "prop-types";

// var config = {
//   maxNbNodes: 13,
//   bestNEdges: 3,
// };
function getId() {
  return new Date().getTime();
}

class Slider extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      value: props.value
    };
  }

  handleChange(evt) {
    const { value } = evt.target;
    this.setState({ value });
    this.props.onChange(value);
  }
  render() {
    const rangeId = `range-${getId()}`;

    return (
      <div>
        <label htmlFor={rangeId}>
          {this.props.labelText}
        </label>
        <input
          type="range"
          className="custom-range"
          id={rangeId}
          value={this.state.value}
          onChange={evt => this.handleChange(evt)}
          {...this.props.inputProps}
        />
      </div>
    );
  }
}

Slider.propTypes = {
  labelText: Proptypes.string,
  inputProps: Proptypes.object,
  onChange: Proptypes.func,
  value: Proptypes.number
};


export class GraphParamBox {
  constructor(parent, container, config) {
    this.config = config;
    this.parent = parent;
    this.init(container);

  }

  init(container) {

    ReactDOM.render(
      <Slider
        labelText={"Number of nodes (best nodes in terms of shared events)"}
        inputProps={{
          min: 2,
          max: CONFIG.GRAPH_MAX_NB_NODES,
          step: 1,
        }}
        value={this.config.maxNbNodes}
        onChange={(maxNbNodes) => this.updateConfig({ maxNbNodes })}
      />
      , container);
  }

  updateConfig(config) {
    for (const conf in config) {
      this.config[conf] = config[conf];
    }

    this.parent.updateConfig(this.config);
  }

}

