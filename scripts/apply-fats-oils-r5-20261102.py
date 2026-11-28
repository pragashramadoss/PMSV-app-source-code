"""Chapter 2.2 R5: source-scoped corrections, never product approval.
This script preserves existing catalogue/profile links and exposes source-oil
requirements that the prior review did not display. Run only on the audit branch.
"""
import copy, hashlib, json, pathlib, re
ROOT=pathlib.Path('.')
PATH=ROOT/'fssai-product-helper-preview-01/data/rules/chapter-2-2-fats-oils-v1.json'
PREIMAGE='a8f7b886de97e6dd085b710d6ba81c335d204ba1'
URL='https://www.fssai.gov.in/upload/uploadfiles/files/Chapter%202_2_Fats_oils%20and%20fat%20emulsions.pdf'
SHA='07dc7cea2d78cd6fef5307c58b0553a554f05a593c8dab4912fe61ad2e0ee2d9'
BATCH='FATS_OILS_R5_2026_11_02'
PRS='https://www.fssai.gov.in/upload/uploadfiles/files/Comp_Prohibition%20and%20Restrcition%20of%20sales%20XI_01042025.pdf'
raw=PATH.read_bytes()
assert hashlib.sha1(b'blob '+str(len(raw)).encode()+b'\0'+raw).hexdigest()==PREIMAGE, 'Source changed; reconcile before applying'
m=json.loads(raw);original=copy.deepcopy(m);by={s['key']:s for s in m['standards']}
S={
 '2.2.1(16)':('Refined Vegetable Oil',[17,18]),
 '2.2.1(7)':('Rapeseed or Mustard Oil - Low Erucic Acid',[6,7]),
 '2.2.1(10)':('Safflower Seed Oil',[12]),
 '2.2.1(10.1)':('High Oleic Safflower / Imported Safflower Oil',[13]),
 '2.2.1(28)':('Palm Kernel Olein',[29]),
 '2.2.1(31)':('Grapeseed Oil',[31]),
 '2.2.1(32)':('Moringa Oil',[32]),
 '2.2.2':('Interesterified Vegetable Fat/Oil',[32,33,34]),
 '2.2.3(1)':('Partially Hydrogenated and Winterised Soyabean Oil',[34,35]),
 '2.2.3(2)':('Partially Hydrogenated Soyabean Oil',[35,36]),
 '2.2.4(11)':('Peanut Butter',[41,42]),
 '2.2.5(1)':('Table Margarine',[43,44]),
 '2.2.5(2)':('Bakery and Industrial Margarine',[44,45,46]),
 '2.2.5(3)':('Fat Spread',[46,47]),
 '2.2.6(1)':('Vanaspati',[48,49]),
 '2.2.6(2)':('Bakery Shortening',[49,50]),
 '2.2.9':('Solvent Extracted Crude Vegetable Oils - Not for Direct Human Consumption',[56,57]),
 '2.2.7':('Selected fatty-acid profiles',[50,51,52,53,54,55]),
 '2.2.8':('Selected peroxide-value classes',[55,56]),
 'PRS 2.3.14(21)':('Industrial trans fatty acids',[6]),
 'PRS 2.3.15(6)':('Residual hexane',[7])
}
rules=[];counts={}
def add(k,p,op,v=None,u='%',basis='as-sold product',when=None,kind='numeric',**extra):
 counts[k]=counts.get(k,0)+1
 r={'id':k+':r5:'+str(counts[k]),'standard_key':k,'parameter':p,'operator':op,'unit':u,'analytical_basis':basis,'when':when or {},'kind':kind,'source_clause':k,'source_pdf_pages':S[k][1],'source_url':PRS if k.startswith('PRS') else URL,'source_content_status':'SOURCE_EDITION_ROW_RECONCILED','current_law_verified':False,'product_approved':False,'automatic_comparison_allowed':kind in ['numeric','formula']}
 if op=='range':r.update(min=v[0],max=v[1])
 elif v is not None:r['value']=v
 r.update(extra);rules.append(r);return r
