"""PMSV Chapter 2.4 source-edition reconciliation, 2 November 2026.
Only exact, preimage-checked data files are changed. Never grants legal/lot approval.
"""
from pathlib import Path
import argparse, copy, hashlib, json
DATE='2026-11-02'
MODULE='fssai-product-helper-preview-01/data/rules/chapter-2-4-cereals-v1.json'
MASTER='fssai-product-helper-preview-01/data/product-master-v1.json'
BEFORE_MODULE='236b518fed8ae59944e223e0db9c7bda5e1d7d32'
BEFORE_MASTER='8455b5b2dc61f906ad9121eb9da225f7b2f6d404'
SOURCE={'url':'https://www.fssai.gov.in/upload/uploadfiles/files/Chapter%202_4_Cereals_and_Cereal_products.pdf','edition':'Version 4 (07.05.2025)','sha256':'7f39921459923619bc3907e1e59f433fbfb5eb92ef3302ae24a8074c57bf572f'}
TABLES={}; UPDATES={}; QUESTIONS={}; NOTES={}; ROUTES={}; CONTEXTS={}
D='dry mass'; A='as-sold mass'; U='basis not expressly specified in this row'
def r(name,op,value,unit='%',basis=A,when=None,note=None,question=None):
    x={'parameter':name,'operator':op,'unit':unit,'analytical_basis':basis,'when':when or {},'automatic_comparison_allowed':op in ['<=','>=','<','>','range','open_range','='] and not question}
    if op in ['range','open_range']: x.update(min=value[0],max=value[1])
    else:x['value']=value
    if note:x['note']=note
    if question:x.update(interpretation_status='SOURCE_CLARIFICATION_REQUIRED',source_question=question)
    return x

def mx(name,v,basis=A,unit='%',**k):return r(name,'<=',v,unit,basis,**k)
def mn(name,v,basis=A,unit='%',**k):return r(name,'>=',v,unit,basis,**k)
def uric(**k):return mx('Uric acid',100,A,'mg/kg',**k)
def aa(v,basis=U,**k):return mx('Alcoholic acidity as H2SO4 (90% alcohol)',v,basis,**k)
def ai(v,**k):return mx('Ash insoluble in dilute HCl',v,D,**k)
def ash(v,**k):return mx('Total ash',v,D,**k)
def protein(v,**k):return mn('Protein (N x 6.25)',v,D,**k)
def size(v,sieve,op='>=',exempt=False,when=None):
    w=dict(when or {})
    if exempt:w['intermediate_not_for_direct_consumption']=False
    return r('Material passing '+sieve,op,v,'%', 'mass passed through '+sieve,w)
def settable(key,pages,rows,name=None,notes=None,questions=None,fields=None):
    TABLES[key]={'pages':pages,'rows':rows,'name':name}
    NOTES[key]=notes or []; QUESTIONS[key]=questions or []
    if fields:UPDATES[key]=fields

def foreign():return [mx('Foreign / extraneous matter',1),mx('Mineral matter within foreign matter',.25),mx('Animal-origin impurities within foreign matter',.1)]
def grain(moisture,other,damaged,weevilled,combined=None,heated=False):
    rows=[mx('Moisture',moisture,note='Pulverised grains heated at 130-133 C for 2 hours.' if heated else None)]+foreign()+[mx('Other edible grains',other),mx('Damaged grains',damaged),mx('Weevilled grains',weevilled,'kernel count','%'),uric()]
    if combined is not None:rows.append(mx('Combined foreign matter + other edible grains + damaged grains',combined))
    return rows

