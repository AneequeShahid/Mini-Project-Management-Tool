import { Project } from "../models/project.js";
import { Workspace } from "../models/workspace.js";

const ROLE_HIERARCHY = { Owner: 4, Admin: 3, Member: 2, Viewer: 1 };

function hasSufficientRole(userRole, minRole) {
  return (ROLE_HIERARCHY[userRole] || 0) >= (ROLE_HIERARCHY[minRole] || 0);
}

export function requireProjectAccess(minRole = "Viewer") {
  return async (req, res, next) => {
    try {
      const projectId = req.params.id || req.params.projectId || req.body?.project;
      if (!projectId) return res.status(400).json({ message: "Project ID required" });

      if (req.user?.role === "Admin") return next();

      const project = await Project.findById(projectId).populate("roles.user", "_id").lean();
      if (!project) return res.status(404).json({ message: "Project not found" });

      const roleEntry = project.roles?.find(
        (r) => r.user?._id?.toString() === req.user.id
      );

      if (roleEntry) {
        if (hasSufficientRole(roleEntry.role, minRole)) return next();
        return res.status(403).json({ message: "Insufficient project role" });
      }

      if (project.members?.some((m) => m?.toString() === req.user.id)) {
        return next();
      }

      if (project.owner?.toString() === req.user.id) return next();

      return res.status(403).json({ message: "Not a project member" });
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  };
}

export function requireWorkspaceAccess(minRole = "Viewer") {
  return async (req, res, next) => {
    try {
      const workspaceId = req.params.id || req.params.workspaceId || req.body?.workspace;
      if (!workspaceId) return res.status(400).json({ message: "Workspace ID required" });

      if (req.user?.role === "Admin") return next();

      const workspace = await Workspace.findById(workspaceId).lean();
      if (!workspace) return res.status(404).json({ message: "Workspace not found" });

      if (workspace.owner?.toString() === req.user.id) return next();

      const memberEntry = workspace.members?.find(
        (m) => m.user?.toString() === req.user.id
      );

      if (memberEntry) {
        const wsRoleHierarchy = {
          Owner: 5, Admin: 4, "Project Manager": 3, Developer: 2, Guest: 1,
        };
        const wsMinRoles = {
          Owner: "Owner", Admin: "Admin", "Project Manager": "Project Manager",
          Developer: "Developer", Guest: "Guest",
        };
        const wsMinRole = wsMinRoles[minRole] || "Developer";
        if ((wsRoleHierarchy[memberEntry.role] || 0) >= (wsRoleHierarchy[wsMinRole] || 0)) return next();
        return res.status(403).json({ message: "Insufficient workspace role" });
      }

      return res.status(403).json({ message: "Not a workspace member" });
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  };
}
