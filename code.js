"use strict";
(() => {
  // src/code.ts
  figma.showUI(`<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    font-family: Inter, -apple-system, sans-serif;
    font-size: 12px;
    background: var(--figma-color-bg, #ffffff);
    color: var(--figma-color-text, #1e1e1e);
    overflow: hidden;
  }

  /* \u2500\u2500 Layout \u2500\u2500 */
  .view { display: none; flex-direction: column; height: 100vh; }
  .view.active { display: flex; }

  .header {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 16px;
    border-bottom: 1px solid var(--figma-color-border, #e6e6e6);
    font-weight: 600;
    font-size: 13px;
    flex-shrink: 0;
  }

  .header button.back {
    background: none;
    border: none;
    cursor: pointer;
    color: var(--figma-color-text-secondary, #666);
    padding: 2px 4px;
    border-radius: 4px;
    font-size: 16px;
    line-height: 1;
  }
  .header button.back:hover { background: var(--figma-color-bg-hover, #f0f0f0); }

  .scroll { flex: 1; overflow-y: auto; padding: 12px 16px; }

  /* \u2500\u2500 Section \u2500\u2500 */
  .section-label {
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--figma-color-text-secondary, #888);
    margin-bottom: 6px;
    margin-top: 16px;
  }
  .section-label:first-child { margin-top: 0; }

  /* \u2500\u2500 Collection list \u2500\u2500 */
  .collection-list { display: flex; flex-direction: column; gap: 4px; }

  .collection-item {
    display: flex;
    align-items: center;
    padding: 8px 10px;
    border-radius: 6px;
    border: 1px solid var(--figma-color-border, #e6e6e6);
    cursor: pointer;
    gap: 8px;
    background: var(--figma-color-bg, #fff);
    transition: background 0.1s;
  }
  .collection-item:hover { background: var(--figma-color-bg-hover, #f5f5f5); }

  .collection-item .icon { font-size: 14px; flex-shrink: 0; }
  .collection-item .name { flex: 1; font-weight: 500; }
  .collection-item .arrow { color: var(--figma-color-text-secondary, #aaa); }

  .empty-state {
    color: var(--figma-color-text-secondary, #888);
    font-style: italic;
    padding: 8px 0;
  }

  /* \u2500\u2500 Form \u2500\u2500 */
  .form-group { display: flex; flex-direction: column; gap: 5px; margin-bottom: 10px; }
  .form-group label { font-size: 11px; color: var(--figma-color-text-secondary, #666); font-weight: 500; }

  select, input[type="text"] {
    width: 100%;
    padding: 6px 8px;
    border: 1px solid var(--figma-color-border, #e0e0e0);
    border-radius: 5px;
    background: var(--figma-color-bg, #fff);
    color: var(--figma-color-text, #1e1e1e);
    font-size: 12px;
    font-family: inherit;
    outline: none;
  }
  select:focus, input:focus { border-color: var(--figma-color-border-selected, #0d99ff); }

  .btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 7px 14px;
    border-radius: 6px;
    font-size: 12px;
    font-family: inherit;
    font-weight: 500;
    border: none;
    cursor: pointer;
    transition: opacity 0.1s;
  }
  .btn:disabled { opacity: 0.4; cursor: default; }
  .btn-primary { background: var(--figma-color-bg-brand, #0d99ff); color: #fff; }
  .btn-primary:hover:not(:disabled) { opacity: 0.88; }
  .btn-secondary {
    background: var(--figma-color-bg-secondary, #f0f0f0);
    color: var(--figma-color-text, #1e1e1e);
  }
  .btn-secondary:hover:not(:disabled) { background: var(--figma-color-bg-hover, #e4e4e4); }
  .btn-danger { background: #e53935; color: #fff; }
  .btn-full { width: 100%; }

  /* \u2500\u2500 Mode tabs \u2500\u2500 */
  .mode-tabs {
    display: flex;
    gap: 2px;
    padding: 8px 16px 0;
    border-bottom: 1px solid var(--figma-color-border, #e6e6e6);
    flex-shrink: 0;
    overflow-x: auto;
  }
  .mode-tab {
    padding: 6px 12px;
    border-radius: 6px 6px 0 0;
    cursor: pointer;
    border: 1px solid transparent;
    border-bottom: none;
    font-size: 12px;
    font-family: inherit;
    background: none;
    color: var(--figma-color-text-secondary, #888);
    white-space: nowrap;
  }
  .mode-tab.active {
    background: var(--figma-color-bg, #fff);
    border-color: var(--figma-color-border, #e6e6e6);
    color: var(--figma-color-text, #1e1e1e);
    font-weight: 600;
    margin-bottom: -1px;
  }

  /* \u2500\u2500 Variable table \u2500\u2500 */
  .var-table { display: flex; flex-direction: column; gap: 2px; }

  .var-row {
    display: grid;
    grid-template-columns: 1fr auto auto;
    align-items: center;
    gap: 8px;
    padding: 6px 0;
    border-bottom: 1px solid var(--figma-color-border, #f0f0f0);
  }
  .var-row:last-child { border-bottom: none; }

  .var-name {
    font-size: 11px;
    color: var(--figma-color-text-secondary, #666);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .var-name strong {
    display: block;
    font-size: 12px;
    color: var(--figma-color-text, #1e1e1e);
    font-weight: 500;
  }
  .var-name.overridden strong { color: var(--figma-color-text-component, #0d99ff); }

  .var-input-wrap { display: flex; align-items: center; gap: 6px; }

  /* Color input */
  .color-wrap {
    display: flex;
    align-items: center;
    gap: 6px;
    border: 1px solid var(--figma-color-border, #e0e0e0);
    border-radius: 5px;
    padding: 3px 6px;
    background: var(--figma-color-bg, #fff);
  }
  .color-wrap input[type="color"] {
    width: 20px;
    height: 20px;
    border: none;
    padding: 0;
    cursor: pointer;
    border-radius: 3px;
    background: none;
  }
  .color-hex {
    width: 68px;
    border: none;
    padding: 0;
    font-size: 11px;
    font-family: monospace;
    background: transparent;
    color: var(--figma-color-text, #1e1e1e);
  }
  .color-hex:focus { outline: none; }
  .alpha-slider { width: 50px; }

  /* Number / string inputs inside table */
  .var-row input[type="number"],
  .var-row input[type="text"] {
    width: 100px;
  }

  .alias-badge {
    font-size: 11px;
    color: var(--figma-color-text-secondary, #888);
    font-style: italic;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 140px;
  }

  .btn-reset {
    background: none;
    border: none;
    cursor: pointer;
    font-size: 14px;
    color: var(--figma-color-text-secondary, #bbb);
    padding: 2px 4px;
    border-radius: 4px;
    line-height: 1;
  }
  .btn-reset:hover { background: var(--figma-color-bg-hover, #f0f0f0); color: var(--figma-color-text, #666); }
  .btn-reset.hidden { visibility: hidden; pointer-events: none; }

  /* \u2500\u2500 Copy overrides footer \u2500\u2500 */
  .editor-footer {
    flex-shrink: 0;
    padding: 10px 16px;
    border-top: 1px solid var(--figma-color-border, #e6e6e6);
    display: flex;
    gap: 8px;
    align-items: center;
  }
  .editor-footer select { flex: 1; }
  .delete-note {
    padding: 8px 16px;
    font-size: 11px;
    color: var(--figma-color-text-secondary, #888);
    border-top: 1px solid var(--figma-color-border, #e6e6e6);
    flex-shrink: 0;
  }

  /* \u2500\u2500 Toast \u2500\u2500 */
  .toast {
    position: fixed;
    bottom: 12px;
    left: 50%;
    transform: translateX(-50%);
    background: #323232;
    color: #fff;
    padding: 8px 14px;
    border-radius: 6px;
    font-size: 12px;
    max-width: 90%;
    text-align: center;
    pointer-events: none;
    opacity: 0;
    transition: opacity 0.2s;
    z-index: 100;
  }
  .toast.visible { opacity: 1; }
  .toast.error { background: #c62828; }

  .spinner { display: inline-block; opacity: 0.5; }
</style>
</head>
<body>

<!-- \u2550\u2550 View: Home \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550 -->
<div id="view-home" class="view active">
  <div class="header">Extended Collections</div>
  <div class="scroll">
    <div class="section-label">Existing in this file</div>
    <div id="existing-list" class="collection-list">
      <span class="spinner">Loading\u2026</span>
    </div>

    <div class="section-label">Create new</div>
    <div class="form-group">
      <label>Library collection to extend</label>
      <select id="lib-select"><option value="">Loading\u2026</option></select>
    </div>
    <div class="form-group">
      <label>Name for the new extended collection</label>
      <input type="text" id="new-name" placeholder="e.g. Brand A Theme">
    </div>
    <button class="btn btn-primary btn-full" id="btn-create">Create Extended Collection</button>
  </div>
</div>

<!-- \u2550\u2550 View: Editor \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550 -->
<div id="view-editor" class="view">
  <div class="header">
    <button class="back" id="btn-back">\u2190</button>
    <span id="editor-title">Collection</span>
  </div>
  <div id="mode-tabs" class="mode-tabs"></div>
  <div class="scroll" id="var-scroll">
    <div id="var-table" class="var-table"></div>
  </div>
  <div class="editor-footer">
    <select id="copy-src-select"><option value="">Copy overrides from\u2026</option></select>
    <button class="btn btn-secondary" id="btn-copy">Copy</button>
  </div>
  <div class="delete-note">To delete this collection, right-click it in the Variables panel \u2192 Delete.</div>
</div>

<div id="toast" class="toast"></div>

<script>
// \u2500\u2500 State \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500

const state = {
  extendedCollections: [],  // [{ id, name, parentVariableCollectionId }]
  libraryCollections: [],   // [{ key, name, libraryName }]
  collection: null,         // { id, name }
  modes: [],                // [{ modeId, name, parentModeId? }]
  vars: [],                 // [{ id, name, key, resolvedType, valuesByMode, overriddenModes }]
  activeModeId: null,
};

// \u2500\u2500 View switching \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500

function showView(name) {
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.getElementById('view-' + name).classList.add('active');
}

// \u2500\u2500 Figma messaging \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500

function send(msg) {
  parent.postMessage({ pluginMessage: msg }, '*');
}

function commitOverride(variableId, modeId, value) {
  send({ type: 'SET_OVERRIDE', variableId, modeId, value });
  const entry = state.vars.find(v => v.id === variableId);
  if (entry) {
    entry.valuesByMode[modeId] = value;
    if (!entry.overriddenModes.includes(modeId)) entry.overriddenModes.push(modeId);
  }
}

window.onmessage = (event) => {
  const msg = event.data.pluginMessage;
  if (!msg) return;

  switch (msg.type) {
    case 'INIT':             handleInit(msg);            break;
    case 'COLLECTION_READY': handleCollectionReady(msg); break;
    case 'ERROR':            showToast(msg.message, true); break;
  }
};

// \u2500\u2500 Init \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500

function handleInit(msg) {
  state.extendedCollections = msg.extendedCollections;
  state.libraryCollections  = msg.libraryCollections;
  renderHome();
}

function renderHome() {
  // Existing list
  const list = document.getElementById('existing-list');
  if (state.extendedCollections.length === 0) {
    list.innerHTML = '<span class="empty-state">None yet \u2014 create one below.</span>';
  } else {
    list.innerHTML = state.extendedCollections.map(c => \`
      <button class="collection-item" data-id="\${c.id}">
        <span class="icon">\u{1F4E6}</span>
        <span class="name">\${esc(c.name)}</span>
        <span class="arrow">\u203A</span>
      </button>
    \`).join('');
    list.querySelectorAll('.collection-item').forEach(btn => {
      btn.addEventListener('click', () => send({ type: 'SELECT', collectionId: btn.dataset.id }));
    });
  }

  // Library dropdown
  const sel = document.getElementById('lib-select');
  if (state.libraryCollections.length === 0) {
    sel.innerHTML = '<option value="">No published libraries found</option>';
  } else {
    sel.innerHTML = state.libraryCollections.map(lc =>
      \`<option value="\${esc(lc.key)}">\${esc(lc.libraryName)} / \${esc(lc.name)}</option>\`
    ).join('');
  }
}

// \u2500\u2500 Create \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500

document.getElementById('btn-create').addEventListener('click', () => {
  const key  = document.getElementById('lib-select').value;
  const name = document.getElementById('new-name').value.trim();
  if (!key)  { showToast('Select a library collection.'); return; }
  if (!name) { showToast('Enter a name for the collection.'); return; }
  send({ type: 'CREATE', collectionKey: key, name });
});

// \u2500\u2500 Collection ready (create or select) \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500

function handleCollectionReady(msg) {
  state.collection = msg.collection;
  state.modes      = msg.modes;
  state.vars       = msg.vars;
  state.activeModeId = msg.modes[0]?.modeId ?? null;

  document.getElementById('editor-title').textContent = msg.collection.name;
  renderModeTabs();
  renderVarTable();
  populateCopySources();
  showView('editor');
}

// \u2500\u2500 Mode tabs \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500

function renderModeTabs() {
  const container = document.getElementById('mode-tabs');
  container.innerHTML = state.modes.map(m => \`
    <button class="mode-tab\${m.modeId === state.activeModeId ? ' active' : ''}"
            data-mode="\${m.modeId}">\${esc(m.name)}</button>
  \`).join('');
  container.querySelectorAll('.mode-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      state.activeModeId = tab.dataset.mode;
      container.querySelectorAll('.mode-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      renderVarTable();
    });
  });
}

// \u2500\u2500 Variable table \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500

function renderVarTable() {
  const modeId = state.activeModeId;
  const table  = document.getElementById('var-table');
  table.innerHTML = '';

  if (!modeId) {
    table.innerHTML = '<span class="empty-state">No modes found.</span>';
    return;
  }

  state.vars.forEach(v => {
    const overridden = v.overriddenModes.includes(modeId);
    const rawValue   = v.valuesByMode[modeId];
    const row = document.createElement('div');
    row.className = 'var-row';

    const parts  = v.name.split('/');
    const label  = parts.pop();
    const group  = parts.join('/');

    row.innerHTML = \`
      <div class="var-name\${overridden ? ' overridden' : ''}">
        <strong>\${esc(label)}</strong>
        \${group ? \`<span>\${esc(group)}</span>\` : ''}
      </div>
      <div class="var-input-wrap"></div>
      <button class="btn-reset\${overridden ? '' : ' hidden'}"
              data-var="\${v.id}"
              title="Reset to inherited value">\u21A9</button>
    \`;

    const wrap = row.querySelector('.var-input-wrap');
    renderValueInput(wrap, v, modeId, rawValue, overridden);

    row.querySelector('.btn-reset').addEventListener('click', () => {
      send({ type: 'REMOVE_OVERRIDE', collectionId: state.collection.id, variableId: v.id, modeId });
    });

    table.appendChild(row);
  });
}

function renderValueInput(wrap, variable, modeId, value, overridden) {
  if (isAlias(value)) {
    const span = document.createElement('span');
    span.className = 'alias-badge';
    span.title = value.id;
    span.textContent = '\u2197 alias';
    wrap.appendChild(span);
    return;
  }

  switch (variable.resolvedType) {
    case 'COLOR':   renderColorInput(wrap, variable, modeId, value); break;
    case 'FLOAT':   renderFloatInput(wrap, variable, modeId, value); break;
    case 'STRING':  renderStringInput(wrap, variable, modeId, value); break;
    case 'BOOLEAN': renderBoolInput(wrap, variable, modeId, value);   break;
  }
}

// COLOR \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500

function renderColorInput(wrap, variable, modeId, value) {
  const rgba = value && typeof value === 'object' && 'r' in value ? value : { r:0, g:0, b:0, a:1 };
  const hex  = rgbToHex(rgba);
  const alphaPercent = Math.round((rgba.a ?? 1) * 100);

  const colorWrap = document.createElement('div');
  colorWrap.className = 'color-wrap';
  colorWrap.innerHTML = \`
    <input type="color" value="\${hex}" title="Pick color">
    <input type="text" class="color-hex" value="\${hex.slice(1)}" maxlength="6">
    <input type="range" class="alpha-slider" min="0" max="100" value="\${alphaPercent}" title="Alpha \${alphaPercent}%">
  \`;

  const colorPicker = colorWrap.querySelector('input[type="color"]');
  const hexInput    = colorWrap.querySelector('.color-hex');
  const alphaSlider = colorWrap.querySelector('.alpha-slider');

  function commit() {
    const rgb  = hexToRgb(colorPicker.value);
    const alpha = parseInt(alphaSlider.value, 10) / 100;
    commitOverride(variable.id, modeId, { ...rgb, a: alpha });
  }

  colorPicker.addEventListener('input', () => {
    hexInput.value = colorPicker.value.slice(1).toUpperCase();
    commit();
  });
  hexInput.addEventListener('change', () => {
    const cleaned = hexInput.value.replace(/[^0-9a-fA-F]/g, '').slice(0, 6);
    if (cleaned.length === 6) {
      colorPicker.value = '#' + cleaned;
      hexInput.value = cleaned.toUpperCase();
      commit();
    }
  });
  alphaSlider.addEventListener('input', () => commit());

  wrap.appendChild(colorWrap);
}

// FLOAT \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500

function renderFloatInput(wrap, variable, modeId, value) {
  const input = document.createElement('input');
  input.type  = 'number';
  input.value = typeof value === 'number' ? value : 0;
  input.step  = 'any';
  input.addEventListener('change', () => {
    commitOverride(variable.id, modeId, parseFloat(input.value));
  });
  wrap.appendChild(input);
}

// STRING \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500

function renderStringInput(wrap, variable, modeId, value) {
  const input = document.createElement('input');
  input.type  = 'text';
  input.value = typeof value === 'string' ? value : '';
  input.addEventListener('change', () => {
    commitOverride(variable.id, modeId, input.value);
  });
  wrap.appendChild(input);
}

// BOOLEAN \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500

function renderBoolInput(wrap, variable, modeId, value) {
  const input = document.createElement('input');
  input.type    = 'checkbox';
  input.checked = Boolean(value);
  input.addEventListener('change', () => {
    commitOverride(variable.id, modeId, input.checked);
  });
  wrap.appendChild(input);
}

// \u2500\u2500 Copy overrides \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500

function populateCopySources() {
  const sel = document.getElementById('copy-src-select');
  const others = state.extendedCollections.filter(c => c.id !== state.collection.id);
  if (others.length === 0) {
    sel.innerHTML = '<option value="">No other extended collections</option>';
    document.getElementById('btn-copy').disabled = true;
  } else {
    sel.innerHTML = '<option value="">Copy overrides from\u2026</option>' +
      others.map(c => \`<option value="\${c.id}">\${esc(c.name)}</option>\`).join('');
    document.getElementById('btn-copy').disabled = false;
  }
}

document.getElementById('btn-copy').addEventListener('click', () => {
  const srcId = document.getElementById('copy-src-select').value;
  if (!srcId) { showToast('Select a source collection.'); return; }
  send({ type: 'COPY_OVERRIDES', srcId, dstId: state.collection.id });
});

// \u2500\u2500 Back \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500

document.getElementById('btn-back').addEventListener('click', () => {
  showView('home');
  // Re-fetch to pick up newly created collection in the list
  send({ type: 'INIT' });
});

// \u2500\u2500 Toast \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500

let toastTimer = null;
function showToast(msg, isError = false) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.className = 'toast visible' + (isError ? ' error' : '');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { el.className = 'toast'; }, 3000);
}

// \u2500\u2500 Utilities \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500

function isAlias(value) {
  return value && typeof value === 'object' && value.type === 'VARIABLE_ALIAS';
}

function esc(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function rgbToHex({ r, g, b }) {
  const toHex = n => Math.round(n * 255).toString(16).padStart(2, '0');
  return '#' + toHex(r) + toHex(g) + toHex(b);
}

function hexToRgb(hex) {
  const n = parseInt(hex.slice(1), 16);
  return { r: ((n >> 16) & 255) / 255, g: ((n >> 8) & 255) / 255, b: (n & 255) / 255 };
}

// \u2500\u2500 Boot \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500

send({ type: 'INIT' });
<\/script>
</body>
</html>
`, { width: 440, height: 580, themeColors: true });
  figma.ui.onmessage = async (msg) => {
    try {
      switch (msg.type) {
        case "INIT":
          await handleInit();
          break;
        case "CREATE":
          await handleCreate(msg);
          break;
        case "SELECT":
          await handleSelect(msg);
          break;
        case "SET_OVERRIDE":
          await handleSetOverride(msg);
          break;
        case "REMOVE_OVERRIDE":
          await handleRemoveOverride(msg);
          break;
        case "COPY_OVERRIDES":
          await handleCopyOverrides(msg);
          break;
        case "CLOSE":
          figma.closePlugin();
          break;
      }
    } catch (err) {
      figma.ui.postMessage({
        type: "ERROR",
        message: err instanceof Error ? err.message : String(err)
      });
    }
  };
  async function handleInit() {
    const [allCollections, libraryCollections] = await Promise.all([
      figma.variables.getLocalVariableCollectionsAsync(),
      figma.teamLibrary.getAvailableLibraryVariableCollectionsAsync()
    ]);
    const extendedCollections = allCollections.filter((c) => c.isExtension).map((c) => ({
      id: c.id,
      name: c.name,
      parentVariableCollectionId: c.parentVariableCollectionId
    }));
    figma.ui.postMessage({
      type: "INIT",
      extendedCollections,
      libraryCollections: libraryCollections.map((lc) => ({
        key: lc.key,
        name: lc.name,
        libraryName: lc.libraryName
      }))
    });
  }
  async function handleCreate(msg) {
    const extended = await figma.variables.extendLibraryCollectionByKeyAsync(
      msg.collectionKey,
      msg.name
    );
    await sendCollectionReady(extended);
  }
  async function handleSelect(msg) {
    const col = await figma.variables.getVariableCollectionByIdAsync(msg.collectionId);
    if (!col) throw new Error("Collection not found.");
    await sendCollectionReady(col);
  }
  async function handleSetOverride(msg) {
    const variable = await figma.variables.getVariableByIdAsync(msg.variableId);
    if (!variable) throw new Error("Variable not found.");
    variable.setValueForMode(msg.modeId, msg.value);
  }
  async function handleRemoveOverride(msg) {
    var _a, _b;
    const [col, variable] = await Promise.all([
      figma.variables.getVariableCollectionByIdAsync(msg.collectionId),
      figma.variables.getVariableByIdAsync(msg.variableId)
    ]);
    if (!col || !variable) throw new Error("Collection or variable not found.");
    const ext = col;
    const overrides = (_a = ext.variableOverrides) != null ? _a : {};
    const otherModeOverrides = Object.entries((_b = overrides[variable.id]) != null ? _b : {}).filter(([modeId]) => modeId !== msg.modeId);
    ext.removeOverridesForVariable(variable);
    for (const [modeId, value] of otherModeOverrides) {
      variable.setValueForMode(modeId, value);
    }
    await sendCollectionReady(ext);
  }
  async function handleCopyOverrides(msg) {
    var _a;
    const [srcCol, dstCol] = await Promise.all([
      figma.variables.getVariableCollectionByIdAsync(msg.srcId),
      figma.variables.getVariableCollectionByIdAsync(msg.dstId)
    ]);
    if (!srcCol || !dstCol) throw new Error("Collection not found.");
    const srcExt = srcCol;
    const dstExt = dstCol;
    const [srcVars, dstVars] = await Promise.all([
      getVarsForCollection(srcExt),
      getVarsForCollection(dstExt)
    ]);
    const idToKey = new Map(srcVars.map((v) => [v.id, v.key]));
    const keyToId = new Map(dstVars.map((v) => [v.key, v.id]));
    const srcModeToParent = new Map(
      srcExt.modes.filter((m) => m.parentModeId).map((m) => [m.modeId, m.parentModeId])
    );
    const parentToDstMode = new Map(
      dstExt.modes.filter((m) => m.parentModeId).map((m) => [m.parentModeId, m.modeId])
    );
    const overrides = (_a = srcExt.variableOverrides) != null ? _a : {};
    for (const srcVar of srcVars) {
      const varOverrides = overrides[srcVar.id];
      if (!varOverrides) continue;
      const dstVarId = keyToId.get(srcVar.key);
      if (!dstVarId) continue;
      const dstVar = await figma.variables.getVariableByIdAsync(dstVarId);
      if (!dstVar) continue;
      for (const [srcModeId, value] of Object.entries(varOverrides)) {
        const parentModeId = srcModeToParent.get(srcModeId);
        const dstModeId = parentModeId ? parentToDstMode.get(parentModeId) : void 0;
        if (!dstModeId) continue;
        try {
          dstVar.setValueForMode(dstModeId, translateValue(value, idToKey, keyToId));
        } catch (e) {
        }
      }
    }
    await sendCollectionReady(dstExt);
  }
  async function getVarsForCollection(col) {
    const results = await Promise.all(
      col.variableIds.map((id) => figma.variables.getVariableByIdAsync(id))
    );
    return results.filter((v) => v !== null);
  }
  async function sendCollectionReady(col) {
    var _a;
    const vars = await getVarsForCollection(col);
    const overrides = (_a = col.variableOverrides) != null ? _a : {};
    const parentVarByKey = /* @__PURE__ */ new Map();
    try {
      const parentCol = await figma.variables.getVariableCollectionByIdAsync(
        col.parentVariableCollectionId
      );
      if (parentCol) {
        const libVars = await figma.variables.getVariablesInLibraryCollectionAsync(parentCol.key);
        for (const lv of libVars) parentVarByKey.set(lv.key, lv);
      }
    } catch (e) {
    }
    figma.ui.postMessage({
      type: "COLLECTION_READY",
      collection: { id: col.id, name: col.name },
      modes: col.modes,
      vars: vars.map((v) => {
        var _a2, _b;
        const varOverrides = (_a2 = overrides[v.id]) != null ? _a2 : {};
        const parentVar = parentVarByKey.get(v.key);
        const effectiveValues = {};
        for (const mode of col.modes) {
          if (mode.modeId in varOverrides) {
            effectiveValues[mode.modeId] = varOverrides[mode.modeId];
          } else if (parentVar && mode.parentModeId) {
            const parentVal = parentVar.valuesByMode[mode.parentModeId];
            if (parentVal !== void 0) effectiveValues[mode.modeId] = parentVal;
          } else {
            const raw = (_b = v.valuesByMode[mode.modeId]) != null ? _b : mode.parentModeId ? v.valuesByMode[mode.parentModeId] : void 0;
            if (raw !== void 0) effectiveValues[mode.modeId] = raw;
          }
        }
        return {
          id: v.id,
          name: v.name,
          key: v.key,
          resolvedType: v.resolvedType,
          valuesByMode: effectiveValues,
          overriddenModes: Object.keys(varOverrides)
        };
      })
    });
  }
  function translateValue(value, idToKey, keyToId) {
    if (typeof value === "object" && "type" in value && value.type === "VARIABLE_ALIAS") {
      const key = idToKey.get(value.id);
      const destId = key ? keyToId.get(key) : void 0;
      if (destId) return { type: "VARIABLE_ALIAS", id: destId };
    }
    return value;
  }
})();