settable('2.4.1',[1,2],[mx('Moisture',14),ash(2),ai(.15),mn('Gluten',6,D),aa(.18,D),mx('Crude fibre',2.5,D),size(98,'500 micron IS sieve / 35 mesh',exempt=True),uric()])
settable('2.4.1(3)',[2,3],[mx('Moisture',13),ai(.1),protein(15),mn('Total dietary fibre',7,D),mx('Alcoholic acidity',.18,U),mn('Gluten',5,D),mx('Urease activity',.02,'pH rise','pH units',when={'soy_used':True}),uric()],fields={'formulation_rules':[mx('Combined added protein-rich ingredients',15,'formulation mass')]})
settable('2.4.2',[3,4],[mx('Moisture',14),ash(1),ai(.1),mn('Gluten',7.5,D),aa(.12,D),size(98,'212 micron / 70 mesh',exempt=True),uric()])
settable('2.4.2(3)',[4,5],[mx('Moisture',12),ai(.1),protein(15),mn('Total dietary fibre',3,D),mx('Alcoholic acidity',.12,U),mn('Gluten',6,D),mx('Urease activity',.02,'pH rise','pH units'),uric()],fields={'permitted_ingredients':['maida','solvent extracted groundnut flour','solvent extracted soya flour','whey protein powder'],'formulation_rules':[mx('Combined added protein-rich ingredients',15,'formulation mass'),mx('Solvent extracted soya flour',10,'formulation mass'),mx('Whey protein powder',5,'formulation mass')]},notes=['The source does not state the protein-atta urease footnote for protein-maida; no soy-use exemption is inferred here.'])
settable('2.4.2(4)',[5],[mx('Moisture',13),ash(1.75),ai(.15),protein(11),aa(.12),size(80,'315 micron silk gauze or man-made textile sieve')])
settable('2.4.3',[5,6],[mx('Moisture',14.5),ash(1),ai(.1),mn('Gluten',6,D),aa(.15,D),uric()],notes=['This is semolina/suji/rawa, not the preceding durum-maida table.'])
settable('2.4.4',[6],[mx('Moisture',12),mx('Ash insoluble in dilute HCl',.3,U),aa(.18,A),protein(20),uric()])
settable('2.4.5',[6,7],[mx('Other foodgrains',1,when={'barley_form':'pearl_grain'}),mn('Starch',98,when={'barley_form':'barley_powder'}),ash(1,when={'barley_form':'barley_powder'}),ai(.1,when={'barley_form':'barley_powder'}),mx('Crude fibre',.5,D,when={'barley_form':'barley_powder'}),aa(.10,when={'barley_form':'barley_powder'})],notes=['The powder paragraph is separate from the pearl-grain definition. Powder figures must not be imposed on whole pearl barley.'])
settable('2.4.5(2)',[7],[mx('Moisture',14,note='130-133 C for 2 hours.'),ash(3),ai(.5),aa(.17,D)])
settable('2.4.6',[7,8],[],notes=['Select the exact named grain subclause. No universal 12% combined-defect limit is specified in the parent definition.','The catalogue identity Bean is insufficient to choose a pulse species/processing standard.'],questions=['Exact botanical identity and processing form are required for the generic Bean catalogue record.'])
settable('2.4.6(2)',[8,9],grain(14,6,6,10,12,True)+[mx('Karnal-bunt affected grains within damaged grains',3),mx('Ergot affected grains',.05),mx('Deoxynivalenol',1000,A,'microgram/kg')],name='Wheat')
settable('2.4.6(3)',[9],grain(16,3,5,10,9,True),name='Maize')
settable('2.4.6(15)',[10],grain(16,6,5,10,12,True),notes=['Residual category only; not a substitute for a specifically named grain standard.'])
settable('2.4.6(16)',[11],[mx('Foreign matter',3),mx('Inorganic matter plus animal-origin impurities within foreign matter',.5)],notes=['Unprocessed whole raw pulses not for direct human consumption. Other applicable standards still apply; these two rows are not a complete panel.'])
settable('2.4.6(17)',[11,12],grain(14,3,3,2)+[mx('Insect-bored grains within weevilled grains',.5,'kernel count'),mn('Test weight',46,'bulk volume','kg/hl'),mx('Hull-less and broken kernels',5),mx('Ergot (Claviceps purpurea)',.05)])
settable('2.4.6(18)',[13,14],[mx('Moisture',12)]+foreign()+[mx('Other edible grains',.5),mx('Damaged grains',3),uric(),mx('Saponin',.1)],notes=['Source identity includes removal of saponin by washing, scouring, dehulling or other suitable process.'])
settable('2.4.6(19)',[14,15],[mx('Moisture',13),mn('Protein',11,D),mn('Beta carotene',5,A,'ppm')]+foreign()+[mx('Other edible grains',3),mx('Damaged grains',4),mx('Weevil-affected grains',4,'count in 100 g','grains/100 g'),mn('Test weight',70,'bulk volume','kg/hl'),mx('Shrunken and broken kernels',6),mx('Ergot',.5),uric()])
settable('2.4.6(22)',[16,17],[mx('Moisture',14,when={'pulse_form':'whole'}),mx('Moisture',12,when={'pulse_form':'without_seed_coat'})]+foreign()+[mx('Seeds with serious defects',1),mx('Seeds with slight defects',7),mx('Broken pulses within slight defects',3),mx('Other edible pulses and grains',2),mx('Discoloured grains',3),uric()],notes=['Species and whole/dehusked/split form must match the named pulse definition.'])
settable('2.4.6(23)',[17,18,19],[mx('Moisture',13)]+foreign()+[mx('Other edible grains',2),mx('Grains with serious defects',1),mx('Grains with slight defects',7),mx('Weevilled grains',4,'kernel count'),mx('Immature and shrivelled grains',5),uric()],notes=['Applicable to named whole/dehulled millet and pseudo-millet species in the source, not automatically their flour or finished mixtures.'])
RT=['brown','milled','parboiled_brown','milled_parboiled']
rice=[]
for j,t in enumerate(RT):
 w={'rice_type':t}
 rice += [mx('Moisture',15.5,when=w),mx('Organic extraneous matter',[1.5,.8,1.5,.8][j],when=w),mx('Animal-origin impurities within organic extraneous matter',.1,when=w),mx('Inorganic extraneous matter',.2,when=w),mx('Weevilled kernels',5,'kernel count',when=w),mx('Damaged kernels including heat-damaged and pin-point damaged',[5,5,8,8][j],when=w),mx('Immature kernels',[12,.5,12,.5][j],when=w),uric(when=w)]
 rice += [r('Chalky kernels','nil','Nil','%',A,w)] if j==2 else [mx('Chalky kernels',[11,5,0,.1][j],when=w)]
