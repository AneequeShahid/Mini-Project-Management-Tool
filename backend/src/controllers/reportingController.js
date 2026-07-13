import { Report } from "../models/report.js";
import { requireFields } from "../utils/validators.js";

export async function listReports(req, res) {
  const filter = {};
  if (req.query.workspace) filter.workspace = req.query.workspace;
  if (req.query.project) filter.project = req.query.project;
  if (req.query.type) filter.type = req.query.type;
  const reports = await Report.find(filter).populate("generatedBy", "name email").sort({ createdAt: -1 });
  res.json(reports);
}

export async function getReport(req, res) {
  const report = await Report.findById(req.params.id).populate("generatedBy", "name email");
  if (!report) return res.status(404).json({ message: "Report not found" });
  res.json(report);
}

export async function createReport(req, res) {
  const { name, type, config, format, scheduled } = req.body || {};
  requireFields(req.body, "name", "type");
  const report = await Report.create({
    workspace: req.body.workspace || req.query.workspace,
    project: req.body.project, name, type,
    config, format: format || "csv",
    status: "generating",
    generatedBy: req.user.id,
    scheduled,
  });
  report.status = "ready";
  report.url = `/api/reports/${report._id}/download`;
  await report.save();
  res.status(201).json(report);
}

export async function deleteReport(req, res) {
  const report = await Report.findByIdAndDelete(req.params.id);
  if (!report) return res.status(404).json({ message: "Report not found" });
  res.json({ message: "Report deleted" });
}

export async function downloadReport(req, res) {
  const report = await Report.findById(req.params.id);
  if (!report) return res.status(404).json({ message: "Report not found" });
  res.json({ message: "Report download", reportId: report._id, format: report.format });
}
