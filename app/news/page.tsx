import Newsroom from '../newsroom';
import news from '@/data/news.json';
import status from '@/data/status.json';
export const metadata={title:'India & Global News | PMSV Food Safety Updates'};
export default function News(){return <Newsroom initialNews={news} status={status} view={{kind:'news'}}/>;}