settable('2.4.6(24)',[19,20,21],rice,notes=['Amendment marker 83 combines damaged, heat-damaged and pin-point-damaged kernels; the old separate row is omitted.','Nil is retained as a qualitative requirement, not converted into an invented analytical detection limit.'])
settable('2.4.6-24(a)',[21,22],[size(90,'250 micron / 60 mesh'),mx('Moisture',14),ai(.15),mx('Alcoholic acidity',.18,U),uric()],notes=['Rice flour specifically for manufacture of fortified rice kernels; not general rice flour or FRK itself.'])
settable('2.4.6(25)',[25,26],[mx('Moisture',11.5)]+foreign()+[mx('Other edible grains',.5),mx('Damaged grains',3),r('1000-grain mass','range',[1.2,1.6],'g','1000 grains'),mx('Acidity of extracted fat',2,'extracted fat','mg KOH/g'),uric()],name='Chia Seeds')
basm=[]
for j,t in enumerate(RT):
 w={'rice_type':t}; nw={**w,'broken_basmati':False}
 basm += [mn('Average grain length',[7,6.61,7,6.61][j],'grain length','mm',when=nw),mn('Average length/breadth ratio',3.5,'length / breadth','ratio',when=nw),mn('Average cooked grain length',12,'cooked grain length','mm',when=nw),r('Average volume expansion ratio','>',3.5,'ratio','cooked / raw rice volume',nw),mx('Average pre-cooked milled grain breadth',2,'grain breadth','mm',when=nw),mn('Elongation ratio after cooking',[1.7,1.7,1.5,1.5][j],'cooked / uncooked grain length','ratio',when=nw),mx('Moisture',14,when=w),mx('Organic extraneous matter',1,when=w),mx('Inorganic extraneous matter',.1,when=w),mx('Paddy grains',[.8,.3,.3,.3][j],when=w),mx('Other non-basmati varieties',15,when=w),mx('Under-milled, red-striped or red grains',3.5,when=w),mx('Chalky grains',[7,7,2,1][j],when=w),mx('Broken grains and fragments',5,when=nw),mx('Damaged/discoloured grains',1,when=w),r('Amylose','range',[20,25],'%',D,w),r('Alkali spreading value','range',[4,7],'ASV','ASV scale',w),uric(when=w)]
 basm += [r('Green grains','nil','Nil','%',A,w)] if j in [1,3] else [mx('Green grains',6,when=w)]
 basm += [mx('Broken grains and fragments',5,when={**w,'broken_basmati':True},question='The broken-basmati note exempts rows 1-6 only and says other rows apply, while row 15 limits broken fragments to 5%. Resolve this source scope before assessing an intentionally broken grade.')]
settable('2.4.6(26)',[26,27,28,29],basm,name='Basmati Rice',notes=['Named Seeds Act basmati varieties and natural fragrance are identity conditions.','Broken types Tibar, Dubar, Mini Dubar, Mogra and Mini Mogra: rows 1-6 exempt; the type must be declared on the label.','PCR confirmation of variety is stated when required.'])
settable('2.4.6(27)',[30],copy.deepcopy(rice),name='Blended Rice',notes=['Mixture of basmati and/or non-basmati rice; apply the respective rice types in clause 2.4.6(24), not all basmati identity/length requirements.','Label the name, type and percentage of each rice in the mixture.'])
settable('2.4.6(28)',[30,31],grain(14,5,5,5,8),name='Triticale')
settable('2.4.7',[31,32],[mx('Moisture',12),ash(.5),ai(.1),aa(.1,A),mn('Starch',98,D),r('pH','range',[4.5,7],'pH','aqueous preparation'),mx('Sulphur dioxide',70,A,'ppm'),uric()])
settable('2.4.8',[32],[mx('Moisture',7.5),mx('Total ash excluding salt',1,D),ai(.1),mx('Alcoholic acidity (90% alcohol)',2,'100 g dried substance','mL 1N NaOH/100 g')])
settable('2.4.9',[32,33],[mx('Moisture',12.5),mx('Total ash excluding added common salt',.5,D),ai(.1)])
settable('2.4.10',[33],[mx('Moisture',12.5),ai(.1)],notes=['Macaroni/pasta product panel; instant noodles use the separate clause 2.4.10(2).'])
settable('2.4.10(2)',[33,34],[mx('Moisture',10,when={'noodle_process':'fried'}),mx('Moisture',13,when={'noodle_process':'non_fried'}),ai(.3),mx('Acid value',2,U,'unit not printed',when={'noodle_process':'fried'},question='The table gives acid value 2.0 but no unit/sample fraction. Confirm the applicable method before numeric comparison.')],name='Instant Noodles',notes=['The standard excludes accompanying seasoning; label that seasoning distinctly.','The non-fried acid-value cell is blank, not zero and not an inferred exemption from other applicable safety requirements.'])
# Malt and oat products. The separate formulated-child-supplement nutrient schedule is not reviewed here.
milk=[]
for cocoa in [False,True]:
 w={'cocoa_added':cocoa}
 milk += [mx('Moisture',5,when=w),protein(11.25 if cocoa else 12.5,when=w),mn('Total fat',6 if cocoa else 7.5,D,when=w),ash(5,when=w),ai(.1,when=w),mn('Solubility',80 if cocoa else 85,A,when=w),mx('Bacterial count',50000,'sample mass','count/g',when=w),mx('Coliform count',10,'sample mass','count/g',when=w)]
 if cocoa:milk.append(mn('Cocoa powder',5,D,when=w))
 else:milk.append(r('Test for starch','qualitative','Negative','result','test',w))
for name in ['Yeast and mould','Salmonella and Shigella','E. coli','Vibrio cholerae and V. parahaemolyticus','Faecal streptococci and Staphylococcus aureus']:
 milk.append(r(name,'absent','Absent in 0.1 g','result','0.1 g',{'cocoa_added':True}))
