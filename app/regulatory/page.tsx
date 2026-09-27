import Newsroom from '../newsroom';
import news from '@/data/news.json';
import status from '@/data/status.json';
export const metadata={title:'Regulatory Updates | PMSV Food Safety Updates'};
export default function Regulatory(){return <Newsroom initialNews={news} status={status} view={{kind:'regulatory'}}/>;}
