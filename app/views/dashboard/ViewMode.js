
import React from "react";

/**
 * Class to give access to a react component to change the dashboard view mode.
 *
 * @export
 * @class ViewMode
 * @extends {React.Component}
 */
export default class ViewMode extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      els: [
        { id: "both", label: "Both views", checked: true, showGraph: true, showStream: true },
        { id: "graph", label: "Graph only", checked: false, showGraph: true, showStream: false },
        { id: "stream", label: "Stream graph only", checked: false, showGraph: false, showStream: true }
      ]
    };
  }

  /**
   * Function to handle the click on one of the button and to update the state accordingly
   *
   * @param {string} id
   * @memberof ViewMode
   */
  handleChange(id) {
    let newEls = this.state.els;
    newEls = newEls.map(el => {
      let newEl = { ...el };
      newEl.checked = id == el.id;
      return newEl;
    });

    this.setState({ els: newEls });
  }

  /**
   * Function to show or hide of th dashboard div
   *
   * @param {string} divId
   * @param {boolean} status
   * @memberof ViewMode
   */
  show(divId, status) {
    let div = document.getElementById(divId);
    div.setAttribute("style", status ? "" : "display: none;");
  }

  render() {

    const graphId = "dashboardGraphContainer";
    const streamId = "dashboardStackedGraphContainer";

    this.state.els.forEach(el => {
      if (el.checked) {
        this.show(graphId, el.showGraph);
        this.show(streamId, el.showStream);
      }
    });

    return (
      <div className="btn-group btn-group-toggle" data-toggle="buttons">
        {
          this.state.els.map((el, i) => (
            <label className={el.checked ? "btn btn-secondary active" : "btn btn-secondary"} key={i}>
              <input
                type="radio"
                name="options"
                autoComplete="off"
                checked={el.checked}
                onChange={() => this.handleChange(el.id)}
              /> {el.label}
            </label>
          ))
        }
      </div>
    );
  }
}
