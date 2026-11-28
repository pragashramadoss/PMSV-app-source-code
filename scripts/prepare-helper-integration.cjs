'use strict';
const {spawnSync}=require('node:child_process');
const tasks=[
 ['sync-helper-search-index.cjs','--check'],
 ['verify-fssai-regulatory-routes.cjs'],
 ['audit-fssai-product-readiness.cjs'],
 ['triage-fssai-contaminant-evidence.cjs'],
 ['audit-all-161-pending-source-matrix-gates.cjs'],
 ['audit-fssai-two-subtype-first-exact-source.cjs'],
 ['audit-fssai-evidence-ledger-conservation.cjs'],
 ['audit-fssai-v9-metal-fallback-precedence.cjs'],
 ['audit-fssai-ayurveda-nine-recipe-source-gates.cjs'],
 ['audit-fssai-ten-edible-fungi-source-gates.cjs'],
 ['audit-fssai-11-chapter-2-3-quality-routes.cjs'],
 ['export-fssai-next-123-source-research-queue.cjs']
];
for(const [file,...args] of tasks){const r=spawnSync(process.execPath,['scripts/'+file,...args],{encoding:'utf8'});if(r.status!==0){process.stderr.write(r.stdout+r.stderr);process.exit(r.status||1);}console.log('PASS '+file);}
