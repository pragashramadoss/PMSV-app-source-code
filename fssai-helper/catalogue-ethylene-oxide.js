/* Ethylene oxide and 2-chloroethanol report interpretation for identified spice samples. */
(function (root) {
  'use strict';
  const sources = {
    decision: 'https://fssai.gov.in/upload/uploadfiles/files/43rd%20FA%20Minutes.pdf#page=8',
    method: 'https://www.fssai.gov.in/upload/uploadfiles/files/Method%20for%20ETO%20and%202-CE.pdf#page=2',
    calculation: 'https://www.fssai.gov.in/upload/uploadfiles/files/Method%20for%20ETO%20and%202-CE.pdf#page=8',
    exports: 'https://www.indianspices.com/sites/default/files/EtO%20SoP%20v.pdf#page=2'
  };
  const methodId = 'FSSAI.OM.EO.001.2024';
  const clean = value => typeof value === 'string' ? value.trim() : '';
  const herbs = new Set(['oregano','bay','mint','rosemary','thyme','sage','basil','marjoram','parsley','tarragon']);
  const named = 'Ethylene oxide and 2-chloroethanol';
  const qualifiers = [
    ['quantified','Quantified'], ['nd','Not detected at stated detection limit'],
    ['trace','Detected below stated quantification limit'], ['less','Below stated threshold, detection unspecified'],
    ['missing','Not reported']
  ];
  const units = [['mg/kg','mg/kg'],['µg/kg','µg/kg']];
  const basisFields = ['eoCeBasis','eoConfirmed'];
  const measurements = ['eoFree','eoCe','eoSum'].flatMap(key => [key+'Kind',key+'Value',key+'Unit']);
  const fields = ['eoMarket','eoDestination','eoMarketRef','eoTreatment','eoTreatmentRef','eoFormat','eoMethod',
    ...measurements,...basisFields];
  const columns = ['Ethylene oxide sample scope','Ethylene oxide decision, method and export sources',
    'Ethylene oxide sample, market and method','Ethylene oxide report as issued','EO sum or analytical bounds (mg/kg as EO)',
    'Ethylene oxide process and source assessment'];

  function matches(value) {
    const name = clean(value).toLowerCase().replace(/\be\.t\.o\.?/g,'eto').replace(/\be\.o\.?/g,'eo').replace(/[^a-z0-9]+/g,' ').trim();
    return /\b(ethylene oxide|ethyleneoxide|oxirane|eto|eo|75 21 8|2 chloroethanol|2 chloro ethanol|2 chloroethyl alcohol|2 chloroethan 1 ol|2ce|2 ce|ethylene chlorohydrin|ethylene chlorhydrin|107 07 3)\b/.test(name);
  }
  const selected = s => s.spAnalyte === 'eto' || (s.spAnalyte === 'other' && matches(s.spOther));

  // Keep the laboratory decimals exact through unit conversion, weighting and addition.
  function amount(raw, unit, nativeMarker) {
    const value = clean(raw);
    if (value.length > 48 || !/^(?:\d+(?:\.\d*)?|\.\d+)$/.test(value) || !units.some(([u]) => u === unit)) return null;
    const [whole, fraction = ''] = value.split('.');
    const digits = BigInt((whole || '0') + fraction);
    if (!digits) return null;
    return {digits: digits * (nativeMarker ? 55n : 1n), places: fraction.length + (unit === 'µg/kg' ? 3 : 0) + (nativeMarker ? 2 : 0)};
  }
  const zero = {digits:0n,places:0};
  function add(a,b) {
    const places = Math.max(a.places,b.places);
    const atScale = x => x.digits * 10n ** BigInt(places - x.places);
    return {digits:atScale(a)+atScale(b),places};
  }
  function display(x) {
    if (!x.places) return String(x.digits);
    const digits = String(x.digits).padStart(x.places+1,'0');
    return (digits.slice(0,-x.places)+'.'+digits.slice(-x.places)).replace(/0+$/,'').replace(/\.$/,'');
  }
  function component(s,key,label) {
    const kind = s[key+'Kind'];
    if (!qualifiers.some(([v]) => v === kind)) return {error:'Choose how the laboratory reported '+label+'.'};
    if (kind === 'missing') return {kind,text:label+' not reported'};
    const unit = s[key+'Unit'], value = clean(s[key+'Value']);
    if (key === 'eoCe' && !['native','equivalent'].includes(s.eoCeBasis)) return {error:'Confirm whether 2-CE is reported as its own mass or already as EO equivalents.'};
    const x = amount(value,unit,key === 'eoCe' && s.eoCeBasis === 'native');
    if (!x) return {error:'Enter a positive decimal and the printed unit for '+label+'. Resolve a zero or an unspecified ND with the laboratory.'};
    const prefix = {quantified:'',nd:'ND, LOD ',trace:'detected below LOQ ',less:'< '};
    const basis = key === 'eoCe' ? (s.eoCeBasis === 'native' ? ' as 2-CE' : ' as EO equivalents') : '';
    return {kind,text:label+' '+prefix[kind]+value+' '+unit+basis,lower:kind === 'quantified' ? x : zero,upper:x,
      detected:kind === 'quantified' || kind === 'trace',censored:kind !== 'quantified'};
  }
  function analysis(s) {
    const paired = s.eoFormat === 'separate';
    if (!paired && s.eoFormat !== 'combined') return {error:'Choose the report format.'};
    const parts = paired ? [component(s,'eoFree','Free EO'),component(s,'eoCe','2-CE')] : [component(s,'eoSum','Lab-reported total as EO')];
    const problem = parts.find(p=>p.error);
    if (problem) return {error:problem.error};
    const raw = parts.map(p=>p.text).join(' | ');
    if (parts.every(p=>p.kind === 'missing')) return {error:'At least one laboratory finding is needed.',raw};
    const free = paired ? parts[0] : null, marker = paired ? parts[1] : null;
    let sum;
    if (parts.some(p=>p.kind === 'missing')) sum = 'Total unavailable, one component was not reported';
    else {
      const hi = display(parts.reduce((v,p)=>add(v,p.upper),zero));
      if (parts.some(p=>p.censored)) {
        const lo = display(parts.reduce((v,p)=>add(v,p.lower),zero));
        sum = lo+' ≤ EO sum < '+hi;
      } else sum = 'EO sum = '+hi;
    }
    return {raw,sum,complete:parts.every(p=>p.kind!=='missing'),paired,free,marker,combined:paired ? null : parts[0]};
  }
  function treatment(s) {
    const ref = clean(s.eoTreatmentRef);
    if (s.eoTreatment === 'used') return ref ? 'EO treatment documented in '+ref+'.' : 'EO treatment reported. Obtain its source record.';
    if (s.eoTreatment === 'excluded') return ref ? 'Evidence reviewed for the declaration of no EO treatment: '+ref+'.' : 'Obtain the record supporting the declaration of no EO treatment.';
    return 'Treatment history unresolved.';
  }
  function review(c,s) {
    const lab = analysis(s), note = [treatment(s)];
    if (s.eoMarket === 'export') {
      note.push('Export assessment for '+(clean(s.eoDestination)||'an unconfirmed destination')+'. Apply the current destination provision and the Spices Board export guidance.');
      if (s.eoTreatment === 'used' && clean(s.eoTreatmentRef)) note.push('Documented treatment conflicts with the Spices Board guidance to avoid EO use.');
      if (clean(s.eoMarketRef)) note.push('Destination evidence: '+clean(s.eoMarketRef)+'.');
    } else if (s.eoMarket !== 'india') note.push('Choose the intended market.');
    else if (herbs.has(c.a.key) || c.a.key === 'tejpat' || !['raw','physical','singleHeat'].includes(s.spProcess))
      note.push('Confirm the Indian article and process before applying the spice decision to this sample.');
    else if (s.eoTreatment === 'used' && clean(s.eoTreatmentRef))
      note.push('Documented treatment conflicts with the Food Authority decision for spices, regardless of the analytical result.');
    else note.push('Food Authority item 3.3 addresses treatment and traces of EO in spices. It supplies no numerical acceptance limit.');
    if (lab.free?.detected) note.push('Free EO detected. Investigate the finding and the treatment record.');
    if (lab.marker?.detected) note.push('2-CE detected. Investigate its origin and review the free EO result.');
    if (lab.combined) note.push('The reported sum covers both analytes. Obtain the component results to identify free EO.');
    if (lab.free && !lab.free.detected && (lab.free.kind === 'nd' || lab.free.kind === 'less'))
      note.push('Free EO is reported below the stated threshold. Amounts below that threshold remain unresolved.');
    if ([lab.free,lab.marker,lab.combined].some(p=>p?.censored)) note.push('The bound uses the laboratory thresholds. No value of zero was assigned to a measured result.');
    if (lab.free?.kind === 'missing' || lab.marker?.kind === 'missing') note.push('Request the missing component for a complete sum.');
    const source = [sources.decision,sources.method,sources.calculation,...(s.eoMarket === 'export' ? [sources.exports] : [])].join(' | ');
    return {lab,note:note.join(' '),source};
  }
  function market(s) {
    if (s.eoMarket === 'india') return 'India';
    if (s.eoMarket === 'export') return 'Export · '+(clean(s.eoDestination)||'destination pending');
    return 'Market pending';
  }
  function snapshot(c,s,process,role) {
    if (!c?.a || !selected(s)) return {error:'Choose the separately sampled spice or marketed article and its EO assessment.'};
    const {lab,note,source} = review(c,s);
    if (lab.error) return {error:lab.error};
    if (!process || !clean(s.spSample) || !clean(s.spReport) || !clean(s.eoMethod) || s.eoConfirmed !== 'yes')
      return {error:'Record the sample, process, report and method reference and confirm the transcription.'};
    if (!['india','export'].includes(s.eoMarket) || (s.eoMarket === 'export' && !clean(s.eoDestination)))
      return {error:'Choose a market and identify the export destination when applicable.'};
    if (!['used','excluded','unknown'].includes(s.eoTreatment) || (s.eoTreatment !== 'unknown' && !clean(s.eoTreatmentRef)))
      return {error:'Enter the treatment evidence or select history unknown.'};
    const marketKey = s.eoMarket === 'india' ? 'india' : 'export-'+clean(s.eoDestination).normalize('NFKC').toLowerCase().replace(/\s+/g,' ');
    return {record:{version:2,type:'eo',role:c.role,matrixKey:c.a.matrix||'spice-'+c.a.key,matrix:c.a.label,
      analyteKey:'eo-pair-'+marketKey,analyte:named,sample:clean(s.spSample),report:clean(s.spReport),process,
      result:lab.sum,unit:'mg/kg',loq:'',basis:clean(s.eoMethod)+' · '+lab.raw,limit:'',source,
      reference:role+' · '+market(s)+' · '+treatment(s),decision:note,outcome:'review',raw:lab.raw,
      market:market(s),treatment:treatment(s)}};
  }
  function values(choices,c,s,role,process) {
    const scope = choices.length ? 'Marketed sample choices: '+choices.join(' | ') : 'Separately sampled spice or culinary herb only';
    const urls = [sources.decision,sources.method,sources.calculation,sources.exports].join(' | ');
    if (!selected(s) || !c?.a) return [scope,urls,'','','',''];
    const {lab,note} = review(c,s);
    return [scope,urls,[role,c.a.label,process,clean(s.spSample),clean(s.spReport),market(s),clean(s.eoMethod),
      s.eoConfirmed === 'yes' ? 'Transcription confirmed' : 'Transcription pending'].filter(Boolean).join(' · '),lab.raw||'',
      lab.sum||'',note+(lab.error ? ' '+lab.error : '')];
  }

  function form(s,{choose,field,link}) {
    const select = (key,title,options) => choose(s,key,title,options);
    const input = (key,title,type) => field(s,key,title,type);
    function reading(key,label) {
      let html = select(key+'Kind',label,qualifiers);
      if (!s[key+'Kind'] || s[key+'Kind'] === 'missing') return html;
      if (key === 'eoCe') html += select('eoCeBasis','2-CE reporting basis',[['native','Mass of 2-CE'],['equivalent','Already expressed as EO']]);
      return html+input(key+'Value',s[key+'Kind'] === 'quantified' ? label+' concentration' : label+' threshold','decimal')+select(key+'Unit',label+' unit',units);
    }
    let html = '<h5>Ethylene oxide laboratory review</h5><p>'+link(sources.decision,'India, spice decision 3.3')+' · '+
      link(sources.method,methodId)+' · '+link(sources.calculation,'EO sum calculation')+'</p>'+
      select('eoMarket','Intended market',[['india','India'],['export','Export']]);
    if (s.eoMarket === 'export') html += input('eoDestination','Destination country or market')+input('eoMarketRef','Destination provision, article and date checked')+link(sources.exports,'Spices Board export guidance');
    html += select('eoTreatment','EO treatment history',[['unknown','Unknown'],['used','Treatment reported'],['excluded','Records indicate no EO treatment']]);
    if (['used','excluded'].includes(s.eoTreatment)) html += input('eoTreatmentRef','Process, supplier or investigation record');
    html += input('spReport','Laboratory report reference')+input('eoMethod','Laboratory method and sample-matrix reference')+
      select('eoFormat','How does the report express EO?',[['separate','Free EO and 2-CE as individual results'],['combined','Lab-reported total expressed as EO']]);
    if (s.eoFormat === 'separate') html += reading('eoFree','Free EO')+reading('eoCe','2-CE');
    if (s.eoFormat === 'combined') html += reading('eoSum','Total as EO');
    return html+'<label class="ws-check"><input type="checkbox" data-ws-field="eoConfirmed"'+(s.eoConfirmed === 'yes' ? ' checked':'')+'> I checked the sample, analyte expressions, units and qualifiers against the laboratory report.</label>'+
      '<button type="button" data-residue-save="eo">Save EO assessment to the panel</button>';
  }
  function resetFields(k,previous) {
    if (['spRole','spArticle','spProcess','spAnalyte','spOther'].includes(k) || (k === 'spSample' && clean(previous))) return fields;
    if (k === 'spReport' && clean(previous)) return ['eoMethod','eoFormat',...measurements,...basisFields];
    if (k === 'eoFormat') return [...measurements,...basisFields];
    if (k === 'eoMarket') return ['eoDestination','eoMarketRef'];
    if (k === 'eoDestination' && clean(previous)) return ['eoMarketRef'];
    if (k === 'eoTreatment') return ['eoTreatmentRef'];
    if (k === 'eoCeBasis' && clean(previous)) return ['eoCeValue','eoCeUnit','eoConfirmed'];
    for (const key of ['eoFree','eoCe','eoSum']) {
      if (k === key+'Kind') return [key+'Value',key+'Unit','eoConfirmed',...(key === 'eoCe' ? ['eoCeBasis'] : [])];
    }
    if (k !== 'eoConfirmed' && (fields.includes(k) || k === 'spReport')) return ['eoConfirmed'];
    return [];
  }
  root.PMSVEthyleneOxide = Object.freeze({sources,methodId,fields,columns,selected,named,analysis,review,snapshot,values,form,resetFields});
})(globalThis);
