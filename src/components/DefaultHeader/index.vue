<template>
  <div class="default-header bg-[#FFFFFF] dark:bg-[#1D1C1A] flex justify-between">
    <div class="flex items-center cursor-pointer">
      <div class="flex items-center cursor-pointer" @click="goHome">
        <img src="@/assets/icons/logo-dark.svg" class="h-[36px] hidden dark:inline-block" />
        <img src="@/assets/icons/logo-white.svg" class="h-[36px] dark:hidden" />
      </div>
      <div @click="goPrjects" style="height:64px;line-height:64px" 
        class="text-[#E2B578] text-[16px] cursor-pointer ml-12 mr-8" id="pro">Projects</div>
      <a-dropdown v-if="!isShowMiddleware">
        <div class="text-[#E2B578] text-[16px] cursor-pointer"
          @click.stop id="middle" style="height:64px;line-height:64px;">
          Middleware
          <img src="@/assets/icons/skx.svg" alt="" class="h-[7px] hidden up-tran">
          <img src="@/assets/icons/skx1.svg" alt="" class="h-[7px] up-tran">
        </div>
        <template #overlay>
          <a-menu>
            <a-menu-item @click="goDashboard">
              Dashboard
            </a-menu-item>
            <a-menu-item @click="goMiwaspace">
              Miwaspace
            </a-menu-item>
          </a-menu>
        </template>
      </a-dropdown>
      <div @click="goDoc" style="color:#E2B578;height:64px;line-height:64px" 
        class="text-[16px] cursor-pointer ml-12 mr-8" id="docs">Docs</div>
    </div>
    <div class="flex items-center">
      <div class="cursor-pointer flex h-[36px]">
        <div @click="changeTheme('dark')"
          class="dark:bg-[#E2B578] w-[44px] border border-solid border-[#E2B578] flex items-center justify-center rounded-tl-[6px] rounded-bl-[6px]">
          <img src="@/assets/icons/dark-b.svg" class="h-[20px] hidden dark:inline-block" />
          <img src="@/assets/icons/dark.svg" class="h-[20px] dark:hidden" />
        </div>
        <div @click="changeTheme('white')"
          class="dark:bg-transparent bg-[#E2B578] w-[44px] border border-solid border-[#E2B578] flex items-center justify-center rounded-tr-[6px] rounded-br-[6px]">
          <img src="@/assets/icons/white-b.svg" class="h-[20px] hidden dark:inline-block" />
          <img src="@/assets/icons/white.svg" class="h-[20px] dark:hidden" />
        </div>
      </div>
      <selectNetwork></selectNetwork>
      <div>
        <a-button v-if="!isConnectedWallet" @click="showWallet" class="!p-0 ml-8" type="primary">Connect Wallet</a-button>
        <a-dropdown v-if="isConnectedWallet">
          <div class="ml-8 px-3 border border-solid border-[#E2B578] rounded-[8px] flex h-[40px] items-center">
            <img src="@/assets/icons/metamask-icon.svg" class="h-[20px] mr-2" />
            <div class="text-[#E2B578] dark:text-[#FFFFFF]">{{ walletAccount }}</div>
          </div>
          <template #overlay>
            <a-menu>
              <a-menu-item @click="visibleDisconnect = true">
                <a href="javascript:;" style="color:black">
                  <img src="@/assets/icons/disconnect.svg" class="h-[24px]" />
                  Disconnect
                </a>
              </a-menu-item>
            </a-menu>
          </template>
        </a-dropdown>
      </div>
      <div class="ml-8">
        <a-dropdown>
          <img :src="githubAvatarUrl" class="h-[40px] rounded-full" />
          <template #overlay>
            <a-menu>
              <div class="text-center px-[16px] py-[8px] h-[40px]">
                <span>Signed in as </span>
                <span class="text-[#000000] font-bold">{{ username }}</span>
              </div>
              <div class="w-full h-[1px] border border-solid border-[#F4F4F4]"></div>
              <a-menu-item class="text-center ">
                <div class="text-[#E2B578] py-[4px]" @click="signOut">Sign out</div>
              </a-menu-item>
            </a-menu>
          </template>
        </a-dropdown>

        <!-- <img src="@/assets/icons/Frame-dark.svg" class="h-[40px] hidden dark:inline-block" />
        <img src="@/assets/icons/Frame-white.svg" class="h-[40px] dark:hidden" /> -->
      </div>
    </div>
  </div>
  <Wallets ref="showWallets" @setWalletBtn="setWalletBtn"></Wallets>
  <a-modal v-model:visible="visibleWallet" title="Connect wallet to continue" :footer="null" :maskClosable="false"
    width="600px">
    <div class="grid grid-cols-3 gap-4">
      <div class="div-img" v-for="(item, index) in imgList" :key="index" :class="{ 'check-border': imgVal === item }"
        @click="checkWallet(item)">
        <img :src="getImageURL(`${item}.png`)" class="img-css" />
      </div>
    </div>
  </a-modal>
  <a-modal v-model:visible="visibleDisconnect" :footer="null" :closable="false">
    <div class="text-[24px] text-[#151210] font-bold mb-4">Confirm disconnect wallets?</div>
    <div class="text-center">
      <a-button type="primary" @click="(visibleDisconnect = false)" ghost>No</a-button>
      <a-button class="ml-4" type="primary" @click="disconnect">Yes</a-button>
    </div>
  </a-modal>
