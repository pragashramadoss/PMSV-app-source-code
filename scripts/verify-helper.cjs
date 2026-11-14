'use strict';
const fs=require('node:fs'),path=require('node:path'),{spawnSync}=require('node:child_process');
const root=path.join(__dirname,'..');
const scripts=fs.readdirSync(__dirname).filter(name=>/^test_.*\.(mjs|py)$/.test(name)||/^verify_.*\.py$/.test(name)).sort();
const tasks=[['node','scripts/build-helper-review-status.cjs','--check'],...scripts.map(name=>[name.endsWith('.py')?'python3':'node','scripts/'+name])];
const results=tasks.map(command=>{
 const result=spawnSync(command[0],command.slice(1),{cwd:root,encoding:'utf8',timeout:60000});
 const passed=result.status===0;
 console.log((passed?'PASS ':'FAIL ')+command.join(' '));
 if(!passed)console.error((result.stdout||'')+(result.stderr||'')+(result.error?.message||''));
 return {command,passed,exitCode:result.status,output:(result.stdout||'')+(result.stderr||''),error:result.error?.message||null};
});
const summary={scope:'Current fssai-helper audit scripts and generated review register; excludes historical preview regression suite and legal-completeness certification.',total:results.length,passed:results.filter(x=>x.passed).length,failed:results.filter(x=>!x.passed).length,results};
if(process.env.PMSV_TEST_REPORT)fs.writeFileSync(process.env.PMSV_TEST_REPORT,JSON.stringify(summary,null,2)+'\n');
console.log(JSON.stringify({total:summary.total,passed:summary.passed,failed:summary.failed}));
process.exitCode=summary.failed?1:0;
