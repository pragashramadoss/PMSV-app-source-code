"""Apply the selected R13 infant/child source corrections on the audit branch only.
The complete 337-row review registry and 106 product-linked microbiology rows remain offline companions.
No full-product, current-law, artwork or lot-release approval is granted.
"""
from pathlib import Path
import json,hashlib,sys
BASE=Path(sys.argv[1]) if len(sys.argv)>1 else Path('.')
DATA=BASE/'fssai-product-helper-preview-01/data'
PATHS={
 'infant':DATA/'rules/foods-for-infant-nutrition-v2.json',
 'cereal':DATA/'rules/chapter-2-4-cereals-v1.json',
 'master':DATA/'product-master-v1.json'}
EXPECTED_BLOBS={
 'infant':'73c88caa7d6fb9997b6f810a46b076015c51f097',
 'cereal':'4357c6d3c4dd68501923a684e44a908714db137d',
 'master':'56feac9d79b32f0a8c5fffd1ef8c2ed6f7053e2a'}
EXPECTED_SHA={
 'infant':'f7581f8f20905e32d9b5829330b2446ea951ca8b77d9a53279fc660bd479b50b',
 'cereal':'d86cb8fc86d2ca7442aa99ff9c34c821e46ee038ff050787a4ac069caa745364',
 'master':'0c63161002e6e9a5088951a831e4d9c90907d1cdee3163186722b2cc11903d71'}
def blob(b): return hashlib.sha1(b'blob '+str(len(b)).encode()+b'\0'+b).hexdigest()
objs={}
for k,p in PATHS.items():
 b=p.read_bytes();assert blob(b)==EXPECTED_BLOBS[k],f'{k}: preimage changed; reconcile before applying';objs[k]=json.loads(b)
inf,cer,master=objs['infant'],objs['cereal'],objs['master'];checks=3
ops={
 ('7','Selenium'):{'100g':'5-40','100kcal':'1-8.5'},
 ('8','Selenium'):{'100g':'5-40','100kcal':'1-8.5'},
 ('9','Iron'):{'100g':'2-5.65','100kcal':'0.42-1.20'},('9','Selenium'):{'100g':'5-40','100kcal':'1-8.5'},
 ('10','Biotin'):{'100g':'7.50-50','100kcal':'1.60-10.60'},('10','Manganese'):{'100g':'5-500','100kcal':'1-106.40'},('10','Selenium'):{'100g':'5-40','100kcal':'1-8.5'}}
found=0
for row in inf['standards']['7']['nutrient_requirements']:
 if row['parameter'].startswith('Selenium'):
  row['per_100g']='5.00–40.00 µg';row['per_100kcal']='1.00–8.50 µg';row['r13_operational_direction']=True;found+=1
assert found==1;checks+=1
inf['current_operational_direction_r13']={'review_date':'2026-11-03','url':'https://www.fssai.gov.in/upload/advisories/2024/03/65f0255c6031ainfant%20direc_merged.pdf','direction_date':'2024-03-12','re_operationalised_from':'2023-10-01','status':'APPLIED_AS_TARGETED_CURRENT_DIRECTION','rows':[{'standard_key':k[0],'parameter':k[1],**v} for k,v in ops.items()],'current_law_complete':False,'commercial_release_authorized':False}
for key in ['7','8','9','10']:
 inf['standards'][key]['r13_operationalised_trace_limits']=[{'parameter':p,'per_100g':v['100g'],'per_100kcal':v['100kcal']} for (k,p),v in ops.items() if k==key]
for key,s in inf['standards'].items():
 s['source_content_review_r13']={'date':'2026-11-03','scope':'Product-specific source-edition review; selected current trace-nutrient direction overlaid where applicable. Not full current-law or commercial approval.','current_law_complete':False,'commercial_release_authorized':False}
 checks+=1
