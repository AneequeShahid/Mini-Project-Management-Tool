import { Proposal } from "../models/proposal.js";
import { toolRegistry } from "./toolRegistry.js";

export const proposalService = {
  async createProposal({ toolName, arguments: args, context }) {
    return await Proposal.create({
      toolName,
      arguments: args,
      context,
      createdBy: context.userId,
    });
  },

  async getPendingProposals(userId, projectId = null) {
    const filter = { status: "pending", createdBy: userId };
    if (projectId) filter.projectId = projectId;
    return await Proposal.find(filter).sort({ createdAt: -1 });
  },

  async approveProposal(proposalId, approverId) {
    const proposal = await Proposal.findById(proposalId);
    if (!proposal) throw new Error("Proposal not found");
    if (proposal.status !== "pending") throw new Error("Proposal is already processed");

    try {
      // Execute the actual tool
      const result = await toolRegistry.executeTool(
        proposal.toolName, 
        proposal.arguments, 
        proposal.context
      );

      return await Proposal.findByIdAndUpdate(proposalId, {
        status: "approved",
        approvedBy: approverId,
        executedAt: new Date(),
        result: result
      }, { new: true });
    } catch (err) {
      throw new Error(`Execution failed: ${err.message}`);
    }
  },

  async rejectProposal(proposalId, rejectorId) {
    return await Proposal.findByIdAndUpdate(proposalId, {
      status: "rejected",
      approvedBy: rejectorId,
    }, { new: true });
  }
};
