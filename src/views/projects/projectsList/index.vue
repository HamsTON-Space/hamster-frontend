<template>
  <div>
    <div :class="theme.themeValue === 'dark' ? 'dark-css' : 'white-css'" class="flex justify-between">
      <div>
        <a-input v-model:value="keyword" placeholder="Search here..." allow-clear autocomplete="off" @change="goSearch">
          <template #prefix>
            <img src="@/assets/icons/white-search.svg" class="h-[20px] dark:hidden" />
            <img src="@/assets/icons/dark-search.svg" class="h-[20px] hidden dark:inline-block" />
          </template>
        </a-input>
      </div>
      <a-button type="primary" @click="goCreateProject">Create Project</a-button>
    </div>
    <div class="mt-4">
      <a-tabs v-model:activeKey="activeKey" @tabClick="handleTabClick">
        <a-tab-pane key="1" tab="Contract">
          <div v-if="totalContract > 0">
            <div v-for="(item, index) in contractList" :key="index">
              <Overview :viewType="viewType" :projectType="activeKey" :viewInfo="item" @loadProjects="getProjects" />
            </div>
            <a-pagination :class="theme.themeValue === 'dark' ? 'dark-css' : 'white-css'" @change="onChange"
              @showSizeChange="onShowSizeChange" :current="currentContract" :total="totalContract" size="small" />
          </div>
          <div v-else>
            <NoData></NoData>
          </div>
        </a-tab-pane>
        <a-tab-pane key="2" tab="FrontEnd">
          <div v-if="totalFrontend > 0">
            <div v-for="(item, index) in frontentList" :key="index">
              <Overview :viewType="viewType" :projectType="activeKey" :viewInfo="item" @loadProjects="getProjects" />
            </div>
            <a-pagination :class="theme.themeValue === 'dark' ? 'dark-css' : 'white-css'" @change="onChange"
              @showSizeChange="onShowSizeChange" :current="currentFrontend" :total="totalFrontend" size="small" />
          </div>
          <div v-else>
            <NoData></NoData>
          </div>
        </a-tab-pane>
      </a-tabs>
    </div>
  </div>
  <div class="fixed top-0 left-0 z-10 w-screen h-screen" v-show="showGuide">
    <img src="@/assets/images/project-guide.jpg" class="w-full dark:hidden" />
    <img src="@/assets/images/project-guide-dark.jpg" class="hidden w-full dark:inline-block" />
    <div class="absolute bottom-[30%] flex justify-center w-full">
      <img class="h-[42px] w-[42px] cursor-pointer" @click="closeGuide" src="@/assets/icons/close-guide.svg" />
    </div>
  </div>
</template>
<script lang='ts' setup>
import { onMounted, onBeforeUnmount, ref, onBeforeMount } from 'vue';
import { useRouter } from "vue-router";
import Overview from "./components/Overview.vue";
import NoData from "@/components/NoData.vue"
import { apiGetProjects } from "@/apis/projects";
import { useThemeStore } from "@/stores/useTheme";
const theme = useThemeStore()

const showGuide = ref(false)
const timer = ref();
const router = useRouter();
const keyword = ref('');
const viewType = ref("list");
const activeKey = ref("1");
const currentContract = ref(1);
const currentFrontend = ref(1);
const totalContract = ref(0);
const totalFrontend = ref(0);
const pageSize = ref(10);
const contractList = ref([]);
const frontentList = ref([]);

const onChange = (pageNumber: number) => {
  activeKey.value === "1" ? currentContract.value = pageNumber : currentFrontend.value = pageNumber;
  activeKey.value === "1" ? getProjectsContract('1') : getProjectsFrontend('2');
}
const onShowSizeChange = (currentVal: number, pageSizeVal: number) => {
  pageSize.value = pageSizeVal;
  activeKey.value === "1" ? currentContract.value = currentVal : currentFrontend.value = currentVal;
  activeKey.value === "1" ? getProjectsContract('1') : getProjectsFrontend('2');

}

const goCreateProject = () => {
  localStorage.removeItem('createFormData');
  router.push("/projects/create");
}

onBeforeMount(() => {
  if (window.localStorage.getItem("firstShowProjects") != undefined && window.localStorage.getItem("firstShowProjects") === "1") {
    showGuide.value = true;
  }
})

onMounted(() => {

  if (window.localStorage.getItem("projectActiveKey") != undefined && window.localStorage.getItem("projectActiveKey") != "") {
    activeKey.value = window.localStorage.getItem("projectActiveKey");
  }
  activeKey.value === "1" ? getProjectsContract('1') : getProjectsFrontend('2');
  tokenFrom()
})

// 判断token是钱包的还是真实
const tokenFrom = ()=>{
  const bool = localStorage.getItem('token')?.startsWith('0x')
  // if(bool){
  //   localStorage.removeItem('token')
  // }
  console.log('bool',bool)
}