settable('2.4.11(1)',[34,35,36],milk,questions=['The source table prints absence requirements in the cocoa column while the plain column is blank for rows k-o. Original-notification/Appendix-B reconciliation for plain malted milk remains necessary; blank cells are not exemptions.'])
malt=[mx('Moisture',5),protein(7),ash(5),mx('Ash insoluble in dilute HCl',.1,A),aa(.30,D),mx('Total plate count',50000,'sample mass','count/g'),mx('Coliform count',10,'sample mass','count/g'),mx('Yeast and mould count',100,'sample mass','count/g')]
for name,mass in [('E. coli',10),('Salmonella and Shigella',25),('Vibrio cholerae and V. parahaemolyticus',.1),('Faecal streptococci and Staphylococcus aureus',.1)]:malt.append(r(name,'absent',f'Absent in {mass} g','result',f'{mass} g'))
settable('2.4.11(2)',[36,37],malt,notes=['These are the chapter-table assays, not a newly completed Appendix-B sample-plan review.'])
extract=[]
for t in ['diastatic','non_diastatic','brewery']:
 w={'malt_extract_type':t}
 extract += [mn('Density at 20 C',1.39,'20 C','unit not printed',when=w,question='The table prints a density number but no unit/reference density; resolve the adopted method before numerical automation.'),mn('Refractive index at 20 C',1.489,'20 C','refractive index',when=w),mn('Total solids',55 if t=='brewery' else 77,A,when=w),r('Reducing sugar as anhydrous maltose','range',[55,65],'%',D,w),mn('Crude protein',2.5 if t=='brewery' else 3.5,D,when=w),r('Test for starch','qualitative','Negative','result','test',w)]
settable('2.4.11(3)',[37,38],extract)
oats=[]
for t in ['rolled_flaked','containing_oats']:
 w={'oat_product_type':t}; oats += [mx('Moisture',12,when=w),ai(.1 if t=='rolled_flaked' else .5,when=w),aa(.18,when=w),uric(when=w)]
 if t=='rolled_flaked':oats += [protein(10,when=w),mx('Crude fibre',2,D,when=w)]
settable('2.4.12',[49,50],oats,notes=['Rolled/flaked and other oat-containing products have different ash limits. No protein/fibre value is inferred for the blank cells of the latter.'])
# Solvent extracted flours: include the chapter-specific solvent and microbiological rows.
for key,pages,moist,total,insol,prot,fibre in [('2.4.13(1)',[51],9,7.2,.4,48,4.2),('2.4.13(2)',[52],8,5,.38,48,5),('2.4.13(3)',[52,53],9,6,.15,47,6),('2.4.13(4)',[53],9,6,.35,22,9),('2.4.13(5)',[54],8,5,.35,47,5)]:
 rows=[mx('Moisture',moist),ash(total),ai(insol),protein(prot),mx('Crude fibre',fibre,D),mx('Fat',1.5,D),mx('Total bacterial count',50000,'sample mass','count/g'),mx('Coliform bacteria',10,'sample mass','count/g'),r('Salmonella','absent','Nil in 25 g','result','25 g'),mx('Residual food-grade hexane',10,A,'ppm')]
 if key=='2.4.13(3)':rows.append(mx('Oxalic acid',.5,D))
 if key=='2.4.13(5)':rows.extend([mn('Available lysine',3.6,'crude protein','g/100 g crude protein'),mx('Free gossypol',.06,D),mx('Total gossypol',1.2,D)])
 settable(key,pages,rows,notes=['Source-edition solvent/microbiology rows are preserved; current residue rules, Appendix B and laboratory methods require separate reconciliation.'])
sago=[]
for t in ['tapioca_sago','palm_sago_starch']:
 w={'starchy_food_type':t};sago += [mx('Moisture',12,when=w),ash(.4,when=w),ai(.1,when=w),mn('Starch',96,D,when=w),mx('Protein',.3,D,when=w),mx('Crude fibre',.2,D,when=w),r('pH of aqueous extract','range',[4.5,7],'pH','aqueous extract',w),r('Colour of gelatinized alkaline paste','compound','Not deeper than 0.4R + 1.5Y','Lovibond','porcelain plate',w),mx('Sulphur dioxide',100,A,'ppm',when=w),r('Colouring matter','absent','Absent','result','sample',w)]
settable('2.4.14',[55],sago,notes=['The chapter gives arrowroot identity only. The tapioca table expressly applies also to palm sago starch, not automatically to arrowroot.'])
settable('2.4.15(1)',[55,56],[ai(.1),mx('Acidity of extracted fat as oleic acid',2,'extracted fat')],notes=['Includes wafer biscuits, coated/filled and stated low-fat/low-sugar variants. No automatic waiver of these two requirements.'])
settable('2.4.15(2)',[56,57],[mx('Alcoholic acidity (90% alcohol)',7.5,'100 g dried substance','mL 1N NaOH/100 g',when={'bakery_type':'bread'}),mx('Acidity of extracted fat as oleic acid',1.5,'extracted fat',when={'bakery_type':'rusk'}),ai(.2)],fields={'formulation_rules':[mx('Trehalose',10,'formulation mass'),mx('Oligofructose',15,'formulation mass')]},notes=['Bread and rusk acidity tests use different analytes/units and are not interchangeable.'])
settable('2.4.16(2)',[57,58],[mx('Moisture',9),ash(4.5),ai(.35),protein(45),mx('Crude fibre',5,D),mx('Fat',9,D),mx('Acid value of extracted fat',4,'extracted fat','% as printed',question='The source says acid value but prints per cent. Do not silently convert to mg KOH/g or % oleic acid; original/method reconciliation is required.')])
settable('2.4.17',[58,59],[mx('Moisture',13),ai(.15),protein(8),mx('Fat',7,D),mx('Crude fibre',2.5,D),aa(.25,D),r('Particle size','qualitative','Shall pass through 1 mm sieve (18 mesh)','result','sieve test',{'intermediate_not_for_direct_consumption':False}),uric()])
settable('2.4.18',[59,60],[mx('Moisture',12),ai(.15),protein(8.5),mx('Crude fat',4.7,D),aa(.18,D),size(80,'1 mm / 18 mesh',exempt=True),uric()])
settable('2.4.19',[60,61],[mx('Moisture',12)]+foreign()+[mx('Other edible grains',1),mx('Immature, shrivelled and green seeds',6),mx('Weevilled seeds',2,'source heading conflicts','count/100 g versus % count',question='The source heading mixes number of grains/100g with maximum percentage. Establish the denominator from the original/method before comparing.'),mx('Damaged, split or cracked seeds',4),mn('Oil content',13,D),mx('Acid value of extracted oil',2.5,'extracted oil','unit not printed',question='The acid-value unit is not printed in the table; validate the analytical-method unit before automation.'),uric()])
soy=[]
for t,lo,hi,fibre in [('flour',50,65,5),('concentrate',65,90,6),('isolate',90,None,.5)]:
 w={'soy_protein_type':t};soy += [mx('Moisture',10,when=w),ash(8,when=w),mx('Crude fibre',fibre,D,when=w)]
 soy += [r('Crude protein','open_range',[lo,hi],'%','dry mass excluding added vitamins, minerals, amino acids and food additives',w)] if hi else [r('Crude protein','>',lo,'%','dry mass excluding added vitamins, minerals, amino acids and food additives',w)]
