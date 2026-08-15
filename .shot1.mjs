import puppeteer from 'puppeteer-core';
const b = await puppeteer.launch({ executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless:'new', defaultViewport:{width:1280,height:800}, args:['--hide-scrollbars','--enable-gpu','--use-gl=angle','--no-sandbox']});
const p = await b.newPage();
await p.goto('http://localhost:5173',{waitUntil:'networkidle2'});
await p.waitForFunction(()=>!document.querySelector('.preload'),{timeout:20000});
await p.evaluate((yy)=>window.scrollTo({top:yy,behavior:'instant'}), Number(process.argv[3]));
await new Promise(r=>setTimeout(r,3000));
await p.screenshot({path:process.argv[2]});
await b.close();
