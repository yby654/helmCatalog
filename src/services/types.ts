// API 응답 기본 타입
export interface ApiResponse<T = any> {
  result: T;
  resultCode: string;
  resultMessage: string;
}

// 차트 관련 타입
export interface Chart {
  name: string;
  version: string;
  description?: string;
  appVersion?: string;
  created?: string;
  digest?: string;
  urls?: string[];
  icon?: string;
  home?: string;
  sources?: string[];
  maintainers?: Maintainer[];
  keywords?: string[];
  dependencies?: ChartDependency[];
}

// 기존 HelmChart 타입과 호환되는 확장 타입
export interface HelmChart extends Chart {
  id: string;
  repository: string;
  repositoryName?: string; // API 호출에 사용될 실제 저장소 이름
  createdAt: string;
  updatedAt: string;
  // downloads: number;
  // stars: number;
  category: string;
  versionHistory?: VersionHistory[];
}

export interface Maintainer {
  name: string;
  email?: string;
  url?: string;
}

export interface ChartDependency {
  name: string;
  version: string;
  repository?: string;
  condition?: string;
  tags?: string[];
  enabled?: boolean;
  importValues?: any[];
  alias?: string;
}

export interface ChartListDto {
  charts: Chart[];
  totalCount: number;
}

// Registry 관련 타입 (기존과 호환)
export interface Registry {
  id: string;
  name: string;
  url: string;
  insecureSkipTlsVerify: boolean;
  username?: string;
  password?: string;
  token?: string;
}

export interface ChartDetailDto {
  name: string;
  version: string;
  description?: string;
  appVersion?: string;
  created?: string;
  digest?: string;
  urls?: string[];
  icon?: string;
  home?: string;
  source?: string;
  maintainers?: Maintainer[];
  keywords?: string[];
  dependencies?: ChartDependency[];
  versionHistory?: VersionHistory[];
  readme?: string;
  values?: string;
}

export interface ChartValuesDto {
  chartName: string;
  version: string;
  values: string;
}

export interface ChartReadmeDto {
  chartName: string;
  version: string;
  readmeContent: string;
  repositoryName: string;
}

export interface ChartDeployDto {
  releaseName: string;
  namespace?: string;
  version?: string;
  values?: Record<string, any>;
  clusterId?: string;
}

export interface ChartDeployResponseDto {
  releaseName: string;
  namespace: string;
  revision: number;
  status: string;
  chart: string;
  appVersion: string;
  deployTime: string;
}

// 클러스터 관련 타입
export interface ClusterEntity {
  id: string;
  clusterName: string;
  clusterEndpoint: string;
  clusterToken: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateClusterDto {
  clusterName: string;
  clusterEndpoint: string;
  clusterToken: string;
  description?: string;
}

// Helm Repository 관련 타입
export interface HelmRepoEntity {
  id: string;
  name: string;
  url: string;
  insecureSkipTLSVerify: boolean;
  username?: string;
  password?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateHelmRepoDto {
  name: string;
  url: string;
  username?: string;
  password?: string;
  token?: string;
  insecureSkipTLSVerify: boolean;
}

// 에러 응답 타입
export interface ErrorResponse {
  resultCode: string;
  resultMessage: string;
  fieldErrors?: FieldError[];
}

export interface FieldError {
  field: string;
  value: any;
  reason: string;
}

export interface VersionHistory {
  version: string;
  appVersion: string;
  created: string; // 백엔드에서 보내는 필드명과 일치
}