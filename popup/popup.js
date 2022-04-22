let connectCount = 0;
let connectListStore = [];
let runningConnection =  [];


const getRandomNumber = Math.round(Math.random() * 6) * 1000;

document.getElementById('actionBtn').addEventListener('click', async () => {
    if(document.getElementById('actionBtn').textContent !== 'START CONNECTING'){
        runningConnection.forEach((id)=>{
            clearTimeout(id);
        })
        reset();
        return '';
    }
    let [tab] = await chrome.tabs.query({ active: true, windowType: "normal", currentWindow: true });
    chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: getPeopleListInjectScript,
        args: ['test']
    }, (injectionResult) => {
        if(injectionResult[0]?.result == null){
            document.getElementById('actionBtn').textContent = 'TRAY AGAIN';
        }
        if (injectionResult[0]?.result?.connectList?.length > 0) {
            connectListStore = injectionResult[0].result.connectList;
            document.getElementById('actionBtn').textContent = 'STOP CONNECTING';
            document.getElementById('actionBtn').style.backgroundColor = '#F56D91';

            document.getElementById('increment_text').textContent = connectListStore.length;
            var setTime = setTimeout(() => {
                sendConnectInjectScript(connectListStore[connectCount]);
                changeUi();
                connectCount++;
            }, getRandomNumber);
            runningConnection.push(setTime);
        }
    });
})




function getPeopleListInjectScript(test) {
    let peopleList = document.querySelectorAll('ul.reusable-search__entity-result-list button');
    let paginationList = document.querySelectorAll('.artdeco-pagination__button');

    let peopleListId = {
        connectList: [],
        paginationList: []
    };

    peopleList.forEach((people) => {
        people.childNodes.forEach((item) => {
            if (typeof (item.classList) == 'object') {
                if (item.classList.contains('artdeco-button__text')) {
                    if (item.innerHTML.trim() == 'Connect') {
                        peopleListId.connectList.push(people.id);
                    }
                }
            }
        })
    })
    paginationList.forEach((item) => {
        peopleListId.paginationList.push(item.id);
    })
    return peopleListId;
}

async function sendConnectInjectScript(btnId) {
    let [tab] = await chrome.tabs.query({ active: true, windowType: "normal", currentWindow: true });
    chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: sendConnect,
        args: [btnId]
    }, (injectionResult) => {
        if(injectionResult[0].result !== null){
            if (connectCount < connectListStore.length) {
                var setTimeLoop =  setTimeout(() => {
                    sendConnectInjectScript(connectListStore[connectCount]);
                    changeUi();
                    connectCount++;
                }, getRandomNumber);
                runningConnection.push(setTimeLoop);
            } else {
                console.log('all connect send');
                reset()
            }
        }else{
            return '';
        }
        
    });

}

function sendConnect(btnId) {
    document.getElementById(btnId).click();
    document.getElementById('artdeco-modal-outlet').addEventListener("DOMNodeInserted", function (event) {
        document.querySelectorAll('#artdeco-modal-outlet .artdeco-button--2').forEach((item) => {
            if (item.innerText.trim().toLowerCase() == 'send') {
                document.getElementById(item.id).click();
            }
        });
    }, false);
    return btnId;
}





function changeUi() {
  let offSetValue =   (233 - (Math.round((233 / connectListStore.length)) * (connectCount +1)));
  document.getElementById('increment_text').textContent = (connectCount +1);
  if(offSetValue <= 0){
    document.getElementById('progressBar').style.strokeDashoffset = 0;
  }else{
    document.getElementById('progressBar').style.strokeDashoffset = offSetValue;
  }
    
}


function reset(params) {
    connectCount = 0;
    connectListStore = [];
    runningConnection = [];
    document.getElementById('progressBar').style.strokeDashoffset = 233;
    document.getElementById('increment_text').textContent = 0;
    document.getElementById('actionBtn').textContent = 'START CONNECTING';
    document.getElementById('actionBtn').style.backgroundColor = '#4E944F';
}

