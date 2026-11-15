import {createHash} from 'node:crypto';
import {readdir,readFile,writeFile} from 'node:fs/promises';
import path from 'node:path';
const dir=process.argv[2];const names=(await readdir(dir)).filter(f=>/\.(exe|dmg|zip)$/.test(f)).sort();
await writeFile(path.join(dir,'SHA256SUMS.txt'),(await Promise.all(names.map(async n=>createHash('sha256').update(await readFile(path.join(dir,n))).digest('hex')+'  '+n))).join('\n')+'\n');
