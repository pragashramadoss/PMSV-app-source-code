import Newsroom from '../../newsroom';
import news from '@/data/news.json';
import status from '@/data/status.json';
import {professionalBodies} from '@/lib/professional-bodies';
import {notFound} from 'next/navigation';
export default async function BodyPage({params}:{params:Promise<{body:string}>}){
 const {body}=await params;
 if(!professionalBodies.some(b=>b.id===body&&b.topics.includes('excellence')))notFound();
 return <Newsroom initialNews={news} status={status} view={{kind:'topic',topic:'excellence',body}}/>;
}
