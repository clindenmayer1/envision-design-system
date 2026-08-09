/*
 * envision-targeting.js
 * ---------------------------------------------------------------------------
 * Name-based targeting for the Envision kitchen GLB (SimLab GLTF export).
 *
 * WHY NAME-BASED: the GLB export drops all SketchUp tags/layers. They do NOT
 * exist anywhere in the file (not in node names, mesh names, materials, or
 * node.extras). So we target by the preserved instance-name convention
 * (Type_Location_Position_Piece) using CASE-INSENSITIVE SUBSTRING / TOKEN
 * matching against node.name. Never require exact equality: SimLab prefixes
 * many nodes with their definition name, e.g.
 *   "36BASE_Cabinet_SinkWall_Lower_03"
 *   "Component#4_Cabinet_SinkWall_Lower_03_LeftDoor"
 *
 * Validated against envision_kitchen_clean_test.glb (320 nodes):
 *   150 meaningful nodes, 149 classified, 1 structural container
 *   (Room_Perimeter_01) intentionally left unclassified.
 *
 * Framework-agnostic: operates on any tree of { name, children:[...] } nodes,
 * which includes THREE.Object3D from GLTFLoader (gltf.scene).
 *
 * Usage (Three.js):
 *   loader.load('envision_kitchen_clean_test.glb', (gltf) => {
 *     const t = EnvisionTargeting.buildTargets(gltf.scene, { applianceMode: 'panel-ready' });
 *     t.cabinet_style.forEach(o => applyCabinetFinish(o));
 *     t.countertop.forEach(o => applyStone(o));
 *   });
 */
