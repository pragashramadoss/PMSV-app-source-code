import Newsroom from '../newsroom';
import news from '@/data/news.json';
import status from '@/data/status.json';
export const metadata={title:'Blogs by Pragash Ramadoss | PMSV'};
export default function Blogs(){return <Newsroom initialNews={news} status={status} view={{kind:'blogs'}}/>;}