onBeforeUnmount(() => {
  clearTimeout(timer.value);
})

const closeGuide = () => {
  showGuide.value = false;
  window.localStorage.removeItem('firstShowProjects');
}

const goSearch = async () => {
  currentContract.value = 1;
  currentFrontend.value = 1;
  activeKey.value === "1" ? getProjectsContract('1') : getProjectsFrontend('2');
}

const getProjects = () => {
  activeKey.value === "1" ? getProjectsContract('1') : getProjectsFrontend('2');
}

const handleTabClick = (tab: any) => {
  if (tab === "1") {
    getProjectsContract('1')
  } else {
    getProjectsFrontend('2')
  }
  window.localStorage.setItem("projectActiveKey", tab);
}

const getProjectsContract = async (type: string | undefined) => {
  try {
    const params = {
      query: keyword.value,
      size: pageSize.value,
      type: type,
      page: currentContract.value,
    }
    const { data } = await apiGetProjects(params);
    if ((data.data === null || data.data === "[]") && (keyword.value === "" || keyword.value === null)) {
      if (activeKey.value === "2") {
        goCreateProject();
      } else {
        getProjectsFrontend('2');
      }
    } else {
      contractList.value = data.data;
      totalContract.value = data.total;
    }

    projectRunning(contractList.value);
  } catch (error: any) {
    console.log("erro:", error)
  }
}
const projectRunning = (projectList: any) => {
  const isRunning = ref(false);
  projectList.forEach((element: { recentCheck: { status: number; }; recentBuild: { status: number; }; recentDeploy: { status: number; }; }) => {
    if (activeKey.value === '1' && (element.recentCheck.status === 1 || element.recentBuild.status === 1)
      || activeKey.value === '2' && (element.recentCheck.status === 1 || element.recentBuild.status === 1 || element.recentDeploy.status === 1)) {
      isRunning.value = true;
    }
  });
  if (isRunning.value === true) {
    timer.value = setTimeout(() => {
      // 其他定时执行的方法
      activeKey.value === "1" ? getProjectsContract('1') : getProjectsFrontend('2');
    }, 5000)
  } else {
    clearTimeout(timer.value);
  }
}
const getProjectsFrontend = async (type: string | undefined) => {
  try {
    const params = {
      query: keyword.value,
      size: pageSize.value,
      type: type,
      page: currentFrontend.value,
    }
    const { data } = await apiGetProjects(params);
    if ((data.data === null || data.data === "[]") && (keyword.value === "" || keyword.value === null)) {
      if (activeKey.value === "1") {
        goCreateProject();
      } else {
        getProjectsContract('1');
      }
    } else {
      frontentList.value = data.data;
      totalFrontend.value = data.total;
    }
    projectRunning(frontentList.value);
  } catch (error: any) {
    console.log("erro:", error)
  } finally {
    // loading.value = false;
  }
};
</script>
<style lang='less' scoped>
@baseColor: #E2B578;

html[data-theme='dark'] {
  :deep(.ant-input) {
    color: #8A8A8A;
    border-color: #434343;
  }

  :deep(.anticon.ant-input-clear-icon) {
    color: #E0DBD2;
  }
}

:deep(.ant-input-affix-wrapper) {
  border-color: #434343;
  padding-top: 0px;
  padding-bottom: 0px;
  width: 350px;
}

:deep(.white-css .ant-input) {
  color: #BBBAB9;
  border-color: #EBEBEB;
}

:deep(.ant-btn-primary) {
  // width: 120px;
  height: 40px;
}

:deep(.ant-pagination) {
  text-align: center;
  margin-top: 40px;
}

:deep(.ant-pagination-item-active) {
  border-color: @baseColor;
  background: @baseColor;
}

:deep(.white-css .ant-pagination-item a),
:deep(.white-css .ant-pagination-jump-next .ant-pagination-item-container .ant-pagination-item-ellipsis),
:deep(.white-css .ant-pagination-jump-next .ant-pagination-item-container .ant-pagination-item-link-icon) {
  color: #7B7D7B;
}

:deep(.dark-css .ant-pagination-item a),
:deep(.dark-css .ant-pagination-jump-next .ant-pagination-item-container .ant-pagination-item-ellipsis),
:deep(.dark-css .ant-pagination-jump-next .ant-pagination-item-container .ant-pagination-item-link-icon) {
  color: #E0DBD2;
}

:deep(.ant-pagination-disabled .ant-pagination-item-link),
:deep(.ant-pagination-disabled:hover .ant-pagination-item-link) {
  color: #8A8A8A !important;
  cursor: not-allowed !important;
}

:deep(.ant-pagination-item-active a) {
  color: #FFFFFF !important;
}

:deep(.ant-pagination-prev button),
:deep(.ant-pagination-next button) {
  color: #BCBEBC;
}

:deep(.ant-pagination-options) {
  display: none;
}
</style>
