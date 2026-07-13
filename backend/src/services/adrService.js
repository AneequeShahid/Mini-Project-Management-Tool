import fs from "fs";
import path from "path";

const ADR_DIR = path.join(process.cwd(), "docs/adr");

export const adrService = {
  async writeADR(id, title, status, context, decision, consequences) {
    if (!fs.existsSync(ADR_DIR)) {
      fs.mkdirSync(ADR_DIR, { recursive: true });
    }

    const content = ` # ADR-${id}: ${title}
Status: ${status}
Date: ${new Date().toISOString().split('T')[0]}

## Context
${context}

## Decision
${decision}

## Consequences
${consequences}
`;
    const fileName = `ADR-${id}.md`;
    fs.writeFileSync(path.join(ADR_DIR, fileName), content);
    return { success: true, path: path.join(ADR_DIR, fileName) };
  }
};
