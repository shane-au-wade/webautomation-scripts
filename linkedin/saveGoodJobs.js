/**
 * This script is intended to be ran on any linkedin job search page
 * like https://www.linkedin.com/jobs/search/?f_E=2&geoId=90000084&location=San%20Francisco%20Bay%20Area
 * 
 * to run the script
 * 1. go to a job search page, apply any filters you want
 * 2. open up the console with f12 or right click > inspect 
 * 3. copy and paste the code below into the console
 * 
 * Once you have ran it on one page, you can either refresh the page
 * and go to another page and repeat the step 3
 * 
 * or
 * 
 * keep the terminal open, go the the next page and paste
 * index = 0; entryPoint();
 * this will reset the global index counter and rerun the code 
 * 
 * !!!WARNING!!! 
 * You should NOT just copy and paste code into the browser terminal!
 * It can be dangerous...  Read the code, and make sure it isn't
 * doing anything malicious 
 * 
 * These scripts will eventually be turned into a google chrome extension, 
 * so distribution will be a little less sketchy
 */

// Copy everthing below 

// Configurations
/* to adjust job validation, adjust the regex pattern below
 * you can paste a job description into https://www.regexpal.com/
 * and then refine your search 
 */  
const regex = /[1,2,3]\+\W*years|[1,2,3]\W*years/g; // looks for 1-3 years of experience

// Globals
let jobTiles = document.querySelector('ul.jobs-search-results__list.list-style-none')
let index = 0
let mutationCount = 0

// helper sleep function
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

let scrollSearchResults = async () => {
    let searchResultsPanel = document.querySelector('div.jobs-search-results')
    searchResultsPanel.scrollTo({behavior: 'smooth'})
    let chunks = 10
    let scrollHeight = parseInt(searchResultsPanel.scrollHeight)
    for(let i = 1; i <= chunks; i++ ) {
        let height = scrollHeight * i/chunks
        //console.log(height)
        searchResultsPanel.scrollTo(0,height)
        await sleep(500)
    }
    await sleep(1000)
    return true
}

let validateJob = async () => {
    let jobDetails = await document.querySelector('div#job-details').innerText
    // the regex variable can be found in the top config section
    const found = jobDetails.match(regex); // found will be null if there is no match
    if(found) {
        return true
    } else {
        return false
    }
}

let initalizeObserver = async () => {
    //console.log('creating observer')
    // target the save button
    let targetNode = document.querySelector('button.mr2.artdeco-button.artdeco-button--3.artdeco-button--secondary.jobs-save-button.ember-view')
    //console.log(targetNode)
    let observerCallback = async (mutations, observer) => { 
        //console.log("mutations from observer: ", mutations)
        mutationCount++
        if(mutationCount >= 1) {
            mutationCount = 0
            observer.disconnect()
            ++index
            jobTiles.children[index].children[0].children[0].click()
            await sleep(500)
            await sleep(500)
            checkCurrentTile()
        }
    }
    let observerConfig = {
        subtree:true, 
        attributes: true
    }
    const observer = new MutationObserver( observerCallback )
    observer.observe(targetNode, observerConfig)
    return true
}

let checkCurrentTile = async () => {
    let goodJob = await validateJob()
    let saveButton = document.querySelector('button.mr2.artdeco-button.artdeco-button--3.artdeco-button--secondary.jobs-save-button.ember-view')
    if(goodJob && saveButton.innerText.toLowerCase().indexOf('unsave') === -1) {
        console.log('we have match!')
        // setup observer to continue the process when the 
        // save button is clicked
        await initalizeObserver()
        await sleep(500)
        await saveButton.click()
    } else {
        ++index
        jobTiles.children[index].children[0].children[0].click()
        await sleep(500)
        await sleep(500)
        checkCurrentTile()
    }
}

let entryPoint = async () => {
    await scrollSearchResults()
    jobTiles.children[0].children[0].children[0].click()
    checkCurrentTile()
}

entryPoint()