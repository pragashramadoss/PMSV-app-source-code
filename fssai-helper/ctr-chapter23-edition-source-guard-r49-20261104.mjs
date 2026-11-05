/** R49: audit-only edition-source validation; never legal CTR or release approval. */
export const R49_VERIFIED_CLAUSES=Object.freeze(["2.3.25","2.3.33","2.3.38","2.3.51","2.3.52","2.3.63"]);
export const APPROVED_SOURCE_EDITION="Version 3 (07.05.2025)";
export function checkR49SourceEdition(clause, evidence={}){
 const base={legalCTRArticlePASS:false,wholeProductLegalPASS:false,commercialRelease:false,
 numericCTRRulesActivated:false,editionSourceReferenceOnly:true};
 if(!R49_VERIFIED_CLAUSES.includes(clause))return {...base,status:"UNREVIEWED_CLAUSE"};
 const missing=["correctOriginalFSSRCatalogueIdentity","originalGazetteAndEffectiveAmendmentsChecked",
 "actualSKUAndRelevantSampleMatrixVerified","fullCurrentContaminantAndMicroLabEvidenceReviewed"].filter(k=>evidence[k]!==true);
 if(evidence.sourceEdition!==APPROVED_SOURCE_EDITION)missing.push("2025OfficialFSSRChapter23SourceSelected");
 if(evidence.v3SelectedPageImageVerified!==true)missing.push("2025NamedClausePDFPageImageReviewed");
 if(evidence.v2SelectedSourceConditionCompared!==true)missing.push("2024SelectedSourceConditionCrosschecked");
 return {...base,status:missing.length?"EDITION_SOURCE_EVIDENCE_HOLD":"SOURCE_EDITION_SPOTCHECK_READY_NOT_PRODUCT_PASS",missing};
}
