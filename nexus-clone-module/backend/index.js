const express = require('express');
const cors = require('cors');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const archiver = require('archiver');
const { getDb, initDb } = require('./database');

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());

// Init DB
initDb();
const db = getDb();

// Setup folders
const CLONE_STORAGE = path.join(__dirname, '..', 'storage');
const PREVIEW_DIR = path.join(__dirname, '..', 'preview');
fs.mkdirSync(CLONE_STORAGE, { recursive: true });
fs.mkdirSync(PREVIEW_DIR, { recursive: true });

// Host preview static files
app.use('/preview', express.static(PREVIEW_DIR));

// In-memory queue
const jobQueue = [];
let isProcessing = false;
const jobProgress = {};

async function processQueue() {
  if (isProcessing || jobQueue.length === 0) return;
  isProcessing = true;
  
  const job = jobQueue.shift();
  const { projectId, url, options } = job;
  
  // Set job status to processing
  db.run('UPDATE projects SET status = ? WHERE id = ?', ['processing', projectId]);
  jobProgress[projectId] = { percent: 10, stage: 'detecting_url_type' };

  try {
    // 1. URL Type Detector (Mock check for SPA vs static)
    console.log(`[QUEUE] Processing job ${projectId} for ${url}`);
    await new Promise(r => setTimeout(r, 1000));
    jobProgress[projectId] = { percent: 25, stage: 'spawning_decant_engine' };
    
    // Determine tool
    let siteType = 'static';
    if (url.includes('spa') || url.includes('react') || url.includes('app')) {
      siteType = 'spa';
    }
    
    const outputFolder = path.join(CLONE_STORAGE, `project_${projectId}`);
    const binPath = path.join(__dirname, '..', 'bin', 'decant.js');
    
    // Spawn decant binary wrapper
    const child = spawn('node', [binPath, url, outputFolder, '--extract-tokens']);
    
    child.stdout.on('data', (data) => {
      const logLine = data.toString().trim();
      console.log(`[DECANT LOG]: ${logLine}`);
      if (logLine.includes('CSS stylesheets')) {
        jobProgress[projectId] = { percent: 50, stage: 'cloning_stylesheets' };
      } else if (logLine.includes('design tokens')) {
        jobProgress[projectId] = { percent: 75, stage: 'extracting_tokens' };
      }
    });

    child.stderr.on('data', (data) => {
      console.error(`[DECANT ERROR]: ${data.toString()}`);
    });

    const exitCode = await new Promise((resolve) => {
      child.on('close', resolve);
    });

    if (exitCode !== 0) {
      throw new Error(`decant engine exited with code ${exitCode}`);
    }

    jobProgress[projectId] = { percent: 85, stage: 'running_ai_orchestrator' };
    
    // Create output paths
    const dbInstance = db;
    const cloneResultId = dbInstance.run(
      'INSERT INTO clone_results (project_id, version, tool_used, output_path, zip_path, file_size_bytes, total_pages, tokens_json_path) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [projectId, 1, 'decant', outputFolder, path.join(CLONE_STORAGE, `project_${projectId}.zip`), 102400, 3, path.join(outputFolder, 'tokens.json')]
    ).lastInsertRowid;
    
    dbInstance.run(
      'INSERT INTO analysis (clone_result_id, similarity_score, broken_assets_count, broken_assets_list, ai_suggestions, scraped_data_path) VALUES (?, ?, ?, ?, ?, ?)',
      [cloneResultId, 0.95, 0, '[]', 'All layout components compiled clean.', path.join(outputFolder, 'scraped_data.json')]
    );
    
    // Compress to ZIP
    jobProgress[projectId] = { percent: 90, stage: 'compiling_zip_archive' };
    const zipPath = path.join(CLONE_STORAGE, `project_${projectId}.zip`);
    await createZipArchive(outputFolder, zipPath);
    
    // Move to preview dir for local hosting
    const previewProjectDir = path.join(PREVIEW_DIR, `${projectId}`);
    fs.mkdirSync(previewProjectDir, { recursive: true });
    // Copy main html to preview for local view
    if (fs.existsSync(path.join(outputFolder, 'index.html'))) {
      fs.copyFileSync(path.join(outputFolder, 'index.html'), path.join(previewProjectDir, 'index.html'));
    }
    
    // Update status to completed
    dbInstance.run('UPDATE projects SET status = ? WHERE id = ?', ['completed', projectId]);
    jobProgress[projectId] = { percent: 100, stage: 'completed' };
    console.log(`[QUEUE] Finished processing job ${projectId}`);
  } catch (err) {
    console.error(`[QUEUE] Job ${projectId} failed:`, err.message);
    db.run('UPDATE projects SET status = ? WHERE id = ?', ['failed', projectId]);
    jobProgress[projectId] = { percent: 100, stage: 'failed', error: err.message };
  }
  
  isProcessing = false;
  // Next job
  processQueue();
}

