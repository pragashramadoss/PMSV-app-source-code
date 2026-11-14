'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const dir=path.join(__dirname,'..','fssai-product-helper-preview-01','data');
const source=fs.readFileSync(path.join(dir,'product-master-v1.json'),'utf8');
const master=JSON.parse(source),file=path.join(dir,'standard-search-index-v1.json'),index=JSON.parse(fs.readFileSync(file,'utf8'));
const ids=master.catalog_products.map(p=>p.id);
assert.equal(ids.length,533);assert.equal(new Set(ids).size,533);
assert.deepEqual(new Set(index.products.map(p=>p.id)),new Set(ids),'Index membership must be preserved');
for(const p of index.products){const m=master.catalog_products.find(m=>m.id===p.id);for(const key of ['name','fssr','fcs'])assert.equal(m[key],p[key],p.id+' identity drift');}
index.products=structuredClone(master.catalog_products);index.product_count=index.products.length;
index.generated_from='product-master-v1.json';
index.generated_from_sha256=crypto.createHash('sha256').update(source).digest('hex');
index.generated_from_blob=crypto.createHash('sha1').update('blob '+Buffer.byteLength(source)+'\0').update(source).digest('hex');
const output=JSON.stringify(index,null,2)+'\n';
if(process.argv.includes('--check'))assert.equal(fs.readFileSync(file,'utf8'),output,'Search index is stale');else fs.writeFileSync(file,output);
console.log('Search index synchronized: 533 identities and all conditional rule links.');
