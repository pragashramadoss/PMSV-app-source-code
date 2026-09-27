import Newsroom from '../../newsroom';
import news from '@/data/news.json';
import status from '@/data/status.json';
import {regions} from '@/lib/news-model';
import {notFound} from 'next/navigation';
export async function generateMetadata({params}:{params:Promise<{region:string}>}){const {region}=await params;return {title:`${regions.find(r=>r.id===region)?.name||'Regulatory'} | PMSV Food Safety Updates`}}
export default async function Country({params}:{params:Promise<{region:string}>}){const {region}=await params;if(!regions.some(r=>r.id===region))notFound();return <Newsroom initialNews={news} status={status} view={{kind:'country',region}}/>;}
