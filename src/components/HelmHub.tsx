import React, { useState, useEffect } from 'react';
import { Search, Filter, Grid, List, Settings, Package } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Separator } from './ui/separator';
import { ChartList } from './ChartList';
import { ChartDetail } from './ChartDetail';
import { RegistrySettings } from './RegistrySettings';
import { DeployModal } from './DeployModal';
import { ChartService, HelmRepoService } from '../services';
import { HelmChart, Registry } from '../services/types';
import { mapChartsToHelmCharts } from '../utils/chartMapper';
// 타입들은 이제 services에서 import

export interface HelmHubProps {
  className?: string;
  showHeader?: boolean;
  title?: string;
  subtitle?: string;
  customRegistries?: Registry[];
  height?: string;
}

export default function HelmHub({
  className = "",
  showHeader = false,
  title = "Helm Chart Catalog",
  subtitle = "Browse and deploy Helm charts from your private registry",
  customRegistries = [],
  height = "auto"
}: HelmHubProps = {}) {
  const [selectedChart, setSelectedChart] = useState<HelmChart | null>(null);
  const [showRegistrySettings, setShowRegistrySettings] = useState(false);
  const [showDeployModal, setShowDeployModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRepo, setSelectedRepo] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [charts, setCharts] = useState<HelmChart[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [repositories, setRepositories] = useState<any[]>([]);
  const [reposLoading, setReposLoading] = useState(false);


  // Repository categories (전체 + API에서 가져온 저장소들)
  const repositoryCategories = [
    { value: 'all', label: '전체' },
    ...repositories.map(repo => ({
      value: repo.name,
      label: repo.name
    }))
  ];

  // Load repositories on mount
  useEffect(() => {
    fetchRepositories();
  }, []);

  // Fetch charts when repository changes or repositories are loaded
  useEffect(() => {
    if (repositories.length > 0 || selectedRepo === 'all') {
      fetchCharts();
    }
  }, [selectedRepo, repositories]);

  const fetchRepositories = async () => {
    setReposLoading(true);
    try {
      console.log('Fetching repositories...');
      const repos = await HelmRepoService.getHelmRepos();
      setRepositories(repos);
      console.log('Successfully fetched', repos.length, 'repositories');

      // 첫 번째 저장소를 기본 선택 (전체가 아닌 경우)
      if (repos.length > 0 && selectedRepo === 'all') {
        // 전체는 그대로 유지
      }
    } catch (error) {
      console.error('Error fetching repositories:', error);
      // 에러 발생 시 기본 저장소 설정
      setRepositories([
      ]);
    } finally {
      setReposLoading(false);
    }
  };

  const fetchCharts = async () => {
    setLoading(true);
    setError(null);

    try {
      let allCharts: HelmChart[] = [];

      if (selectedRepo === 'all') {
        // 전체 선택 시 모든 저장소에서 차트 가져오기
        console.log('Fetching charts from all repositories...');

        if (repositories.length > 0) {
          const chartPromises = repositories.map(async (repo) => {
            try {
              console.log(repo)
              const repoName = repo.name;
              const chartListData = await ChartService.getChartList(repoName);
              console.log(chartListData)
              return mapChartsToHelmCharts(chartListData.charts, repoName);
            } catch (error) {
              console.error(`Error fetching charts from ${repo.name}:`, error);
              return [];
            }
          });

          const chartArrays = await Promise.all(chartPromises);
          allCharts = chartArrays.flat();
        } else {
          // 저장소 목록이 없으면 기본 mock 데이터 사용
          allCharts = [];
        }
      } else {
        // 특정 저장소 선택 시
        console.log('Fetching charts from repository:', selectedRepo);
        const chartListData = await ChartService.getChartList(selectedRepo);
        allCharts = mapChartsToHelmCharts(chartListData.charts, selectedRepo);
      }

      setCharts(allCharts);
      console.log('Successfully fetched', allCharts.length, 'charts');

    } catch (error) {
      console.error('Error fetching charts:', error);
      setError('Failed to fetch charts from the repository. Please check your connection and try again.');

      // 에러 발생 시 fallback 데이터 사용
      setCharts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleChartSelect = (chart: HelmChart) => {
    setSelectedChart(chart);
  };

  const handleDeploy = (chart: HelmChart) => {
    setSelectedChart(chart);
    setShowDeployModal(true);
  };



  if (selectedChart && !showDeployModal) {
    return (
      <ChartDetail
        chart={selectedChart}
        selectedRepo={selectedRepo}
        onBack={() => setSelectedChart(null)}
        onDeploy={() => setShowDeployModal(true)}
      />
    );
  }

  return (
    <div className={`bg-background ${className}`} style={{ height }}>
      {showHeader && (
        <div className="border-b bg-card mb-6">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <Package className="w-4 h-4 text-primary-foreground" />
                </div>
                <div>
                  <h1 className="text-lg font-medium">{title}</h1>
                  <p className="text-sm text-muted-foreground">{subtitle}</p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowRegistrySettings(true)}
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Registry
                </Button>

              </div>
            </div>

            {/* Search Bar */}
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search charts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="p-4">
        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-700 text-sm">{error}</p>
            <Button
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={fetchCharts}
            >
              Retry
            </Button>
          </div>
        )}

        {/* Repository Selector (기존 카테고리 자리) */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div className="flex items-center space-x-3">
            <Select value={selectedRepo} onValueChange={setSelectedRepo}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="저장소 선택..." />
              </SelectTrigger>
              <SelectContent>
                {reposLoading ? (
                  <SelectItem value="loading" disabled>Loading repositories...</SelectItem>
                ) : (
                  repositoryCategories.map((repo) => (
                    <SelectItem key={repo.value} value={repo.value}>
                      {repo.label}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchCharts}
              disabled={loading}
            >
              <Filter className="w-4 h-4 mr-1" />
              Refresh
            </Button>
          </div>

          <div className="flex items-center space-x-1">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              <Grid className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <Tabs defaultValue="featured" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-3">
            <TabsTrigger value="featured" className="text-xs sm:text-sm">Featured</TabsTrigger>
            {/* <TabsTrigger value="popular" className="text-xs sm:text-sm">Popular</TabsTrigger> */}
            <TabsTrigger value="recent" className="text-xs sm:text-sm">Recent</TabsTrigger>
            <TabsTrigger value="all" className="text-xs sm:text-sm">All Charts</TabsTrigger>
          </TabsList>

          <TabsContent value="featured">
            <ChartList
              charts={charts}
              onChartSelect={handleChartSelect}
              onDeploy={handleDeploy}
              viewMode={viewMode}
              searchTerm={searchTerm}
              selectedCategory="all"
              loading={loading}
            />
          </TabsContent>

          {/* <TabsContent value="popular">
            <ChartList
              charts={[...charts].sort((a, b) => b.downloads - a.downloads)}
              onChartSelect={handleChartSelect}
              onDeploy={handleDeploy}
              viewMode={viewMode}
              searchTerm={searchTerm}
              selectedCategory="all"
              loading={loading}
            />
          </TabsContent> */}

          <TabsContent value="recent">
            <ChartList
              charts={[...charts].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())}
              onChartSelect={handleChartSelect}
              onDeploy={handleDeploy}
              viewMode={viewMode}
              searchTerm={searchTerm}
              selectedCategory="all"
              loading={loading}
            />
          </TabsContent>

          <TabsContent value="all">
            <ChartList
              charts={charts}
              onChartSelect={handleChartSelect}
              onDeploy={handleDeploy}
              viewMode={viewMode}
              searchTerm={searchTerm}
              selectedCategory="all"
              loading={loading}
            />
          </TabsContent>
        </Tabs>
      </div>

      {/* Dialogs and Modals */}
      <RegistrySettings
        open={showRegistrySettings}
        onClose={() => setShowRegistrySettings(false)}
      />

      {selectedChart && (
        <DeployModal
          open={showDeployModal}
          onClose={() => setShowDeployModal(false)}
          chart={selectedChart}
        />
      )}
    </div>
  );
}