def neg(k,w=None):add(k,'Argemone oil','negative','Negative','qualitative','named test',w,'qualitative',note='Negative is not a universal numeric zero concentration or validated detection limit.')
def ri(k,br,index,w=None):
 g=k+':refractometry'+json.dumps(w or {},sort_keys=True)
 add(k,'Butyro-refractometer reading at 40°C','range',br,'BR units','oil at 40°C',w,alternative_group=g)
 add(k,'Refractive index at 40°C','range',index,'dimensionless','oil at 40°C',w,alternative_group=g)
def av(k,v,w=None,basis='oil'):add(k,'Acid value','<=',v,'acid value',basis,w)
def tfa(k,basis='product by weight',w=None):add(k,'Trans fatty acids','<=',2,'%',basis,w,effective_from='2022-01-01')
def baud(k,v,basis='specified sample mixed with refined groundnut oil 20:80; Lovibond 1 cm cell',w=None):add(k,'Baudouin test colour','>=',v,'red units',basis,w,note='The 20:80 mixture is test preparation, not the sesame-oil recipe proportion.')
def vitamin(k,v,basis,w=None,carr=False):
 add(k,'Vitamin A','>=',v,'IU/g',basis,w)
 if carr:add(k,'Vitamin A identification','positive','Positive','qualitative','Carr-Price / antimony trichloride; IS 5886-1970 as cited',w,'qualitative',note='Named method identifier retained; no claim of current laboratory validation.')
def ffa(k,basis):
 g=k+':FFA_OR_AV';add(k,'Free fatty acids as oleic acid','<=',.25,'%',basis,alternative_group=g);add(k,'Acid value','<=',.5,'acid value',basis,alternative_group=g)
# Refined parent plus named source identity.
k='2.2.1(16)';av(k,.6);add(k,'Moisture','<=',.1,'%','oil by weight');tfa(k,'oil by weight');neg(k)
k='2.2.1(7)';ri(k,(58.6,61.7),(1.465,1.467));add(k,'Iodine value (Wijs)','range',(105,126),'iodine value','oil');add(k,'Saponification value','range',(182,193),'saponification value','oil');add(k,'Unsaponifiable matter','<=',20,'g/kg','oil');av(k,6,{'refining_state':'unrefined'});add(k,'Erucic acid','<=',2,'%','total fatty acids');neg(k);add(k,'Hydrocyanic acid ferric-chloride test','required','Conforms','qualitative','specified test',kind='qualitative');add(k,'Flash point','>=',250,'°C','Pensky-Martens closed test',{'extraction':'solvent'})
k='2.2.1(10)';w={'safflower_variant':'ordinary_domestic'};ri(k,(62.4,64.7),(1.4674,1.4689),w)
for p,op,v,u in [('Saponification value','range',(186,196),'saponification value'),('Iodine value (Wijs)','range',(135,148),'iodine value'),('Unsaponifiable matter','<=',1,'%')]:add(k,p,op,v,u,'oil',w)
av(k,6,{**w,'refining_state':'unrefined'});neg(k,w)
k='2.2.1(10.1)'
for variant,br,index,iv,sv,uns in [('high_oleic',(51,57.1),(1.460,1.464),(80,100),(186,194),10),('ordinary_imported',(61.7,66.4),(1.467,1.470),(136,148),(186,198),15)]:
 w={'safflower_variant':variant};ri(k,br,index,w);add(k,'Iodine value (Wijs)','range',iv,'iodine value','oil',w);add(k,'Saponification value','range',sv,'saponification value','oil',w);add(k,'Unsaponifiable matter','<=',uns,'g/kg','oil',w);av(k,4,{**w,'refining_state':'unrefined'});neg(k,w)
