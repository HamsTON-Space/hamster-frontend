<template>
  <div class="dark:text-white text-[#121211]">
    <div class="flex justify-between mb-[24px]">
      <Breadcrumb :currentName="currentName" :isClick="false"></Breadcrumb>
      <a-button class="btn" @click="stopBtn">{{ $t('workFlows.stop') }}</a-button>
    </div>
    <WorkflowsInfo :checkType="''" :workflowsDetailsData="workflowsDetailsData" :title="title" :inRunning="inRunning"></WorkflowsInfo>
    <WorkflowsProcess :processData="processData" :workflowsId="queryJson.workflowsId"
      :workflowDetailId="queryJson.workflowDetailId">
    </WorkflowsProcess>
    <div v-if="queryJson.projectType === '1'">
      <!-- frameType == '1',也就是evm走统计表格，其它情况走原来的流水线 -->
      <CheckResult v-if="contractFrameType == '1' && query.isBuild !='1'"></CheckResult>
      <div v-else>
        <CheckReport v-show="queryJson.type === '1'" :projectType="queryJson.projectType"
          :checkReportData="checkReportData" :checkStatus="workflowsDetailsData.checkStatus"></CheckReport>
        <GasUsageReport :gasUsageReportData="gasUsageReportData"
          v-show="queryJson.type === '1' && workflowsDetailsData.frameType === 1"></GasUsageReport>
        <ContractList v-if="queryJson.type === '2'" :contractListData="contractListData" :frameType="workflowsDetailsData.frameType"></ContractList>
      </div>
    </div>
    <div v-else>
      <CheckReport v-show="queryJson.type === '1'" :projectType="queryJson.projectType"
        :checkReportData="frontendReportData" :checkStatus="workflowsDetailsData.checkStatus"></CheckReport>
      <ArtifactList v-show="queryJson.type === '2'" :artifactListData="artifactListData"
        :deployType="workflowsDetailsData.deployType"></ArtifactList>
      <Deployment v-show="queryJson.type === '3'" :packageInfo="packageInfo" :workflowsDetailsData="workflowsDetailsData" :show-bth="true">
      </Deployment>
    </div>
    <AiAnalysis v-if="isShowAiAnalysis && contractFrameType != '1'" :checkTool="openAiInfo.checkTool" :reportFile="openAiInfo.reportFile" />
  </div>
