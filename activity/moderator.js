let puppeteer = require("puppeteer");
let fs = require("fs");
let cFile = process.argv[2];
(async function(){
    let browser = await puppeteer.launch({
        headless: false,
        defaultViewport: null,
        args: ["--start-maximized"]
        
    });

    let tabs = await browser.pages();
    let tab = tabs[0];
    
    let data = await fs.promises.readFile(cFile);
    let {url, user, pwd} = JSON.parse(data);

    await tab.goto(url, { waitUntil: "networkidle0" });

    //******LOGIN******* */
    await tab.type("#input-1", user);
    await tab.type("#input-2", pwd);
  
    await Promise.all(
      [tab.waitForNavigation({ waitUntil: "networkidle0" }),
      tab.click("button[data-analytics=LoginPassword]")]);

    //*******DASHBOARD******** */
    await tab.waitForSelector("a[data-analytics=NavBarProfileDropDown]", { visible: true });
  await tab.click("a[data-analytics=NavBarProfileDropDown]");
  await Promise.all(
    [tab.waitForNavigation({ waitUntil: "networkidle0" }),
    tab.click("a[data-analytics=NavBarProfileDropDownAdministration]"),])

  await tab.waitForSelector(".administration header", { visible: true })
  let mtabs = await tab.$$(".administration header ul li a");

  let href = await tab.evaluate(function (el) {
    return el.getAttribute("href");
  }, mtabs[1])
  let mpUrl = "https://www.hackerrank.com" + href;
  // console.log("Line number number " + mpUrl);
  await tab.goto(mpUrl, { waitUntil: "networkidle0" });
  // get question

  await handleSinglePageQuestion(tab, browser);

})()

async function handleSinglePageQuestion(tab, browser){
    await tab.waitForSelector(".backbone.block-center");
    let qoncPage = await tab.$$(".backbone.block-center");
    let pArr = [];

    //all questions of that page
    for(let i=0;i < qoncPage.length; i++){
        let href = await tab.evaluate(function(elem){
            return elem.getAttribute("href");
        },qoncPage[i]);

        let newTab = await browser.newPage();
        //developer tools => elem.getAttribute
        let mWillAddedPromisetocQ = handleSingleQuestion(newTab, "https://www.hackerrank.com" + href);
        pArr.push(mWillAddedPromisetocQ);

    }

    await Promise.all(pArr);
    //go to next page
    await tab.waitForSelector(".pagination ul li");
    let paginationBtn = await tab.$$(".pagination ul li");
    let nxtBtn = paginationBtn[paginationBtn.length - 2];
    let className = await tab.evaluate(function(nxtBtn){
        return nxtBtn.getAttribute("class");
    }, nxtBtn);

    if(className == "disabled"){
        return; 
    }
    else{
        await Promise.all([nxtBtn.click(), tab.waitForNavigation({
            waitUntil: "networkidle0"
        })]);
        await handleSinglePageQuestion(tab, browser);
    }
}

async function handleSingleQuestion(newTab, link){
    console.log(link);
    await newTab.goto(link, {waitUntil: "networkidle0"});
    //popup => save changes may not have been saved
    await newTab.waitForSelector(".tag");
    await newTab.click("li[data-tab=moderators]");
    await newTab.waitForSelector("input[id=moderator]", {visible: "true"});
    await newTab.type("#moderator","rkrajnees3");
    await newTab.keyboard.press("Enter");
    await newTab.click(".save-challenge.btn.btn-green");
    await newTab.close();

}