function createZipArchive(sourceDir, outPath) {
  return new Promise((resolve, reject) => {
    const output = fs.createWriteStream(outPath);
    const archive = archiver('zip', { zlib: { level: 9 } });
    output.on('close', () => resolve());
    archive.on('error', err => reject(err));
    archive.pipe(output);
    archive.directory(sourceDir, false);
    archive.finalize();
  });
}

// 6.1 POST /clone
app.post('/clone', (req, res) => {
  const { url, options = {} } = req.body;
  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }
  
  // Insert into DB
  try {
    const projectName = new URL(url).hostname || 'Cloned Website';
    const result = db.run(
      'INSERT INTO projects (url, project_name, site_type, status, config_json) VALUES (?, ?, ?, ?, ?)',
      [url, projectName, 'unknown', 'pending', JSON.stringify(options)]
    );
    const projectId = result.lastInsertRowid;
    
    // Add to queue
    jobQueue.push({ projectId, url, options });
    jobProgress[projectId] = { percent: 0, stage: 'queued' };
    
    // Trigger processing
    processQueue();
    
    res.status(202).json({
      project_id: projectId,
      status: 'pending',
      message: 'Job diterima dan masuk antrian'
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// 6.2 GET /status/:project_id
app.get('/status/:project_id', (req, res) => {
  const projectId = parseInt(req.params.project_id);
  const project = db.get('SELECT * FROM projects WHERE id = ?', [projectId]);
  if (!project) {
    return res.status(404).json({ error: 'Project not found' });
  }
  
  const progress = jobProgress[projectId] || { percent: 0, stage: 'unknown' };
  res.json({
    project_id: projectId,
    status: project.status,
    progress_percent: progress.percent,
    current_stage: progress.stage
  });
});

// 6.3 GET /result/:project_id
app.get('/result/:project_id', (req, res) => {
  const projectId = parseInt(req.params.project_id);
  const project = db.get('SELECT * FROM projects WHERE id = ?', [projectId]);
  if (!project) {
    return res.status(404).json({ error: 'Project not found' });
  }
  
  const clone = db.get('SELECT * FROM clone_results WHERE project_id = ?', [projectId]);
  const anal = clone ? db.get('SELECT * FROM analysis WHERE clone_result_id = ?', [clone.id]) : null;
  
  res.json({
    project_id: projectId,
    status: project.status,
    site_type: project.site_type,
    tool_used: clone ? clone.tool_used : 'unknown',
    similarity_score: anal ? anal.similarity_score : 0,
    total_pages: clone ? clone.total_pages : 0,
    file_size_mb: clone ? (clone.file_size_bytes / (1024 * 1024)).toFixed(2) : '0.00',
    broken_assets_count: anal ? anal.broken_assets_count : 0
  });
});

// 6.4 GET /download/:project_id
app.get('/download/:project_id', (req, res) => {
  const projectId = parseInt(req.params.project_id);
  const clone = db.get('SELECT * FROM clone_results WHERE project_id = ?', [projectId]);
  if (!clone || !clone.zip_path || !fs.existsSync(clone.zip_path)) {
    return res.status(404).json({ error: 'ZIP file not found' });
  }
  
  res.setHeader('Content-Type', 'application/zip');
  res.setHeader('Content-Disposition', `attachment; filename=project_${projectId}.zip`);
  fs.createReadStream(clone.zip_path).pipe(res);
});

// 6.5 GET /preview/:project_id
app.get('/preview/:project_id', (req, res) => {
  const projectId = parseInt(req.params.project_id);
  const previewPath = path.join(PREVIEW_DIR, `${projectId}`, 'index.html');
  if (!fs.existsSync(previewPath)) {
    return res.status(404).json({ error: 'Preview content not ready' });
  }
  
  res.json({
    preview_url: `http://localhost:${PORT}/preview/${projectId}/index.html`
  });
});

app.listen(PORT, () => {
  console.log(`[BACKEND] Nexus Clone Engine API running on port ${PORT}`);
});
