import apiClient from './api';
import {
  ClusterEntity,
  CreateClusterDto
} from './types';

/**
 * Cluster API 서비스
 */
export class ClusterService {

  /**
   * 클러스터 목록 조회
   * @returns 클러스터 전체 목록
   */
  static async getClusters(): Promise<ClusterEntity[]> {
    const response = await apiClient.get<ClusterEntity[]>('/system/clusters');
    return response.data;
  }

  /**
   * 클러스터 단일 조회
   * @param clusterName 클러스터 이름
   * @returns 클러스터 정보
   */
  static async getCluster(clusterName: string): Promise<ClusterEntity> {
    const response = await apiClient.get<ClusterEntity>(`/system/cluster/${clusterName}`);
    return response.data;
  }

  /**
   * 클러스터 생성
   * @param cluster 클러스터 생성 정보
   * @returns 생성 결과
   */
  static async createCluster(cluster: CreateClusterDto): Promise<void> {
    await apiClient.post('/system/cluster', cluster);
  }

  /**
   * 클러스터 삭제
   * @param clusterName 클러스터 이름
   * @returns 삭제 결과
   */
  static async deleteCluster(clusterName: string): Promise<void> {
    await apiClient.delete(`/system/cluster/${clusterName}`);
  }

  /**
   * 클러스터 존재 여부 확인
   * @param clusterName 클러스터 이름
   * @returns 존재 여부
   */
  static async isClusterExist(clusterName: string): Promise<boolean> {
    const response = await apiClient.get<boolean>(
      `/system/cluster/exists?clusterId=${clusterName}`
    );
    return response.data;
  }
}

export default ClusterService;
