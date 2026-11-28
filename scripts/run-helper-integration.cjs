'use strict';
const fs=require('node:fs'),{spawnSync}=require('node:child_process');
const mode=process.argv[2]||'data',shard=Number(process.argv[3]||0),shards=Number(process.argv[4]||1);
if(!['data','browser'].includes(mode)||!Number.isInteger(shard)||!Number.isInteger(shards)||shard<0||shards<1||shard>=shards)throw Error('Invalid test selection');
const files=fs.readdirSync('tests').filter(f=>f.endsWith('.test.cjs')).sort().filter(f=>{
 const s=fs.readFileSync('tests/'+f,'utf8');return /playwright|chromium/.test(s)===(mode==='browser');
}).filter((_,i)=>i%shards===shard).map(f=>'tests/'+f);
if(!files.length)throw Error('No tests selected');
console.log(JSON.stringify({mode,shard,shards,files:files.length}));
// Browser fixtures use fixed local ports. Keep each shard sequential in its own runner.
const r=spawnSync(process.execPath,['--test','--test-reporter=tap','--test-concurrency='+ (mode==='browser'?1:4),...files],{stdio:'inherit'});
// spawnSync returns null after a signal/startup failure; that must never pass CI.
process.exit(r.status===0?0:(r.status||1));