settable('2.4.20',[62,63],soy,notes=['Strict source inequalities are retained: >50 and <65; >65 and <90; >90. The values 65 and 90 are not silently treated as inclusive.'])
settable('2.4.21',[63,64],[mx('Moisture',13),ash(3),protein(8),mn('Crude fat',3.1,D),size(95,'1.19 mm / 16 mesh')])
wheatprot=[]
for t in ['vital','devitalized','solubilized']:
 w={'wheat_protein_type':t};wheatprot += [mx('Moisture',10,when=w),protein(60 if t=='solubilized' else 80,when=w),ash(10 if t=='solubilized' else 2,when=w)]
settable('2.4.22',[65,66],wheatprot,notes=['Optional-ingredient permission in paragraph 2 is for solubilized wheat proteins, not a blanket permission for vital/devitalized gluten.'],fields={'optional_ingredient_scope':'solubilized wheat proteins only'})
durum=[]
for t in ['durum','whole_durum']:
 w={'durum_semolina_type':t};durum += [mx('Moisture',12,when=w),ash(2.1 if t=='whole_durum' else 1.3,when=w),ai(.1,when=w),mn('Protein (N x 5.7)',11.5 if t=='whole_durum' else 10.5,D,when=w),aa(.18,when=w),size(80,'500 micron silk gauze or man-made textile sieve',op='<=',when=w),uric(when=w)]
settable('2.4.23',[66,67],durum,notes=['The table explicitly says maximum 80% passing the 500-micron sieve, not minimum. The protein conversion factor is 5.7, not 6.25.'])
degerm=[mx('Moisture',14),ash(1),protein(7),mx('Crude fat',2.25,D)]
for t,sieves in [('meal',[(95,'0.85 mm / 20 mesh','>='),(45,'0.71 mm / 25 mesh','>='),(25,'0.210 mm / 70 mesh','<=')]),('grits',[(95,'2 mm / 10 mesh','>='),(20,'0.71 mm / 25 mesh','<=')])]:
 for v,sieve,op in sieves:degerm.append(size(v,sieve,op,True,{'degermed_maize_type':t}))
settable('2.4.24',[68,69],degerm,notes=['All sieve conditions for the selected type apply together. The intermediate-product exception applies only to particle size.'])
settable('2.4.25',[69,70],[mx('Moisture',13),ash(1.1),r('Granularity','compound','600-2000 microns with 6% tolerance','micron','particle size distribution')],fields={'formulation_rules':[r('Fine semolina proportion','range',[20,30],'%','semolina mixture',{'couscous_blend':'coarse_fine'}),r('Coarse semolina proportion','range',[70,80],'%','semolina mixture',{'couscous_blend':'coarse_fine'}),r('Coarse semolina proportion','range',[25,30],'%','semolina mixture',{'couscous_blend':'coarse_medium'}),r('Medium semolina proportion','range',[70,75],'%','semolina mixture',{'couscous_blend':'coarse_medium'})]},notes=['The 6% granularity tolerance is retained as a compound requirement; it is not interpreted as an automatic expansion of both particle-size bounds.'])
settable('2.4.26',[70],[mx('Moisture',65),mn('Protein',15,D),mn('Fat',7,D),mx('Crude fibre',2.5,D),r('Urease index','range',[.05,.2],'pH units','pH rise')])
settable('2.4.27',[70,71],[mx('Moisture',7),protein(50),mx('Fat',1,D),ash(8),mx('Crude fibre',3.5,D),ai(.3),mx('Residual hexane',10,A,'ppm'),r('Urease index','range',[.05,.2],'pH units','pH rise')],notes=['A draft proposing 8.5% moisture was located, but no final adoption was established in this review. Retain the 7% value in the identified source edition, with current-law reconciliation still open.'])
settable('2.4.28',[71,72],[mx('Moisture',13),mx('Ash / inorganic extraneous matter',.5),mx('Acidity',220,'100 g sample','mg KOH/100 g',question='The source row includes mg KOH/100g and also per cent by mass. Numeric value and explicit titration unit are retained, but the inconsistent wording is not automatically resolved.'),mn('Starch',96),mx('Crude fibre',.2),size(95,'100 mesh')])
settable('2.4.29',[72],[mx('Moisture',12.5),protein(9),mx('Crude fibre',12,A),ai(.25),mx('Acid value',6,U,'unit not printed',question='The table gives acid value 6 without a unit/sample fraction. Check the adopted method before numerical comparison.')])
nonfermented=[]
soy_types=['plain_beverage','composite_beverage','soy_based_beverage','semisolid_curd','curd','compressed_curd','dehydrated_film']
for t,threshold in zip(soy_types,[2,2,[.8,2],2.5,3.5,13,30]):
 w={'soy_product_type':t}
 nonfermented.append(r('Protein','source_expression',threshold,'g/100 g',A,w,note='Table wording: not less than or equal to the stated threshold; soy-based beverage additionally not more than 2.0.',question='The source uses the nonstandard wording "not less than or equal to". Confirm the intended boundary from the original/clarification rather than silently selecting >= or >.'))
 nonfermented.append(r('Urease index','range',[.05,.2],'pH units','pH rise',w))
 if t=='semisolid_curd':nonfermented.append(mn('Moisture',92,A,'g/100 g',when=w))
 if t in ['curd','compressed_curd','dehydrated_film']:
  limit={'curd':92,'compressed_curd':75,'dehydrated_film':20}[t]
  nonfermented.append(r('Moisture','source_expression',limit,'g/100 g',A,w,note='Not more than or equal to '+str(limit),question='The source says "not more than or equal to". The intended inclusive/exclusive boundary requires clarification.'))
