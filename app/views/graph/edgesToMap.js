
/**
 * Function that generates a map, where for each node you have a list of
 * [nodeConnected, {meanToneDist, eventsSharedCount}]
 *
 * @param {Array[string]} nodes
 * @param {Object} edgesInfo
 * @returns {Map}
 */
export function edgesToMap(nodes, edgesInfo) {
  // Convert nodes to map for better performances
  let nodesMap = new Map();
  nodes.forEach(name => {
    nodesMap.set(name, true);
  });

  // Create the edgesMap and initialize it
  let edgesMap = new Map();
  nodes.forEach(name => {
    edgesMap.set(name, Array());
  });

  // Function to add 2 possible edges to edgesMap
  function addEdges(node1, node2, meanToneDist, eventsSharedCount) {
    // we do it for both nodes
    let cur1 = edgesMap.get(node1);
    cur1.push([node2, { meanToneDist, eventsSharedCount }]);
    edgesMap.set(node1, cur1);

    let cur2 = edgesMap.get(node2);
    cur2.push([node1, { meanToneDist, eventsSharedCount }]);
    edgesMap.set(node2, cur2);
  }

  // Iterate through the data to build the info we need
  for (const source1 in edgesInfo) {
    if (nodesMap.has(source1)) {
      for (const source2 in edgesInfo[source1]) {
        if (nodesMap.has(source2)) {
          // here we can work
          const { meanToneDist, eventsSharedCount } = edgesInfo[source1][source2];
          addEdges(source1, source2, meanToneDist, eventsSharedCount);
        }
      }
    }
  }

  // finally we sort all possible edges for each nodes
  nodes.forEach(source => {
    let cur = edgesMap.get(source);
    edgesMap.set(source, Array.sort(
      cur,
      (a, b) => b[1].eventsSharedCount - a[1].eventsSharedCount
    ));
  });

  return edgesMap;
}

