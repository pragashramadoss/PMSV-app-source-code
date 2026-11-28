/* Regulatory samples sent to the Food Analyst under Laboratory and Sample Analysis regulation 2.3.1. */
(function(root){
  'use strict';
  const area='Regulatory sample quantity';
  const regulation='https://fssai.gov.in/docs/food-law/regulations/Comp_Laboratory%20and%20Sampling%20analysis%20(IV).pdf';
  const original='https://fssai.gov.in/upload/uploadfiles/files/Lab_Sample_Regulations.pdf';
  const amendment='https://fssai.gov.in/docs/food-law/notice-comment/Notification%20dated%2014.09.2026_amendment.pdf#page=3';
  const articles=new Map();
  function article(key,food,quantity,unit,condition=''){
    const page=parseInt(key,10)<=21?2:3;
    articles.set(key,{key,food,quantity,unit,condition,source:original+'#page='+(page+1)+' | '+regulation+'#page='+page});
  }
  article('1','Milk',500,'mL','For sterilized or UHT milk, see item 2, also 500 mL.');
  article('2','Sterilized or UHT milk',500,'mL');
  article('3','Malai or plain dahi',200,'g');
  article('4','Yoghurt or sweetened dahi',500,'g');
  article('5','Chhana, paneer, khoya or shrikhand',250,'g');
  article('6','Cheese or cheese spread',200,'g');
  article('7','Evaporated or condensed milk',200,'g');
  article('8','Ice cream, softy, kulfi, ice candy or ice lolly',300,'g','Confirm the finished frozen article.');
  article('9','Milk powder or skimmed milk powder',250,'g');
  article('10','Infant food or weaning food',500,'g');
  article('11','Malt food or malted milk food',300,'g');
  article('12','Butter, butter oil, ghee, margarine, cream or bakery shortening',200,'g');
  article('13','Vanaspati and edible oils or fats',400,'g','Use the specific item 12 for its named fats.');
  article('14','Carbonated water',3,'L');
  article('15','Baking powder',100,'g');
  article('16','Arrowroot or sago',250,'g');
  article('17','Corn flakes, macaroni products, corn flour or custard powder',200,'g','For the corn flour entry, identify the sampled article. Whole milled maize flour has a distinct identity from maize starch.');
  article('18','Whole spices, condiments or mixed masala',500,'g');
  article('19','Powdered spices, condiments or mixed masala',500,'g');
  article('20','Nutmeg or mace',250,'g');
  article('21','Asafoetida',100,'g');
  article('22','Compounded asafoetida',150,'g');
  article('23','Saffron',20,'g');
  article('24','Jaggery, icing sugar, honey, synthetic syrup or bura',250,'g');
  article('25','Cane, refined or cube sugar, dextrose, misri or dried glucose syrup',200,'g');
  article('26','Artificial sweetener',100,'g');
  article('27','Fruit juice, fruit drink or fruit squash',1,'L');
  article('28','Tomato sauce, ketchup, tomato paste or purée, jam, fruit jelly, marmalade or vegetable sauce',300,'g');
  article('29','Non-fruit jelly',200,'g');
  article('30','Pickle or chutney',250,'g');
  article('31','Oilseeds, nuts or dry fruits',250,'g');
  article('32','Tea, roasted coffee or roasted chicory',500,'g');
  article('33','Instant tea, instant coffee or instant coffee–chicory mixture',100,'g');
  article('34','Sugar confectionery, chewing gum or bubble gum',200,'g');
  article('35','Chocolate',200,'g');
  article('36','Edible salt',200,'g');
  article('37','Iodised or iron-fortified salt',200,'g');
  article('38','Whole or split food grains and pulses',1,'kg');
  article('39','Atta, maida, suji, besan, other milled products and fortified atta or maida',500,'g');
  article('40','Biscuits or rusks',200,'g');
  article('41','Bread, cakes or pasties',250,'g');
  article('42','Gelatin',150,'g');
  article('43','Catechu',150,'g');
  article('44','Vinegar, including synthetic vinegar',300,'g');
  article('45','Food colour',25,'g');
  article('46s','Solid food colour preparation',25,'g');
  article('46l','Liquid food colour preparation',100,'mL');
  article('47','Natural mineral water or packaged drinking water',4000,'mL','Total volume across at least three original sealed packs.');
  article('48','Silver leaf',2,'g');
  article('49','Prepared food',500,'g');
  article('50','Proprietary food (non-standardised)',500,'g');
  article('51','Canned food',6,'sealed cans','Count intact sealed cans. Confirm the actual container for articles also sold in retort pouches or other packs.');
  article('52','Food unspecified in the table',500,'g','The table gives an approximate quantity. The proviso separately governs the quantity drawn.');
  const listed=new Map();
  for(const [key,ids] of [
    ['1', [
      '01-01-1-buffalo-milk',
      '01-01-1-cow-milk',
      '01-01-1-goat-milk',
      '01-01-1-camel-milk',
      '01-01-1-mixed-milk',
      '01-01-1-standardized-milk',
      '01-01-1-toned-milk',
      '01-01-1-double-toned-milk',
      '01-01-1-skimmed-milk',
      '01-01-1-full-cream-milk',
      '01-01-1-low-lactose-or-lactose-free-milk',
      '01-01-1-sheep-milk'
    ]],
    ['3', [
      '01-01-4-malai'
    ]],

    ['5', [
      '01-01-3-khoa',
      '01-01-6-chhana-and-paneer',
      '01-01-7-shrikhand'
    ]],
    ['6', [
      '01-01-6-cottage-cheese-and-creamed-cottage-cheese',
      '01-01-6-cream-cheese-rahmfrischkase',
      '01-01-6-coulommiers-cheese',
      '01-01-6-provolone-cheese',
      '01-01-6-cheddar-cheese',
      '01-01-6-danbo-cheese',
      '01-01-6-edam-cheese',
      '01-01-6-gouda-cheese',
      '01-01-6-havarti-cheese',
      '01-01-6-tilsiter-cheese',
      '01-01-6-camembert-cheese',
      '01-01-6-brie-cheese',
      '01-01-6-saint-paulin-cheese',
      '01-01-6-samsoe-cheese',
      '01-01-6-emmental-or-emmentaler-cheese',
      '01-01-6-extra-hard-grating-cheese',
      '01-01-6-mould-ripened-cheese',
      '01-01-6-processed-cheese',
      '01-01-6-processed-cheese-spread',
      '01-01-6-mozzarella-cheese',
      '01-01-6-creamed-whey-cheese',
      '01-01-6-whey-cheese',
      '01-01-6-skimmed-whey-cheese',
      '01-01-6-soft-cheese-in-brine',
      '01-01-6-semi-hard-cheese-in-brine',
      '01-01-6-ripened-cheese',
      '01-01-6-unripened-cheese-including-fresh-cheese'
    ]],
    ['7', [
      '01-01-3-evaporated-or-concentrated-milk',
      '01-01-3-sweetened-condensed-milk'
    ]],

    ['10', [
      'traditional-infant-food',
      '13-13-1-infant-formula',
      '13-13-1-follow-up-formula',
      '13-13-1-preterm-infant-milk-substitute',
      '13-13-1-food-for-special-medical-purpose-intended-for-infants',
      '13-13-1-lactose-free-infant-milk-substitutes',
      '13-13-1-hypoallergenic-infant-milk-substitutes',
      '13-13-1-foods-for-infants-with-inborn-errors-of-metabolism-iem',
      '13-13-1-infant-milk-food',
      '13-13-2-milk-cereal-based-complementary-food',
      '13-13-2-processed-cereal-based-complementary-food'
    ]],
    ['11', [
      '06-06-7-malted-milk-food',
      '06-06-7-malt-based-foods-malt-food'
    ]],
    ['12', [
      '01-01-4-cream',
      '02-02-1-butter-oil',
      '02-02-2-butter',
      '02-02-2-table-margarine',
      '02-02-2-bakery-and-industrial-margarine',
      '02-02-1-bakery-shortening'
    ]],
    ['13', [
      '02-02-1-milk-fat',
      '02-02-1-anhydrous-milk-fat',
      '02-02-1-refined-grapeseed-oil',
      '02-02-1-refined-rapeseed-or-mustard-oil-low-erucic-acid',
      '02-02-1-refined-safflower-seed-oil-and-safflower-seed-oil-high-oleic-acid-imported-or-dome',
      '02-02-1-moringa-oil',
      '02-02-1-refined-palm-kernel-olein',
      '02-02-1-refined-moringa-oil',
      '02-02-1-fish-oil',
      'fssai-2-16-hemp-seed-oil',
      '02-02-1-interesterified-vegetable-fat-oil',
      '02-02-1-vanaspati',
      '02-02-1-partially-hydrogenated-and-winterised-soyabean-oil',
      '02-02-1-partially-hydrogenated-soyabean-oil',
      '02-02-1-partially-hydrogenated-soybean-oil',
      '02-02-1-partially-hydrogenated-and-winterised-soybean-oil'
    ]],
    ['14', [
      'carbonated-water'
    ]],
    ['15', [
      '99-99-1-baking-powder'
    ]],
    ['16', [
      '06-06-2-arrowroot',
      '06-06-2-tapioca-sago',
      '06-06-2-palm-sago-starch'
    ]],
    ['17', [
      '06-06-2-custard-powder',
      '06-06-2-maize-starch',
      '06-06-3-corn-flakes',
      '06-06-4-macaroni-products-pasta-products',
      '06-06-4-macaroni-products-instant-noodle'
    ]],
    ['19', [
      '04-04-1-vanilla-powder',
      '12-12-2-curry-powder',
      '12-12-2-dried-mango-powder-amchur'
    ]],
    ['20', [
      '12-12-2-mace-jaipatri',
      '12-12-2-nutmeg-jaiphal'
    ]],
    ['21', [
      '12-12-2-asafoetida-hing-or-hingra'
    ]],
    ['23', [
      '12-12-2-saffron-kesar'
    ]],
    ['24', [
      'synthetic-syrup-dispenser',
      'synthetic-syrup-sharbat',
      '11-11-1-icing-sugar',
      '11-11-1-bura-sugar',
      '11-11-1-gur-or-jaggery',
      '11-11-1-cane-jaggery-or-cane-gur',
      '11-11-5-honey'
    ]],
    ['25', [
      '11-11-1-refined-sugar',
      '11-11-1-dextrose',
      '11-11-1-dried-glucose-syrup',
      '11-11-1-plantation-white-sugar',
      '11-11-1-cube-sugar',
      '11-11-1-misri'
    ]],
    ['26', [
      '11-11-6-sodium-saccharin-food-grade',
      '11-11-6-aspartyl-phenyl-alanine-methyl-ester-aspartame',
      '11-11-6-acesulfame-potassium',
      '11-11-6-sucralose',
      '11-11-6-calcium-saccharin-food-grade'
    ]],
    ['27', [
      'fruit-juices',
      'fruit-juice-preserved-industrial',
      'fruit-drink-rts',
      'squash',
      'carbonated-fruit-beverages'
    ]],
    ['28', [
      '04-04-1-jams-fruit-jellies-and-marmalades',
      '04-04-2-thermally-processed-tomato-puree-and-paste',
      '12-12-6-tomato-ketchup-and-tomato-sauce',
      '12-12-6-chilli-sauce',
      '12-12-6-fruits-vegetable-sauces'
    ]],
    ['30', [
      '04-04-1-pickles-made-from-fruits',
      '04-04-1-fruits-and-vegetable-chutney',
      '04-04-1-mango-chutney',
      '04-04-2-pickles-made-from-vegetables-or-other-edible-plant-material-including-mushrooms',
      '04-04-2-pickles-made-from-combination-of-fruits-or-vegetables-or-other-edible-plant-materi',
      '04-04-2-pickled-fungi',
      '09-09-3-fish-pickles',
      '10-10-3-pickled-eggs'
    ]],
    ['31', [
      '04-04-1-dehydrated-fruits',
      '04-04-1-groundnut-kernel-deshelled',
      '04-04-1-raisins',
      '04-04-1-pistachio-nuts',
      '04-04-1-dates',
      '04-04-1-dry-fruits-and-nuts',
      '04-04-1-dried-apricots',
      '04-04-1-almond-kernels',
      '04-04-1-cashew-kernels',
      '04-04-1-walnut-kernels'
    ]],
    ['32', [
      'tea',
      'kangra-tea',
      'green-tea',
      'chicory'
    ]],
    ['33', [
      'instant-tea-solid'
    ]],
    ['34', [
      '05-05-2-sugar-boiled-confectionery-hard-candy',
      '05-05-2-sugar-boiled-confectionery-soft-candy',
      '05-05-2-lozenges',
      '05-05-3-chewing-gum-and-bubble-gum'
    ]],
    ['35', [
      '05-05-1-chocolate'
    ]],
    ['36', [
      '12-12-1-edible-common-salt'
    ]],
    ['37', [
      '12-12-1-iron-fortified-iodized-salt-double-fortified-salt'
    ]],
    ['38', [
      '06-06-1-bean',
      '06-06-1-soybean',
      '06-06-1-wheat',
      '06-06-1-maize',
      '06-06-1-rice',
      '06-06-1-any-other-foodgrains',
      '06-06-1-unprocessed-whole-raw-pulses-not-for-direct-human-consumption',
      '06-06-1-oats',
      '06-06-1-durum-wheat',
      '06-06-1-pulses',
      '06-06-1-basmati-rice',
      '06-06-1-millets',
      '06-06-1-triticale'
    ]],
    ['39', [
      '06-06-2-wholemeal-barley-powder-or-barley-flour-or-choker-yukt-jau-ka-churan',
      '06-06-2-wheat-flour-atta-and-resultant-wheat-flour-resultant-atta',
      '06-06-2-maida-refined-wheat-flour',
      '06-06-2-semolina-suji-or-rawa',
      '06-06-2-besan',
      '06-06-2-bajra-flour-pearl-millet-flour',
      '06-06-2-jowar-flour-sorghum-flour',
      '06-06-2-whole-maize-corn-flour',
      '06-06-2-durum-wheat-semolina-and-whole-durum-wheat-semolina',
      '06-06-2-degermed-maize-corn-meal-and-maize-corn-grits',
      '06-06-2-roasted-bengal-gram-flour-chana-sattu',
      '06-06-2-ragi-flour',
      '06-06-2-multigrain-flour-atta',
      '06-06-2-mixed-millet-flour',
      '06-06-2-protein-rich-wheat-flour-protein-prachur-atta',
      '06-06-2-protein-rich-refined-wheat-flour-protein-prachur-maida',
      '06-06-2-durum-wheat-maida'
    ]],
    ['40', [
      '07-07-2-biscuit',
      '07-07-2-wafer-biscuit'
    ]],
    ['41', [
      '07-07-1-bread-and-bread-type-products'
    ]],
    ['42', [
      '99-99-1-gelatin-from-fish-processing-waste',
      '99-99-1-gelatin'
    ]],
    ['43', [
      '04-04-1-catechu-edible'
    ]],
    ['44', [
      '12-12-3-vinegar'
    ]],
    ['47', [
      'mineral-water',
      'packaged-drinking-water'
    ]],
    ['48', [
      '100-100-silver-leaf-chandi-ka-warq'
    ]],

  ])for(const id of ids)listed.set(id,key);
  const cereals='https://www.fssai.gov.in/upload/uploadfiles/files/Chapter%202_4_Cereals_and_Cereal_products.pdf';
  const identities=new Map([
    ['11-11-1-khandsari-sugar',['25','Khandsari under 2.8.1(3) is sugar made from sugarcane juice.','https://fssai.gov.in/upload/uploadfiles/files/Chapter%202_8%20%28Sweetening%20agents%20including%20Honey%29.pdf#page=1']],
    ['06-06-1-blended-rice',['38','The blended rice standard describes a mixture of basmati or non-basmati rice grains.',cereals]],
    ['06-06-2-rice-flour-for-preparation-of-fortified-rice-kernel-frk',['39','Clause 2.4.6(24A) identifies the rice flour used as the input for making fortified kernels.','https://fssai.gov.in/upload/notifications/2024/10/671b28f9586dfGAZETTE%20NOTIFICATION%20DATED%2021.10.2024.pdf']],
    ['06-06-2-edible-cassava-or-tapioca-flour',['39','Clause 2.4.32 describes flour ground or milled from cassava chips or paste. Tapioca sago is a different sampled article.',cereals]],
    ['06-06-2-water-chestnut-flour-singhare-ka-atta',['39','Clause 2.3.64 defines singhare ka atta as flour ground from dried water chestnuts.','https://fssai.gov.in/upload/uploadfiles/files/Chapter%202_3_Fruit%20%20Vegetable%20products.pdf']],
    ['fssai-2-16-hemp-seed-flour',['39','The hemp seed standard defines this flour as seeds milled to powder, with or without oil extraction.','https://www.fssai.gov.in/upload/notifications/2021/11/619b553646e10Gazette_Notification_Oil_Flour_22_11_2021.pdf']]
  ]);
  for(const [id,[item]] of identities)listed.set(id,item);
  const rules='https://fssai.gov.in/upload/uploadfiles/files/FSS_Gazete_Rules_2011%20comendium.pdf#page=9';
  const partsAmendment='https://fssai.gov.in/docs/states/fso/fso_notification_16012023.pdf#page=2';
  const imports='https://fssai.gov.in/upload/uploadfiles/files/Gazette_Notification_Food_Import_20_03_2017%281%29.pdf';
  const importClarification='https://fssai.gov.in/upload/advisories/2022/08/62fe0bcc5afdbClarification_Sample_18_08_2022.pdf';
  const purposes=new Map([
    ['domestic',['Domestic enforcement, ordinary procedure','4 parts','Divide the sample into four parts or take four already sealed packages. Mark and seal each part as prescribed in rule 2.4.1(9)(i).',rules]],
    ['micro',['Microbiological analysis','Applicable Appendix B plan','Use the sampling plan for the food and criterion in Appendix B. Record the specified number of sample units.',partsAmendment]],
    ['surveillance',['Surveillance','As specified in the surveillance plan','Use the plan issued by the Food Authority or State Food Authority for the survey.',partsAmendment]],
    ['import',['Import clearance','2 parts under import regulation 9','For sealed bulk containers that need aseptic or hygroscopic conditions, see regulation 9(2) for same-batch representative samples, the manufacturer declaration and its alternative procedure.',imports+' | '+importClarification]],
    ['complaint',['Complaint investigation','Case-specific','Rule 2.4.1 names complaint investigations in the proviso. For a reduced count under the other-cases row, record the reasons and supporting evidence in writing.',partsAmendment]],
    ['emergency',['Food safety emergency','Case-specific','Any reduction in the mandated number of parts requires reasons and supporting evidence in writing.',partsAmendment]]
  ]);
  const lotFields=['dispatchLot','dispatchPurpose','dispatchUnspecified','dispatchAmount','dispatchUnit','dispatchEvidence','dispatchRecordDate'];
  const units=['g','kg','mL','L'];
  function purposeRows(){
    return [['Sampling purpose','Number of parts or governing plan','Application','Sources'],...purposes.values()];
  }
  const spiceIds=new Set([
'04-04-1-vanilla-pods',
      '04-04-1-cut-vanilla',
      '12-12-2-caraway-siahjira',
      '12-12-2-cardamom-elaichi',
      '12-12-2-chillies-and-capsicum-lal-mirchi',
      '12-12-2-cinnamon-dalchini',
      '12-12-2-cassia-taj',
      '12-12-2-cloves-laung',
      '12-12-2-coriander-dhania',
      '12-12-2-cumin-zeera-kalonji',
      '12-12-2-fennel-saunf',
      '12-12-2-fenugreek-methi',
      '12-12-2-dried-ginger-sonth-dried-adrak',
      '12-12-2-mustard-rai-sarson',
      '12-12-2-black-white-and-green-bwg-peppers',
      '12-12-2-poppy-khas-khas',
      '12-12-2-turmeric-haldi',
      '12-12-2-mixed-masala',
      '12-12-2-aniseed-saunf',
      '12-12-2-ajowan-bishops-seed',
      '12-12-2-tejpat',
      '12-12-2-star-anise',
      '12-12-2-pimento-or-allspice'
  ]);
  // An umbrella record needs the sampled form before using the named entry.
  const conditional=new Map([
    ['coffee',['32','33']],['coffee-chicory-mixture',['33']],
    ['01-01-5-milk-powders-and-cream-powder',['9']],
    ['03-03-ice-lollies-or-edible-ices',['8']],
    ['01-01-7-yoghurt-including-flavoured-yoghurt-and-flavoured-dahi',['4']],
    ['01-01-2-fermented-milk',['3','4']],
    ['01-01-7-ice-cream-kulfi-chocolate-ice-cream-softy-ice-cream-milk-ice-milk-lolly-and-dried-',['8']],
    ['08-08-2-canned-or-retort-pouch-meat-products',['51']],
    ['08-08-3-canned-or-retort-pouch-meat-products',['51']]
  ]);
  const fruitChapter='https://fssai.gov.in/upload/uploadfiles/files/Chapter%202_3_Fruit%20%20Vegetable%20products.pdf';
  const packSources=new Map([
    ['04-04-2-canned-tomatoes',fruitChapter+'#page=9'],
    ['04-04-2-canned-chestnut',fruitChapter+'#page=93'],
    ['04-04-2-canned-chestnut-puree',fruitChapter+'#page=93'],
    ['09-09-4-canned-fishery-products','https://www.fssai.gov.in/upload/uploadfiles/files/food%20product.pdf'],
    ['04-04-1-thermally-processed-fruits',fruitChapter+'#page=1'],
    ['04-04-1-thermally-processed-fruit-salad-cocktail-mix',fruitChapter+'#page=2'],
    ['04-04-2-thermally-processed-vegetables',fruitChapter+'#page=6'],
    ['04-04-2-thermally-processed-curried-vegetables-ready-to-eat-vegetables',fruitChapter+'#page=10'],
    ['12-12-5-thermally-processed-vegetable-soups',fruitChapter+'#page=11'],
    ['vegetable-juices',fruitChapter+'#page=18'],
    ['tomato-juice',fruitChapter+'#page=20'],
    ['fruit-nectars',fruitChapter+'#page=20'],
    ['04-04-1-thermally-processed-mango-pulp-puree-and-sweetened-mango-pulp-puree',fruitChapter+'#page=23'],
    ['04-04-1-thermally-processed-fruit-pulp-puree-and-sweetened-fruit-pulp-puree-other-than-man',fruitChapter+'#page=24'],
    ['concentrated-fruit-pulp-puree',fruitChapter+'#page=24'],
    ['concentrated-vegetable-pulp-puree',fruitChapter+'#page=24']
  ]);
  for(const id of packSources.keys())conditional.set(id,['51']);
  const coffeeForms={
    coffee:{roasted_ground:'32',decaffeinated_roasted_ground:'32',soluble_coffee:'33',decaffeinated_soluble:'33'},
    'coffee-chicory-mixture':{instant:'33',decaffeinated_instant:'33'}
  };
  const exceptions={
    'coffee':'Green coffee beans require a separate article decision.',
    'coffee-chicory-mixture':'Item 33 names the instant blend. A ground coffee–chicory blend needs a separate article decision.',
    'purified-vending-water':'Item 47 refers to sealed packaged water. Confirm the sampling plan for the vending outlet.',
    '100-100-royal-jelly':'Item 24 names honey. Confirm the sampling quantity for royal jelly.',
    '04-04-1-coconut-milk-powder':'Item 9 concerns dairy milk powder. Confirm the dried coconut product.',
    '100-100-cow-or-buffalo-colostrum-and-colostrum-products':'Identify liquid colostrum or powder and confirm its sampling quantity.',
    '04-04-2-cocoa-beans':'Confirm the quantity for fermented, dried cocoa beans. Item 35 covers chocolate.',
    '05-05-1-cocoa-mass-or-cocoa-chocolate-liquor-and-cocoa-cake':'Identify mass, liquor or press cake. Item 35 covers chocolate.',
    '10-10-2-egg-powder':'Identify dried whole egg, white or yolk and confirm the sampling quantity.'
  };
  function unspecified(date){
    return date<'2027-04-01'?'For an unspecified food, agree the quantity drawn with the Food Analyst under 2.3.1(4).':'From 1 April 2027, establish the quantity drawn for an unspecified food using the applicable Food Authority guidelines under 2.3.1(4).';
  }
  const boundary='This is a regulatory dispatch quantity. Use the relevant sampling plan for the number of sample units and the laboratory method for each analytical test portion.';
  function decision(id,date,state={}){
    if(!Object.hasOwn(root.PMSVCatalogueRules.products,id)||!root.PMSVTestingPlan.metalEdition(date))return null;
    let key=listed.get(id),status='Named food or class';
    const forms=conditional.get(id)||[];
    const coffee=Object.hasOwn(coffeeForms,id),form=state.coffeeForm;
    if(coffee&&form)key=Object.hasOwn(coffeeForms[id],form)?coffeeForms[id][form]:undefined;
    else if(!coffee&&forms.includes(state.dispatchRow))key=state.dispatchRow;
    if(key&&forms.length)status='Selected food form';
    let r=articles.get(key);
    if(spiceIds.has(id)){
      r={...articles.get('18'),key:'18/19',food:'Whole or powdered spice, condiment or mixed masala',condition:'Use item 18 for whole material and 19 for powder.'};
    }
    const packSource=packSources.get(id);
    const packed=forms.length===1&&forms[0]==='51';
    const otherPack=packed&&state.dispatchRow==='other-pack';
    if(r){
      const identity=identities.get(id);
      return {...r,status,notes:[r.condition,identity?.[1],boundary].filter(Boolean).join(' '),source:[r.source,identity?.[2],packSource].filter(Boolean).join(' | ')};
    }
    const candidates=forms.map(k=>{const a=articles.get(k);return 'item '+k+' ('+a.food+', '+a.quantity+' '+a.unit+')';});
    const relevant=forms.length&&!(coffee&&form)&&!otherPack;
    const action=relevant?'Confirm the marketed form before using '+candidates.join(' or ')+'.':'Review the table against the actual article and packaging.';
    const selected=root.PMSVVariantComposition.profileFor(id)?.forms.find(f=>f.name===state.compVariant);
    return {key:'',food:selected?.name||root.PMSVCatalogueRules.products[id].name,quantity:'',unit:'',status:relevant?'Form confirmation needed':'Article confirmation needed',notes:[exceptions[id],packed?'Item 51 requires actual sealed cans. Confirm the container before choosing a quantity.':'',action,'If no listed entry applies, item 52 gives 500 g as a reference.',unspecified(date),boundary].filter(Boolean).join(' '),
      source:regulation+'#page=3 | '+regulation+'#page=4 | '+original+'#page=4'+(date>='2027-04-01'?' | '+amendment:'')+(packSource?' | '+packSource:'')};
  }
  function lotDecision(record,date,state={}){
    const purpose=purposes.get(state.dispatchPurpose);
    const lot=String(state.dispatchLot||'').trim();
    const evidence=String(state.dispatchEvidence||'').trim();
    const amount=String(state.dispatchAmount||'').trim();
    const applicable=record&&!record.key&&state.dispatchUnspecified==='yes'&&date===state.dispatchRecordDate;
    const valid=applicable&&lot&&evidence&&purpose&&units.includes(state.dispatchUnit)&&/^\d+(?:\.\d+)?$/.test(amount)&&Number.isFinite(Number(amount))&&Number(amount)>0;
    const basis=date<'2027-04-01'?'Food Analyst consultation':'Food Authority guideline';
    return {lot,purpose,amount:valid?amount:'',unit:valid?state.dispatchUnit:'',basis:valid?basis:'',evidence:valid?evidence:''};
  }
  function planEntry(id,date,state){
    const r=decision(id,date,state);
    if(!r)return null;
    const lot=lotDecision(r,date,state);
    const extra=[lot.purpose?'Sampling purpose: '+lot.purpose[0]+'. '+lot.purpose[1]+'. '+lot.purpose[2]:'',lot.lot?'Lot or sample: '+lot.lot+'.':'',lot.amount?'Recorded quantity drawn for unspecified food: '+lot.amount+' '+lot.unit+'. '+lot.basis+': '+lot.evidence+'.':''].filter(Boolean).join(' ');
    return {area,form:r.food,parameter:'Quantity sent to the Food Analyst',article:'Laboratory and Sample Analysis 2.3.1'+(r.key?', item '+r.key:''),
      status:r.status,limit:'',unit:'',notes:(r.quantity?'Approximate quantity: '+r.quantity+' '+r.unit+'. ':'')+[r.notes,extra].filter(Boolean).join(' '),source:[r.source,lot.purpose?.[3]].filter(Boolean).join(' | ')};
  }
  function exportRows(id,date=root.PMSVVeterinary.reviewDate,state){
    const out=[['Catalogue ID','Product','Assessment date','Article match','Table item','Article or sample','Approximate quantity to send','Unit','Conditions and next action','Sources','Lot or sample reference','Sampling purpose','Parts or plan','Quantity drawn for unspecified food','Recorded unit','Basis','Evidence reference','Sample parts source']];
    for(const key of id?[id]:root.PMSV_CATALOGUE.map(p=>p.id)){
      const r=decision(key,date,id?state:undefined);
      if(r){
        const lot=lotDecision(r,date,id?state:undefined);
        out.push([key,root.PMSVCatalogueRules.products[key].name,date,r.status,r.key,r.food,r.quantity,r.unit,r.notes,r.source,lot.lot,lot.purpose?.[0]||'',lot.purpose?.[1]||'',lot.amount,lot.unit,lot.basis,lot.evidence,lot.purpose?.[3]||'']);
      }
    }
    return out;
  }
  function tableRows(date=root.PMSVVeterinary.reviewDate){
    const out=[['Table item','Food','Approximate quantity','Unit','Conditions','Sources']];
    if(!root.PMSVTestingPlan.metalEdition(date))return out;
    for(const r of articles.values())out.push([parseInt(r.key,10),r.food,r.quantity,r.unit,r.key==='52'?r.condition+' '+unspecified(date):r.condition,r.key==='52'?r.source+' | '+regulation+'#page=4'+(date>='2027-04-01'?' | '+amendment:''):r.source]);
    return out;
  }
  root.PMSVSamplingQuantities=Object.freeze({area,articles,listed,conditional,spiceIds,identities,packSources,purposes,purposeRows,lotFields,units,lotDecision,decision,planEntry,exportRows,tableRows});
})(globalThis);
