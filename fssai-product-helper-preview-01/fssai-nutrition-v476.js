/* PMSV FSSAI nutrition calculation layer v476. Official legal basis: FSSAI Labelling & Display Regulations, 2020, Compendium Version VIII (09.09.2025). */
(function(root){
'use strict';
const FACTORS={carbohydrate_g:4,protein_g:4,total_fat_g:9,dietary_fibre_g:2,organic_acids_g:3,alcohol_g:7,polyols_g:2,erythritol_g:0};
const finite=v=>typeof v==='number'&&Number.isFinite(v)&&v>=0;
function energy(n){
 const needed=['carbohydrate_g','protein_g','total_fat_g'];
 if(needed.some(k=>!finite(n[k]))) return null;
 let kcal=n.carbohydrate_g*4+n.protein_g*4+n.total_fat_g*9;
 for(const k of ['dietary_fibre_g','organic_acids_g','alcohol_g','polyols_g','erythritol_g']){
   if(finite(n[k])) kcal+=n[k]*FACTORS[k];
 }
 return kcal;
}
function adjustForYield(per100g,inputMassG,finishedMassG){
 if(!(finite(inputMassG)&&inputMassG>0&&finite(finishedMassG)&&finishedMassG>0)) throw new Error('Valid input and finished product mass required');
 const ratio=inputMassG/finishedMassG;
 const out={};
 for(const [k,v] of Object.entries(per100g||{})) out[k]=finite(v)?v*ratio:null;
 return out;
}
function calculate({per100g,inputMassG,finishedMassG,retention={}}){
 const ratio=inputMassG/finishedMassG;
 const adjusted={};
 for(const [k,v] of Object.entries(per100g||{})){
   if(!finite(v)){adjusted[k]=null;continue;}
   const r=retention[k];
   if(r!==undefined&&(!finite(r)||r>1)) throw new Error('Retention must be 0 to 1');
   adjusted[k]=v*ratio*(r===undefined?1:r);
 }
 adjusted.energy_kcal=energy(adjusted);
 return {per100g:adjusted,yield_percent:finishedMassG/inputMassG*100,energy_basis:'FSSAI conversion factors',estimated:true};
}
function proteinFromNitrogen(nitrogenG,{milk=false,factor=null}={}){
 if(!finite(nitrogenG)) return null;
 const f=factor==null?(milk?6.38:6.25):Number(factor);
 if(!Number.isFinite(f)||f<=0) throw new Error('Invalid protein conversion factor');
 return nitrogenG*f;
}
const api={FACTORS,energy,adjustForYield,calculate,proteinFromNitrogen};
root.PMSVFssaiNutrition=api;
if(typeof module==='object'&&module.exports)module.exports=api;
})(typeof globalThis==='object'?globalThis:this);