w={'soy_product_type':'tofu'}
nonfermented += [mx('Moisture',76,when=w),r('Total ash','range',[.3,2],'%',A,w),mn('Protein',8,D,when=w),r('Fat','range',[2,5],'%',A,w),r('Crude fibre','range',[.5,6],'%',D,w),mx('Titratable acidity as lactic acid',1.5,U,when=w),r('Urease index','range',[.05,.2],'pH units','pH rise',w)]
settable('2.4.30',[72,73,74,75],nonfermented,notes=['Tofu has its own paragraph-5 panel. Do not substitute the paragraph-3 general curd/beverage table.','The allowed coagulating agents and permitted ingredient standards remain separately applicable.'])
gari=[mx('Moisture',12)]+foreign()+[r('Total acidity as lactic acid','range',[.6,1],'%',U),mx('Crude fibre',2,U),mx('Total ash',2.75,U),ai(.5)]
for t,sieve1,sieve2,op in [('extra_fine','0.5 mm','0.25 mm','>='),('fine','1 mm','0.5 mm','<='),('medium','1.25 mm','1 mm','<='),('coarse','2 mm','1.25 mm','<=')]:
 w={'gari_grade':t};gari += [size(100,sieve1,when=w),size(40,sieve2,op,when=w)]
settable('2.4.31',[75,76,77],gari,notes=['The two size constraints for each grade apply together; do not replace AND with OR.'])
settable('2.4.32',[77,78],[mx('Moisture',13),mx('Crude fibre',2,U),mx('Total ash',3,U),ai(.5),size(90,'0.6 mm',when={'cassava_flour_grade':'fine'}),size(90,'1.2 mm',when={'cassava_flour_grade':'coarse'})],notes=['Bitter-cassava detoxification is an identity/process requirement, not waived by satisfying moisture or ash.'])
settable('2.4.33',[78,79],[mx('Moisture',8),ai(.5),mx('Alcoholic acidity',.15,A),mx('Crude fibre',3,D),protein(20),size(100,'35 mesh',exempt=True),uric()])
settable('2.4.34',[79],[mx('Moisture',10),mx('Crude fibre',4.5,D),protein(7),ai(.15),r('Particle size','qualitative','Shall pass through 1 mm sieve (18 mesh)','result','sieve test',{'intermediate_not_for_direct_consumption':False}),uric()])
settable('2.4.35',[80,81],[mx('Moisture',10,when={'breakfast_moisture_class':'containing_dehydrated_or_candied_fruit_seeds_nuts_wholegrains'}),mx('Moisture',7.5,when={'breakfast_moisture_class':'all_others'}),ai(.1)],fields={'formulation_rules':[mn('Whole grain',25,D,when={'wholegrain_claim':True})]},notes=['The 10% versus 7.5% moisture class must be established from actual ingredients. The source says "etc."; an unlisted ingredient does not automatically establish the 10% class.'])
settable('2.4.36',[81],[mx('Moisture',12),mn('Protein',22,D),ai(.3),mx('Alcoholic acidity',.18,U),uric()])
settable('2.4.37',[81,82],[mx('Moisture',13),ai(.15),mn('Gluten',3,D),protein(10),mn('Total dietary fibre',12,D),mx('Alcoholic acidity',.18,D),size(98,'40 mesh'),mx('Urease activity',.02,'pH rise','pH units',when={'soy_used':True}),uric()],fields={'formulation_rules':[r('Whole wheat flour','range',[50,90],'%','formulation mass'),r('Other permitted flours','range',[10,50],'%','formulation mass')]},notes=['The source specifically conditions urease on soy use. It does not state the intermediate-product particle-size exemption here; none is inherited from atta.'])
settable('2.4.38',[82,83],[mx('Moisture',11),ai(.15),protein(8),mx('Alcoholic acidity',.18,D),mn('Total dietary fibre',12,D),size(98,'40 mesh'),uric()])
fermented=[]
for t,acidity,ph in [('fermented_curd',1.5,[4,4.5]),('named_cultures',1.7,[4,5])]:
 w={'fermented_soy_type':t};fermented += [r('Acidity as lactic acid','<',acidity,'%',U,w),mn('Protein',3,A,when=w),mx('Fat',2,A,when=w),r('pH','range',ph,'pH','sample',w),mn('Total solids',10,A,when=w),mx('Urease activity',.5,'pH change','pH units',when=w)]
