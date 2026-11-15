import { _electron as electron, expect } from '@playwright/test';
import { mkdtemp, mkdir, readFile } from 'node:fs/promises';
import os from 'node:os'; import path from 'node:path';
const executablePath=process.env.PMSV_EXECUTABLE;if(!executablePath)throw Error('PMSV_EXECUTABLE is required');
const userData=await mkdtemp(path.join(os.tmpdir(),'pmsv-desktop-qa-'));await mkdir('test-results',{recursive:true});
const launch=()=>electron.launch({executablePath,args:['--pmsv-offline','--pmsv-test-data='+userData],timeout:60000});
let app=await launch();let page=await app.firstWindow();page.on('dialog',d=>d.accept());
try{
 await expect(page.getByRole('heading',{name:'Welcome to the Forum',exact:true})).toBeVisible({timeout:30000});
 await expect(page.locator('.app-notification-actions')).toBeVisible();
 const hiddenHint=page.locator('.sr-only').first();
 await expect(hiddenHint).toHaveCSS('position','absolute');
 await expect(hiddenHint).toHaveCSS('width','1px');
 await page.screenshot({path:'test-results/home.png'});
 await page.goto('pmsv://app/audits/general-manufacturing.html');
 await expect(page.locator('#fbo')).toBeVisible();await page.locator('#fbo').fill('PMSV offline test');
 await page.locator('tbody select').first().selectOption('C');await page.locator('.pmsv-draft').click();
 await expect(page).toHaveURL(/draft=/);const draft=page.url();
 await page.screenshot({path:'test-results/audit-saved.png'});
 await app.close();app=await launch();page=await app.firstWindow();page.on('dialog',d=>d.accept());
 await page.goto(draft);await expect(page.locator('#fbo')).toHaveValue('PMSV offline test');await expect(page.locator('tbody select').first()).toHaveValue('C');
 await page.goto('pmsv://app/fssai-license/index.html');
 await expect(page.getByRole('heading',{name:'Find the right FSSAI licence',exact:true})).toBeVisible();
 await page.getByRole('button',{name:'Start licence finder',exact:true}).click();
 await page.screenshot({path:'test-results/licence.png'});
 // Native export uses a chosen destination. Stub only the OS chooser; exercise the real IPC and filesystem write.
 const exportFile=path.join(userData,'PMSV-QA-report.csv');
 await app.evaluate(({dialog},file)=>{dialog.showSaveDialog=async()=>({canceled:false,filePath:file});},exportFile);
 await page.evaluate(()=>{const a=document.createElement('a');a.download='PMSV-QA-report.csv';a.href=URL.createObjectURL(new Blob(['Question,Status\nTest,C\n'],{type:'text/csv'}));a.click();});
 await expect.poll(async()=>{try{return await readFile(exportFile,'utf8')}catch{return''}}).toContain('Question,Status');
 await expect(page.evaluate(()=>({node:typeof window.require,bridge:typeof window.pmsvDesktop.save}))).resolves.toEqual({node:'undefined',bridge:'function'});
 console.log('PASS: packaged Home, offline audit save/relaunch, local licence tool, native report export, isolated renderer.');
}finally{await app.close();}
