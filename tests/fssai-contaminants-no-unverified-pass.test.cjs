#!/usr/bin/env node
"use strict";
const test=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path");
const root=path.resolve(__dirname,"..");
const helper=fs.readFileSync(path.join(root,"fssai-product-helper-preview-01/index.html"),"utf8");
const audit=fs.readFileSync(path.join(root,"scripts/audit-fssai-product-readiness.cjs"),"utf8");
const triage=fs.readFileSync(path.join(root,"scripts/triage-fssai-contaminant-evidence.cjs"),"utf8");
test("No contaminant compliance PASS on product rule mapping alone",()=>{
 const full=helper.match(/masterComplianceRow\('Contaminants \/ residues','pass'/g)||[];
 assert.equal(full.length,0,"A contaminant mapping cannot imply final compliance PASS");
 assert.match(helper,/masterComplianceRow\('Contaminants \/ residues','evidence','Available product\/qualifier contaminant rules have been mapped for review only/);
 assert.match(helper,/no product-level compliance PASS is established/);
});
test("Incomplete source, qualifier, or selected product cannot claim full contaminant verification",()=>{
 assert.match(helper,/no exact product contaminant profile/);
 assert.match(helper,/product cannot receive a full contaminant PASS/);
 assert.match(helper,/Regulatory mapping still needs:/);
 assert.match(audit,/compliance_decision:"not_established_by_route_evidence"/);
 assert.match(triage,/source_full_compliance_verified:false/);
 assert.match(triage,/automatic_missing_limit_inference_allowed:false/);
});
