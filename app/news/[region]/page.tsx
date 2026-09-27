import Newsroom from '../../newsroom';
import news from '@/data/news.json';
import status from '@/data/status.json';
import {notFound} from 'next/navigation';
export async function generateMetadata({params}:{params:Promise<{region:string}>}){const {region}=await params;return {title:`${region==='india'?'India':'Global'} News | PMSV Food Safety Updates`}}
export default async function Feed({params}:{params:Promise<{region:string}>}){const {region}=await params;if(!['india','global'].includes(region))notFound();return <Newsroom initialNews={news} status={status} view={{kind:'feed',region}}/>;}
