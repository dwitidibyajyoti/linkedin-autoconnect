

let connectCount = 0;
let connectListStore = [];
let runningConnection = [];


const getRandomNumber = Math.round(Math.random() * 6) * 1000;



document.getElementById('actionBtn').addEventListener('click', async () => {


     var message = document.getElementById('connect_with_message').value;

     if(message == ''){
        return;
     }
    

    if (document.getElementById('actionBtn').textContent !== 'START CONNECTING') {
        runningConnection.forEach((id) => {
            clearTimeout(id);
        })
        reset();
        return '';
    }
    let [tab] = await chrome.tabs.query({
        active: true,
        windowType: "normal",
        currentWindow: true
    });

    chrome.scripting.executeScript({
        target: {
            tabId: tab.id
        },
        function: getPeopleListInjectScript,
        args: ['test']
    }, (injectionResult) => {
        if (injectionResult[0]?.result == null) {
            document.getElementById('actionBtn').textContent = 'TRAY AGAIN';
        }
        // console.log('injectionResult');
        if (injectionResult[0]?.result?.connectList?.length > 0) {
            connectListStore = injectionResult[0].result.connectList;
            document.getElementById('actionBtn').textContent = 'STOP CONNECTING';
            document.getElementById('actionBtn').style.backgroundColor = '#F56D91';

            document.getElementById('increment_text').textContent = connectListStore.length;
            var setTime = setTimeout(() => {
                sendConnectInjectScript(connectListStore[connectCount],message);
                changeUi();
                connectCount++;
            }, getRandomNumber);
            runningConnection.push(setTime);
        }
    });
})



function getPeopleListInjectScript (test) {
  let peopleList = document.querySelectorAll ('.artdeco-list__item');
  let paginationList = document.querySelectorAll (
    '.artdeco-pagination__button'
  );

  // return;
  let peopleListId = {
    connectList: [],
    paginationList: [],
  };

  peopleList.forEach (async people => {
    peopleListId.connectList.push (people.children[0].children[0].children[1].children[1].children[0].children[0].children[0].id);
  });
  paginationList.forEach (item => {
    peopleListId.paginationList.push (item.id);
  });
//   console.log (peopleListId);
  return peopleListId;
}


async function sendConnectInjectScript(btnId,message) {
    let [tab] = await chrome.tabs.query({
        active: true,
        windowType: "normal",
        currentWindow: true
    });
    chrome.scripting.executeScript({
        target: {
            tabId: tab.id
        },
        function: sendConnect,
        args: [btnId,message]
    }, (injectionResult) => {
        //  console.log(injectionResult,'>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>.');
        if (injectionResult[0].result !== null) {
            if (connectCount < connectListStore.length) {
                var setTimeLoop = setTimeout(() => {
                    sendConnectInjectScript(connectListStore[connectCount],message);
                    changeUi();
                    connectCount++;
                }, getRandomNumber);
                runningConnection.push(setTimeLoop);
            } else {
                console.log('all connect send');
                reset()
            }
        } else {
            return '';
        }

    });

}

async function sendConnect(btnId,message) {
    // console.log(btnId, message,'>>>>>>>>>>>>>>>>>>>>>>>.');

    document.getElementById(btnId).children[0].click()
   
    function waitForElm(selector) {
        return new Promise((resolve,reject) => {
            
            if (document.querySelector(selector)) {
                return resolve(document.querySelector(selector));
            }

            const observer = new MutationObserver(mutations => {
                if(selector !== '.compose-form__message-field' ){
                    if(document.getElementsByClassName('message-item__date-boundary')[0]){
                        reject("reject")
                    }
                }
                
                if (document.querySelector(selector)) {
                    resolve(document.querySelector(selector));
                    observer.disconnect();
                }
            });

            observer.observe(document.body, {
                childList: true,
                subtree: true
            });

        });
    }


    await waitForElm('.artdeco-dropdown__content-inner').then(async (elm) => {
        // console.log('Element is ready form_message');

        // console.log(elm.children[0].children[elm.children[0].children.length-3].children[0].textContent.replace(/^\s+|\s+$/gm,''));
        if(elm.children[0].children[elm.children[0].children.length-3].children[0].textContent.replace(/^\s+|\s+$/gm,'') !== 'Connect — Pending'){
           elm.children[0].children[elm.children[0].children.length-3].children[0].click();
           await waitForElm('#connect-cta-form__invitation').then(async (elm) => {
            elm.value = message;

            document.getElementsByClassName('connect-cta-form__send')[0].disabled = false; // click button to send connection

            // console.log(document.getElementsByClassName('connect-cta-form__send')[0],'i think >>>>>>>');
            document.getElementsByClassName('connect-cta-form__send')[0].click();
            // document.getElementsByClassName('connect-cta-form__cancel')[0].click();
            
           
            // document.getElementsByClassName('connect-cta-form__send')[0].click(); // click button to send connection
            document.getElementById(btnId).children[0].click();

        })}else{
            document.getElementById(btnId).children[0].click();
        } 
        document.getElementById(btnId).children[0].click();
       
    })


   return btnId;

    

    
    // await waitForElm('.compose-form__subject-field').then(async (elm) => {
    //     console.log('Element is ready subject filed');
    //     elm.value = "My value";
    //     elm.dispatchEvent(new Event('change', {
    //         bubbles: true
    //     }));
    //     document.getElementsByClassName('compose-form__message-field')[0].dispatchEvent(new Event('input'));
    //     //  document.querySelectorAll('button[id^="artdeco-hoverable-artdeco-gen-"]')[0].click();  click the send button hear; 
    //     document.querySelectorAll('button[id^="artdeco-hoverable-artdeco-gen-"]')[0].style.backgroundColor = 'red';
    //     document.getElementsByClassName('artdeco-button--circle artdeco-button--inverse')[1].click()

    //     await waitForElm('.artdeco-modal--layer-confirmation').then((elm) => {
    //         // console.log('new>>>>>>>>>>>>>>>>>');
    //         // artdeco-modal__confirm-dialog-btn
    //         elm.querySelectorAll('.artdeco-modal__confirm-dialog-btn')[1].click();
    //     })

       
    // }).catch( async ()=>{
    //     document.getElementsByClassName('compose-form__message-field')[0].dispatchEvent(new Event('input'));
    //     //  document.querySelectorAll('button[id^="artdeco-hoverable-artdeco-gen-"]')[0].click();  click the send button hear; 
    //     document.querySelectorAll('button[id^="artdeco-hoverable-artdeco-gen-"]')[0].style.backgroundColor = 'red';
    //     document.getElementsByClassName('artdeco-button--circle artdeco-button--inverse')[1].click()
    //     console.log(">>>>>>>>>>...hell");
    //     await waitForElm('.artdeco-modal--layer-confirmation').then((elm) => {
    //         console.log('discart');
    //         // artdeco-modal__confirm-dialog-btn
    //         elm.querySelectorAll('.artdeco-modal__confirm-dialog-btn')[1].click();
    //     })
    // })
    // return
   

    
}




function changeUi() {
    let offSetValue = (233 - (Math.round((233 / connectListStore.length)) * (connectCount + 1)));
    document.getElementById('increment_text').textContent = (connectCount + 1);
    if (offSetValue <= 0) {
        document.getElementById('progressBar').style.strokeDashoffset = 0;
    } else {
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