</template>
<script lang="ts" setup>
import { watch } from "vue";
import { useRouter } from "vue-router";
import { onMounted, reactive, ref } from "vue";
import useAssets from "@/stores/useAssets";
import Wallets from "../Wallets.vue";
import { useThemeStore } from "@/stores/useTheme";
import { useWalletAddress } from "@/stores/useWalletAddress";
import selectNetwork from "./components/selectNetwork.vue";
const theme = useThemeStore()
const walletAddress = useWalletAddress()
const { getImageURL } = useAssets();
const router = useRouter();

const defaultTheme = ref("dark");
const showWallets = ref();
const visibleWallet = ref(false);
const visibleDisconnect = ref(false);
const isConnectedWallet = ref(false);
const walletAccount = ref("");
const isProject = ref(true)
const imgVal = ref("");
const imgList = reactive(["metamask", "connect", "imToken", "math", "trust", "huobi"]);
const userInfo = localStorage.getItem('userInfo');
const githubAvatarUrl = JSON.parse(userInfo)?.avatarUrl;
const username = JSON.parse(userInfo)?.username;
const isShowMiddleware = ref(false)
const goHome = () => {
  // router.push("/node-service/RPCs");
  // router.push("/projects");
  let linkVal = "https://portal.hamster.newtouch.com"
  if (window.location.href.indexOf('hamsternet.io') !== -1) {
    linkVal = "https://hamsternet.io";
  }
  window.open(linkVal)
  isProject.value = true;
};

const goPrjects = () => {
  router.push("/projects");
  isProject.value = true;
}

// 跳官网文档
const goDoc = () => {
  window.open('https://hamsternet.io/docs/')
}

const goMiwaspace = () => {
  router.push("/chainlink/miwaspace?key=1");
  isProject.value = false;
  // const connectedWallets = window.localStorage.getItem('alreadyConnectedWallets')
  // // 如果 local storage 里没有保存的钱包，直接返回
  // if (connectedWallets == null || connectedWallets === '[]') {
  //   showWallet();
  // } else {
  //   router.push("/node-service/Apps");

  //   isProject.value = false;
  // }
}
const goDashboard = () => {
  router.push("/chainlink/dashboard");
  isProject.value = false;
}

const changeTheme = (val: string) => {
  // theme.setTheme(val)
  let htmlRoot = document.getElementById('htmlRoot') || null;
  if (val === 'white') {
    theme.setTheme('light')
    htmlRoot?.setAttribute('data-theme', 'light');
    document.documentElement.classList.remove('dark')
  } else {
    theme.setTheme('dark')
    htmlRoot?.setAttribute('data-theme', 'dark');
    document.documentElement.classList.add('dark')
  }
  window.localStorage.setItem("themeValue", val);
}

const checkWallet = async (val: string) => {
  imgVal.value = val;
  // console.log("window.ethereum:",window.ethereum);
  // if (typeof window.ethereum !== 'undefined') {
  //   console.log('MetaMask is installed!');
  //   const accounts = await ethereum.request( {method: 'eth_requestAccounts'} );
  //   const account = accounts[0];
  //   console.log("accounts:",accounts);
  // }
  // console.log("wallet end..");
}

