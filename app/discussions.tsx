'use client';
import {useEffect,useMemo,useState} from 'react';
import {BookOpen,Newspaper,ShieldCheck,MessagesSquare,MessageCircleQuestion,ArrowLeft,Send,Flag} from 'lucide-react';
import AppNotifications from './app-notifications';

type Question={
 id:string;title:string;body:string;category:'food-safety'|'quality'|'process-excellence';
 name:string;createdAt:string;answerCount:number;lastActivityAt:string
};
type Answer={id:string;questionId:string;name:string;body:string;createdAt:string};
type Detail={question:Question;answers:Answer[]};

const pmsv=()=>typeof window!=='undefined'?((window as unknown as {PMSV?:{base?:string;publicBase?:string;preview?:boolean}}).PMSV):undefined;
const base=()=>pmsv()?.base||'';
const isPreview=()=>Boolean(pmsv()?.preview)||(typeof window!=='undefined'&&window.location.hostname==='raw.githack.com');
const publicAsset=(path:string)=>{const b=typeof window!=='undefined'?((window as unknown as {PMSV?:{publicBase?:string}}).PMSV?.publicBase||''):'';return b?b+path.replace(/^\/+/, ''):path};
const route=(path:string)=>base()+path;
const previewUrl=(path:string)=>base()+'/preview.html?route='+encodeURIComponent(path);
const previewKey='pmsv-preview-discussion';
const readPreviewDetail=():Detail|null=>{try{const raw=sessionStorage.getItem(previewKey);return raw?JSON.parse(raw) as Detail:null}catch{return null}};
const savePreviewDetail=(value:Detail)=>{try{sessionStorage.setItem(previewKey,JSON.stringify(value))}catch{}};
const dateLabel=(iso:string)=>new Intl.DateTimeFormat('en-IN',{dateStyle:'medium',timeStyle:'short'}).format(new Date(iso));
const categoryLabel=(value:string)=>value==='food-safety'?'Food Safety':value==='quality'?'Quality':'Process Excellence';

function Shell({children,detail=false}:{children:React.ReactNode;detail?:boolean}){
 return <div className="app-shell app-dashboard discussion-shell">
  <header className="masthead"><a className="brand" href={route('/')} aria-label="PMSV Food Safety & Quality Forum home"><span className="brand-mark family-brand"><img src={publicAsset('/brand/pmsv-family.png')} alt="PMSV family logo"/></span><div><div className="brand-name">PMSV <span>Food Safety &amp; Quality Forum</span></div><div className="brand-sub">FOOD SAFETY · QUALITY · EXCELLENCE</div></div></a><AppNotifications/></header>
  <nav className="primary-nav" aria-label="Main navigation"><div className="nav-caption">WORKSPACE</div>
   <a href={route('/updates')}><Newspaper size={17}/><span>Updates/News</span></a>
   <a href={route('/audits/index.html')}><ShieldCheck size={17}/><span>Audits</span></a>
   <a href={route('/blogs')}><BookOpen size={17}/><span>Blogs</span></a>
   <a href={route('/discussions')} aria-current="page"><MessagesSquare size={17}/><span>Discussions</span></a>
   <div className="nav-bottom"><img className="sidebar-family-logo" src={publicAsset('/icons/pmsv-family-192.png')} alt="PMSV family logo"/><span>PMSV<small>Food safety, quality &amp; excellence</small></span></div>
  </nav>
  <main>{detail&&<a className="discussion-back" href={route('/discussions')} onClick={e=>{if(isPreview()){e.preventDefault();history.back()}}}><ArrowLeft size={17}/>All discussions</a>}{children}</main>
  <footer><strong>PMSV Food Safety &amp; Quality Forum</strong><span>Professional text discussions only. No advertising or unrelated topics.</span></footer>
 </div>
}

