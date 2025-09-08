import apiClient from './api';
import {
  HelmRepoEntity,
  CreateHelmRepoDto
} from './types';

/**
 * HelmRepo API 서비스
 */
export class HelmRepoService {

  /**
   * 헬름 저장소 목록 조회
   * @returns 헬름 저장소 전체 목록
   */
  static async getHelmRepos(): Promise<HelmRepoEntity[]> {
    const response = await apiClient.get<HelmRepoEntity[]>('/helm-repos');
    return response.data;
  }

  /**
   * 헬름 저장소 단일 조회
   * @param helmRepoName 헬름 저장소 이름
   * @returns 헬름 저장소 정보
   */
  static async getHelmRepo(helmRepoName: string): Promise<HelmRepoEntity> {
    const response = await apiClient.get<HelmRepoEntity>(`/helm-repos/${helmRepoName}`);
    return response.data;
  }

  /**
   * 헬름 저장소 생성
   * @param helmRepo 헬름 저장소 생성 정보
   * @returns 생성 결과
   */
  static async createHelmRepo(helmRepo: CreateHelmRepoDto): Promise<void> {
    await apiClient.post('/helm-repos', helmRepo);
  }

  /**
   * 헬름 저장소 삭제
   * @param helmRepoName 헬름 저장소 이름
   * @returns 삭제 결과
   */
  static async deleteHelmRepo(helmRepoName: string): Promise<void> {
    await apiClient.delete(`/helm-repos/${helmRepoName}`);
  }

  /**
   * 헬름 저장소 존재 여부 확인
   * @param helmRepoName 헬름 저장소 이름
   * @returns 존재 여부
   */
  static async isHelmRepoExist(helmRepoName: string): Promise<boolean> {
    const response = await apiClient.get<boolean>(
      `/helm-repos/${helmRepoName}/exists?clusterId=${helmRepoName}`
    );
    return response.data;
  }
}

export default HelmRepoService;