const signOut = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('userInfo');
  router.push('/')
};

onMounted(() => {
  if (window.localStorage.getItem("themeValue") != undefined && window.localStorage.getItem("themeValue") != "") {
    defaultTheme.value = window.localStorage.getItem("themeValue");
  }
  changeTheme(defaultTheme.value);
  // 针对钱包登录的特殊处理
  if(localStorage.getItem('token')?.startsWith('0x')){
    // debugger
    isShowMiddleware.value = true
    isConnectedWallet.value = true
    const walletAddr:any  = localStorage.getItem('token')
    walletAccount.value = walletAddr.substring(0,5)+ "..." +walletAddr.substring(walletAddr.length-4)
  }
});

watch(
  () => walletAddress.walletAddress || window.localStorage.getItem("walletAccount"),
  (oldValue, newV) => {
    if (oldValue) {
      // console.log(walletAccount.value, 'kkkk')
      isConnectedWallet.value = true;
      walletAccount.value = oldValue?.substring(0, 5) + "..." + oldValue?.substring(oldValue.length - 4);
    } else {
      isConnectedWallet.value = false
    }
  }, { deep: true, immediate: true }
);
const disconnect = () => {
  showWallets.value?.onClickDisconnect();
  walletAddress.setWalletAddress('');
  window.localStorage.removeItem("walletAccount");
  const isFakeToken = localStorage.getItem('token')?.startsWith('0x')
  if(isFakeToken){
    localStorage.removeItem('token')
    router.push('/login')
  }
  visibleDisconnect.value = false;
  isConnectedWallet.value = false
}
const showWallet = () => {
  // visibleWallet.value = true;
  showWallets.value?.onClickConnect();
}
const setWalletBtn = (val: boolean) => {
  isConnectedWallet.value = val;
  // const account = window.localStorage.getItem("walletAccount");
  // walletAccount.value = account?.substring(0, 5) + "..." + account?.substring(account.length - 4);
}
</script>

<style lang="less" scoped>
@btnColor: #E2B578;
#docs:hover{
  border-bottom: 3px solid #E2B578;
}
#middle:hover{
  border-bottom: 3px solid #E2B578;
}
#pro:hover{
  border-bottom: 3px solid #E2B578;
}
.default-header {
  position: fixed;
  top: 0;
  padding: 0 32px;
  width: 100%;
  height: 64px;
  z-index: 1;
}

.div-img {
  width: 164px;
  height: 164px;
  border: 1px solid #EBEBEB;
  border-radius: 16px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
}

.check-border,
.div-img:active {
  border: 1px solid #E2B578;
}

.img-css {
  height: 90px;
}

:deep(.ant-btn) {
  border-radius: 8px;
}

:deep(.ant-btn-primary) {
  width: 120px;
  height: 40px;
}

:deep(.ant-btn-primary),
:deep(.ant-btn-primary:hover),
:deep(.ant-btn-primary:focus) {
  border-color: @btnColor;
  background: @btnColor;
}

:deep(.ant-btn-background-ghost.ant-btn-primary),
:deep(.ant-btn-background-ghost.ant-btn-primary:hover),
:deep(.ant-btn-background-ghost.ant-btn-primary:focus) {
  border-color: @btnColor;
  color: @btnColor;
}

:deep(.ant-btn.ant-btn-background-ghost),
:deep(.ant-btn.ant-btn-background-ghost:hover),
:deep(.ant-btn.ant-btn-background-ghost:active),
:deep(.ant-btn.ant-btn-background-ghost:focus) {
  background: transparent;
}

.up-tran {
  transform: rotate(180deg);
  transition: all .3s, visibility 0s;
}

:deep(.ant-dropdown-open .up-tran) {
  transform: rotate(0deg);
}

:deep(.ant-select-selector) {
  color: #ffffff !important;
}

html[data-theme='dark'] {
  :deep(.ant-select-single:not(.ant-select-customize-input) .ant-select-selector) {
    border: 1px solid #EBEBEB;
  }
}
</style>
