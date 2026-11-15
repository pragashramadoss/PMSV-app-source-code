import Newsroom from '../newsroom';
import status from '@/data/status.json';
export default function BookmarksPage(){return <Newsroom initialNews={[]} status={status} view={{kind:'bookmarks'}}/>;}
