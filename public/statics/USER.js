const userAuthObject = JSON.parse(localStorage.getItem('userAuthObject'));
let mssgBoxObject;

function appBodyHeightAdjust() {
  let windowHeight = window.innerHeight;
  let appHead = document.querySelector('.appHead'),
      appBody = document.querySelector('.appBody'),
      appBUp = document.querySelector('.appBUp');
  appBody.style.height = windowHeight-appHead.clientHeight+'px';
  appBUp.style.height = windowHeight-appHead.clientHeight-90+'px';
}
function authFetching(apiUrl, apiBody) {
  return fetch(`/server/${apiUrl}`, {
    method: apiBody?'POST':'GET',
    headers: {
      'Authorization': `Bearer ${userAuthObject._token}`,
      'Content-Type': 'application/json'
    },
    body: apiBody?JSON.stringify(apiBody):null
  }).then(res=>res.json());
}
function userMssg(mssg) {
  let appBUp = document.querySelector('.appBUp');
  let userMssgDiv = document.createElement('div');
  let userMssgHtml = `
  <div class="mssgBox">
    <div class="mssgHead">
      <div class="textIcon">
        <i class="fas fa-user-circle"></i>
        <h5>YOU</h5>
      </div>
      <div class="textIcon">
        <i class="fas fa-clock"></i>
        <h5>${moment().calendar(mssg.time)}</h5>
      </div>
    </div>
    <p>${mssg.mssg}</p>
  </div>`;
  userMssgDiv.className = 'userMssg';
  userMssgDiv.innerHTML = userMssgHtml;
  appBUp.append(userMssgDiv);
}
function otherMssg(mssg) {
  let appBUp = document.querySelector('.appBUp');
  let otherMssgDiv = document.createElement('div');
  let otherMssgHtml = `
  <div class="mssgBox">
    <div class="mssgHead">
      <div class="textIcon">
        <i class="fas fa-user-circle"></i>
        <h5>${mssg.name}</h5>
      </div>
      <div class="textIcon">
        <i class="fas fa-clock"></i>
        <h5>${moment().calendar(mssg.time)}</h5>
      </div>
    </div>
    <p>${mssg.mssg}</p>
  </div>`;
  otherMssgDiv.className = 'otherMssg';
  otherMssgDiv.innerHTML = otherMssgHtml;
  appBUp.append(otherMssgDiv);
}
function timeBand(dateStamp) {
  let appBUp = document.querySelector('.appBUp');
  let h4Tag = document.createElement('h4');
  h4Tag.className = 'timeBand';
  // let dateArray = moment().calendar(dateStamp).split(' ')
  // if(dateArray.length > 4){
  //   h4Tag.innerHTML = dateArray[0]+' '+dateArray[1]
  // } else h4Tag.innerHTML = dateArray[0];
  h4Tag.innerHTML = dateStamp;
  appBUp.append(h4Tag);
}
function mssgDistribution(userData, mssgBoxObject) {
  let appBUp = document.querySelector('.appBUp');
  appBUp.innerHTML = '';
  timeBand(mssgBoxObject.PERIOD);
  mssgBoxObject.MSSGBOX.length === 0 || mssgBoxObject.MSSGBOX
    .forEach(eachMssg=>{
      if(eachMssg.id === userData._id) userMssg(eachMssg)
        else otherMssg(eachMssg)
    })
}

function navbar(user, tokenTimeStamp) {
  if(Date.now() <= tokenTimeStamp) {
    let sidenav = document.querySelector('.sidenav');
    sidenav.children[0].innerHTML = user.name;
    sidenav.children[1].innerHTML = (user.name).slice(0, 1)+(user.surname).slice(0, 1);
    sidenav.children[2].addEventListener('click', ()=>signOut());
  } else signOut();
}
function mssgWork(userData, mssgBoxObject) {
  mssgDistribution(userData.data, mssgBoxObject)
  const socket = io.connect(window.location.host);
  let mssgArea = document.querySelector('.mssgArea'),
      forwardBtn = document.querySelector('.forwardBtn');
  
  forwardBtn.addEventListener('click', ()=>{
    if(Date.now() <= userData.tokenExpiresAt) {
      socket.emit('clientMssg', {
        mssg: mssgArea.value,
        id: userData.data._id,
        name: `${userData.data.name} ${userData.data.surname.slice(0,1)}`,
        time: Date.now()
      });
      mssgArea.value = '';
    } else signOut();
  });
  socket.on('returnMssg', data=>{
    if(Date.now() <= userData.tokenExpiresAt) {
      mssgBoxObject.MSSGBOX.push(data);
      mssgDistribution(userData.data, mssgBoxObject)
    } else signOut();
  })
}
function signOut() {
  closeOrRefresh(mssgBoxObject)
  window.location.href = '/';
  localStorage.clear();
}
function closeOrRefresh(mssgContainer) {
  authFetching('/userDataBase', mssgContainer)
    .then(res=>{
      console.log(res)
    })
}


window.addEventListener('DOMContentLoaded', ()=>{
  if(userAuthObject) {
    console.log('USER');
    authFetching(`user/${userAuthObject._id}`)
      .then(userRes=>{
        navbar(userRes.data, userRes.tokenExpiresAt);
        appBodyHeightAdjust();
        authFetching(`userDataBase/${new Date().toDateString()}`)
          .then(res=>{
            if(!res.done) {
              mssgBoxObject = {
                PERIOD: new Date().toDateString(),
                MSSGBOX: []
              }
            } else mssgBoxObject = res.data;
            mssgWork(userRes, mssgBoxObject)
          })
      })
  } else {
    window.location.href = '/';
  }
});
window.addEventListener('unload', ()=>{
  closeOrRefresh(mssgBoxObject)
})