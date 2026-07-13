import fetch from "node-fetch";

const PROVIDERS = {
  github: {
    commits: async (repo, token) => {
      const res = await fetch(`https://api.github.com/repos/${repo.externalId}/commits`, {
        headers: { Authorization: `Bearer ${token}`, Accept: "application/vnd.github.v3+json" },
      });
      if (!res.ok) throw new Error(`GitHub Error: ${res.statusText}`);
      const data = await res.json();
      return data.map(c => ({
        sha: c.sha,
        message: c.commit.message,
        author: { name: c.commit.author?.name || c.commit.committer?.name, email: c.commit.author?.email || c.commit.committer?.email, date: c.commit.author?.date || c.commit.committer?.date },
        url: c.html_url,
      }));
    },
    prs: async (repo, token) => {
      const res = await fetch(`https://api.github.com/repos/${repo.externalId}/pulls?state=all`, {
        headers: { Authorization: `Bearer ${token}`, Accept: "application/vnd.github.v3+json" },
      });
      if (!res.ok) throw new Error(`GitHub Error: ${res.statusText}`);
      const data = await res.json();
      return data.map(p => ({
        externalId: p.number,
        title: p.title,
        state: p.state,
        author: p.user?.login,
        url: p.html_url,
        mergedAt: p.merged_at,
      }));
    },
  },
  gitlab: {
    commits: async (repo, token) => {
      const res = await fetch(`https://gitlab.com/api/v4/projects/${repo.externalId}/repository/commits`, {
        headers: { "PRIVATE-TOKEN": token },
      });
      if (!res.ok) throw new Error(`GitLab Error: ${res.statusText}`);
      const data = await res.json();
      return data.map(c => ({
        sha: c.id,
        message: c.title,
        author: { name: c.author_name, email: c.author_email, date: c.created_at },
        url: c.web_url,
      }));
    },
    prs: async (repo, token) => {
      const res = await fetch(`https://gitlab.com/api/v4/projects/${repo.externalId}/merge_requests?state=all`, {
        headers: { "PRIVATE-TOKEN": token },
      });
      if (!res.ok) throw new Error(`GitLab Error: ${res.statusText}`);
      const data = await res.json();
      return data.map(p => ({
        externalId: p.iid,
        title: p.title,
        state: p.state,
        author: p.author?.name,
        url: p.web_url,
        mergedAt: p.merged_at,
      }));
    },
  },
  gitea: {
    commits: async (repo, token) => {
      const res = await fetch(`https://gitea.com/api/v1/repos/${repo.externalId}/commits`, {
        headers: { Authorization: `token ${token}` },
      });
      if (!res.ok) throw new Error(`Gitea Error: ${res.statusText}`);
      const data = await res.json();
      return data.map(c => ({
        sha: c.sha,
        message: c.commit.message,
        author: { name: c.commit.author?.name, email: c.commit.author?.email, date: c.commit.author?.date },
        url: c.html_url,
      }));
    },
    prs: async (repo, token) => {
      const res = await fetch(`https://gitea.com/api/v1/repos/${repo.externalId}/pulls`, {
        headers: { Authorization: `token ${token}` },
      });
      if (!res.ok) throw new Error(`Gitea Error: ${res.statusText}`);
      const data = await res.json();
      return data.map(p => ({
        externalId: p.number,
        title: p.title,
        state: p.state,
        author: p.user?.login,
        url: p.html_url,
        mergedAt: p.merged_at,
      }));
    },
  },
  forgejo: {
    // Forgejo is a fork of Gitea, so it uses the same API
    get commits() { return PROVIDERS.gitea.commits; },
    get prs() { return PROVIDERS.gitea.prs; },
  }
};

export const gitService = {
  async getCommits(repo, accessToken) {
    const provider = PROVIDERS[repo.provider] || PROVIDERS.github;
    return provider.commits(repo, accessToken);
  },

  async getPRs(repo, accessToken) {
    const provider = PROVIDERS[repo.provider] || PROVIDERS.github;
    return provider.prs(repo, accessToken);
  },

  async syncRepo(repo, accessToken) {
    const [commits, prs] = await Promise.all([
      this.getCommits(repo, accessToken),
      this.getPRs(repo, accessToken),
    ]);
    return { commits, prs };
  }
};
