let puppeteer = require("puppeteer");

(async function(){
    const bowser = puppeteer.launch({
       headless:false,
       defaultViewport : null,
       args:["--incognito" , "--start maximized"]
    })

    let pages = await (await bowser).pages()
    let page = pages[0];

    

    await page.goto("https://www.google.com");


} )();