add(k,'Oleic acid','>=',70,'%','total fatty acids',{'safflower_variant':'high_oleic'})
k='2.2.1(28)'
for p,op,v,u,b in [('Refractive index at 40°C','range',(1.451,1.453),'dimensionless','oil at 40°C'),('Saponification value','range',(231,244),'saponification value','oil'),('Iodine value','range',(20,28),'iodine value','oil'),('Unsaponifiable matter','<=',1.5,'%','oil by weight'),('Free fatty acids as lauric acid','<=',5,'%','oil by weight'),('Slip melting point','range',(21,26),'°C','oil; slip-point test')]:add(k,p,op,v,u,b)
neg(k);add(k,'Flash point','>=',250,'°C','Pensky-Martens closed test',{'solvent_extracted_or_imported':True});add(k,'Residual n-hexane','<=',5,'mg/kg','refined oil',{'solvent_extracted_or_imported':True})
k='2.2.1(31)'
for p,op,v,u,b in [('Refractive index at 40°C','range',(1.467,1.477),'dimensionless','oil at 40°C'),('Saponification value','range',(188,194),'saponification value','oil'),('Iodine value','range',(128,150),'iodine value','oil'),('Unsaponifiable matter','<=',2,'%','oil by weight')]:add(k,p,op,v,u,b)
av(k,4,{'refining_state':'unrefined'});neg(k)
k='2.2.1(32)'
for p,op,v,u,b in [('Refractive index at 40°C','range',(1.452,1.468),'dimensionless','oil at 40°C'),('Saponification value','range',(167,192),'saponification value','oil'),('Iodine value','range',(65,70),'iodine value','oil'),('Unsaponifiable matter','<=',1.5,'%','oil by mass')]:add(k,p,op,v,u,b)
av(k,6,{'refining_state':'unrefined'});neg(k)
# Interesterified fat.
k='2.2.2';add(k,'Moisture','<=',.25,'%','product by weight');tfa(k);add(k,'Unsaponifiable matter','<=',2,'%','product by weight');add(k,'Free fatty acids as oleic acid','<=',.25,'%','product by weight');baud(k,2);vitamin(k,25,'product at packing; synthetic vitamin A',carr=True);add(k,'Aeration','<=',12,'% by volume','product',{'aerated':True});add(k,'Aeration gas','required','Nitrogen or other inert gas','identity','aeration gas',{'aerated':True},'qualitative');neg(k)
# Hydrogenated soy; do not inherit raw-soy fatty-acid ranges.
for k,index,br,iv,cloud in [('2.2.3(1)',(1.463,1.469),(55.6,64.8),(107,120),10),('2.2.3(2)',(1.463,1.467),(55.6,61.7),(95,110),25)]:
 add(k,'Moisture','<=',.1,'%','oil by weight');ri(k,br,index);add(k,'Saponification value','range',(189,195),'saponification value','oil');add(k,'Iodine value (Wijs)','range',iv,'iodine value','oil');av(k,.5);add(k,'Unsaponifiable matter','<=',1.5,'%','oil by weight');add(k,'Linolenic acid C18:3','<=',3,'%','oil by weight');add(k,'Cloud point','<=',cloud,'°C','oil; cloud-point test');add(k,'Flash point','>=',250,'°C','Pensky-Martens closed test');tfa(k,'oil by weight');neg(k)
for k in ['2.2.3(1)','2.2.3(2)']:add(k,'Residual n-hexane','<=',5,'mg/kg','refined oil',{'solvent_extracted_or_imported':True})
k='2.2.4(11)'
for p,op,v,b in [('Moisture','<=',3,'as-sold product by weight'),('Fat','>=',40,'dry product'),('Protein','>=',25,'dry product'),('Total ash','<=',5,'dry product'),('Salt as NaCl','<=',2,'as-sold product by weight')]:add(k,p,op,v,'%',b)
av(k,4,basis='extracted fat');neg(k)
# Margarine and spreads: analytical phase and OR groups are explicit.
for k in ['2.2.5(1)','2.2.5(2)']:
 add(k,'Fat','>=',80,'% m/m','as-sold product');add(k,'Moisture','range',(12,16),'% m/m','as-sold product');add(k,'Added common salt','<=',2.5,'%','as-sold product');neg(k)