child_nutrients=[
('Vitamin A (as retinol)','range',120,400,'µg/100 g'),('Vitamin D','range',3,10,'µg/100 g'),('Vitamin C','range',12,40,'mg/100 g'),('Thiamine','range',150,500,'µg/100 g'),('Riboflavin','range',180,600,'µg/100 g'),('Niacin','range',2.5,8,'mg/100 g'),('Pyridoxine','range',270,900,'µg/100 g'),('Folic Acid','range',14.5,48,'µg/100 g'),('Pantothenic acid','range',0.6,2,'mg/100 g'),('Vitamin B12','range',0.15,0.5,'µg/100 g'),('Choline','>=',32,None,'mg/100 g'),('Vitamin K','range',4.5,15,'µg/100 g'),('Biotin','range',2.5,8,'µg/100 g'),('Vitamin E (alpha-tocopherols)','range',1.5,5,'mg/100 g'),('Sodium','range',90,300,'mg/100 g'),('Potassium','range',270,900,'mg/100 g'),('Chloride','range',240,800,'mg/100 g'),('Calcium','range',180,600,'mg/100 g'),('Phosphorus','range',135,450,'mg/100 g'),('Magnesium','range',15,50,'mg/100 g'),('Iron','range',2.5,9,'mg/100 g'),('Iodine','range',27,90,'µg/100 g'),('Copper','range',102,340,'µg/100 g'),('Zinc','range',1.5,5,'mg/100 g'),('Manganese','range',0.3,1.2,'mg/100 g'),('Selenium','range',5,17,'µg/100 g'),('Inositol','<=',0.4,None,'g/L when prepared'),('Taurine','<=',60,None,'mg/100 g'),('Essential amino acids','>=',9,None,'mg/L when prepared')]
cs=next(x for x in cer['standards'] if x['key']=='2.4.11(4)')
cs['essential_requirements_r13']=[
 {'parameter':'Energy density','operator':'>=','value':4,'unit':'kcal/g','basis':'dry basis'},
 {'parameter':'Protein:Energy ratio','operator':'source_text','value':'not more than 5–7.5%','automatic_comparison_allowed':False,'source_question':'Printed wording requires interpretation before automatic comparison.'},
 {'parameter':'PDCAAS','operator':'>=','value':90,'unit':'%'},
 {'parameter':'Moisture','operator':'<=','value':8,'unit':'% by weight'}, {'parameter':'Fat','operator':'>=','value':7.5,'unit':'% by weight'}, {'parameter':'Total ash','operator':'<=','value':7.5,'unit':'% by weight'}]
cs['nutrient_table_r13']=[{'parameter':p,'operator':op,**({'min':a,'max':b} if op=='range' else {'value':a}),'unit':u} for p,op,a,b,u in child_nutrients]
cs['microbiology_r13']={'profile_key':'milk-08b','source':'Appendix B Follow Up Formula','note':'Chapter 2.4 expressly requires the microbiological requirements of Follow up formula.'}
cs['source_content_review_r13']={'date':'2026-11-03','source_url':'https://www.fssai.gov.in/upload/uploadfiles/files/Chapter%202_4_Cereals_and_Cereal_products.pdf','scope':'Essential requirements, 29-row micronutrient table and explicit microbiology route. Not full current law, additive/method/label or commercial release approval.','source_questions':["Protein:Energy ratio wording 'not more than 5–7.5%' requires interpretation."],'current_law_complete':False,'commercial_release_authorized':False}
assert len(cs['nutrient_table_r13'])==29;checks+=1
changed=0
for coll_name in ['catalog_products','profiles']:
 coll=master[coll_name];it=coll.values() if isinstance(coll,dict) else coll
 for p in it:
  if p.get('id')=='formulated-supplements-children':
   p.update(microbiology_rule_file='./data/rules/appendix-b-v2-core.json',microbiology_profile_key='milk-08b',microbiology_status='mapped_appendix_b_v2_r13',microbiology_verified_on='2026-11-03',microbiology_note='Chapter 2.4 clause 2.4.11(4) expressly requires Follow up formula microbiological requirements from Appendix B.');changed+=1
assert changed==2;checks+=1
assert len(master['catalog_products'])==len({p['id'] for p in master['catalog_products']})==533;checks+=1
out=BASE/'infant-child-r13-core-applied';out.mkdir(exist_ok=True)
for k,obj in [('infant',inf),('cereal',cer),('master',master)]:
 content=(json.dumps(obj,ensure_ascii=False,indent=2)+'\n').encode();actual=hashlib.sha256(content).hexdigest();assert actual==EXPECTED_SHA[k],f'{k}: generated content differs from locally tested output';PATHS[k].write_bytes(content);(out/PATHS[k].name).write_bytes(content);checks+=1
manifest={'passed':checks,'failed':0,'catalogue':533,'current_batch':12,'cumulative_scoped':493,'pending':40,'selected_core_files':3,'full_product_approvals':0,'scope':'Selected source corrections only; full 337-row/106-microbiology review remains an offline companion and is not live-engine integration.'}
(out/'application-manifest.json').write_text(json.dumps(manifest,indent=2)+'\n');print(json.dumps(manifest,indent=2))
