/* PMSV common checklist VISUAL layer only.
   No scoring, grading, rating, NC or audit-state calculations are performed here. */
(()=>{if(!document.querySelector('script[data-pmsv-forum-shell]')){const sh=document.createElement('script');sh.src='forum-shell.js?v=1';sh.dataset.pmsvForumShell='1';document.head.appendChild(sh)}if(document.getElementById('pmsvCommonVisualUi'))return;
const st=document.createElement('style');st.id='pmsvCommonVisualUi';st.textContent=`
:root{--pmsv-green:#3155d9;--pmsv-green2:#243e79;--pmsv-bg:#f0f3f9;--pmsv-line:#e2e7f0;--pmsv-text:#18243e;--pmsv-red:#b42318;--pmsv-c:#e9f7ef;--pmsv-pc:#fff4cf;--pmsv-nc:#fde5e3;--pmsv-na:#e9f1f6;--pmsv-crit:#eceff1}
*{box-sizing:border-box}html,body{margin:0}body{font-family:system-ui,-apple-system,"Segoe UI",Arial,sans-serif!important;background:var(--pmsv-bg)!important;color:var(--pmsv-text)!important;font-size:16px!important}
.wrap{max-width:1450px!important;margin:auto!important}
header{background:linear-gradient(135deg,var(--pmsv-green),var(--pmsv-green2))!important;color:#fff!important;padding:20px 18px 24px!important;border:0!important;border-radius:0!important;box-shadow:none!important}
header .wrap{max-width:1450px!important}header a{color:#fff!important;font-size:14px!important;font-weight:750!important;text-decoration:none!important}
header h1{font-family:inherit!important;font-size:clamp(25px,4vw,36px)!important;line-height:1.12!important;font-weight:750!important;letter-spacing:normal!important;margin:12px 0 4px!important;color:#fff!important}
header p{margin:0!important;color:#e5f5ef!important;font-size:14px!important}
.score,.scorebar{position:sticky!important;top:0!important;z-index:999!important;background:#fff!important;padding:8px 10px 11px!important;border:0!important;border-bottom:1px solid var(--pmsv-line)!important;border-radius:0!important;box-shadow:0 5px 18px rgba(25,70,55,.14)!important;font-family:inherit!important;font-size:11px!important;font-weight:750!important;line-height:1.2!important;color:var(--pmsv-text)!important}
.score .wrap,.scorebar .wrap{max-width:1450px!important;margin:auto!important;display:flex!important;align-items:center!important;gap:3px!important;white-space:normal!important;overflow-x:auto!important;scrollbar-width:none;flex-wrap:wrap!important}.score .wrap::-webkit-scrollbar,.scorebar .wrap::-webkit-scrollbar{display:none}
.score-chip{display:inline-flex!important;align-items:center!important;gap:4px!important;padding:7px 10px!important;border:1px solid #dbe3f2!important;border-radius:999px!important;background:#f7f9fd!important;color:#42516d!important;font-weight:750!important;white-space:nowrap!important}.score-chip strong,.score-chip span{font-weight:850!important;color:#18243e!important}.score-chip.grade-chip{background:#eef2ff!important;border-color:#cfd8ff!important}.score-chip.critical-chip{background:#fff0ee!important;border-color:#efc3be!important;color:var(--pmsv-red)!important}.critical-ribbon{color:var(--pmsv-red)!important;font-weight:850!important}
.pmsv-draft,.pmsv-reset,.draft-btn,.reset-btn{margin-left:5px!important;border-radius:7px!important;padding:4px 7px!important;font-family:inherit!important;font-size:10px!important;line-height:1.1!important;font-weight:800!important;cursor:pointer!important;white-space:nowrap!important}
.pmsv-draft,.draft-btn{border:1px solid #9bc9b9!important;background:#effaf6!important;color:var(--pmsv-green)!important}
.pmsv-reset,.reset-btn{border:1px solid #efb6b0!important;background:#fff5f4!important;color:var(--pmsv-red)!important}
main.wrap,main .wrap{max-width:1450px!important}main{padding-left:14px!important;padding-right:14px!important;padding-bottom:40px!important}
.card,.meta,.pmsv-rules,.rules-top,.hyg-rules,.grade-bottom,.rating-bottom{background:#fff!important;border:1px solid var(--pmsv-line)!important;border-radius:16px!important;box-shadow:0 5px 18px rgba(25,70,55,.055)!important}
.meta{display:grid!important;grid-template-columns:1fr 1fr!important;gap:10px!important;padding:16px!important;margin:16px 0!important}
.meta input,.meta select{width:100%!important;padding:10px 11px!important;border:1px solid #cbdad4!important;border-radius:9px!important;background:#fff!important;font:inherit!important}
.pmsv-rules,.rules-top,.hyg-rules,.grade-bottom,.rating-bottom{margin:16px 0!important;padding:16px!important}
.pmsv-rules h3,.rules-top h3,.hyg-rules h3,.grade-bottom h3,.rating-bottom h3{margin:0 0 11px!important;color:var(--pmsv-green)!important;font-size:18px!important}
.rules-table,.rating-table{width:100%!important;min-width:0!important;border-collapse:collapse!important;border-spacing:0!important;margin:0!important;background:#fff!important;font-family:inherit!important}
.rules-table th,.rules-table td,.rating-table th,.rating-table td{border:1px solid #d4e1dc!important;padding:9px 10px!important;background:#fff!important;border-radius:0!important;text-align:left!important;vertical-align:top!important}
.rules-table th,.rating-table th{background:#eaf4f0!important;font-weight:750!important}
.critical-note{margin-top:11px!important;padding:10px 12px!important;background:#fde5e3!important;border-radius:9px!important;font-weight:700!important;color:#8d1c14!important}
.tablewrap{overflow:auto!important;margin:0!important}
.tablewrap>table{width:100%!important;min-width:850px!important;border-collapse:separate!important;border-spacing:0 9px!important;background:transparent!important;font-family:inherit!important}
.tablewrap>table>thead th{background:#dceee7!important;border:0!important;padding:10px!important;text-align:left!important;font-weight:750!important}
.tablewrap>table>thead th:first-child{border-radius:11px 0 0 11px!important}.tablewrap>table>thead th:last-child{border-radius:0 11px 11px 0!important}
.tablewrap>table>tbody>tr:not(.section)>td{background:#fff!important;border-top:1px solid var(--pmsv-line)!important;border-bottom:1px solid var(--pmsv-line)!important;border-left:0!important;border-right:0!important;padding:9px!important;vertical-align:top!important}
.tablewrap>table>tbody>tr:not(.section)>td:first-child{border-left:1px solid var(--pmsv-line)!important;border-radius:13px 0 0 13px!important}
.tablewrap>table>tbody>tr:not(.section)>td:last-child{border-right:1px solid var(--pmsv-line)!important;border-radius:0 13px 13px 0!important}
.tablewrap>table>tbody>tr.crit:not(.answered)>td,.tablewrap>table>tbody>tr.critical:not(.answered)>td{background:var(--pmsv-crit)!important}
.tablewrap>table>tbody>tr.answer-C>td{background:var(--pmsv-c)!important}.tablewrap>table>tbody>tr.answer-PC>td{background:var(--pmsv-pc)!important}.tablewrap>table>tbody>tr.answer-NC>td{background:var(--pmsv-nc)!important}.tablewrap>table>tbody>tr.answer-NA>td{background:var(--pmsv-na)!important}
.tablewrap .section td{background:#dceee7!important;border:0!important;border-radius:11px!important;padding:10px!important;font-weight:800!important}
.tablewrap select,.status{min-width:78px!important;padding:7px!important;border:1px solid #cbdad4!important;border-radius:8px!important;background:#fff!important;font:inherit!important}
.tablewrap textarea,.comment{width:100%!important;min-height:82px!important;min-width:240px!important;padding:9px!important;border:1px solid #cbdad4!important;border-radius:8px!important;background:#fff!important;font:inherit!important;line-height:1.4!important}
.actions{display:flex!important;gap:8px!important;align-items:center!important;flex-wrap:wrap!important;margin:17px 0!important}
.finish,.btn.primary,#finish{margin:17px 0!important;padding:12px 18px!important;background:var(--pmsv-green)!important;color:#fff!important;border:0!important;border-radius:10px!important;font:inherit!important;font-weight:800!important;cursor:pointer!important}
.btn.secondary{padding:11px 16px!important;background:#fff!important;color:var(--pmsv-green)!important;border:1px solid var(--pmsv-line)!important;border-radius:10px!important;font-weight:800!important}
@media(min-width:1100px){
 .wrap,header .wrap,main.wrap{max-width:1320px!important}
 .meta{grid-template-columns:repeat(4,minmax(0,1fr))!important;padding:18px!important}
 .pmsv-rules,.rules-top,.hyg-rules,.grade-bottom,.rating-bottom{padding:18px!important}
 .tablewrap>table{min-width:100%!important}
}
@media(min-width:701px) and (max-width:1099px){
 .wrap,header .wrap,main.wrap{max-width:960px!important}
 .meta{grid-template-columns:repeat(2,minmax(0,1fr))!important}
}
@media(max-width:700px){
 header{padding:18px 14px 22px!important}header h1{font-size:27px!important}
 .score,.scorebar{font-size:9.5px!important;padding:7px 5px 10px!important}
 .meta{grid-template-columns:1fr!important;padding:14px!important}
 .pmsv-rules,.rules-top,.hyg-rules,.grade-bottom,.rating-bottom{padding:13px!important}
 .rules-table,.rating-table{font-size:13px!important}.tablewrap>table{border-spacing:0 7px!important}
 main{padding-left:8px!important;padding-right:8px!important}
}
@media(display-mode:standalone){
 body{padding-bottom:env(safe-area-inset-bottom)!important}
 header{padding-top:calc(14px + env(safe-area-inset-top))!important}
 .score,.scorebar{top:0!important}
 button,select,textarea,input{touch-action:manipulation}
}
`;document.head.appendChild(st)})();