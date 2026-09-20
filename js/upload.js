const Upload = (() => {
  const MAX_SIZE = 2 * 1024 * 1024 * 1024;
  let state = null;

  function validateFileType(file) {
    return !!file.type && file.type.startsWith('video/');
  }

  function checkFileSize(file) {
    if (file.size >= MAX_SIZE) {
      return 'This file is larger than 2 GB and may be slow to process.';
    }
    return null;
  }

  function createObjectUrl(file) {
    return URL.createObjectURL(file);
  }

  function handleFile(file) {
    const { warning, onFileReady } = state;
    warning.textContent = '';

    if (!validateFileType(file)) {
      warning.textContent = 'Please select a video file.';
      return;
    }

    const sizeWarning = checkFileSize(file);
    if (sizeWarning) {
      warning.textContent = sizeWarning;
    }

    const objectUrl = createObjectUrl(file);
    onFileReady(file, objectUrl);
  }

  function onDropZoneClick() {
    state.fileInput.click();
  }

  function onDragEnter(e) {
    e.preventDefault();
    state.dropZone.classList.add('dragover');
  }

  function onDragOver(e) {
    e.preventDefault();
    state.dropZone.classList.add('dragover');
  }

  function onDragLeave() {
    state.dropZone.classList.remove('dragover');
  }

  function onDrop(e) {
    e.preventDefault();
    state.dropZone.classList.remove('dragover');
    const file = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  function onFileInputChange(e) {
    const file = e.target.files && e.target.files[0];
    if (file) handleFile(file);
  }

  function init(options) {
    state = options;
    state.dropZone.addEventListener('click', onDropZoneClick);
    state.dropZone.addEventListener('dragenter', onDragEnter);
    state.dropZone.addEventListener('dragover', onDragOver);
    state.dropZone.addEventListener('dragleave', onDragLeave);
    state.dropZone.addEventListener('drop', onDrop);
    state.fileInput.addEventListener('change', onFileInputChange);
  }

  function destroy() {
    if (!state) return;
    state.dropZone.removeEventListener('click', onDropZoneClick);
    state.dropZone.removeEventListener('dragenter', onDragEnter);
    state.dropZone.removeEventListener('dragover', onDragOver);
    state.dropZone.removeEventListener('dragleave', onDragLeave);
    state.dropZone.removeEventListener('drop', onDrop);
    state.fileInput.removeEventListener('change', onFileInputChange);
    state = null;
  }

  return { init, validateFileType, checkFileSize, createObjectUrl, destroy };
})();
