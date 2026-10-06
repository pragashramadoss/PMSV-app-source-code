"""Compile official IFCT PDF coordinate text into validated, bounded table modules.

Usage: python3 scripts/build-ifct-modules.py --pdf IFCT2017.pdf --bbox tables-bbox.html
Generate bbox input with pdftotext -f 131 -l 475 -bbox-layout IFCT2017.pdf tables-bbox.html.
The PDF is the user-provided official ICMR-NIN publication; it is not rewritten.
"""
import argparse
import hashlib
import json
import re
import unicodedata
import xml.etree.ElementTree as ET
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1] / 'fssai-product-helper-preview-01'
RANGES = {4:(131,147),5:(151,206),6:(209,224),7:(227,294),8:(297,361),9:(364,381),10:(384,451),11:(454,471),12:(474,475)}
NAMES = {4:'carotenoids',5:'minerals',6:'starch-sugars',7:'fatty-acids',8:'amino-acids',9:'organic-acids',10:'polyphenols',11:'oligosaccharides-phytosterols',12:'oils-fatty-acids'}
TITLES = {4:'Carotenoids',5:'Minerals and trace elements',6:'Starch and individual sugars',7:'Fatty acid profile',8:'Amino acid profile',9:'Organic acids',10:'Polyphenols',11:'Oligosaccharides, phytosterols, phytates and saponins',12:'Fatty acid profile of edible oils and fats'}
EXPECTED = {4:329,5:528,6:314,7:528,8:528,9:314,10:314,11:314,12:14}
SOURCE_URL = 'https://www.nin.res.in/ebooks/IFCT2017_16122024.pdf'