k='2.2.5(1)';add(k,'Added skimmed milk powder','<=',2,'%','as-sold product');vitamin(k,30,'product at sale');add(k,'Melting point','range',(31,37),'°C','extracted fat; capillary slip method');add(k,'Unsaponifiable matter','<=',1.5,'%','extracted fat by weight');ffa(k,'extracted fat by weight');baud(k,2.5);tfa(k);add(k,'Starch','range',(100,150),'ppm','product',{'coloured_and_flavoured':True});add(k,'Sealed package net weight','<=',500,'g','retail package',{'coloured_and_flavoured':True})
k='2.2.5(2)';vitamin(k,30,'separated fat at packaging',carr=True);tfa(k,'separated fat by weight');ffa(k,'separated fat');baud(k,2);add(k,'Unsaponifiable matter','<=',2,'%','separated fat',{'rice_bran_exception':'not_used'});add(k,'Unsaponifiable matter','<=',2.5,'%','separated fat',{'rice_bran_exception':'declared_more_than_30'},requires={'rice_bran_percent':{'gt':30,'max':100},'rice_bran_declared':True})
k='2.2.5(3)';add(k,'Total fat','range',(40,80),'%','product by weight');add(k,'Moisture','range',(16,56),'%','product by weight');add(k,'Common salt','<=',2,'%','aqueous phase by weight');add(k,'Starch','range',(100,150),'ppm','product');add(k,'Acid value','<=',.5,'acid value','extracted fat');add(k,'Sealed package net weight','<=',500,'g','retail package')
for t in ['milk','mixed']:add(k,'Unsaponifiable matter','<=',1,'%','extracted fat by weight',{'spread_type':t})
add(k,'Unsaponifiable matter','<=',1.5,'%','extracted fat by weight',{'spread_type':'vegetable'});add(k,'Melting point','<=',37,'°C','extracted fat; capillary slip method',{'spread_type':'vegetable'});vitamin(k,25,'product at packing; synthetic vitamin A',{'spread_type':'vegetable'},carr=True);baud(k,2.5,'separated fat mixed with refined groundnut oil 20:80; Lovibond 1 cm cell',{'spread_type':'vegetable'})
for t in ['mixed','vegetable']:tfa(k,w={'spread_type':t})
# Vanaspati and shortening: conditional physical-rice-bran exception is not interpolated.
k='2.2.6(1)';add(k,'Refined sal-seed fat proportion','<=',10,'%','total oil mix');add(k,'Moisture','<=',.25,'%','product by weight');tfa(k);av(k,.6,basis='product fat');vitamin(k,25,'product at packing; synthetic vitamin A',carr=True);add(k,'Residual nickel','<=',1.5,'ppm','product');baud(k,2);neg(k);add(k,'Unsaponifiable matter','<=',2,'%','product fat',{'rice_bran_exception':'not_used'});add(k,'Unsaponifiable matter','<=',2.5,'%','product fat',{'rice_bran_exception':'declared_more_than_30'},requires={'rice_bran_percent':{'gt':30,'max':100},'rice_bran_declared':True})
add(k,'Unsaponifiable matter','<=',4,'%','product fat',{'rice_bran_exception':'physical_refining'},requires={'physical_rice_bran_refining':True,'rice_bran_percent':{'min':20,'max':100,'step':5,'offset':20},'oryzanol_percent':'formula_minimum'},note='Only source-stated 20%,25%,30%... rice-bran levels are automatically compared; all proviso evidence required.')
add(k,'Oryzanol for physical-rice-bran exception','formula',None,'%','product fat',{'rice_bran_exception':'physical_refining'},kind='formula',formula='0.20 + 0.05 * ((rice_bran_percent - 20) / 5)',requires={'physical_rice_bran_refining':True,'rice_bran_percent':{'min':20,'max':100,'step':5,'offset':20}},note='No extrapolation below 20% or between 5%-steps.')
k='2.2.6(2)';add(k,'Aeration','<=',12,'% by volume','product',{'aerated':True});add(k,'Aeration gas','required','Nitrogen or other inert gas','identity','aeration gas',{'aerated':True},'qualitative');add(k,'Vanaspati standard inheritance','required','2.2.6(1)','reference','complete parent requirements',kind='qualitative')
# Existing twelve crude-table rows were checked. Preserve values, normalize temperature.
crude=by['2.2.9']
for v in crude['variants']:
 k='2.2.9';w={'crude_oil':v['name']};add(k,'Moisture and insoluble impurities','<=',v['moisture_impurities_max_pct'],'%','crude oil by mass',w);rv=re.findall(r'\d+\.\d+',v['refractive_index']);temp=20 if 'at 20' in v['refractive_index'] else 40;add(k,'Refractive index at '+str(temp)+'°C','range',tuple(map(float,rv[:2])),'dimensionless','crude oil at '+str(temp)+'°C',w)
 for p,key,u in [('Saponification value','saponification','saponification value'),('Iodine value (Wijs)','iodine','iodine value')]:
  nums=[float(x) for x in re.findall(r'\d+(?:\.\d+)?',v[key])];add(k,p,'>=' if 'Min' in v[key] else 'range',nums[0] if 'Min' in v[key] else nums,u,'crude oil',w)
 av(k,v['acid_value_max'],w,'crude oil');add(k,'Unsaponifiable matter','<=',v['unsaponifiable_max_pct'],'%','crude oil by mass',w);add(k,'Flash point','>=',v['flash_point_min_c'],'°C','crude oil; Pensky-Martens closed cup',w)
