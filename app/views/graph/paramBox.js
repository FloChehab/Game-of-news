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

        <label
          htmlFor={rangeId}
          style={{ marginBottom: 0, display: "block" }}
          data-toggle="tooltip"
          data-placement="top"
          title={this.props.tooltip}>
          {this.props.labelTextLeft} <span className="badge badge-secondary">{this.state.value}</span> {this.props.labelTextRight}
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
  labelTextLeft: Proptypes.string,
  labelTextRight: Proptypes.string,
  inputProps: Proptypes.object,
  onChange: Proptypes.func,
  value: Proptypes.number,
  tooltip: Proptypes.string
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
                labelTextLeft={"Set the red/green tone threshold to"}
                labelTextRight={"."}
                tooltip={"If the average tone of the articles of the news source for an event is lower than the threshold, then the corresponding edge is red; it's green otherwise."}
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
                labelTextLeft={"Display the top"}
                labelTextRight={"news sources."}
                tooltip={"The 'top news sources' are the biggest ones in terms of number of different events shared."}
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
                labelTextLeft={"Display at most"}
                labelTextRight={"of the 'top edges' of each node."}
                tooltip={"This parameter limits the number of edges that are added to the graph for each node. The biggest edges in terms of number of events shared between each node and another one are added first."}
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
                labelTextLeft={"Show only edges of weight at least"}
                labelTextRight={"."}
                tooltip={"The 'weight' of an edge represents the number of events that were shared by both of the news sources connected by the edge."}
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
                labelTextLeft={"Set the tone distance threshold to"}
                labelTextRight={"."}
                tooltip={"This threshold is used to color the edges: if the distance between the average recorded tone of each news source is above the threshold, then the corresponding edge is red. Otherwise it is green."}
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

