/* Product-specific readings of the four powder standards and two sago forms. */
(function(root){
  'use strict';
  const evidence=root.PMSVCatalogueEvidence,rules=root.PMSVCatalogueRules;
  if(!evidence||!rules)return;
  const source=(doc,page)=>evidence.documents[doc].url.split('#')[0]+'#page='+page;
  const sagoSource='https://fssai.gov.in/upload/uploadfiles/files/Gazette_Notification_Standards_Tapioca_Sago_03_11_2017.pdf#page=5';
  const singhara='06-06-2-water-chestnut-flour-singhare-ka-atta';
  const protein='The English Gazette specifies a minimum of 9.0% on dry matter. The Hindi table specifies a maximum of 9.0%. Resolve the applicable wording before comparing the lot.';
  const uric='Both Gazette tables print 100 mg/kg without a minimum or maximum. The direction of comparison needs clarification.';
  const notes=[
    ['06-06-2-arrowroot',source('baser02-1',83),'Identify the separated, purified starch from Maranta arundinacea or the Curcuma species printed as “augustifolia” in clause 2.4.14(1). The numerical table in the following clause covers tapioca sago and palm sago starch.','arrowroot'],
    ['06-06-2-tapioca-sago',sagoSource,'Identify sago pearls produced from tapioca root starch. Use the reported basis for each parameter.','tapioca_sago'],
    ['06-06-2-palm-sago-starch',sagoSource,'Identify starch from Metroxylon sagu or M. rumphii. Clause 2(3) expressly extends the sago standard to this product.','palm_sago_starch'],
    [singhara,source('food-14',35),'Confirm flour milled from dried Trapa nuts. Keep the incoming nut lot and the finished flour sample distinct. Use the aflatoxin worksheet for the two potential finished-flour entries and the separate incoming-nut sample.'],
    ['04-04-1-coconut-milk-powder',source('food-20',17),'Match the dried coconut milk powder, the dry-matter fat result and the free fatty acid result for extracted fat. Maltodextrin and sodium caseinate are permitted ingredients. Added colour and flavour are prohibited.'],
    ['06-06-2-carob-powder',source('baser02-1',129),'Match powder from roasted, husk-free Ceratonia siliqua pods. The carob standard excludes artificial colour or flavour, extraneous matter and glazing substances, and requires sound material free of rancid or objectionable flavour.']
  ];
  const products=new Map();
  for(const [id,gazette,note,form] of notes){
    const raw=rules.standards[evidence.products[id].standard],name=rules.products[id].name;
    const rows=[{parameter:'Product identity and sample',status:'Document product identity',notes:note,source:gazette}],criteria=[];
    for(const {spec:original} of raw.criteria){
      if(form&&original.when?.starchy_food_type!==form)continue;
      if(id===singhara&&original.parameter==='Protein on dry basis')continue;
      const {when,...spec}=original; // The marketed form has already selected the row.
      const numeric=['<=','>=','range'].includes(spec.operator);
      const status=numeric?'Source-edition comparison available':'Inspect the reported finding';
      rows.push({spec,status,source:gazette});
      if(numeric)criteria.push({i:'powder-'+spec.parameter.toLowerCase().replace(/[^a-z0-9]+/g,'-'),v:{spec,compare:true,gazette}});
    }
    if(id===singhara){
      const dualSource=source('food-14',12)+' | '+gazette;
      rows.push({parameter:'Protein on dry basis',status:'Resolve Gazette wording',unit:'% m/m on dry basis',notes:protein,source:dualSource},
        {parameter:'Uric acid',status:'Confirm direction of comparison',unit:'mg/kg',notes:uric,source:dualSource},
        {parameter:'Appearance and quality',status:'Inspect the reported finding',notes:'Check white colour, absence of added colours or flavours and of rancidity, foreign matter, pests and contamination described in clause 2.3.64(1).',source:gazette});
    }
    products.set(id,{id,name,note,gazette,rows,criteria});
  }
  root.PMSVPowderStandards=Object.freeze({products,singhara});
})(globalThis);