add('2.2.9','Direct human consumption','prohibited','Not permitted before required refining','identity','crude intermediate',kind='qualitative')
# Six selected fatty-acid table columns. Source ND <=0.05%; '-' is unspecified.
acids=['C6:0','C8:0','C10:0','C12:0','C14:0','C16:0','C16:1','C17:0','C17:1','C18:0','C18:1','C18:2','C18:3','C20:0','C20:1','C20:2','C22:0','C22:1','C22:2','C24:0','C24:1']
profiles={
 'safflower_ordinary':'ND|ND|ND|ND|ND-.2|5.3-8.0|ND-.2|ND-.1|ND-.1|1.9-2.9|8.4-21.3|67.8-83.2|ND-.1|.2-.4|.1-.3|ND|ND-1.0|ND-1.8|ND|ND-.2|ND-.2',
 'safflower_high_oleic':'ND|ND|ND|ND-.2|ND-.2|3.6-6.0|ND-.2|ND-.1|ND-.1|1.5-2.4|70-83.7|9-19.9|ND-1.2|.3-.6|.1-.5|ND|ND-.4|ND-.3|ND|ND-.3|ND-.3',
 'rapeseed_low_erucic':'ND|ND|ND|ND|ND-.2|2.5-7|ND-.6|ND-.3|ND-.3|.8-3|51-70|15-30|5-14|.2-1.2|.1-4.3|ND-.1|ND-.6|ND-2.0|ND-.1|ND-.3|ND-.4',
 'palm_kernel_olein':'.7|2.9-6.3|2.7-4.5|39.7-47|11.5-15.5|6.2-10.6|.1|ND|ND|1.7-3|14.4-24.6|2.4-4.3|.3|.5|.2|ND|ND|ND|ND|ND|ND',
 'grapeseed':'-|-|-|-|.3|5.5-11|1.2|.2|.1|3-6.5|12-28|58-78|1|1|.3|-|.5|.3|-|.4|-',
 'moringa':'ND|.4|.4|.4|1.4|3-13|.9-2.9|.09|ND|2.5-8.5|67-78|4|2.5|2-4.2|1.2-3|ND|5-8|.3|ND|1-3.5|ND|1.4'
}
pages={'safflower_ordinary':[50,51,52],'safflower_high_oleic':[50,51,52],'rapeseed_low_erucic':[52,53],'palm_kernel_olein':[54],'grapeseed':[54,55],'moringa':[54,55]}
for profile,spec in profiles.items():
 tokens=spec.split('|');codes=acids+(['C26:0'] if profile=='moringa' else []);assert len(tokens)==len(codes)
 for acid,t in zip(codes,tokens):
  kw={'when':{'fatty_acid_profile':profile},'source_pdf_pages':pages[profile],'source_token':t};b='total fatty acids by gas-liquid chromatography'
  if t=='-':add('2.2.7',acid,'not_specified','—','%',b,kind='not_specified',**kw)
  elif t=='ND':add('2.2.7',acid,'<=',.05,'%',b,note='ND is <=0.05%, not zero.',**kw)
  elif t.startswith('ND-'):add('2.2.7',acid,'<=',float(t[3:]),'%',b,note='No positive minimum is imposed by ND-to-maximum.',**kw)
  elif '-' in t:add('2.2.7',acid,'range',tuple(map(float,t.split('-'))),'%',b,**kw)
  else:add('2.2.7',acid,'<=',float(t),'%',b,**kw)
