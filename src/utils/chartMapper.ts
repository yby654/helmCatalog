import { Chart, HelmChart } from '../services/types';

/**
 * API에서 받은 Chart 데이터를 HelmChart 형태로 변환
 */
export function mapChartToHelmChart(chart: Chart, index: number, repositoryName?: string): HelmChart {
  const now = new Date().toISOString();

  return {
    ...chart,
    id: `chart-${index}-${chart.name}`,
    repository: extractRepository(repositoryName, chart.name),
    repositoryName: repositoryName, // 실제 API에서 사용할 저장소 이름
    createdAt: chart.created || now,
    updatedAt: chart.created || now,
    downloads: generateMockDownloads(),
    stars: generateMockStars(),
    category: categorizeChart(chart.keywords || []),
    description: chart.description || 'No description available',
    keywords: chart.keywords || [],
    maintainers: chart.maintainers || [],
    versionHistory: chart.versionHistory || []
  };
}

/**
 * Chart 배열을 HelmChart 배열로 변환
 */
export function mapChartsToHelmCharts(charts: Chart[], repositoryName?: string): HelmChart[] {
  return charts.map((chart, index) => mapChartToHelmChart(chart, index, repositoryName));
}

/**
 * 차트 이름에서 repository 추출 (임시 로직)
 */
function extractRepository(repositoryName: string, chartName: string): string {
  // 실제로는 API에서 repository 정보를 제공해야 함
  const repoMap: Record<string, string> = {
    // 'nginx': 'kubernetes/ingress-nginx',
    // 'prometheus': 'prometheus-community/prometheus',
    // 'grafana': 'grafana/grafana',
    // 'postgresql': 'bitnami/postgresql',
    // 'redis': 'bitnami/redis',
    // 'mysql': 'bitnami/mysql',
    // 'mongodb': 'bitnami/mongodb'
  };

  return `${repositoryName}/${chartName}` || `unknown/${chartName}`;
}

/**
 * 키워드를 기반으로 카테고리 결정
 */
function categorizeChart(keywords: string[]): string {
  const keywordLower = keywords.map(k => k.toLowerCase());

  if (keywordLower.some(k => ['database', 'sql', 'nosql', 'redis', 'postgres', 'mysql', 'mongodb'].includes(k))) {
    return 'database';
  }
  if (keywordLower.some(k => ['monitoring', 'metrics', 'prometheus', 'grafana', 'observability'].includes(k))) {
    return 'monitoring';
  }
  if (keywordLower.some(k => ['security', 'auth', 'authentication', 'authorization'].includes(k))) {
    return 'security';
  }
  if (keywordLower.some(k => ['storage', 'volume', 'persistent'].includes(k))) {
    return 'storage';
  }
  if (keywordLower.some(k => ['network', 'ingress', 'nginx', 'proxy', 'load-balancer'].includes(k))) {
    return 'networking';
  }
  if (keywordLower.some(k => ['ai', 'ml', 'machine-learning', 'tensorflow', 'pytorch'].includes(k))) {
    return 'ai-ml';
  }
  if (keywordLower.some(k => ['dev', 'development', 'ci', 'cd', 'build', 'deploy'].includes(k))) {
    return 'devtools';
  }

  return 'others';
}

/**
 * 모의 다운로드 수 생성
 */
function generateMockDownloads(): number {
  return Math.floor(Math.random() * 100000) + 1000;
}

/**
 * 모의 스타 수 생성
 */
function generateMockStars(): number {
  return Math.floor(Math.random() * 2000) + 100;
}
