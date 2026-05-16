figma.showUI(__html__, { width: 440, height: 580, themeColors: true });

// ─── Types ────────────────────────────────────────────────────────────────────

interface ExtendedVariableCollectionExt extends VariableCollection {
  isExtension: true;
  parentVariableCollectionId: string;
  rootVariableCollectionId: string;
  variableOverrides: Record<string, Record<string, VariableValue>>;
  modes: Array<{ modeId: string; name: string; parentModeId?: string }>;
  removeOverridesForVariable(variable: Variable): void;
}

type UIMessage =
  | { type: 'INIT' }
  | { type: 'CREATE'; collectionKey: string; name: string }
  | { type: 'SELECT'; collectionId: string }
  | { type: 'SET_OVERRIDE'; variableId: string; modeId: string; value: VariableValue }
  | { type: 'REMOVE_OVERRIDE'; collectionId: string; variableId: string }
  | { type: 'COPY_OVERRIDES'; srcId: string; dstId: string }
  | { type: 'CLOSE' };

// ─── Entry ────────────────────────────────────────────────────────────────────

figma.ui.onmessage = async (msg: UIMessage) => {
  try {
    switch (msg.type) {
      case 'INIT':            await handleInit();               break;
      case 'CREATE':          await handleCreate(msg);          break;
      case 'SELECT':          await handleSelect(msg);          break;
      case 'SET_OVERRIDE':    await handleSetOverride(msg);     break;
      case 'REMOVE_OVERRIDE': await handleRemoveOverride(msg);  break;
      case 'COPY_OVERRIDES':  await handleCopyOverrides(msg);   break;
      case 'CLOSE':           figma.closePlugin();              break;
    }
  } catch (err: unknown) {
    figma.ui.postMessage({
      type: 'ERROR',
      message: err instanceof Error ? err.message : String(err),
    });
  }
};

// ─── Handlers ─────────────────────────────────────────────────────────────────

async function handleInit() {
  const [allCollections, libraryCollections] = await Promise.all([
    figma.variables.getLocalVariableCollectionsAsync(),
    figma.teamLibrary.getAvailableLibraryVariableCollectionsAsync(),
  ]);

  const extendedCollections = allCollections
    .filter(c => c.isExtension)
    .map(c => ({
      id: c.id,
      name: c.name,
      parentVariableCollectionId: (c as unknown as ExtendedVariableCollectionExt).parentVariableCollectionId,
    }));

  figma.ui.postMessage({
    type: 'INIT',
    extendedCollections,
    libraryCollections: libraryCollections.map(lc => ({
      key: lc.key,
      name: lc.name,
      libraryName: lc.libraryName,
    })),
  });
}

async function handleCreate(msg: Extract<UIMessage, { type: 'CREATE' }>) {
  const extended = await figma.variables.extendLibraryCollectionByKeyAsync(
    msg.collectionKey,
    msg.name
  );
  await sendCollectionReady(extended as unknown as ExtendedVariableCollectionExt);
}

async function handleSelect(msg: Extract<UIMessage, { type: 'SELECT' }>) {
  const col = await figma.variables.getVariableCollectionByIdAsync(msg.collectionId);
  if (!col) throw new Error('Collection not found.');
  await sendCollectionReady(col as unknown as ExtendedVariableCollectionExt);
}

async function handleSetOverride(msg: Extract<UIMessage, { type: 'SET_OVERRIDE' }>) {
  const variable = await figma.variables.getVariableByIdAsync(msg.variableId);
  if (!variable) throw new Error('Variable not found.');
  variable.setValueForMode(msg.modeId, msg.value);
}

async function handleRemoveOverride(msg: Extract<UIMessage, { type: 'REMOVE_OVERRIDE' }>) {
  const [col, variable] = await Promise.all([
    figma.variables.getVariableCollectionByIdAsync(msg.collectionId),
    figma.variables.getVariableByIdAsync(msg.variableId),
  ]);
  if (!col || !variable) throw new Error('Collection or variable not found.');
  (col as unknown as ExtendedVariableCollectionExt).removeOverridesForVariable(variable);
  await sendCollectionReady(col as unknown as ExtendedVariableCollectionExt);
}

async function handleCopyOverrides(msg: Extract<UIMessage, { type: 'COPY_OVERRIDES' }>) {
  const [srcCol, dstCol] = await Promise.all([
    figma.variables.getVariableCollectionByIdAsync(msg.srcId),
    figma.variables.getVariableCollectionByIdAsync(msg.dstId),
  ]);
  if (!srcCol || !dstCol) throw new Error('Collection not found.');

  const srcExt = srcCol as unknown as ExtendedVariableCollectionExt;
  const dstExt = dstCol as unknown as ExtendedVariableCollectionExt;

  const [srcVars, dstVars] = await Promise.all([
    getVarsForCollection(srcExt),
    getVarsForCollection(dstExt),
  ]);

  const idToKey = new Map(srcVars.map(v => [v.id, v.key]));
  const keyToId = new Map(dstVars.map(v => [v.key, v.id]));

  // Translate mode IDs via parentModeId
  const srcModeToParent = new Map(
    srcExt.modes.filter(m => m.parentModeId).map(m => [m.modeId, m.parentModeId!])
  );
  const parentToDstMode = new Map(
    dstExt.modes.filter(m => m.parentModeId).map(m => [m.parentModeId!, m.modeId])
  );

  const overrides = srcExt.variableOverrides ?? {};

  for (const srcVar of srcVars) {
    const varOverrides = overrides[srcVar.id];
    if (!varOverrides) continue;

    const dstVarId = keyToId.get(srcVar.key);
    if (!dstVarId) continue;

    const dstVar = await figma.variables.getVariableByIdAsync(dstVarId);
    if (!dstVar) continue;

    for (const [srcModeId, value] of Object.entries(varOverrides)) {
      const parentModeId = srcModeToParent.get(srcModeId);
      const dstModeId = parentModeId ? parentToDstMode.get(parentModeId) : undefined;
      if (!dstModeId) continue;

      try {
        dstVar.setValueForMode(dstModeId, translateValue(value, idToKey, keyToId));
      } catch {
        // skip incompatible values
      }
    }
  }

  await sendCollectionReady(dstExt);
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function getVarsForCollection(col: ExtendedVariableCollectionExt): Promise<Variable[]> {
  const results = await Promise.all(
    col.variableIds.map(id => figma.variables.getVariableByIdAsync(id))
  );
  return results.filter((v): v is Variable => v !== null);
}

async function sendCollectionReady(col: ExtendedVariableCollectionExt) {
  const vars = await getVarsForCollection(col);
  const overrides = col.variableOverrides ?? {};

  figma.ui.postMessage({
    type: 'COLLECTION_READY',
    collection: { id: col.id, name: col.name },
    modes: col.modes,
    vars: vars.map(v => ({
      id: v.id,
      name: v.name,
      key: v.key,
      resolvedType: v.resolvedType,
      valuesByMode: v.valuesByMode,
      overriddenModes: Object.keys(overrides[v.id] ?? {}),
    })),
  });
}

function translateValue(
  value: VariableValue,
  idToKey: Map<string, string>,
  keyToId: Map<string, string>
): VariableValue {
  if (typeof value === 'object' && 'type' in value && value.type === 'VARIABLE_ALIAS') {
    const key = idToKey.get(value.id);
    const destId = key ? keyToId.get(key) : undefined;
    if (destId) return { type: 'VARIABLE_ALIAS', id: destId };
  }
  return value;
}
