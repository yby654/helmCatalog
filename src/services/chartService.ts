import apiClient from './api';
import {
  ApiResponse,
  ChartListDto,
  ChartDetailDto,
  ChartValuesDto,
  ChartReadmeDto,
  ChartDeployDto,
  ChartDeployResponseDto
} from './types';

/**
 * Chart API 서비스
 */
export class ChartService {

  /**
   * 차트 목록 조회
   * @param repo Repository ID 또는 이름
   * @returns 차트 목록
   */
  static async getChartList(repo: string): Promise<ChartListDto> {
    const response = await apiClient.get<ApiResponse<ChartListDto>>(`/charts?repo=${repo}`);
    console.log(response);
    return response.data.data;
  }

  /**
   * 차트 상세 조회 (versionHistory 포함)
   * @param repoName Repository 이름
   * @param chartName 차트 이름
   * @returns 차트 상세 정보 (versionHistory 포함)
   */
  static async getChartDetail(
    repoName: string,
    chartName: string
  ): Promise<ChartDetailDto> {
    const response = await apiClient.get<ApiResponse<ChartDetailDto>>(
      `/charts/${repoName}/${chartName}/detail`
    );
    return response.data.data;
  }

  /**
   * 차트 values.yaml 조회
   * @param repoName Repository 이름
   * @param chartName 차트 이름
   * @param version 차트 버전 (선택사항)
   * @returns values.yaml 내용
   */
  static async getChartValues(
    repoName: string,
    chartName: string,
    version?: string
  ): Promise<ChartValuesDto> {
    const params = version ? `?version=${version}` : '';
    const response = await apiClient.get<ApiResponse<ChartValuesDto>>(
      `/charts/${repoName}/${chartName}/values${params}`
    );
    return response.data.data;
  }

  /**
   * 차트 README.md 조회
   * @param repoName Repository 이름
   * @param chartName 차트 이름
   * @param version 차트 버전 (선택사항)
   * @returns README.md 내용
   */
  static async getChartReadme(
    repoName: string,
    chartName: string,
    version?: string
  ): Promise<ChartReadmeDto> {
    const params = version ? `?version=${version}` : '';
    const response = await apiClient.get<ApiResponse<ChartReadmeDto>>(
      `/charts/${repoName}/${chartName}/readme${params}`
    );
    return response.data.data;
  }

  /**
   * 차트 배포
   * @param repoName Repository 이름
   * @param chartName 차트 이름
   * @param deployDto 배포 정보
   * @returns 배포 결과
   */
  static async deployChart(
    repoName: string,
    chartName: string,
    deployDto: ChartDeployDto
  ): Promise<ChartDeployResponseDto> {
    const response = await apiClient.post<ApiResponse<ChartDeployResponseDto>>(
      `/charts/${repoName}/${chartName}/deploy`,
      deployDto
    );
    return response.data.data;
  }
}

export default ChartService;