// The factory result is captured DIRECTLY into the exported `EnvisionTargeting` binding (see the
// export at the bottom). This is deliberate: the old UMD form assigned only to a global as a
// side-effect, and the production bundler tree-shook that IIFE away (pure), leaving the global
// unset → app crashed. Feeding the result into a used export keeps it.
const EnvisionTargeting = (function () {
  'use strict';

  // --- nodes to ignore entirely -------------------------------------------
  // Geom3D / Assembly = SimLab helper/wrapper nodes (geometry holders, ~158 of 320).
  // The rest are SketchUp saved scenes / cameras exported as empty nodes.
  var WRAPPER_PREFIXES = ['geom3d', 'assembly'];
  var SCENE_NODE_NAMES = [
    'plan', 'view1', 'view2', 'view3', 'range view', 'sink view',
    'scene 5', 'scene 6', 'active view', 'details'
  ];

  function isIgnored(name) {
    var l = (name || '').toLowerCase().trim();
    if (!l) return true;
    for (var i = 0; i < WRAPPER_PREFIXES.length; i++) {
      if (l.indexOf(WRAPPER_PREFIXES[i]) === 0) return true;
    }
    return SCENE_NODE_NAMES.indexOf(l) !== -1;
  }

  function has(n /*, ...subs */) {
    for (var i = 1; i < arguments.length; i++) {
      if (n.indexOf(arguments[i]) !== -1) return true;
    }
    return false;
  }

  // Door / drawer-front tokens that mark a cabinet *front* (style/finish surface).
  var DOOR_TOKENS = ['door', 'drawerfront', 'drawer', 'leftdoor', 'rightdoor', 'upperdoor', 'lowerdoor'];

  // Categories whose matched parent should absorb descendant sub-parts so a
  // whole-object finish reaches pieces whose own names lost the convention
  // (range knobs/feet/handle/burners, sink vendor model, etc.).
  var EXPAND = { appliance: true, plumbing: true, island: true };

  /**
   * Return the SET of category keys a single node name belongs to.
   * A node can belong to several sets (e.g. a door is cabinet_style AND cabinet_body).
   * @param {string} name
   * @param {{applianceMode?: string}} [opts]
   * @returns {string[]}
   */
  function classifyNodeName(name, opts) {
    opts = opts || {};
    var mode = opts.applianceMode || 'panel-ready';
    var n = (name || '').toLowerCase();
    var out = [];
    var cab = n.indexOf('cabinet_') !== -1;

    // cabinet_style = cabinet fronts; + appliance panels when panelized/integrated
    var isFront = cab && has(n, 'door', 'drawerfront', 'drawer', 'leftdoor', 'rightdoor', 'upperdoor', 'lowerdoor');
    var isPanel = n.indexOf('appliance_') !== -1 && n.indexOf('panel') !== -1;
    if (isFront || ((mode === 'panel-ready' || mode === 'integrated') && isPanel)) out.push('cabinet_style');

    if (cab) out.push('cabinet_body');
    if (has(n, 'hardware_', 'pull')) out.push('hardware');
    if (n.indexOf('appliance_') !== -1) out.push('appliance');

    // FIX: 'countertop_' alone also matches plumbing fixtures located on the
    // countertop (Plumbing_SinkWall_Countertop_01_Sink). Exclude plumbing_.
    if (n.indexOf('countertop_') !== -1 && n.indexOf('plumbing_') === -1) out.push('countertop');

    if (n.indexOf('backsplash_') !== -1) out.push('backsplash');
    if (n.indexOf('floor_perimeter_01') !== -1) out.push('floor');
    if (n.indexOf('walls_perimeter_01') !== -1) out.push('walls');
    if (n.indexOf('ceiling_perimeter_01') !== -1) out.push('ceiling');
    if (has(n, 'window_', 'windows')) out.push('windows');

    // FIX: do NOT use a bare 'sink' token — it collides with the 'SinkWall'
    // LOCATION used by cabinets/hardware/countertops (65 false positives).
    // Real plumbing is identifiable by 'plumbing_', 'faucet', 'drain', 'sinkbasin';
    // any remaining sink sub-parts are absorbed via hierarchy (EXPAND).
    if (has(n, 'plumbing_', 'faucet', 'drain', 'sinkbasin')) out.push('plumbing');

    if (has(n, 'trim_', 'crownmolding')) out.push('trim');
    if (n.indexOf('island') !== -1) out.push('island');
    return out;
  }

  // Collect descendant nodes (skipping Geom3D wrappers but keeping real sub-parts).
  function collectDescendants(node, acc) {
    var kids = node.children || [];
    for (var i = 0; i < kids.length; i++) {
      var c = kids[i];
      var cn = (c.name || '').toLowerCase();
      if (cn.indexOf('geom3d') !== 0) acc.push(c);
      collectDescendants(c, acc);
    }
    return acc;
  }

  var CATEGORIES = [
    'cabinet_style', 'cabinet_body', 'hardware', 'appliance', 'countertop',
    'backsplash', 'floor', 'walls', 'ceiling', 'windows', 'plumbing', 'trim', 'island'
  ];

  /**
   * Walk a node tree and return { category: [node, ...] } target sets.
   * appliance / plumbing / island matches expand to descendant sub-parts.
   * @param {{name:string, children?:Array}} rootNode  e.g. THREE gltf.scene
   * @param {{applianceMode?: string}} [opts]
   */
  function buildTargets(rootNode, opts) {
    opts = opts || {};
    var sets = {};
    var seen = {};
    CATEGORIES.forEach(function (c) { sets[c] = []; seen[c] = (typeof Set !== 'undefined') ? new Set() : {}; });

    function add(cat, node) {
      var key = node.uuid || node.name;
      if (typeof Set !== 'undefined') {
        if (seen[cat].has(node)) return;
        seen[cat].add(node);
      } else {
        if (seen[cat][key]) return; seen[cat][key] = true;
      }
      sets[cat].push(node);
    }

    function visit(node) {
      var name = node.name || '';
      if (!isIgnored(name)) {
        var cats = classifyNodeName(name, opts);
        for (var i = 0; i < cats.length; i++) {
          var cat = cats[i];
          add(cat, node);
          if (EXPAND[cat]) {
            var desc = collectDescendants(node, []);
            for (var j = 0; j < desc.length; j++) add(cat, desc[j]);
          }
        }
      }
      var kids = node.children || [];
      for (var k = 0; k < kids.length; k++) visit(kids[k]);
    }
    visit(rootNode);
    return sets;
  }

  // =========================================================================
  // PATH-AWARE LOOKUP  (additive — does not change classification behavior)
  //
  // Shared SketchUp definitions produce DUPLICATE node names in the GLB, e.g.
  // "Component#6_Cabinet_RangeWall_Lower_01_DrawerFront_02" appears under BOTH
  // 36BASE#2_Cabinet_RangeWall_Lower_01 AND ..._Lower_02. node.name alone can't
  // tell them apart; their ANCESTRY can. These helpers resolve nodes by parent
  // path / ancestor tokens. Pass the scene ROOT (e.g. gltf.scene) so the full
  // ancestry is reachable.
  // =========================================================================

  // child -> parent map, built by traversal (works for THREE.Object3D or any
  // {name, children} tree; does not rely on / mutate node.parent).
  function buildParentMap(root) {
    var map = new Map();
    (function walk(node) {
      var kids = node.children || [];
      for (var i = 0; i < kids.length; i++) { map.set(kids[i], node); walk(kids[i]); }
    })(root);
    return map;
  }

  // Ancestors of a node, nearest-first (parent, grandparent, ... root).
  function getAncestors(node, parentMap) {
    var out = [], p = parentMap.get(node);
    while (p) { out.push(p); p = parentMap.get(p); }
    return out;
  }

  // Name of the nearest MEANINGFUL ancestor (skips Geom3D/Assembly/scene/blank).
  function meaningfulParentName(node, parentMap) {
    var anc = getAncestors(node, parentMap);
    for (var i = 0; i < anc.length; i++) {
      if (!isIgnored(anc[i].name || '')) return anc[i].name;
    }
    return null;
  }

  // Readable ancestry path "Parent > Child > Leaf".
  // opts.includeNoise=true keeps Geom3D/Assembly/blank nodes; default filters them.
  // opts.separator (default ' > '); opts.parentMap to reuse a prebuilt map.
  function getPath(node, root, opts) {
    opts = opts || {};
    var sep = opts.separator || ' > ';
    var parentMap = opts.parentMap || buildParentMap(root);
    var chain = getAncestors(node, parentMap).reverse(); // root .. parent
    chain.push(node);
    var labels = [];
    for (var i = 0; i < chain.length; i++) {
      var nm = chain[i].name || '';
      if (opts.includeNoise || !isIgnored(nm)) labels.push(nm.trim() ? nm : '<blank>');
    }
    return labels.join(sep);
  }

  // tokens: string or string[]; true if ANY token is a substring of hay (lowercased).
  function matchAny(hayLower, tokens) {
    if (tokens == null) return true;
    if (typeof tokens === 'string') tokens = [tokens];
    for (var i = 0; i < tokens.length; i++) {
      if (hayLower.indexOf(String(tokens[i]).toLowerCase()) !== -1) return true;
    }
    return false;
  }

  /**
   * Find nodes by name token(s) plus optional ancestry constraints.
   * @param {object} root  scene root (gltf.scene)
   * @param {object} query
   *   query.name            string|string[]  ANY token must be in node.name
   *   query.requireAncestor string|string[]  EACH token must appear in SOME ancestor name
   *   query.excludeAncestor string|string[]  reject if ANY token appears in ANY ancestor
   *   query.category        string           node must also classify into this category
   *   query.applianceMode   string           passed to classifyNodeName for category check
   *   query.parentMap       Map              optional prebuilt map (perf)
   * @returns {Array} matching nodes (wrappers/scene nodes are never returned)
   */
  function findNodes(root, query) {
    query = query || {};
    var parentMap = query.parentMap || buildParentMap(root);
    var reqs = query.requireAncestor == null ? null
      : (typeof query.requireAncestor === 'string' ? [query.requireAncestor] : query.requireAncestor);
    var exs = query.excludeAncestor == null ? null
      : (typeof query.excludeAncestor === 'string' ? [query.excludeAncestor] : query.excludeAncestor);
    var res = [];

    (function walk(node) {
      var nm = node.name || '';
      if (!isIgnored(nm)) {
        var ok = matchAny(nm.toLowerCase(), query.name);
        if (ok && (reqs || exs)) {
          var ancNames = getAncestors(node, parentMap).map(function (a) { return (a.name || '').toLowerCase(); });
          if (ok && reqs) {
            ok = reqs.every(function (r) {
              r = String(r).toLowerCase();
              return ancNames.some(function (a) { return a.indexOf(r) !== -1; });
            });
          }
          if (ok && exs) {
            var hit = exs.some(function (x) {
              x = String(x).toLowerCase();
              return ancNames.some(function (a) { return a.indexOf(x) !== -1; });
            });
            if (hit) ok = false;
          }
        }
        if (ok && query.category) {
          ok = classifyNodeName(nm, query).indexOf(query.category) !== -1;
        }
        if (ok) res.push(node);
      }
      var kids = node.children || [];
      for (var i = 0; i < kids.length; i++) walk(kids[i]);
    })(root);
    return res;
  }

  // Categories a node inherits from its nearest classifying ancestor (used to
  // explain EXPAND-descent membership: appliance/plumbing/island sub-parts).
  function inheritedCategories(node, parentMap, opts) {
    var anc = getAncestors(node, parentMap);
    for (var i = 0; i < anc.length; i++) {
      if (isIgnored(anc[i].name || '')) continue;
      var c = classifyNodeName(anc[i].name || '', opts);
      if (c.length) return { source: anc[i], categories: c };
    }
    return null;
  }

  // One descriptive record for a node.
  function describeNode(node, root, opts) {
    opts = opts || {};
    var parentMap = opts.parentMap || buildParentMap(root);
    var own = classifyNodeName(node.name || '', opts);
    var inh = inheritedCategories(node, parentMap, opts);
    return {
      name: node.name || '',
      path: getPath(node, root, { parentMap: parentMap }),
      parentName: meaningfulParentName(node, parentMap),
      ownCategories: own,
      inheritedCategory: inh ? inh.categories : []
    };
  }

  /**
   * Debug report over every node in every target set produced by buildTargets.
   * Each record: { category, name, path, parentName, via }.
   *   via = 'name'                     -> node's own name classifies into category
   *         'inherited-parent-category'-> only present via appliance/plumbing/island
   *                                        hierarchy descent (sub-part of a matched parent)
   */
  function debugTargets(root, opts) {
    opts = opts || {};
    var parentMap = buildParentMap(root);
    var sets = buildTargets(root, opts);
    var rows = [];
    CATEGORIES.forEach(function (cat) {
      sets[cat].forEach(function (node) {
        var ownCats = classifyNodeName(node.name || '', opts);
        var via = ownCats.indexOf(cat) !== -1 ? 'name' : 'inherited-parent-category';
        rows.push({
          category: cat,
          name: node.name || '',
          path: getPath(node, root, { parentMap: parentMap }),
          parentName: meaningfulParentName(node, parentMap),
          via: via
        });
      });
    });
    return rows;
  }

  /**
   * Debug report for an ancestry-constrained query (findNodes).
   * via = 'ancestry' when requireAncestor/excludeAncestor narrowed the match,
   *       else 'name'.
   */
  function debugFind(root, query) {
    query = query || {};
    var parentMap = buildParentMap(root);
    var via = (query.requireAncestor != null || query.excludeAncestor != null) ? 'ancestry' : 'name';
    return findNodes(root, Object.assign({}, query, { parentMap: parentMap })).map(function (node) {
      return {
        category: query.category || null,
        name: node.name || '',
        path: getPath(node, root, { parentMap: parentMap }),
        parentName: meaningfulParentName(node, parentMap),
        via: via
      };
    });
  }

  /**
   * Ergonomic wrapper: prebuilds the parent map once and exposes bound helpers.
   *   var L = EnvisionTargeting.createLookup(gltf.scene, { applianceMode: 'panel-ready' });
   *   L.targets.cabinet_style; L.path(node); L.find({ name:'DrawerFront', requireAncestor:'Lower_02' });
   */
  function createLookup(root, opts) {
    opts = opts || {};
    var parentMap = buildParentMap(root);
    function withMap(q) { return Object.assign({ applianceMode: opts.applianceMode, parentMap: parentMap }, q); }
    return {
      root: root,
      parentMap: parentMap,
      applianceMode: opts.applianceMode || 'panel-ready',
      targets: buildTargets(root, opts),
      path: function (node, o) { return getPath(node, root, Object.assign({ parentMap: parentMap }, o)); },
      parentName: function (node) { return meaningfulParentName(node, parentMap); },
      ancestors: function (node) { return getAncestors(node, parentMap); },
      describe: function (node) { return describeNode(node, root, withMap()); },
      find: function (q) { return findNodes(root, withMap(q)); },
      debug: function () { return debugTargets(root, opts); },
      debugFind: function (q) { return debugFind(root, withMap(q)); }
    };
  }

  return {
    WRAPPER_PREFIXES: WRAPPER_PREFIXES,
    SCENE_NODE_NAMES: SCENE_NODE_NAMES,
    CATEGORIES: CATEGORIES,
    isIgnored: isIgnored,
    classifyNodeName: classifyNodeName,
    buildTargets: buildTargets,
    // path-aware helpers
    buildParentMap: buildParentMap,
    getAncestors: getAncestors,
    meaningfulParentName: meaningfulParentName,
    getPath: getPath,
    findNodes: findNodes,
    describeNode: describeNode,
    debugTargets: debugTargets,
    debugFind: debugFind,
    createLookup: createLookup
  };
})();

// Keep the legacy global (for any non-module consumer), then export the API directly.
if (typeof self !== 'undefined') self.EnvisionTargeting = EnvisionTargeting
export default EnvisionTargeting
