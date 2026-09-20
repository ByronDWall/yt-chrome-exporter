const App = (() => {
  let currentView = 'upload';

  function init() {
    Upload.init({
      dropZone: document.getElementById('upload-zone'),
      fileInput: document.getElementById('file-input'),
      warning: document.getElementById('upload-warning'),
      onFileReady
    });

    Player.init({
      container: document.getElementById('player-container'),
      video: document.getElementById('video'),
      title: document.getElementById('video-title')
    });

    document.getElementById('btn-export').addEventListener('click', startExport);
    document.getElementById('btn-new-video').addEventListener('click', resetToUpload);
    document.getElementById('btn-cancel-export').addEventListener('click', cancelExport);

    const sidebarUpload = document.getElementById('sidebar-upload-card');
    if (sidebarUpload) {
      sidebarUpload.addEventListener('click', () => {
        document.getElementById('file-input').click();
      });
    }
  }

  function showView(name) {
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    const view = document.getElementById(`${name}-view`);
    if (view) view.classList.add('active');
    currentView = name;
  }

  function onFileReady(file, objectUrl) {
    const video = document.getElementById('video');
    video.src = objectUrl;

    const name = file.name.replace(/\.[^.]+$/, '');
    document.getElementById('video-title').textContent = name;
    document.getElementById('video-info-title').textContent = name;

    const now = new Date();
    const dateStr = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    document.getElementById('video-info-date').textContent = dateStr;

    const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
    document.getElementById('video-info-views').textContent = `${sizeMB} MB`;

    showView('player');
    Player.load();
  }

  function startExport() {
    const modal = document.getElementById('export-modal');
    modal.hidden = false;
    ExportPipeline.start({
      video: document.getElementById('video'),
      title: document.getElementById('video-title').textContent,
      onProgress: updateExportProgress,
      onComplete: handleExportComplete,
      onError: handleExportError
    });
  }

  function cancelExport() {
    ExportPipeline.cancel();
    document.getElementById('export-modal').hidden = true;
    resetExportModal();
  }

  function updateExportProgress(percent) {
    document.getElementById('export-progress-fill').style.width = `${percent}%`;
    document.getElementById('export-status').textContent = `Exporting... ${Math.round(percent)}%`;
  }

  function handleExportComplete(blob, filename) {
    const url = URL.createObjectURL(blob);
    const dl = document.getElementById('btn-download');
    dl.href = url;
    dl.download = filename;
    dl.hidden = false;
    document.getElementById('export-status').textContent = 'Export complete!';
    document.getElementById('btn-cancel-export').textContent = 'Close';
  }

  function handleExportError(error) {
    document.getElementById('export-status').textContent = `Error: ${error.message}`;
  }

  function resetExportModal() {
    document.getElementById('export-progress-fill').style.width = '0%';
    document.getElementById('export-status').textContent = 'Preparing...';
    document.getElementById('export-time').textContent = '';
    document.getElementById('btn-download').hidden = true;
    document.getElementById('btn-cancel-export').textContent = 'Cancel';
  }

  function resetToUpload() {
    Player.destroy();
    const video = document.getElementById('video');
    if (video.src) {
      URL.revokeObjectURL(video.src);
      video.removeAttribute('src');
      video.load();
    }
    showView('upload');
  }

  function getView() { return currentView; }

  return { init, showView, getView };
})();

document.addEventListener('DOMContentLoaded', () => App.init());
