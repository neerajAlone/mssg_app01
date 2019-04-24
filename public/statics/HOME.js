function appBodyHeightAdjust() {
  let windowHeight = window.innerHeight;
  let appHead = document.querySelector('.appHead'),
      appBody = document.querySelector('.appBody');
  appBody.style.height = windowHeight-appHead.clientHeight+'px';
}
function dirBtnWorking() {
  let btnBoolean = true;
  let upper = document.querySelector('.upper'),
      lower = document.querySelector('.lower'),
      dirBtn = document.querySelector('.dirBtn');
  dirBtn.addEventListener('click', ()=>{
    if(btnBoolean) {
      upper.style.transform = 'scale(0)';
      upper.style.height = '0px';
      dirBtn.style.transform = 'rotateZ(180deg)';
      lower.style.transform = 'scale(1)';
      lower.style.height = '273px';
      btnBoolean = !btnBoolean;
    } else {
      upper.style.transform = 'scale(1)';
      upper.style.height = '160px';
      dirBtn.style.transform = 'rotateZ(0deg)';
      lower.style.transform = 'scale(0)';
      lower.style.height = '0px';
      btnBoolean = !btnBoolean;
    }
  })
}
function formWorking() {
  const Login = {
    email: '',
    password: ''
  }, AddMe = {
    name: '',
    surname: '',
    email: '',
    password: ''
  };
  let upperForm = document.querySelector('.upper'),
      lowerForm = document.querySelector('.lower'),
      getinBtn = document.querySelector('.getinBtn'),
      addmeBtn = document.querySelector('.addmeBtn');
  
  upperForm.querySelectorAll('input').forEach(eInput=>{
    eInput.addEventListener('change', e=>{
      Login[e.target.name] = e.target.value;
    });
  });
  getinBtn.addEventListener('click', ()=>{
    fetch('/server/user_login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(Login)
    }).then(res=>res.json()).then(res=>{
      if(res.done){
        localStorage.setItem('userAuthObject', JSON.stringify(res));
        window.location.href = '/user'
      } else {
        console.log(res.mssg);
      }
    }).catch(err=>{ throw err })
  });

  lowerForm.querySelectorAll('input').forEach(eInput=>{
    eInput.addEventListener('change', e=>{
      AddMe[e.target.name] = e.target.value;
    });
  });
  addmeBtn.addEventListener('click', ()=>{
    console.log(AddMe);
    fetch('/server/add_user', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(AddMe)
    }).then(res=>res.json()).then(res=>{
      if(res.done){
        window.location.href = '/';
      } else console.log(res.mssg);
    }).catch(err=>{ throw err })
  })
}

window.addEventListener('DOMContentLoaded', ()=>{
  let userAuthObject = localStorage.getItem('userAuthObject');
  if(userAuthObject === null) {
    console.log('HOME');
    appBodyHeightAdjust();
    dirBtnWorking();
    formWorking();
  } else window.location.href = '/user'
})