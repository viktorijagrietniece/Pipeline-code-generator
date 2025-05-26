import express from 'express';
import { fetch } from 'undici';
import cors from 'cors';
const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

app.post('/export-gitlab', async (req, res) => {
  const { projectId, branch, token, fileContent } = req.body;

  const encodedPath = encodeURIComponent('.gitlab-ci.yml');
  const url = `https://gitlab.com/api/v4/projects/${projectId}/repository/files/${encodedPath}`;

  const payload = {
    branch: branch || 'main',
    content: fileContent,
    commit_message: 'Add or update .gitlab-ci.yml',
    encoding: 'text',
  };

  try {
    // Try to create file
    const createRes = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'PRIVATE-TOKEN': token,
      },
      body: JSON.stringify(payload),
    });

    if (createRes.ok) {
      return res.json({ status: 'created' });
    }

    const createErr = await createRes.json();
    if (createRes.status === 400 && createErr.message?.includes('already exists')) {
      // Try to update instead
      const updateRes = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'PRIVATE-TOKEN': token,
        },
        body: JSON.stringify(payload),
      });

      if (updateRes.ok) {
        return res.json({ status: 'updated' });
      }

      const updateErr = await updateRes.json();
      return res.status(updateRes.status).json({ error: updateErr });
    }

    return res.status(createRes.status).json({ error: createErr });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

app.post('/export-github', async (req, res) => {
  const { repo, branch, token, fileContent } = req.body;
  const filePath = 'Jenkinsfile'; // always Jenkinsfile
  const apiBase = `https://api.github.com/repos/${repo}/contents/${filePath}`;

  const headers = {
    'Authorization': `token ${token}`,
    'Accept': 'application/vnd.github+json',
    'Content-Type': 'application/json',
  };

  // First: check if file exists to decide between PUT (update) or POST (create)
  try {
    const checkRes = await fetch(`${apiBase}?ref=${branch}`, { headers });
    const fileExists = checkRes.status === 200;
    const sha = fileExists ? (await checkRes.json()).sha : undefined;

    const payload = {
      message: fileExists ? 'Update Jenkinsfile ' : 'Create Jenkinsfile',
      content: Buffer.from(fileContent).toString('base64'),
      branch,
      ...(sha && { sha })
    };

    const response = await fetch(apiBase, {
      method: 'PUT',
      headers,
      body: JSON.stringify(payload),
    });

    const result = await response.json();
    if (response.ok) {
      return res.json({ status: fileExists ? 'updated' : 'created' });
    }

    return res.status(response.status).json({ error: result });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});


app.listen(PORT, () => {
  console.log(`Proxy server running at http://localhost:${PORT}`);
});
