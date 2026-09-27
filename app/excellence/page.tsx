import Newsroom from '../newsroom';
import news from '@/data/news.json';
import status from '@/data/status.json';
export const metadata={title:'Excellence | PMSV Food Safety Updates'};
export default function Page(){return <Newsroom initialNews={news} status={status} view={{kind:'topic',topic:'excellence'}}/>;}
