import Newsroom from './newsroom';
import news from '@/data/news.json';
import status from '@/data/status.json';
export default function Home(){return <Newsroom initialNews={news} status={status}/>;}
