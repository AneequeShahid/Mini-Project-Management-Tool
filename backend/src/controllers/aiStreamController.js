export async function aiChatStream(req, res) {
  const { messages, projectId, persona } = req.body || {};
  if (!messages?.length) return res.status(400).json({ message: "Messages required" });

  // Set SSE Headers
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  let context = { 
    userId: req.user.id, 
    userName: req.user.name, 
    persona: persona || "general" 
  };
  
  if (projectId) {
    const project = await Project.findById(projectId).populate("members", "name");
    const sprints = await Sprint.find({ project: projectId });
    const tasks = await Task.find({ project: projectId }).limit(20);
    context.project = project;
    context.sprints = sprints;
    context.tasks = tasks;
  }

  try {
    const stream = ai.chatStream(messages, context);
    for await (const chunk of stream) {
      res.write(`data: ${JSON.stringify({ content: chunk })}\n\n`);
    }
    res.write("data: [DONE]\n\n");
    res.end();
  } catch (err) {
    console.error("Streaming error:", err);
    res.write(`data: ${JSON.stringify({ error: "An error occurred during streaming" })}\n\n`);
    res.end();
  }
}