for process,value in [('refined_non_olive',10),('cold_pressed_or_virgin_non_olive',15),('other_expelled',10)]:add('2.2.8','Peroxide value','<=',value,'meq active oxygen/kg','oil',{'peroxide_class':process})
add('PRS 2.3.14(21)','Industrial trans fatty acids','<=',2,'%','total oils/fats present in food',{'edible_oils_fats_used_as_ingredient':True},effective_from='2022-01-01',note='Natural dairy/meat/fish trans fats excluded by PRS definition; not a whole-product percentage.')
add('PRS 2.3.15(6)','Residual n-hexane','<=',5,'mg/kg','refined solvent-extracted oils/fats',{'extraction':'solvent'})
for k in ['2.2.1(10)','2.2.1(10.1)','2.2.1(31)']:add(k,'Hexane in expeller-pressed oil','absent','Free from hexane','qualitative','expeller-pressed oil',{'extraction':'expeller'},'qualitative',note='No numerical detection limit invented.')
# Resolve every actual Chapter 2.2 product; preserve all existing master/profile fields.
masterpath=ROOT/'fssai-product-helper-preview-01/data/product-master-v1.json';masterraw=masterpath.read_bytes();master=json.loads(masterraw);assert len(master['catalog_products'])==533
products=[]
for p in master['catalog_products']:
 if not p.get('rule_file','').endswith('/chapter-2-2-fats-oils-v1.json'):continue
 pid=p['id'];k=p['rule_key'];keys=[k];fixed={};choices={};fa=[];extra=[]
 if k=='2.2.1(16)':
  fixed.update(refining_state='refined',peroxide_class='refined_non_olive');keys.append('2.2.8');extra.append('PRS 2.3.15(6)')
  if 'grapeseed' in pid:keys+=['2.2.1(31)'];fa=['grapeseed']
  elif 'rapeseed' in pid:keys+=['2.2.1(7)'];fa=['rapeseed_low_erucic']
  elif 'safflower' in pid:keys+=['2.2.1(10)','2.2.1(10.1)'];fa=['safflower_ordinary','safflower_high_oleic'];choices['safflower_variant']=['ordinary_domestic','ordinary_imported','high_oleic']
  elif 'palm-kernel' in pid:keys+=['2.2.1(28)'];fa=['palm_kernel_olein']
  elif 'moringa' in pid:keys+=['2.2.1(32)'];fa=['moringa']
 elif k=='2.2.1(32)':fixed['refining_state']='unrefined';keys+=['2.2.8'];fa=['moringa'];choices['peroxide_class']=['cold_pressed_or_virgin_non_olive','other_expelled']
 elif k=='2.2.6':
  k='2.2.6(2)' if 'shortening' in pid else '2.2.6(1)';keys=['2.2.6(1)']+(['2.2.6(2)'] if k.endswith('(2)') else []);extra+=['PRS 2.3.15(6)']
 elif k in ['2.2.2','2.2.3(1)','2.2.3(2)']:extra+=['PRS 2.3.15(6)']
 if k in ['2.2.5(1)','2.2.5(2)','2.2.5(3)','2.2.4(11)']:extra+=['PRS 2.3.14(21)']
 if k in ['2.2.5(1)','2.2.5(2)','2.2.5(3)']:fixed['edible_oils_fats_used_as_ingredient']=True
 if k=='2.2.5(3)':choices['spread_type']=['milk','mixed','vegetable']
 if k=='2.2.9':choices['crude_oil']=[v['name'] for v in crude['variants']]
 if len(fa)==1:fixed['fatty_acid_profile']=fa[0]
 if fa:keys+=['2.2.7'];choices['fatty_acid_profile']=fa
 keys+=extra
 ids=[r['id'] for r in rules if r['standard_key'] in keys and not (r['standard_key']=='2.2.7' and r['when']['fatty_acid_profile'] not in fa) and not any(key in fixed and fixed[key]!=v for key,v in r['when'].items())]
 questions=[]
 if k=='2.2.5(3)':questions=['Final PRS 17 October 2024 amendment removes AGMARK wording from PRS 2.3.14(13), but Chapter 2.2 still contains it. No blanket certification conclusion across all enactments.']
 if k in ['2.2.6(1)','2.2.6(2)']:questions=['Physical-rice-bran oryzanol formula is not interpolated below 20% or between source-stated 5%-steps.']
 products.append({'id':pid,'name':p['name'],'standard_key':k,'source_standard_keys':keys,'rule_ids':ids,'fixed_context':fixed,'context_choices':choices,'source_questions':questions,'crude_intermediate':k=='2.2.9'})
