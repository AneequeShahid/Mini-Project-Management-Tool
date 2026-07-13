import { proposalService } from "../services/proposalService.js";

export async function listProposals(req, res) {
  const { projectId } = req.query;
  const proposals = await proposalService.getPendingProposals(req.user.id, projectId);
  res.json(proposals);
}

export async function approveProposal(req, res) {
  const { id } = req.params;
  try {
    const result = await proposalService.approveProposal(id, req.user.id);
    res.json({ message: "Proposal approved and executed", result });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}

export async function rejectProposal(req, res) {
  const { id } = req.params;
  try {
    const result = await proposalService.rejectProposal(id, req.user.id);
    res.json({ message: "Proposal rejected", result });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}
