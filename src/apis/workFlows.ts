import httpRequest from "@/request";

interface GetWorkflowsDetailParams {
  id: string,
  workflowsId: string,
  workflowDetailId: string,
}

interface GetContractDeployDetailParams {
  id: string,
  version: string,
}

interface GetDetailLogsParams {
  workflowsId: string,
  workflowDetailId: string,
}

interface GetPackageParams {
  workflowsId: string,
  workflowDetailId: string,
  packageId: string,
}

interface GetDetailStagelogsParams {
  id: string | number,
  workflowsId: string,
  workflowDetailId: number,
  stagename: string,
  start: number,
}

interface GetDetailSteplogsParams {
  id: string,
  name: string,
  stagename: string,
  stepname: string,
}

interface GetCheckResultParams {
  id: string,
  detailId: string
}


// 检查EVM合约是否设置了workflow的check pipeline
export function apiIsCheck(id:string){
  return httpRequest({
    url:`/api/project/${id}/workflow/setting/check`,
    method:'get',
  })
}

//Configure Check Tools 弹出层页面
interface GetCheckToolType {
  tool:string[]
}


//Configure Check Tools 弹出层页面
export function apiPostPopover(id:string,params:GetCheckToolType){  
  return httpRequest({
    url:`/api/project/${id}/workflow/setting`,
    method:'post',
    data:params
  })
}

// templates-category?type=1
export function apiGetTemplates(params: GetWorkflowsDetailParams) {
  return httpRequest({
    url: `/api/templates-category`,
    method: "get",
    params: params,
  });
}

// 获取workFlows详情 workflows/:id
export function apiGetWorkflowsDetail(params: GetWorkflowsDetailParams) {
  return httpRequest({
    url: `/api/workflows/${params.workflowsId}/detail/${params.workflowDetailId}`,
    method: "get",
  });
}

// 合约列表详情  workflows/:id/details/:workflowDetailId/contract
export function apiGetWorkFlowsContract(params: GetWorkflowsDetailParams) {
  return httpRequest({
    url: `/api/workflows/${params.workflowsId}/detail/${params.workflowDetailId}/contract`,
    method: "get",
  });
}

// workflow下的check report  workflows/:id/details/:workflowDetailId/report
export function apiGetWorkFlowsReport(params: GetWorkflowsDetailParams) {
  return httpRequest({
    url: `/api/workflows/${params.workflowsId}/detail/${params.workflowDetailId}/report`,
    method: "get",
  });
}

// 获取已部署的版本列表
export function apiGetProjectsVersions(params: any) {
  return httpRequest({
    url: `/api/projects/${params.id}/versions`,
    method: "get",
  });
}

//  根据版本查询合约信息/api/projects/:id/contract/:version
export function apiGetProjectsContract(params: any) {
  // console.log(id, version)
  return httpRequest({
    url: `/api/projects/${params.id}/contract/${params.version}`,
    method: "get",
  });
}

// 获取部署详情信息 ==== 详情页
// export function apiGetContractDeployDetail(deployId: string) {
//   return httpRequest({
//     url: `/contract/deploy/${deployId}/detail`,
//     method: "get",
//   });
// }

// projects/:id/contract/deploy/detail?version=xxx
export function apiGetContractDeployDetail(params: GetContractDeployDetailParams) {
  return httpRequest({
    url: `/api/projects/${params.id}/contract/deploy/detail`,
    method: "get",
    params: { version: params.version }
  });
}

//  获取指定stage日志  /workflows/:id/detail/:workflowDetailId/logs/:stageName
export function apiGetDetailStageLogs(params: GetDetailStagelogsParams) {
  return httpRequest({
    url: `/api/workflows/${params.workflowsId}/detail/${params.workflowDetailId}/logs/${params.stagename}`,
    method: "get",
    params: { start: params.start },
  });
}

// 获取steps日志
export function apiGetDetailStepLogs(params: GetDetailSteplogsParams) {
  return httpRequest({
    url: `/api/workflows/${params.name}/detail/${params.id}/logs/${params.stagename}/${params.stepname}`,
    method: "get",
  });
}

// 查看所有日志   /workflows/:id/detail/:workflowDetailId/logs
export function apiGetDetailLogs(params: GetDetailLogsParams) {
  return httpRequest({
    url: `/api/workflows/${params.workflowsId}/detail/${params.workflowDetailId}/logs`,
    method: "get",
  });
}

// 获取workflow下的package 信息====Deployment/Artifact
export function apiGetPackagesList(params: GetPackageParams) {
  return httpRequest({
    url: `/api/workflows/${params.workflowsId}/detail/${params.workflowDetailId}/package`,
    method: "get",
  });
}

// 获取 package 详情
export function apiGetPackageDetail(packageId: string) {
  return httpRequest({
    // url: `/api/workflows/${params.workflowsId}/detail/${params.workflowDetailId}/frontend/deploy/detail`,
    url: `/api/package/${packageId}/deploy/detail`,
    method: "get",
  });
}

// 获取 package 详情
export function apiGetDeployInfo(params: GetPackageParams) {
  return httpRequest({
    url: `/api/workflows/${params.workflowsId}/detail/${params.workflowDetailId}/deploy-info`,
    method: "get",
  });
}

//workflow详情report
export function apiGetDetailFrontendReport(params: GetPackageParams) {
  return httpRequest({
    url: `/api/workflows/${params.workflowsId}/detail/${params.workflowDetailId}/frontend/report`,
    method: "get",
  });
}

// 删除
export function apiGetDetailDelete(params: GetPackageParams) {
  return httpRequest({
    url: `/api/workflows/${params.workflowsId}/detail/${params.workflowDetailId}/deploy`,
    method: "delete",
  });
}

// check详情下的Check Result的信息
export function apiGetCheckResult(params: GetCheckResultParams) {
  return httpRequest({
    url: `/api/workflows/${params.id}/detail/${params.detailId}/report/overview`,
    // url: '/api/workflows/1979/detail/3161/report/overview',
    method: "get",
  });
}