# Abbreviations and units are taken from the original table headers.
LABELS = {
 'LUTN':'Lutein','ZEA':'Zeaxanthin','LYCPN':'Lycopene','CRYPXB':'Beta-cryptoxanthin','CARTG':'Gamma-carotene','CARTA':'Alpha-carotene','CARTB':'Beta-carotene','CARTOID':'Total carotenoids',
 'AL':'Aluminium','AS':'Arsenic','CD':'Cadmium','CA':'Calcium','CR':'Chromium','CO':'Cobalt','CU':'Copper','FE':'Iron','PB':'Lead','LI':'Lithium','MG':'Magnesium','MN':'Manganese','HG':'Mercury','MO':'Molybdenum','NI':'Nickel','P':'Phosphorus','K':'Potassium','SE':'Selenium','NA':'Sodium','ZN':'Zinc',
 'CHOAVL':'Total available carbohydrate','STARCH':'Total starch','FRUS':'Fructose','GLUS':'Glucose','SUCS':'Sucrose','MALS':'Maltose','FREESUG':'Total free sugars',
 'HIS':'Histidine','ILE':'Isoleucine','LEU':'Leucine','LYS':'Lysine','MET':'Methionine','CYS':'Cystine','PHE':'Phenylalanine','THR':'Threonine','TRP':'Tryptophan','VAL':'Valine','ALA':'Alanine','ARG':'Arginine','ASP':'Aspartic acid','GLU':'Glutamic acid','GLY':'Glycine','PRO':'Proline','SER':'Serine','TYR':'Tyrosine',
 'OXAL_TOTAL':'Total oxalate','OXAL_SOLUBLE':'Soluble oxalate','OXAL_INSOLUBLE':'Insoluble oxalate','CIS_ACONITIC':'Cis-aconitic acid','CITAC':'Citric acid','FUMAC':'Fumaric acid','MALAC':'Malic acid','QUINIC':'Quinic acid','SUCAC':'Succinic acid','TARAC':'Tartaric acid',
 'DIHYDROXY_BENZOIC':'3,4-Dihydroxybenzoic acid','HYDROXY_BENZALDEHYDE':'3-Hydroxybenzaldehyde','PROTOCATECHUIC':'Protocatechuic acid','VANILLIC':'Vanillic acid','GALLAC':'Gallic acid','CINNAMIC':'Cinnamic acid','O_COUMARIC':'O-Coumaric acid','P_COUMARIC':'P-Coumaric acid','CAFFEIC':'Caffeic acid',
 'CHLRAC':'Chlorogenic acid','FERAC':'Ferulic acid','APIGEN':'Apigenin','APIGENIN_6_C_GLUCOSIDE':'Apigenin-6-C-glucoside','APIGENIN_7_O_NEOHESPERIDOSIDE':'Apigenin-7-O-neohesperidoside','LUTEOL':'Luteolin','KAEMF':'Kaempferol','QUERCE':'Quercetin','QUERCETIN_3_B_D_GLUCOSIDE':'Quercetin-3-beta-D-glucoside','QUERCETIN_3_O_RUTINOSIDE':'Quercetin-3-O-rutinoside',
 'QUERCETIN_3_B_GALACTOSIDE':'Quercetin-3-beta-galactoside','ISORHAMNETIN':'Isorhamnetin','MYRICETIN':'Myricetin','RESVERATROL':'Resveratrol','HESPT':'Hesperetin','NARINGENIN':'Naringenin','HESPD':'Hesperidin','DAIDZN':'Daidzein','GNSTEIN':'Genistein','EPICATEC':'Epicatechin',
 'EPIGALLOCATECHIN':'Epigallocatechin','EPIGALLOCATECHIN_3_GALLATE':'Epigallocatechin-3-gallate','CATECHIN':'Catechin','GALLOCATECHIN_GALLATE':'Gallocatechin gallate','GALLOCATECHIN':'Gallocatechin','SYRINGIC':'Syringic acid','SINAPINIC':'Sinapinic acid','ELLAGIC':'Ellagic acid','TOTAL_POLYPHENOLS':'Total polyphenols',
 'RAFS':'Raffinose','STAS':'Stachyose','VERS':'Verbascose','AJUGOSE':'Ajugose','CAMT':'Campesterol','STGSTR':'Stigmasterol','B_SITOSTEROL':'Beta-sitosterol','PHYTAC':'Phytate','SAPONIN':'Total saponin',
 'FASAT':'Total saturated fatty acids','FAMS':'Total monounsaturated fatty acids','FAPU':'Total polyunsaturated fatty acids','CHOLC':'Cholesterol',
}
LABELS.update({'F4D0':'Butyric acid','F6D0':'Caproic acid','F8D0':'Caprylic acid','F10D0':'Capric acid','F11D0':'Undecanoic acid','F12D0':'Lauric acid','F14D0':'Myristic acid','F15D0':'Pentadecanoic acid','F16D0':'Palmitic acid','F18D0':'Stearic acid','F20D0':'Arachidic acid','F22D0':'Behenic acid','F24D0':'Lignoceric acid','F14D1':'Myristoleic acid','F16D1':'Palmitoleic acid','F18D1N9':'Oleic acid','F18D1TN9':'Elaidic acid','F20D1N9':'Eicosenoic acid','F22D1N9':'Erucic acid','F24D1N9':'Nervonic acid','F18D2N6':'Linoleic acid','F20D2':'Eicosadienoic acid','F18D3N3':'Alpha-linolenic acid','F20D3N6':'Eicosatrienoic acid','F20D4N6':'Arachidonic acid','F20D5N3':'Eicosapentaenoic acid','F22D2':'Docosadienoic acid','F22D5N3':'Docosapentaenoic acid','F22D6N3':'Docosahexaenoic acid'})

def cx(w): return (float(w.get('xMin')) + float(w.get('xMax'))) / 2
def cy(w): return (float(w.get('yMin')) + float(w.get('yMax'))) / 2
def text(w): return (w.text or '').strip()
def norm(s): return re.sub(r'[^a-z0-9]+','',unicodedata.normalize('NFKD',s).encode('ascii','ignore').decode().lower())