export default function Discussions({questionId}:{questionId?:string}){
 const [questions,setQuestions]=useState<Question[]>([]);
 const [detail,setDetail]=useState<Detail|null>(null);
 const [loading,setLoading]=useState(true);
 const [askOpen,setAskOpen]=useState(false);
 const [message,setMessage]=useState('');
 const [submitting,setSubmitting]=useState(false);
 const [category,setCategory]=useState<'food-safety'|'quality'|'process-excellence'>('food-safety');
 const [name,setName]=useState('');
 const [title,setTitle]=useState('');
 const [body,setBody]=useState('');
 const [answerName,setAnswerName]=useState('');
 const [answerBody,setAnswerBody]=useState('');
 const [previewQuestionOpen,setPreviewQuestionOpen]=useState(false);
 const [reportTarget,setReportTarget]=useState<{type:'question'|'answer';id:string}|null>(null);
 const [reportReason,setReportReason]=useState<'off-topic'|'spam'|'inappropriate'|'other'>('off-topic');
 const [reporting,setReporting]=useState(false);
 const [reportNotice,setReportNotice]=useState('');

 const endpoint=useMemo(()=>route('/api/discussions'+(questionId?'/'+questionId:'')),[questionId]);
 async function load(){
  setLoading(true);setMessage('');
  if(isPreview()){
   const saved=readPreviewDetail();
   if(questionId)setDetail(saved);
   else setQuestions(saved?[saved.question]:[]);
   setLoading(false);return;
  }
  try{
   const r=await fetch(endpoint,{cache:'no-store'});const data=await r.json();
   if(!r.ok)throw new Error(data.error||'Unable to load discussions.');
   if(questionId)setDetail(data as Detail);else setQuestions((data.questions||[]) as Question[]);
  }catch(e){setMessage(e instanceof Error?e.message:'Unable to load discussions.')}
  finally{setLoading(false)}
 }
 useEffect(()=>{load()},[endpoint]);

 async function ask(e:React.FormEvent){
  e.preventDefault();setSubmitting(true);setMessage('');
  if(isPreview()){
   const now=new Date().toISOString();
   const question:Question={id:'1',title,body,category,name,createdAt:now,answerCount:0,lastActivityAt:now};
   const next={question,answers:[]};
   savePreviewDetail(next);setDetail(next);setQuestions([question]);setPreviewQuestionOpen(false);setSubmitting(false);setAskOpen(false);
   return;
  }
  try{
   const r=await fetch(route('/api/discussions'),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name,title,body,category})});
   const data=await r.json();if(!r.ok)throw new Error(data.error||'Unable to post question.');
   location.href=route('/discussions/'+data.id);
  }catch(e){setMessage(e instanceof Error?e.message:'Unable to post question.');setSubmitting(false)}
 }
 async function answer(e:React.FormEvent){
  e.preventDefault();const qid=questionId||detail?.question.id;if(!qid)return;setSubmitting(true);setMessage('');
  if(isPreview()){
   const current=detail||readPreviewDetail();
   if(current){
    const now=new Date().toISOString();
    const nextAnswer:Answer={id:String(current.answers.length+1),questionId,name:answerName,body:answerBody,createdAt:now};
    const next:Detail={question:{...current.question,answerCount:current.answers.length+1,lastActivityAt:now},answers:[...current.answers,nextAnswer]};
    savePreviewDetail(next);setDetail(next);setAnswerBody('');
   }
   setSubmitting(false);return;
  }
  try{
   const r=await fetch(route('/api/discussions/'+qid+'/answers'),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name:answerName,body:answerBody})});
   const data=await r.json();if(!r.ok)throw new Error(data.error||'Unable to post answer.');
   setAnswerBody('');setSubmitting(false);await load();
  }catch(e){setMessage(e instanceof Error?e.message:'Unable to post answer.');setSubmitting(false)}
 }

 async function report(type:'question'|'answer',id:string){
  setReporting(true);setReportNotice('');
  if(isPreview()){
   setReportNotice('Report received. In the live app it will appear in WordPress moderation.');
   setReportTarget(null);setReporting(false);return;
  }
  try{
   const r=await fetch(route('/api/discussions/report'),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({targetType:type,targetId:id,reason:reportReason})});
   const data=await r.json();if(!r.ok)throw new Error(data.error||'Unable to submit report.');
   setReportNotice('Report submitted for review.');setReportTarget(null);
  }catch(e){setReportNotice(e instanceof Error?e.message:'Unable to submit report.')}
  finally{setReporting(false)}
 }
 function ReportControl({type,id}:{type:'question'|'answer';id:string}){
  const open=reportTarget?.type===type&&reportTarget.id===id;
  return <div className="report-control">
   <button type="button" className="report-link" onClick={()=>{setReportNotice('');setReportTarget(open?null:{type,id})}}><Flag size={14}/>{open?'Cancel':'Report'}</button>
   {open&&<div className="report-panel"><label>Reason<select value={reportReason} onChange={e=>setReportReason(e.target.value as typeof reportReason)}><option value="off-topic">Off-topic</option><option value="spam">Spam / advertisement</option><option value="inappropriate">Inappropriate</option><option value="other">Other</option></select></label><button type="button" disabled={reporting} onClick={()=>report(type,id)}>{reporting?'Sending…':'Submit report'}</button></div>}
  </div>
 }

 if(questionId||previewQuestionOpen){
  return <Shell detail={Boolean(questionId)}>{isPreview()&&previewQuestionOpen&&<button type="button" className="discussion-back preview-back" onClick={()=>{setPreviewQuestionOpen(false);setQuestions(detail?[detail.question]:[]);}}><ArrowLeft size={17}/>All discussions</button>}<div className="heading-row"><div><h1>Discussion</h1><p className="intro">Food safety, quality and process excellence Q&amp;A.</p></div></div>
   {message&&<p className="discussion-message">{message}</p>}
   {reportNotice&&<p className="discussion-report-notice">{reportNotice}</p>}
   {loading?<p className="discussion-loading">Loading discussion…</p>:detail?<><article className="question-detail">
    <div className="discussion-meta"><span className={'discussion-category '+detail.question.category}>{categoryLabel(detail.question.category)}</span><span>{dateLabel(detail.question.createdAt)}</span></div>
    <h2>{detail.question.title}</h2><p>{detail.question.body}</p><div className="discussion-author"><span>Asked by <strong>{detail.question.name}</strong></span><ReportControl type="question" id={detail.question.id}/></div>
   </article>
   <section className="answers-section"><h2>{detail.answers.length} {detail.answers.length===1?'Answer':'Answers'}</h2>
    {detail.answers.length===0&&<p className="discussion-empty">No answers yet. Be the first to respond.</p>}
    {detail.answers.map(a=><article className="answer-card" key={a.id}><p>{a.body}</p><div className="answer-meta"><span><strong>{a.name}</strong><span>{dateLabel(a.createdAt)}</span></span><ReportControl type="answer" id={a.id}/></div></article>)}
   </section>
   <section className="answer-form-card"><h2>Your answer</h2><form onSubmit={answer}>
    <label>Display name<input required minLength={2} maxLength={40} value={answerName} onChange={e=>setAnswerName(e.target.value)} placeholder="Your name"/></label>
    <label>Answer<textarea required minLength={5} maxLength={2000} value={answerBody} onChange={e=>setAnswerBody(e.target.value)} placeholder="Share a practical, relevant answer…"/></label>
    <p className="discussion-rule">Text only. No links, advertisements or unrelated subjects.</p>
    <button type="submit" disabled={submitting}><Send size={17}/>{submitting?'Posting…':'Post answer'}</button>
   </form></section></>:<p className="discussion-empty">Question not found.</p>}
  </Shell>
 }

 return <Shell><div className="discussion-heading"><div><h1>Discussions</h1><p>Ask and answer practical questions about food safety, quality and process excellence.</p></div><button onClick={()=>setAskOpen(x=>!x)}><MessageCircleQuestion size={19}/>{askOpen?'Close':'Ask a question'}</button></div>
  <div className="discussion-scope"><strong>Scope:</strong> Food Safety · Quality · Process Excellence <span>No general advertising, unrelated subjects, links or promotions.</span></div>
  {message&&<p className="discussion-message">{message}</p>}
  {askOpen&&<section className="ask-card"><h2>Ask a question</h2><form onSubmit={ask}>
   <label>Topic<select value={category} onChange={e=>setCategory(e.target.value as typeof category)}><option value="food-safety">Food Safety</option><option value="quality">Quality</option><option value="process-excellence">Process Excellence</option></select></label>
   <label>Display name<input required minLength={2} maxLength={40} value={name} onChange={e=>setName(e.target.value)} placeholder="Your name"/></label>
   <label>Question title<input required minLength={12} maxLength={180} value={title} onChange={e=>setTitle(e.target.value)} placeholder="Example: How should allergen changeover validation be designed?"/></label>
   <label>Details<textarea required minLength={20} maxLength={3000} value={body} onChange={e=>setBody(e.target.value)} placeholder="Add enough context for professionals to answer clearly…"/></label>
   <p className="discussion-rule">Only professional questions within the three PMSV topics are accepted. Text only; no links or advertisements.</p>
   <button type="submit" disabled={submitting}><Send size={17}/>{submitting?'Posting…':'Post question'}</button>
  </form></section>}
  <section className="question-list"><div className="discussion-list-title"><h2>Latest questions</h2><span>{questions.length} discussions</span></div>
   {loading?<p className="discussion-loading">Loading discussions…</p>:questions.length===0?<div className="discussion-empty"><MessageCircleQuestion size={28}/><h3>No questions yet</h3><p>Start the first professional discussion.</p></div>:questions.map(q=><a className="question-card" key={q.id} href={route('/discussions/'+q.id)} onClick={e=>{if(isPreview()){e.preventDefault();const saved=readPreviewDetail();if(saved){setDetail(saved);setPreviewQuestionOpen(true);}}}}>
    <div className="discussion-meta"><span className={'discussion-category '+q.category}>{categoryLabel(q.category)}</span><span>{dateLabel(q.createdAt)}</span></div>
    <h3>{q.title}</h3><p>{q.body}</p><div className="question-bottom"><span>Asked by <strong>{q.name}</strong></span><span className="question-open">Open question · {q.answerCount} {q.answerCount===1?'answer':'answers'}</span></div>
   </a>)}
  </section>
 </Shell>
}
