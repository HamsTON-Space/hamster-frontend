<template>
  <div class="login-box">
    <div class="flex justify-between login-header">
      <a target="_bank" @click="goHome">
        <img src="@/assets/images/logo-block.png" class="h-[28px] mt-[16px]" />
      </a>
    </div>
    <div class="text-center login-content ">
      <img src="@/assets/images/logo.png" class="h-[92px]" />
      <div class="text-[32px] text-[#ffffff] font-bold mb-[32px]">Welcome to Hamster</div>
      <div class="login-btn mb-[24px] bg-[#ffffff] text-[#000000] cursor-pointer" @click="loginBox">
        <img src="@/assets/icons/Frame-white.svg" class="h-[24px]" />
        <span class="align-middle ml-[6px]">Continue with GitHub</span>
      </div>
      <div class="login-btn mb-[24px] bg-[#ffffff] text-[#000000] cursor-pointer" @click="awakeWallet">
        <svg-icon name="metamaskLogo" size="18" class="mr-[4px]" />
        <span class="align-middle ml-[6px]">Continue with MeteMask</span>
      </div>
      <div class="login-btn btn-dis mb-[24px] bg-[#333230] text-[#FFFFFF]">
        <img src="@/assets/icons/icon-gitLab.svg" />
        <span class="align-middle ml-[6px]">Continue with GitLab</span>
      </div>
      <div class="login-btn btn-dis bg-[#333230] text-[#FFFFFF]">
        <img src="@/assets/icons/icon-bitbucket.svg" />
        <span class="align-middle ml-[6px]">Continue with Bitbucket</span>
      </div>
    </div>
  </div>

</template>
<script lang='ts' setup>
import { message } from "ant-design-vue";
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";


const router = useRouter()

const clientId = ref(import.meta.env.VITE_APP_CLIENTID);
const oauthUrl = ref('https://github.com/login/oauth/authorize');

const loginBox = () => {
  const userInfo = JSON.parse(localStorage.getItem('userInfo')) || {};
  if (JSON.stringify(userInfo) === '{}') {
    const state = new Date().getTime();
    const url = `${oauthUrl.value}?client_id=${clientId.value}&scope=read:user&state=${state}`;
    const myWindow = window.open(url, 'login-github', 'modal=yes,toolbar=no,titlebar=no,menuba=no,location=no,top=100,left=500,width=800,height=700')
    myWindow?.focus()
  } else {
    if (userInfo.token) {
      localStorage.setItem('token', userInfo.token);
      commonJump()
    } else {
      const state = new Date().getTime();
      const url = `${oauthUrl.value}?client_id=${clientId.value}&scope=read:user&state=${state}`;
      const myWindow = window.open(url, 'login-github', 'modal=yes,toolbar=no,titlebar=no,menuba=no,location=no,top=100,left=500,width=800,height=700')
      myWindow?.focus()
    }
  }
}
const commonJump = ()=>{
  if (localStorage.getItem('firstState') === "0") {
      //第一次登录
      router.push('/welcome')
    } else {
      router.push('/projects')
    }
}
// 通过钱包登录
const awakeWallet = async()=>{
  if (window.ethereum) {
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    const address = accounts[0];
    if(address){
      localStorage.setItem('token',address)
      commonJump()
    }
    console.log(`Metamask wallet address: ${address}`,accounts);
  } else {
    message.error('Please install MetaMask!')
    console.log('Please install MetaMask!');
  }
}
const goHome = () => {
  let linkVal = "https://portal.hamster.newtouch.com"
  if (window.location.href.indexOf('hamsternet.io') !== -1) {
    linkVal = "https://hamsternet.io";
  }
  window.open(linkVal)
};
onMounted(()=>{
  if(localStorage.getItem('token')){
    if(localStorage.getItem('firstState')==="0"){
      router.push('/welcome')
    }
    else{
      router.push('/projects')
    }
  }
})
</script>
<style lang='less' scoped>
.login-box {
  min-height: 100vh;
  padding: 0 32px;
  background: url("../../assets/images/login-bg.jpg") 100% 100% no-repeat;
  background-size: cover;

  .login-header {
    height: 64px;
  }

  .login-content {
    font-size: 16px;
    width: 400px;
    position: fixed;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);

    .login-btn {
      border-radius: 8px;
      line-height: 56px;
    }

    .btn-dis {
      width: 100%;
      height: 56px;
      position: relative;

      &::before {
        content: 'coming soon';
        position: absolute;
        top: 0;
        right: 0;
        width: 89px;
        height: 24px;
        line-height: 24px;
        font-size: 12px;
        border-radius: 0 8px 0 8px;
        color: #ffffff;
        background-color: #E2B578;
      }
    }
  }
}
</style> 