</template>
<script lang='ts' setup>
import { ref, reactive, onMounted, onUnmounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import { apiGetProjectsDetail, apiProjectsWorkflowsStop } from "@/apis/projects";
import { apiGetWorkflowsDetail, apiGetWorkFlowsContract, apiGetWorkFlowsReport, apiGetDetailFrontendReport, apiGetPackagesList, apiGetDeployInfo } from "@/apis/workFlows";
import { message } from 'ant-design-vue';
import { useI18n } from 'vue-i18n'
import YAML from "yaml";
import Breadcrumb from '../components/Breadcrumb.vue';
import WorkflowsInfo from './components/WorkflowsInfo.vue';
import WorkflowsProcess from './components/WorkflowsProcess.vue';
import CheckReport from './components/CheckReport.vue';
import ContractList from './components/ContractList.vue';
import ArtifactList from './components/ArtifactList.vue';
import Deployment from './components/Deployment.vue';
import GasUsageReport from './components/GasUsageReport.vue';
import AiAnalysis from './components/AiAnalysis.vue';
import CheckResult from './components/CheckResult.vue'

const { t } = useI18n()
const { params,query } = useRoute();
const contractFrameType = localStorage.getItem('frameType')
const queryJson = reactive({
  id: params.id,
  workflowDetailId: params.workflowDetailId,
  workflowsId: params.workflowsId,
  type: params.type,
  projectType: params.projectType,
})
const detailTimer = ref();
const title = ref('');
const currentName = ref('');
const inRunning = ref(true);
const processData = ref([]);
const openAiInfo = ref({})

const gasUsageReportData = reactive([])
const frontendReportData = reactive([]);
const checkReportData = reactive([]);
const contractListData = reactive([]);
const artifactListData = reactive([]);
const packageInfo = reactive({});
const workflowsDetailsData = reactive({
  startTime: '',
  endTime: '',
  RepositoryUrl: '',
  errorNumber: 0,
  workflowDetailId: params.workflowDetailId,
  workflowsId: params.workflowsId,
  packageId: 0,
  execNumber: 0,
  frameType: 0,
  deployType: 0,
  checkStatus: 0,
});

const isShowAiAnalysis = computed(() => {
  return [5, 1].includes(workflowsDetailsData.frameType) && openAiInfo.value.checkTool
})

const getWorkflowsDetails = async () => {
  const { data } = await apiGetWorkflowsDetail(queryJson)
  Object.assign(workflowsDetailsData, data);
  const stageInfo = YAML.parse(data.stageInfo);
  processData.value = stageInfo;
  processData.value.unshift({ name: 'Start', status: 99, duration: 'none' })

  setCurrentName();

  // 打印查看转换后的 stageInfo
  // console.log(stageInfo, 'stageInfo');
  inRunning.value = processData.value.some((val: any) => val.status === 1);
  if (inRunning.value) {
    detailTimer.value = setTimeout(() => {
      getWorkflowsDetails();
    }, 5000);
  } else {
    clearTimeout(detailTimer.value);
    loadInfo();
    getProjectsDetailData();
  }
}

const loadInfo = () => {
  if (queryJson.projectType === '2') {
    queryJson.type === '1' ? getDetailFrontendReport() : getWorkflowPackage();
  } else {
    queryJson.type === '1' ? getCheckReport() : getContractList();
  }
}

const getContractList = async () => {
  const { data } = await apiGetWorkFlowsContract(queryJson);
  Object.assign(contractListData, data);
}

const getCheckReport = async () => {
  let issue = 0;
  const list: any = []
  const listGas: any = [];
  const { data } = await apiGetWorkFlowsReport(queryJson);
  data?.map((item: any) => {
    if (item.checkTool !== 'sol-profiler' && item.checkTool.toLowerCase() !== 'openai' && item.checkTool !== '' && item.checkTool !== 'MetaTrust (OSA)' && item.checkTool != 'MetaTrust (SA)' && item.checkTool != 'AI') {
      if (item.checkTool === 'eth-gas-reporter') {
        listGas.push(item);
      } else {
        list.push(item)
      }
    }
  })
  // evm的错误统计
  if(contractFrameType=='1'){
    for(let i=0;i<data.length;i++){
      issue += data[i].issues
    }
  }else{
    issue = yamlData(listGas, issue, "gasUsage");
    issue = yamlData(list, issue, "report");
  }

  data?.filter((item: any) => {
    if (item.checkTool == 'OpenAI') {
      openAiInfo.value = item
    }
  })
  Object.assign(gasUsageReportData, listGas);
  workflowsDetailsData.errorNumber = issue;
  Object.assign(checkReportData, list);
}

const yamlData = (list: any[], issue: number, dataType: string) => {
  if (list.length > 0) {
    list.map((item: any) => {
        item.reportFileData = YAML.parse(item.reportFile);
        item.reportFileData?.map((val: any, index: number) => {
          if (dataType === "gasUsage") {
            if (index === 0) {
              issue += val.issue
            }
          } else {
            issue += val.issue
          }
        })
        item.errorNumber = issue;
    })
  } 
  return issue;
}

const getDetailFrontendReport = async () => {
  try {
    let issue = 0;
    const params = {
      workflowsId: queryJson.workflowsId,
      workflowDetailId: queryJson.workflowDetailId,
    }
    const { data } = await apiGetDetailFrontendReport(params);
    data?.map((item: any) => {
      item.reportFileData = YAML.parse(item.reportFile);
      item.reportFileData?.map((val: any) => {
        issue += val.issue
      })
    })

    workflowsDetailsData.errorNumber = issue;
    Object.assign(frontendReportData, data)

    // console.log(frontendReportData, 'frontendReportData')

  } catch (error: any) {
    console.log("erro:", error)
  }
}

const getWorkflowPackage = async () => {
  try {
    const params = {
      workflowsId: queryJson.workflowsId,
      workflowDetailId: queryJson.workflowDetailId,
    }
    if (queryJson.type === '2') {
      const { data } = await apiGetPackagesList(params);
      Object.assign(artifactListData, data)
    } else {
      const { data } = await apiGetDeployInfo(params);
      Object.assign(packageInfo, data)
    }

  } catch (error: any) {
    console.log("erro:", error)
  }
}

const stopBtn = async () => {
  if (inRunning.value) {
    try {
      const { data } = await apiProjectsWorkflowsStop(queryJson);
      getWorkflowsDetails()
    } catch (err: any) {
      message.error(err.message)
    }
  } else {
    message.info(t('workFlows.workflowStopped'))
  }
}

const getProjectsDetailData = async () => {
  try {
    const { data } = await apiGetProjectsDetail(queryJson.id.toString())
    // console.log("data project:", data);
    Object.assign(workflowsDetailsData, { repositoryUrl: data.repositoryUrl, packageId: data.recentDeploy.packageId, frameType: data.frameType, deployType: data.deployType, checkStatus:data.recentCheck.status })
    localStorage.setItem('frameType',data.frameType)
  } catch (err: any) {
    console.info(err)
  }

}

const setCurrentName = () => {
  if (queryJson.projectType === '1') {
    // projectType === '1' === contract
    title.value = queryJson.type === '1' ? 'Check' : 'Build';
    currentName.value = `Contract ${title.value}_#${workflowsDetailsData.execNumber}`
  } else {
    // projectType === '2' === frontend
    if (queryJson.type === '1') {
      title.value = 'Check'
    } else if (queryJson.type === '2') {
      title.value = 'Build'
    } else {
      title.value = 'Deploy'
    }
    currentName.value = `Frontend ${title.value}_#${workflowsDetailsData.execNumber}`
  }
}

onMounted(() => {
  getWorkflowsDetails();
  getProjectsDetailData();
  loadInfo();
})

onUnmounted(() => {
  clearTimeout(detailTimer.value);
});

</script>
<style lang='less' scoped>
.btn {
  width: 150px;
  height: 43px;
}
</style>
