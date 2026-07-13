import { GraphEdge } from "../models/graphEdge.js";

export async function visualizeGraph(req, res) {
  const { projectId } = req.params;
  
  // In a real system, we'd filter edges by project
  const edges = await GraphEdge.find({});
  
  const nodes = new Set();
  const links = [];

  edges.forEach(edge => {
    nodes.add(edge.from.toString());
    nodes.add(edge.to.toString());
    links.push({
      source: edge.from.toString(),
      target: edge.to.toString(),
      label: edge.relation,
      weight: edge.weight
    });
  });

  res.json({
    nodes: Array.from(nodes).map(id => ({ id })),
    links: links
  });
}