assert len(products)==18 and len({p['id'] for p in products})==18
assert len(rules)==377 and sum(r['kind'] in ['numeric','formula'] for r in rules)==343
assert sum(r['standard_key']=='2.2.7' for r in rules)==127
assert sum(r['standard_key']=='2.2.9' and r['kind']=='numeric' for r in rules)==84
assert all(not r['current_law_verified'] and not r['product_approved'] for r in rules)
assert masterpath.read_bytes()==masterraw
# A semantic digest omits descriptive prose, but covers every comparison-relevant field.
fields=['id','standard_key','parameter','operator','value','min','max','unit','analytical_basis','when','kind','requires','alternative_group','effective_from','formula','source_clause','source_pdf_pages','source_url','source_token']
projection=[{k:r[k] for k in fields if k in r} for r in rules]
digest=hashlib.sha256(json.dumps(projection,sort_keys=True,ensure_ascii=False,separators=(',',':')).encode()).hexdigest()
expected=(ROOT/'fssai-helper/fats-oils-r5-expected-semantic-sha256.txt').read_text().strip()
assert digest==expected, 'Repository rows differ from the locally tested semantic registry'
for k,(name,pages_) in S.items():
 if k.startswith('PRS') or k in ['2.2.7','2.2.8']:continue
 if k not in by:
  by[k]={'key':k,'name':name,'status':'structured_source_edition_review','definition':'See exact source clause; no whole-product approval.'};m['standards'].append(by[k])
 s=by[k];s['source_content_review']={'batch_id':BATCH,'review_date':'2026-11-02','source':{'url':URL,'edition':'Version 5 (01.08.2025)','sha256':SHA,'pdf_pages':pages_},'scope':'Listed source-edition requirements only; targeted amendments, not exhaustive current law.','current_law_complete':False,'commercial_release_authorized':False}
 s['reviewed_requirements']=[r for r in rules if r['standard_key']==k]
 if 'composition' in s:s['legacy_composition_before_r5']=copy.deepcopy(s['composition'])
 if k!='2.2.9':s['composition']=copy.deepcopy(s['reviewed_requirements'])
 s['full_compliance_assessment_enabled']=False
by['2.2.6']['detailed_standard_keys']=['2.2.6(1)','2.2.6(2)']
by['2.2.6']['source_content_review']={'batch_id':BATCH,'scope':'Select Vanaspati or bakery-shortening child before comparison.','current_law_complete':False,'commercial_release_authorized':False}
by['2.2.5(3)']['packaging_reconciliation']=next(p['source_questions'][0] for p in products if p['standard_key']=='2.2.5(3)')
reg={'batch_id':BATCH,'review_date':'2026-11-02','source':{'url':URL,'edition':'Version 5 (01.08.2025)','sha256':SHA},'rules':rules,'products':products,'summary':{'products_reviewed':18,'product_specific_standard_sections':17,'shared_rule_sections':4,'requirement_records':377,'numeric_or_formula_records':343,'fatty_acid_table_records':127,'fatty_acid_profiles':6,'crude_oil_variants':12,'products_with_source_questions':3,'full_product_approvals':0},'semantic_sha256':digest,'current_law_complete':False,'commercial_release_authorized':False}
m['r5_source_review']=reg;m['source_content_reviewed_on']='2026-11-02';m['source_review_scope']='Selected source-edition requirements only. Existing source_verified_on is historical and is not current-law certification.'
PATH.write_text(json.dumps(m,ensure_ascii=False,indent=2)+'\n')
regpath=ROOT/'fssai-helper/fats-oils-review-r5-20261102.json';regpath.write_text(json.dumps(reg,ensure_ascii=False,indent=2)+'\n')
result={'products':18,'requirements':len(rules),'numeric_or_formula':343,'semantic_sha256':digest,'module_sha256':hashlib.sha256(PATH.read_bytes()).hexdigest(),'master_unchanged':masterpath.read_bytes()==masterraw,'full_product_approvals':0,'scope':'Same comparison-relevant rows as local R5; descriptive text/schema need not be byte-identical.'}
(ROOT/'fssai-helper/fats-oils-r5-application-result.json').write_text(json.dumps(result,indent=2)+'\n');print(json.dumps(result,indent=2))
