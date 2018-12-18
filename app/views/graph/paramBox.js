import CONFIG from "../../config";
import React from "react";
import ReactDOM from "react-dom";
import Proptypes from "prop-types";
import "../../../assets/styles/GraphParamBox.scss";

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
      <div className={this.props.className}>
        <label htmlFor={rangeId} style={{ marginBottom: 0, display: "block" }}>
          {this.props.labelText}: {this.state.value}
        </label>
        <input
          type="range"
          className="custom-range"
          id={rangeId}
          value={this.state.value}
          onChange={evt => this.handleChange(evt)}
          {...this.props.inputProps}
          style={{ marginBottom: "1em", display: "block" }}
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
    this.config = Object.assign({}, config); // make a copy to prevent bugs with object being references
    this.parent = parent;
    this.container = container;
    this.init(this.container);
    this.secondaryView = false;
  }

  setWeAreInSecondaryView(b) {
    this.secondaryView = b;
    this.init(this.container);
  }

  init(container) {
    ReactDOM.render(
      <div>
        {
          this.secondaryView ?
            <div className="graphParamContainer">
              <Slider
                labelText={"Positive/negative tone threshold"}
                inputProps={{
                  min: -10,
                  max: 10,
                  step: 0.02,
                }}
                value={this.config.posNegThreshold}
                onChange={(posNegThreshold) => this.updateConfig({ posNegThreshold })}
                className="param"
                key={1}
              />
            </div>

            :

            <div className="graphParamContainer">
              <Slider
                labelText={"Number of nodes (best nodes in terms of shared events)"}
                inputProps={{
                  min: 2,
                  max: CONFIG.GRAPH_MAX_NB_NODES,
                  step: 1,
                }}
                value={this.config.maxNbNodes}
                onChange={(val) => this.updateConfig({ maxNbNodes: +val })}
                className="param"
                key={2}
              />

              <Slider
                labelText={"Max number of edges per node (biggest)"}
                inputProps={{
                  min: 1,
                  max: CONFIG.GRAPH_MAX_NB_BEST_EDGES,
                  step: 1,
                }}
                value={this.config.bestNEdges}
                onChange={(val) => this.updateConfig({ bestNEdges: +val })}
                className="param"
                key={3}
              />

              <Slider
                labelText={"Show only edges that have at least in common"}
                inputProps={{
                  min: 1,
                  max: CONFIG.GRAPH_MAX_MIN_NB_SHARED_EVENTS_EDGE,
                  step: 1,
                }}
                value={this.config.minNbSharedEventEdge}
                onChange={(val) => this.updateConfig({ minNbSharedEventEdge: +val })}
                className="param"
                key={4}
              />

              <Slider
                labelText={"Tone distance threshold"}
                inputProps={{
                  min: 0.02,
                  max: CONFIG.GRAPH_MAX_NB_BEST_EDGES,
                  step: 0.02,
                }}
                value={this.config.toneDistThreshold}
                onChange={(val) => this.updateConfig({ toneDistThreshold: +val })}
                className="param"
                key={5}
              />
            </div>
        }
      </div>
      , container);
  }

  updateConfig(config) {
    Object.assign(this.config, config);
    this.parent.updateConfig(this.config);
  }

}