settable('2.4.39',[83,84,85],fermented,fields={'formulation_rules':[mx('Added milk or reconstituted milk',25,'final product mass')]},notes=['Acidity inequalities are strict (<1.5 and <1.7), not <=.','Source label distinctions: Non-dairy product when without dairy; With low-dairy ingredients when with dairy. Broader naming/labelling requirements still need current-law reconciliation.'])
settable('2.4.40',[85],[mx('Moisture',15),ai(.25),aa(.2,D),uric()])
# Exact identity routing: preserve all catalogue IDs and original FSSR/FCS strings.
for suffix,key in {'wheat':'2.4.6(2)','maize':'2.4.6(3)','rice':'2.4.6(24)','any-other-foodgrains':'2.4.6(15)','unprocessed-whole-raw-pulses-not-for-direct-human-consumption':'2.4.6(16)','oats':'2.4.6(17)','quinoa':'2.4.6(18)','durum-wheat':'2.4.6(19)','pulses':'2.4.6(22)','millets':'2.4.6(23)','chia-seeds':'2.4.6(25)','basmati-rice':'2.4.6(26)','blended-rice':'2.4.6(27)','triticale':'2.4.6(28)'}.items():ROUTES['06-06-1-'+suffix]=key
ROUTES['06-06-4-macaroni-products-instant-noodle']='2.4.10(2)'
CONTEXTS={'06-06-1-pearl-barley-jau':{'barley_form':'pearl_grain'},'06-06-2-arrowroot':{'starchy_food_type':'arrowroot'},'06-06-2-tapioca-sago':{'starchy_food_type':'tapioca_sago'},'06-06-2-palm-sago-starch':{'starchy_food_type':'palm_sago_starch'},'06-06-8-compressed-soybean-curd':{'soy_product_type':'compressed_curd'},'06-06-8-dehydrated-soybean-curd-film':{'soy_product_type':'dehydrated_film'},'06-06-8-tofu':{'soy_product_type':'tofu'},'06-06-8-fermented-soybean-curd':{'fermented_soy_type':'fermented_curd'},'06-06-8-fermented-soybean-curd-made-with-s-thermophillus-l-bulgaricus':{'fermented_soy_type':'named_cultures'}}
# Limit family choices without prematurely choosing a subtype for grouped catalogue entries.
CHOICES={'06-06-8-soybean-beverages-and-related-products':{'soy_product_type':['plain_beverage','composite_beverage','soy_based_beverage']},'06-06-8-soybean-curd-and-related-products':{'soy_product_type':['semisolid_curd','curd']}}

def blob_sha(data):return hashlib.sha1(b'blob '+str(len(data)).encode()+b'\0'+data).hexdigest()
def write_json(path,data):
 path.parent.mkdir(parents=True,exist_ok=True);path.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
