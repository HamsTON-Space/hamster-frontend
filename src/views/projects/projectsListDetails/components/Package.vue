<template>
  <a-table class="my-4" :columns="tableColumns" :dataSource="tableList" :pagination="pagination">
    <template #bodyCell="{ column, record, index }">
      <template v-if="column.dataIndex === 'action'">
        <label class="text-[#E2B578] cursor-pointer" v-if="record.domain === ''"
          @click="goDeploy(record.projectId ,record.workflowId, record.workflowDetailId)">Deploy</label>
        <label class="text-[#E2B578] cursor-pointer ml-2" v-else
          @click="goView(record.workflowId, record.workflowDetailId, record.id)">View</label>

      </template>
    </template>
  </a-table>
  <CustomMsg :showMsg="showMsg" :msgType="msgType" :msgParam="msgParam"></CustomMsg>
  <ContainerParam :containerVisible="containerVisible" :detailId="detailId" @hideContainerParam="containerVisible=false"
    @frontendContainerDeploy="frontendContainerDeploy"></ContainerParam>
</template>
<script setup lang="ts">
import { computed, onMounted, reactive, ref, toRefs } from 'vue';
import { formatDateToLocale } from '@/utils/dateUtil';
import { useRouter } from "vue-router";
import { apiGetProjectsPackages, apiProjectsDeploy, apiProjectsContainerDeploy, apiContainerCheck } from "@/apis/projects";
import CustomMsg from '@/components/CustomMsg.vue';
import ContainerParam from '../../projectsList/components/ContainerParam.vue';
import { message } from 'ant-design-vue';

const props = defineProps({
  detailId: String,
  pageType: String,
  packageListData: Array,
  deployType:String
});
const { pageType, detailId, packageListData } = toRefs(props);

const router = useRouter();
const containerVisible = ref(false);
const showMsg = ref(false);
const msgType = ref("");
const msgParam = ref({
  id: detailId?.value,
  workflowsId: 0,
  workflowDetailId: 0,
  projectType: 2,
});
const deployParams = ref({
  id: detailId?.value,
  workflowsId: '',
  workflowDetailId: '',
});
const tableList = ref([]);
const pagination = ref();

const firstTitle = ref('')
const checkImageOrPackage = () => {
  
  if(props.deployType == '1'){
    firstTitle.value = 'Package Name'
  }else{
    firstTitle.value = 'Image Name'
  }
}

const tableColumns = computed<any[]>(() => [
  {
    title: firstTitle.value,
    dataIndex: 'name',
    align: 'center',
    ellipsis: 'fixed',
    key: 'name',
  },
  {
    title: 'Version',
    dataIndex: 'version',
    align: 'center',
    ellipsis: 'fixed',
    key: 'type',
  },
  {
    title: 'Branch',
    dataIndex: 'branch',
    key: 'branch',
    ellipsis: 'fixed',
    align: 'center',
  },
  {
    title: 'Build Time',
    dataIndex: 'buildTime',
    align: 'center',
    ellipsis: 'fixed',
    key: 'buildTime',
    customRender: ({ text: date }) => formatDateToLocale(date).format("YYYY/MM/DD HH:mm:ss"),
  },
  {
    title: 'Domains',
    dataIndex: 'domain',
    key: 'domain',
    ellipsis: 'fixed',
    align: 'center',
  },
  {
    title: 'Action',
    dataIndex: 'action',
    align: 'center',
    width: '150px',
  },
]);

const paginationVal = reactive({
  // 分页配置器
  pageSize: 10, // 一页的数据限制
  current: 1, // 当前页
  total: 10, // 总数
  size: 'small',
  position: ['bottomCenter'], //指定分页显示的位置
  hideOnSinglePage: false, // 只有一页时是否隐藏分页器
  showQuickJumper: false, // 是否可以快速跳转至某页
  showSizeChanger: false, // 是否可以改变 pageSize
  pageSizeOptions: ['10', '20', '30'], // 指定每页可以显示多少条
  onShowSizeChange: (current: number, pagesize: number) => {
    // 改变 pageSize时的回调
    pagination.current = current;
    pagination.pageSize = pagesize;
    getProjectsPackage();
  },
  onChange: (current: number) => {
    // 切换分页时的回调，
    pagination.current = current;
    getProjectsPackage();
  },
  // showTotal: total => `总数：${total}人`, // 可以展示总数
});
onMounted(() => {
  if (pageType?.value === 'project') {
    pagination.value = paginationVal;
    getProjectsPackage()
  } else {
    tableList.value = packageListData.value;
    pagination.value = false;
  }

  checkImageOrPackage()
})

const getProjectsPackage = async () => {
  try {
    const params = {
      page: pagination.current,
      size: pagination.pageSize,
    }
    const { data } = await apiGetProjectsPackages(detailId?.value, params);
    tableList.value = data.data;
    pagination.total = data.total

  } catch (error: any) {
    console.log("erro:", error)
  } finally {
    // loading.value = false;
  }
}

const goDeploy = async (projectId:string, workflowId: string, workflowDetailId: string) => {

  try {
    deployParams.value.id = projectId;
    deployParams.value.workflowsId = workflowId;
    deployParams.value.workflowDetailId = workflowDetailId;
    if (props.deployType == '2') {
      frontendContainerCheck();
    } else {
      const { data } = await apiProjectsDeploy(deployParams.value); 
      setMsgShow(data);
    }
  } catch (error: any) {
    console.log("erro:", error)
    message.error(error.response.data.message);
  }
}
const frontendContainerCheck = async () => {
  try {
    const { data } = await apiContainerCheck(deployParams.value.id, deployParams.value.workflowsId);
    if (data === false) { //未配置
      containerVisible.value = true;
    } else {
      frontendContainerDeploy();
    }
  } catch (error: any) {
    console.log("erro:", error)
    message.error(error.response.data.message);
  }
}
const frontendContainerDeploy = async (apiContainerDeployParams?: Object) => {
  try {
    const { data } = await apiProjectsContainerDeploy(deployParams.value, apiContainerDeployParams);

    setMsgShow(data);
  } catch (error: any) {
    console.log("erro:", error)
    message.error(error.response.data.message);
  }
}

const setMsgShow = (data:any) => {
  showMsg.value = true;
  msgParam.value.id = deployParams.value.id;
  msgParam.value.workflowsId = data.workflowId;
  msgParam.value.workflowDetailId = data.detailId;
  msgType.value = 'deploy';
  setTimeout(function () {
    showMsg.value = false;
  }, 3000)

}

const goView = (workflowId: number, workflowDetailId: number, packageId:number) => {
  router.push("/projects/" + workflowId + "/frontend-details/" + workflowDetailId + "/" + packageId);
}

// const downloadAbi = (val: any) => {
//   console.log(val, 'val')
// }

defineExpose({
  getProjectsPackage
})
</script>