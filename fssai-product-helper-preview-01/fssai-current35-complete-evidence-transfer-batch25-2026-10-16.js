"use strict";
/* PMSV Batch25: optional B5 reviewer evidence references/notes travel with
 * the existing B15 unverified cross-device transfer, guarded by B23 preflight
 * and B24 per-case selection. Local-only; never a regulatory or lot PASS. */
var pmsvB25LastResult="NOT_STARTED";
const pmsvB25Kind="PMSV_CURRENT35_UNVERIFIED_EVIDENCE_NOTES_B25";
function pmsvB25Ready(){
 return typeof pmsvB24Valid==="function"&&pmsvB24Valid()&&
 typeof pmsvB5Valid==="function"&&pmsvB5Valid()&&
 typeof pmsvB5Read==="function"&&typeof pmsvB15PacketForTransfer==="function"&&
 pmsv498Ledger?.records?.length===533&&pmsv498Ledger.first_source_pending===35;
}
function pmsvB25Packet(){
 if(!pmsvB25Ready())return null;
 const packet=pmsvB15PacketForTransfer(),notes=pmsvB5Read();
 if(!packet||packet.review_queue?.records?.length!==35)return null;
 return {...packet,
  evidence_notes:{
   kind:pmsvB25Kind,schema_version:"1.0",all_unverified:true,
   source_approvals:0,lab_passes:0,
   records:pmsvB14Data.cases.map(c=>({
    catalog_id:c.catalog_id,product_name:c.product_name,
    reference:notes[c.catalog_id]?.reference||"",
    notes:notes[c.catalog_id]?.notes||"",
    source_verified:false,regulatory_approved:false
   }))
  },
  warning:"Contains browser-local reviewer drafts, receipt claims and reference/notes. No document, legal limit, approval or laboratory result is verified."
 };
}
function pmsvB25ParseNotes(raw,parsed){
 if(!Object.hasOwn(raw,"evidence_notes"))return null; // Legacy B15 JSON stays compatible.
 const n=raw.evidence_notes;
 if(raw.kind!=="PMSV_35_REVIEW_TRANSFER_B15_UNVERIFIED"||
 !n||typeof n!=="object"||Array.isArray(n)||
 n.kind!==pmsvB25Kind||n.schema_version!=="1.0"||
 n.all_unverified!==true||n.source_approvals!==0||n.lab_passes!==0||
 !Array.isArray(n.records)||n.records.length!==35||
 parsed.records.length!==35||!parsed.unverified)
 throw Error("Invalid B25 unverified reference/notes envelope");
 const allowed=new Map(pmsvB14Data.cases.map(c=>[c.catalog_id,c.product_name]));
 const ids=new Set(),items=[];
 for(const x of n.records){
  if(!x||typeof x!=="object"||Array.isArray(x)||
   Object.keys(x).sort().join("|")!=="catalog_id|notes|product_name|reference|regulatory_approved|source_verified"||
   !allowed.has(x.catalog_id)||x.product_name!==allowed.get(x.catalog_id)||
   ids.has(x.catalog_id)||typeof x.reference!=="string"||x.reference.length>300||
   typeof x.notes!=="string"||x.notes.length>500||
   x.source_verified!==false||x.regulatory_approved!==false)
   throw Error("Invalid, duplicate or approved B25 case reference");
  ids.add(x.catalog_id);
  items.push({id:x.catalog_id,reference:x.reference,notes:x.notes});
 }
 if(ids.size!==35||parsed.records.some(x=>!ids.has(x.id)))throw Error("B25 case IDs mismatch");
 return {kind:pmsvB25Kind,items};
}
const pmsvB25OldPreview=pmsvB23PreviewSelected;
pmsvB23PreviewSelected=async function(){
 const ok=await pmsvB25OldPreview();
 if(!ok||!pmsvB23Pending)return ok;
 try{
  const draft=pmsvB23Pending,raw=JSON.parse(await draft.file.text());
  if(draft.file!==document.querySelector("#pmsv-b15-transfer-panel [data-pmsv-b15-import-file]")?.files?.[0]||
     !pmsvB23SameSnapshot(draft.previous,pmsvB23Snapshot()))
   throw Error("Changed file or local evidence while verifying references");
  const notes=pmsvB25ParseNotes(raw,draft.parsed);
  if(notes){
   draft.parsed.b25_meta=notes;
   pmsvB23Display("Validated full 35-case unverified draft AND reference/notes transfer. Select individual cases below; preview makes no local changes.",draft.info);
  }
  pmsvB25LastResult=notes?"FULL_PACKET_PREVIEW":"LEGACY_PACKET_PREVIEW";
  return true;
 }catch(e){
  pmsvB23Reset("B25 references/notes rejected before import: "+String(e.message||"Invalid packet"));
  pmsvB23LastResult="REJECTED";pmsvB25LastResult="REJECTED";return false;
 }
};
const pmsvB25OldChanges=pmsvB24Changes;
pmsvB24Changes=function(parsed){
 const rows=pmsvB25OldChanges(parsed);
 if(!parsed?.b25_meta)return rows;
 const prior=pmsvB5Read(),byId=new Map(parsed.b25_meta.items.map(x=>[x.id,x]));
 return rows.map(x=>{
  const entry=byId.get(x.id);
  if(!entry)throw Error("Missing B25 notes for a current case");
  const saved=prior[x.id]||{reference:"",notes:"",received:[false,false,false,false]};
  const notesDiffer=entry.reference!==saved.reference||entry.notes!==saved.notes;
  if(!notesDiffer)return x;
  const incomingHas=!!entry.reference.trim()||!!entry.notes.trim();
  const oldHas=!!saved.reference.trim()||!!saved.notes.trim()||x.priorHasEvidence;
  return {...x,metadataDiffer:true,
   category:!incomingHas&&!x.incomingHasEvidence?"EMPTY_INCOMING":
    oldHas?"OVERWRITES_EXISTING":"NEW_INFORMATION"};
 });
};
const pmsvB25OldCommit=pmsvB15CommitTransfer;
pmsvB15CommitTransfer=function(parsed){
 if(!parsed?.b25_meta)return pmsvB25OldCommit(parsed);
 if(!pmsvB25Ready()||!Array.isArray(parsed.records)||!parsed.records.length||
  parsed.b25_meta.kind!==pmsvB25Kind||parsed.b25_meta.items?.length!==35)return false;
 const index=new Map(parsed.b25_meta.items.map(x=>[x.id,x]));
 if(index.size!==35||parsed.records.some(x=>!index.has(x.id)||
  !pmsvB14Data.cases.some(c=>c.catalog_id===x.id)))return false;
 const keys=[pmsvB14StorageKey,pmsvB5StorageKey,pmsvB15ClaimsKey],store=window.localStorage;
 let backup;
 try{
  backup=keys.map(k=>store.getItem(k));
  if(!pmsvB25OldCommit(parsed))return false;
  const changed=pmsvB5Read();
  for(const row of parsed.records){
   const m=index.get(row.id),z=changed[row.id];
   if(!z||typeof m.reference!=="string"||m.reference.length>300||
    typeof m.notes!=="string"||m.notes.length>500)throw Error("Invalid B25 metadata");
   z.reference=m.reference;z.notes=m.notes;
  }
  store.setItem(pmsvB5StorageKey,JSON.stringify(changed));
  pmsvB25LastResult="SELECTED_REFERENCES_RESTORED_UNVERIFIED";
  return true;
 }catch(_){
  if(backup)for(let i=0;i<keys.length;i++)try{
   if(backup[i]===null)store.removeItem(keys[i]);else store.setItem(keys[i],backup[i]);
  }catch(__){}
  pmsvB25LastResult="RESTORE_ROLLED_BACK";return false;
 }
};
if(typeof document!=="undefined"&&document.addEventListener){
 /* Override only the B15 export, preserving its strict import parser and
  * the existing B23/B24 capture handlers for import/confirm. */
 document.addEventListener("click",e=>{
  const button=e.target?.closest?.("[data-pmsv-b15-export]");
  if(!button||!pmsvB25Ready())return;
  e.preventDefault();e.stopImmediatePropagation();
  const ok=pmsvB14Download(pmsvB25Packet(),"PMSV-35-UNVERIFIED-EVIDENCE-WITH-NOTES-B25.json");
  const label=document.querySelector("#pmsv-b15-transfer-panel [data-pmsv-b15-message]");
  if(label)label.textContent=ok?
   "B25: 35-case local review transfer includes evidence reference/notes and receipt claims; ALL UNVERIFIED. Treat as sensitive, do not post publicly.":
   "Review JSON download unavailable.";
 },true);
 const prior=pmsvB23Ensure;
 pmsvB23Ensure=function(){
  prior();
  const box=document.querySelector("#pmsv-b15-transfer-panel [data-pmsv-b23-preflight]");
  if(box&&!box.querySelector("[data-pmsv-b25-info]"))
   box.insertAdjacentHTML("afterbegin",'<p data-pmsv-b25-info><b>Batch 25:</b> Exports now include all 35 cases\' evidence reference IDs and follow-up notes. Imported notes change only for explicitly selected cases. Legacy JSON imports preserve local notes. Every field remains unverified; keep exports private.</p>');
 };
}
