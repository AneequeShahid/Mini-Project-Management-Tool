import { GraphEdge } from "../models/graphEdge.js";

export const knowledgeGraphService = {
  async addEdge(from, to, relation, properties = {}) {
    return await GraphEdge.findOneAndUpdate(
      { from, to, relation },
      { $set: { properties } },
      { upsert: true, new: true }
    );
  },

  async removeEdge(from, to, relation) {
    return await GraphEdge.findOneAndDelete({ from, to, relation });
  },

  async getNeighbors(nodeId, relation = null, direction = "out") {
    const filter = {};
    if (direction === "out") {
      filter.from = nodeId;
    } else if (direction === "in") {
      filter.to = nodeId;
    } else {
      // Bi-directional
      filter.$or = [{ from: nodeId }, { to: nodeId }];
    }

    if (relation) filter.relation = relation;

    return await GraphEdge.find(filter);
  },

  async findPath(startNodeId, endNodeId, maxDepth = 3) {
    const visited = new Set();
    const queue = [[startNodeId, []]];

    while (queue.length > 0) {
      const [currentNode, path] = queue.shift();
      if (currentNode.toString() === endNodeId.toString()) return path;

      if (visited.has(currentNode.toString())) continue;
      visited.add(currentNode.toString());

      const edges = await this.getNeighbors(currentNode);
      for (const edge of edges) {
        const nextNode = edge.from.toString() === currentNode.toString() ? edge.to : edge.from;
        queue.push([nextNode, [...path, { relation: edge.relation, to: nextNode }]]);
      }
    }
    return null;
  },

  async getSubGraph(nodeId, depth = 2) {
    const nodes = new Set([nodeId.toString()]);
    const edges = [];
    let currentLevel = [nodeId];

    for (let i = 0; i < depth; i++) {
      const nextLevel = [];
      for (const node of currentLevel) {
        const neighbors = await this.getNeighbors(node);
        for (const edge of neighbors) {
          edges.push(edge);
          const neighborId = edge.from.toString() === node.toString() ? edge.to : edge.from;
          if (!nodes.has(neighborId.toString())) {
            nodes.add(neighborId.toString());
            nextLevel.push(neighborId);
          }
        }
      }
      currentLevel = nextLevel;
    }

    return { nodes: Array.from(nodes), edges };
  }
};
