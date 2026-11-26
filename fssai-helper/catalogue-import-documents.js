/* Consignment records for the named Indian import routes. */
(function(root){
  'use strict';
  const plan=root.PMSVTestingPlan;
  const area='Indian import documents';
  const egg=root.PMSVVeterinary.eggPowderId, bean='04-04-2-cocoa-beans', blend='coffee-chicory-mixture';
  const cocoaOrder='https://pflanzengesundheit.julius-kuehn.de/mediaPublic/PG-docs/pdf/Vorschriften_Nicht-EU/G-J/Indien/in_2003-1322cons2026-5094_pqorder_en.pdf#page=304';
  const coffeeOrder='https://egazette.gov.in/WriteReadData/2024/258800.pdf';
  const permit='https://dahd.gov.in/sites/default/files/2026-01/Procedureforimportoflivestockproducts.pdf';
  const registration='https://fssai.gov.in/upload/advisories/2024/04/660f9bb7d8c4fOrder_FFMF_04_04_2024_for%20upload.pdf';
  const ports='https://fssai.gov.in/upload/advisories/2023/02/63dd1f8114589Port_Restriction.pdf';
  function document(field,parameter,article,locator,source,notes){
    return {field,parameter,article,locator,source,notes};
  }
  const eggDocs=[
    document('importFacility','Foreign manufacturing facility registration','FSSAI foreign facility registration order','4 April 2024 and annexed order',registration,
      'Match the producing establishment and its egg powder registration to the FSSAI ReFoM entry. Record the facility name and unique registration number.'),
    document('importPermit','Sanitary import permit','S.O. 2666(E)','Paragraphs 1(iii) and 2',permit,
      'Match the permit issued by the Department of Animal Husbandry and Dairying to this egg powder shipment and record its number and validity.'),
    document('importPort','Designated point of entry','FSSAI order TIC-B05/5/2022-IMPORTS-FSSAI','Egg powder entry and port annexure',ports,
      'Match the port and Customs location code on the Bill of Entry to the designated list in force for the shipment date. Record the code and list reference.')
  ];
  const cocoaDocs=[
    document('importDeclaration','Additional declaration on phytosanitary certificate','Plant Quarantine Order, Schedule VI, serial 644','Theobroma cacao, columns 3–5',cocoaOrder,
      'Match the certificate to the imported fermented and dried bean lot for processing or industrial use, from any country. Verify coverage of the five listed pests and diseases: chocolate moth, Mediterranean flour moth, tropical nut borer, black pod of cocoa and chestnut downy mildew.'),
    document('importTreatment','Treatment endorsement on phytosanitary certificate','Plant Quarantine Order, Schedule VI, serial 644','Theobroma cacao, column 6',cocoaOrder,
      'Check the treatment endorsement against serial 644. If an alternative was used, record the applicable Plant Protection Adviser approval and the certificate reference.')
  ];
  const coffeeDocs=[
    document('importDeclaration','Coffee berry borer declaration','Plant Quarantine Order, Schedule VI, serial 90','S.O. 4995(E), column 5',coffeeOrder,
      'Match the certificate to the imported coffee bean lot for consumption or processing, from any country. Check that the declaration covers both coffee berry borers named in the order.'),
    document('importTreatment','Treatment endorsement on phytosanitary certificate','Plant Quarantine Order, Schedule VI, serial 90','S.O. 4995(E), column 6',coffeeOrder,
      'Verify the endorsed treatment on the certificate issued at origin or re-export against a route permitted by the order. Record the certificate number and endorsement reference.')
  ];
  const routes=new Map([
    [egg,{form:'Egg powder imported into India',docs:eggDocs}],
    [bean,{form:'Fermented and dried cocoa beans imported into India for processing or industrial use',docs:cocoaDocs}],
    [plan.routeIds.cocoa,{form:'Incoming imported fermented and dried cocoa beans used to make cocoa mass, liquor or cake',docs:cocoaDocs}],
    ['coffee',{form:'Imported coffee beans for consumption or processing',docs:coffeeDocs}],
    [blend,{form:'Incoming imported coffee beans used to make the coffee–chicory mixture',docs:coffeeDocs}]
  ]);
  const docFields=[...new Set([...eggDocs,...cocoaDocs,...coffeeDocs].map(doc=>doc.field))];
  const fields=['importScope','importLot','importCountry',...docFields];
  const sourceUrls=new Set([...eggDocs,...cocoaDocs,...coffeeDocs].map(doc=>doc.source));
  function entries(id,state={}){
    const route=routes.get(id);
    if(!route)return [];
    return route.docs.map(({field,...doc})=>{
      let status='Conditional import document check',notes=doc.notes;
      if(state.importScope==='outside'){
        status='Outside this import route';
        notes='This worksheet records a consignment outside the named import route.';
      }
      if(state.importScope==='imported'){
        const lot=state.importLot?.trim(), country=state.importCountry?.trim(), reference=state[field]?.trim();
        status=!lot||!country?'Identify consignment and country of origin':reference?'Document reference recorded':'Document reference pending';
        notes+=' Consignment: '+(lot||'pending')+'. Country of origin: '+(country||'pending')+'. Reference: '+(reference||'pending')+'.';
      }
      return {...doc,area,form:route.form,status,notes};
    });
  }
  function exportRows(date){
    const rows=[['Catalogue ID','Product','Assessment date','Imported article','Document check','Provision','Location','What to verify','Source']];
    if(!plan.metalEdition(date))return rows;
    for(const [id,route] of routes){
      for(const doc of route.docs)rows.push([id,root.PMSVCatalogueRules.products[id].name,date,route.form,doc.parameter,doc.article,doc.locator,doc.notes,doc.source]);
    }
    return rows;
  }
  root.PMSVImportDocuments=Object.freeze({area,routes,fields,docFields,entries,exportRows,isSource:url=>sourceUrls.has(url)});
})(globalThis);