def header_columns(table, words, first_y):
    header = [w for w in words if cy(w) < first_y - 9 and cx(w) > 100]
    columns = {}
    def named(key, token, at=None):
        options = [w for w in header if text(w)==token]
        if at is not None: options = [w for w in options if abs(cx(w)-at)<15]
        if options: columns[key] = cx(max(options,key=cy))
    if table in (4,5,7,8,12):
        allowed = set(LABELS) if table!=7 and table!=12 else set(LABELS)|{text(w) for w in header if re.fullmatch(r'F\d+D\d+(?:T?N\d+)?',text(w))}
        for w in header:
            key = 'LEU' if text(w)=='LE' and table==8 else text(w)
            # Marine panels print ASN below the explicit Aspartic Acid heading.
            if key=='ASN' and table==8 and any(text(h)=='Aspartic' for h in header):key='ASP'
            accept = key in allowed and (table not in (7,12) or key.startswith('F') or key=='CHOLC' and table==7)
            if accept: columns[key] = cx(w)
    elif table==6:
        for key in ('STARCH','FRUS','GLUS','SUCS','MALS'): named(key,key)
        named('CHOAVL','CHO'); named('FREESUG','Sugars')
    elif table==9:
        for key in ('CITAC','FUMAC','MALAC','SUCAC','TARAC'): named(key,key)
        for key,token in [('OXAL_TOTAL','Total'),('OXAL_SOLUBLE','Soluble'),('OXAL_INSOLUBLE','Insoluble'),('CIS_ACONITIC','Cis-Aconitic'),('QUINIC','Quinic')]: named(key,token)
    elif table==10:
        # Each of the four panels has a distinct header signature.
        tokens={text(w) for w in header}
        if 'GALLAC' in tokens:
            pairs=[('DIHYDROXY_BENZOIC','3,4-Dihydroxy'),('HYDROXY_BENZALDEHYDE','benzaldehyde'),('PROTOCATECHUIC','Protocatechuic'),('VANILLIC','Vanillic'),('GALLAC','GALLAC'),('CINNAMIC','Cinnamic'),('O_COUMARIC','O-Coumaric'),('P_COUMARIC','P-'),('CAFFEIC','Caffeic')]
        elif 'CHLRAC' in tokens:
            pairs=[('CHLRAC','CHLRAC'),('FERAC','FERAC'),('APIGEN','APIGEN'),('APIGENIN_6_C_GLUCOSIDE','Apigenin-6-'),('APIGENIN_7_O_NEOHESPERIDOSIDE','Apigenin-7-'),('LUTEOL','LUTEOL'),('KAEMF','KAEMF'),('QUERCE','QUERCE')]
            named('QUERCETIN_3_B_D_GLUCOSIDE','Quercetin-3-',730)
            named('QUERCETIN_3_O_RUTINOSIDE','Quercetin-3-',783)
        elif 'HESPT' in tokens:
            pairs=[('QUERCETIN_3_B_GALACTOSIDE','Quercetin-3-'),('ISORHAMNETIN','Isorhamnetin'),('MYRICETIN','Myricetin'),('RESVERATROL','Resveratrol'),('HESPT','HESPT'),('NARINGENIN','Naringenin'),('HESPD','HESPD'),('DAIDZN','DAIDZN'),('GNSTEIN','GNSTEIN'),('EPICATEC','EPICATEC')]
        else:
            pairs=[('CATECHIN','(+)-Catechin'),('SYRINGIC','Syringic'),('SINAPINIC','Sinapinic'),('ELLAGIC','Ellagic'),('TOTAL_POLYPHENOLS','polyphenols')]
            # Multi-line catechin headings have no distinct printed abbreviation.
            named('EPIGALLOCATECHIN','Epigallo',313)
            named('EPIGALLOCATECHIN_3_GALLATE','Epigallo',374)
            named('GALLOCATECHIN_GALLATE','Gallocatechin')
            named('GALLOCATECHIN','Gallo')
        for key,token in pairs: named(key,token)
        if 'GALLAC' in tokens and 'DIHYDROXY_BENZOIC' not in columns:
            # Some pages print the same heading as two words: "3,4 Dihydroxy".
            prefixes=[w for w in header if text(w)=='3,4']
            suffixes=[w for w in header if text(w)=='Dihydroxy']
            matches=[(a,b) for a in prefixes for b in suffixes if abs(cy(a)-cy(b))<2 and 0<cx(b)-cx(a)<45]
            if len(matches)==1:
                a,b=matches[0]
                columns['DIHYDROXY_BENZOIC']=(float(a.get('xMin'))+float(b.get('xMax')))/2
    elif table==11:
        for key in ('RAFS','STAS','VERS','CAMT','STGSTR','PHYTAC'): named(key,key)
        for key,token in [('AJUGOSE','Ajugose'),('B_SITOSTEROL','β-Sitosterol'),('SAPONIN','Saponin')]: named(key,token)
    columns = {key:value for key,value in columns.items() if key not in ('P','K') or table==5}
    if not columns: raise ValueError(f'Table {table}: no recognized column header')
    regions = [cx(w) for w in header if text(w).lower()=='regions' and cx(w)<min(columns.values())]
    if not regions: raise ValueError(f'Table {table}: regions column absent')
    return sorted(columns.items(),key=lambda kv:kv[1]),max(regions)

