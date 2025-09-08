# API 연결 가이드

이 프로젝트에 API 연결 부분이 구현되었습니다.

## 구현된 파일들

### 1. API 클라이언트 설정
- **파일**: `src/services/api.ts`
- **설명**: Axios 기반의 HTTP 클라이언트 설정
- **기능**:
  - 기본 URL 설정 (환경변수 기반)
  - 요청/응답 인터셉터
  - 인증 토큰 자동 포함
  - 에러 처리

### 2. 타입 정의
- **파일**: `src/services/types.ts`
- **설명**: API 응답과 요청에 사용되는 TypeScript 타입 정의
- **포함된 타입**:
  - Chart 관련: `Chart`, `ChartListDto`, `ChartDetailDto`, `ChartDeployDto` 등
  - Cluster 관련: `ClusterEntity`, `CreateClusterDto`
  - HelmRepo 관련: `HelmRepoEntity`, `CreateHelmRepoDto`
  - 공통: `ApiResponse`, `ErrorResponse`

### 3. Chart API 서비스
- **파일**: `src/services/chartService.ts`
- **설명**: Helm Chart 관련 API 호출 함수들
- **기능**:
  - `getChartList()`: 차트 목록 조회
  - `getChartDetail()`: 차트 상세 조회
  - `getChartValues()`: values.yaml 조회
  - `getChartReadme()`: README.md 조회
  - `deployChart()`: 차트 배포

### 4. Cluster API 서비스
- **파일**: `src/services/clusterService.ts`
- **설명**: Kubernetes 클러스터 관련 API 호출 함수들
- **기능**:
  - `getClusters()`: 클러스터 목록 조회
  - `getCluster()`: 클러스터 단일 조회
  - `createCluster()`: 클러스터 생성
  - `deleteCluster()`: 클러스터 삭제
  - `isClusterExist()`: 클러스터 존재 확인

### 5. HelmRepo API 서비스
- **파일**: `src/services/helmRepoService.ts`
- **설명**: Helm Repository 관련 API 호출 함수들
- **기능**:
  - `getHelmRepos()`: 저장소 목록 조회
  - `getHelmRepo()`: 저장소 단일 조회
  - `createHelmRepo()`: 저장소 생성
  - `deleteHelmRepo()`: 저장소 삭제
  - `isHelmRepoExist()`: 저장소 존재 확인

### 6. 통합 내보내기
- **파일**: `src/services/index.ts`
- **설명**: 모든 서비스와 타입을 한 곳에서 내보내기

## 사용 방법

### 1. 환경 변수 설정
```bash
# .env 파일 생성
REACT_APP_API_BASE_URL=http://localhost:8080
```

### 2. 컴포넌트에서 사용 예시
```typescript
import { ChartService, ClusterService, HelmRepoService } from '../services';

// 차트 목록 조회
const charts = await ChartService.getChartList('repo-id');

// 클러스터 목록 조회
const clusters = await ClusterService.getClusters();

// 헬름 저장소 목록 조회
const repos = await HelmRepoService.getHelmRepos();
```

### 3. 에러 처리
```typescript
try {
  const data = await ChartService.getChartList('repo-id');
  // 성공 처리
} catch (error) {
  // 에러 처리
  console.error('API 호출 실패:', error);
}
```

## API 엔드포인트 매핑

| 서비스 함수 | HTTP 메서드 | 엔드포인트 |
|------------|-------------|-----------|
| `ChartService.getChartList()` | GET | `/charts?repo={repo}` |
| `ChartService.getChartDetail()` | GET | `/charts/{repoName}/{chartName}/detail` |
| `ChartService.getChartValues()` | GET | `/charts/{repoName}/{chartName}/values` |
| `ChartService.getChartReadme()` | GET | `/charts/{repoName}/{chartName}/readme` |
| `ChartService.deployChart()` | POST | `/charts/{repoName}/{chartName}/deploy` |
| `ClusterService.getClusters()` | GET | `/system/clusters` |
| `ClusterService.getCluster()` | GET | `/system/cluster/{clusterName}` |
| `ClusterService.createCluster()` | POST | `/system/cluster` |
| `ClusterService.deleteCluster()` | DELETE | `/system/cluster/{clusterName}` |
| `ClusterService.isClusterExist()` | GET | `/system/cluster/exists` |
| `HelmRepoService.getHelmRepos()` | GET | `/helm-repos` |
| `HelmRepoService.getHelmRepo()` | GET | `/helm-repos/{helmRepoName}` |
| `HelmRepoService.createHelmRepo()` | POST | `/helm-repos` |
| `HelmRepoService.deleteHelmRepo()` | DELETE | `/helm-repos/{helmRepoName}` |
| `HelmRepoService.isHelmRepoExist()` | GET | `/helm-repos/{helmRepoName}/exists` |

## 설치된 종속성

- **axios**: HTTP 클라이언트 라이브러리

이제 기존 컴포넌트들에서 이 API 서비스들을 import하여 백엔드와 통신할 수 있습니다.