def apply(repo,out):
 path=repo/MODULE; raw=path.read_bytes()
 if blob_sha(raw)!=BEFORE_MODULE:raise RuntimeError('Cereal source changed: reconcile before applying, not overwrite.')
 master_raw=(repo/MASTER).read_bytes()
 if blob_sha(master_raw)!=BEFORE_MASTER:raise RuntimeError('Product master changed: reconcile before applying.')
 master=json.loads(master_raw); module=json.loads(raw); original=copy.deepcopy(master)
 bykey={s['key']:s for s in module['standards']}; review=[]; rules=[]
 for key,table in TABLES.items():
  if key not in bykey:
   s={'key':key,'name':table['name'],'definition':'Refer to the exact identity and process requirements in the linked official source.'};module['standards'].append(s);bykey[key]=s
  s=bykey[key]
  # Preserve identity descriptions from variant containers, without retaining obsolete limits.
  identities=[]
  for field in ['variants','types']:
   for item in s.get(field,[]):
    if isinstance(item,str):identities.append({'name':item})
    elif isinstance(item,dict):
     keep={k:copy.deepcopy(v) for k,v in item.items() if k in ['name','definition','description']}
     if keep:identities.append(keep)
  if identities:s['identity_variants']=identities
  # Replace only the numerical representations covered by this source-table review.
  for field in ['composition','general_limits','variants','types','microbiology','formulation_rules','particle_size_rules']:
   s.pop(field,None)
  s['composition']=copy.deepcopy(table['rows']);s.update(copy.deepcopy(UPDATES.get(key,{})))
  questions=list(QUESTIONS[key])
  for field in ['composition','formulation_rules']:
   for i,row in enumerate(s.get(field,[]),1):
    row['id']=f'{key}:{field}:{i}';row['source_pdf_pages']=table['pages'];row['source_clause']=key
    row['source_content_status']='REQUIRES_SOURCE_INTERPRETATION' if row.get('interpretation_status') else 'SOURCE_EDITION_ROW_RECONCILED'
    if row['analytical_basis']==U:row['automatic_comparison_allowed']=False
    row['current_law_verified']=False;row['product_approved']=False
    if row.get('source_question'):questions.append(row['source_question'])
    rules.append({'standard_key':key,'standard_name':s['name'],**copy.deepcopy(row)})
  questions=list(dict.fromkeys(questions))
  meta={'clause':key,'name':s['name'],'review_date':DATE,'batch_id':'CEREALS_R3_2026_11_02','scope':'Listed source-edition numerical tables, explicit variant conditions and selected formulation limits. Not a complete current-law, method or commercial-release assessment.','status':'REVIEWED_WITH_SOURCE_QUESTIONS' if questions else 'SOURCE_EDITION_NUMERIC_RECONCILED','source':{**SOURCE,'pdf_pages':table['pages']},'source_questions':questions,'general_source_questions':QUESTIONS[key],'notes':NOTES[key],'current_law_complete':False,'commercial_release_authorized':False,'remaining_scope':['Original-notification/current-amendment reconciliation beyond specifically checked provisions','Complete additive/processing-aid permissions','Current microbiological sample plans and contaminant/residue articles','Adopted analytical methods and units/bases where not printed','Packaging, labelling, claims and special-regulation applicability']}
  s['source_content_review']=meta;s['full_compliance_assessment_enabled']=False;s['conditional_rules_require_context']=True
  review.append(meta)
 module['source_content_review_batch']={'id':'CEREALS_R3_2026_11_02','date':DATE,'source':SOURCE,'standards':len(review),'numeric_approval_is_not_product_approval':True,'excluded_standard':'2.4.11(4) formulated supplements for children: detailed nutrient schedule not reviewed in this continuation.'}
 module['legacy_structured_core_standards']=module.get('structured_core_standards')
 module['structured_core_standards']=len(review)
 module['stored_standard_objects']=len(module['standards'])
 module['structured_core_standards_scope']='Number of standard objects reviewed in this source-edition batch; not a verified-products count.'
 module['source_content_review_batch']['amendment_83_recheck']={
  'url':'https://fssai.gov.in/upload/notifications/2024/10/671b28f9586dfGAZETTE%20NOTIFICATION%20DATED%2021.10.2024.pdf',
  'scope':'English parsed text of commencement and regulation 2.4.6 rice substitution/24A matched to the visually inspected compendium tables.',
  'general_commencement':'2025-05-01','24A_24B_24C_commencement':'Date of Gazette publication, per clause 1(2)',
  'evidence_limit':'Gazette PDF image retrieval returned 404 in this session; no local PDF hash or complete amendment review claimed.'}
 module['source_content_review_batch']['engine_integration']='Conditional row schema is review-only until the production consumer implements equivalent context and source-question guards. Do not deploy unadapted.'
 profile_index={p['id']:p for p in master['profiles']}; changed=[]
 for p in master['catalog_products']:
  if 'chapter-2-4-' not in p.get('rule_file',''):continue
  if p['rule_key']=='2.4.11(4)':continue
  key=ROUTES.get(p['id'],p['rule_key']);assert key in TABLES
  old=p['rule_key'];p['rule_key']=key
  p['source_content_review_batch']='CEREALS_R3_2026_11_02';p['source_content_review_date']=DATE
  p['rule_resolution_context']=CONTEXTS.get(p['id'],{})
  if p['id'] in CHOICES:p['rule_context_choices']=CHOICES[p['id']]
  profile=profile_index[p['profile_id']]
  profile['chapter_rule_key']=key;profile['source_content_review_batch']='CEREALS_R3_2026_11_02';profile['rule_resolution_context']=p['rule_resolution_context']
  if p['id'] in CHOICES:profile['rule_context_choices']=CHOICES[p['id']]
  changed.append({'id':p['id'],'name':p['name'],'old_key':old,'new_key':key,'fixed_context':p['rule_resolution_context'],'context_choices':p.get('rule_context_choices',{})})
 assert len(master['catalog_products'])==533 and len({x['id'] for x in master['catalog_products']})==533
 for p,old in zip(master['catalog_products'],original['catalog_products']):
  for k in ['id','name','fssr','fcs','profile_status','profile_id']:assert p.get(k)==old.get(k),(p['id'],k)
 write_json(out/'chapter-2-4-cereals-v1.json',module);write_json(out/'product-master-v1.json',master)
 result={'batch_id':'CEREALS_R3_2026_11_02','review_date':DATE,'source':SOURCE,'standards':review,'rules':rules,'products':changed,'summary':{'products_reviewed':len(changed),'standards_reviewed':len(review),'table_rule_records':len(rules),'numeric_records':sum(isinstance(x.get('value'),(int,float)) or 'min' in x or isinstance(x.get('value'),list) for x in rules),'source_question_records':sum(bool(x.get('interpretation_status')) for x in rules),'source_question_standards':sum(bool(x['source_questions']) for x in review),'exact_product_routes_corrected':sum(x['old_key']!=x['new_key'] for x in changed),'fully_regulatory_verified_new':0,'excluded_product':'formulated-supplements-children'},'module_before_blob':BEFORE_MODULE,'module_after_sha256':hashlib.sha256((out/'chapter-2-4-cereals-v1.json').read_bytes()).hexdigest(),'master_before_sha256':hashlib.sha256((repo/MASTER).read_bytes()).hexdigest(),'master_after_sha256':hashlib.sha256((out/'product-master-v1.json').read_bytes()).hexdigest()}
 write_json(out/'cereal-review-r3.json',result)
 print(json.dumps(result['summary'],indent=2));return result
if __name__=='__main__':
 ap=argparse.ArgumentParser();ap.add_argument('--repo',type=Path,required=True);ap.add_argument('--out',type=Path,required=True);a=ap.parse_args();apply(a.repo,a.out)