def unit(table,key):
    if table==4:return 'µg'
    if table==5:return 'µg' if key in ('AS','HG','SE') else 'mg'
    if table in (6,8):return 'g'
    if table==11:return 'g' if key in ('RAFS','STAS','VERS','AJUGOSE','SAPONIN') else 'mg'
    return '%' if table==12 else 'mg'

def compile_modules(pdf,bbox):
    source_sha=hashlib.sha256(pdf.read_bytes()).hexdigest()
    assert source_sha=='7fc5a5112a57240d25bf695dca82cccd8d93ed54e8c39530e42b5ad1820d0e8c','Unexpected official source PDF'
    master_path=ROOT/'data/nutrition-db-v1.json'; raw=master_path.read_bytes(); master=json.loads(raw)
    assert hashlib.sha1(b'blob '+str(len(raw)).encode()+b'\0'+raw).hexdigest()=='8eda506e6083089173ede637560a89ad69dc1be9','Master does not match v473'
    food_names={p['ifct_code']:p['display_name'] for p in master['profiles'] if p.get('ifct_code')}
    food_names.update({p['ifct_code']:p['name'] for p in master['edible_oils_fats_ifct_table12']['entries']})
    assert len(food_names)==542
    pages=ET.parse(bbox).findall('.//{*}page')
    compiled=[]
    for table,(start,end) in RANGES.items():
        evidence={}; all_fields={}; page_panels=[]
        for physical in range(start,end+1):
            words=pages[physical-131].findall('.//{*}word')
            codes=sorted([w for w in words if re.fullmatch('[A-T][0-9]{3}',text(w)) and cx(w)<100],key=cy)
            if not codes:continue
            try:columns,region_x=header_columns(table,words,cy(codes[0]))
            except ValueError as exc:raise ValueError(f'PDF page {physical}: {exc}') from exc
            page_panels.append({'page':physical,'fields':[k for k,x in columns]})
            required_panels={4:{8},5:{10},6:{7},7:{8,9,10,11},8:{8,10},9:{10},10:{9,10},11:{9},12:{11}}
            if table in required_panels and len(columns) not in required_panels[table]:raise ValueError(f'Table {table}, page {physical}: incomplete panel {columns}')
            all_fields.update({k:{'label':LABELS.get(k,k),'unit':unit(table,k)} for k,x in columns})
            boundaries=[(region_x+columns[0][1])/2]+[(a[1]+b[1])/2 for a,b in zip(columns,columns[1:])]+[float(pages[physical-131].get('width'))]
            for i,c in enumerate(codes):
                code=text(c)
                if code not in food_names:raise ValueError(f'Unknown food code {code}')
                lo=(cy(codes[i-1])+cy(c))/2 if i else cy(c)-8
                hi=(cy(c)+cy(codes[i+1]))/2 if i+1<len(codes) else cy(c)+15
                row_words=[w for w in words if lo<=cy(w)<hi]
                reg=[text(w) for w in row_words if region_x-18<=cx(w)<boundaries[0] and re.fullmatch('[1-9][0-9]?',text(w))]
                if len(reg)!=1:raise ValueError(f'{table} {physical} {code}: ambiguous regions {reg}')
                row=evidence.setdefault(code,{'code':code,'name':food_names[code],'regions_by_page':{},'observations':{},'source_pages':[]})
                row['regions_by_page'][str(physical)]=int(reg[0])
                row['source_pages'].append(physical)
                for j,(key,x) in enumerate(columns):
                    cell=sorted([w for w in row_words if boundaries[j]<=cx(w)<boundaries[j+1]],key=lambda w:(round(cy(w),1),cx(w)))
                    # Ignore a footer that happens to occupy the last row's height.
                    cell=[w for w in cell if not (len(text(w))==3 and text(w).isdigit() and float(w.get('yMin'))>550)]
                    value=''.join(text(w) for w in cell).replace('−','-')
                    row['observations'].setdefault(key,[]).append((value,physical))
        assert len(evidence)==EXPECTED[table],(table,len(evidence),EXPECTED[table])
        expected_fields={4:8,5:20,6:7,7:29,8:18,9:10,10:38,11:9,12:22}
        assert len(all_fields)==expected_fields[table],(table,'incomplete nutrient registry',len(all_fields))
        rows=[];unresolved_count=0
        for code,row in sorted(evidence.items()):
            values={};raw_values={};below=[];unreported=[];unresolved={}
            for key in all_fields:
                obs=row['observations'].get(key)
                if obs is None:values[key]=None;raw_values[key]=None;unreported.append(key);continue
                texts=list(dict.fromkeys(v for v,page in obs))
                raw_values[key]=texts[0] if len(texts)==1 else texts
                if texts==['']:values[key]=None;below.append(key);continue
                means=[]
                for value in texts:
                    m=re.fullmatch(r'(\d+(?:\.\d+)?)(?:±\d+(?:\.\d+)?)?',value)
                    means.append(float(m[1]) if m else None)
                if any(v is None for v in means) or len(set(means))!=1:
                    values[key]=None;unresolved[key]='Conflicting or unparseable printed cell';unresolved_count+=1
                else:values[key]=means[0]
            region_counts=set(row['regions_by_page'].values())
            regions=next(iter(region_counts)) if len(region_counts)==1 else None
            rows.append({k:v for k,v in dict(code=code,name=row['name'],regions=regions,regions_by_page=row['regions_by_page'],values=values,raw=raw_values,source_pages=sorted(set(row['source_pages'])),below_detection=below,not_reported=unreported,unresolved=unresolved).items() if v or k in ('regions','values','raw')})
        basis='per_100g_protein' if table==8 else 'percent_total_fatty_acid_methylesters' if table==12 else 'per_100g_edible_portion'
        module={'schema_version':1,'table':table,'title':TITLES[table],'source_authority':'ICMR-NIN','source_url':SOURCE_URL,'source_pdf_sha256':source_sha,'basis':basis,'reference_only':table in (8,12),'blank_cell_policy':'Below detection is null, never zero; absent panels and unresolved cells are also null with separate reasons.','fields':all_fields,'rows':rows}
        filename=f'ifct-table{table}-{NAMES[table]}.json';path=ROOT/'data'/filename
        payload=(json.dumps(module,ensure_ascii=False,separators=(',',':'))+'\n').encode();path.write_bytes(payload)
        compiled.append({'table':table,'file':filename,'expected_rows':EXPECTED[table],'expected_codes':[r['code'] for r in rows],'expected_fields':list(all_fields),'expected_units':{k:v['unit'] for k,v in all_fields.items()},'basis':basis,'reference_only':table in (8,12),'sha256':hashlib.sha256(payload).hexdigest(),'size_bytes':len(payload),'unresolved_cells':unresolved_count})
        print(json.dumps({'table':table,'rows':len(rows),'fields':len(all_fields),'bytes':len(payload),'unresolved':unresolved_count}))
    manifest={'schema_version':1,'runtime_version':475,'source_authority':'ICMR-NIN','source_url':SOURCE_URL,'source_pdf_sha256':source_sha,'base_database':{'file':'nutrition-db-v1.json','cache_version':473,'git_blob_sha':'8eda506e6083089173ede637560a89ad69dc1be9','sha256':hashlib.sha256(raw).hexdigest(),'expected_ifct_profiles':528,'expected_reference_codes':14},'food_names':food_names,'modules':compiled}
    (ROOT/'data/ifct-modules-manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,separators=(',',':'))+'\n')

if __name__=='__main__':
    parser=argparse.ArgumentParser();parser.add_argument('--pdf',type=Path,required=True);parser.add_argument('--bbox',type=Path,required=True);args=parser.parse_args();compile_modules(args.pdf,args.bbox)
