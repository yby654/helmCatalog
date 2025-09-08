import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Star,
  Download,
  Calendar,
  Tag,
  Package,
  ExternalLink,
  Copy,
  Check,
  GitBranch,
  Users,
  Shield,
  Code,
  FileText
} from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { MarkdownRenderer } from './ui/markdown';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { HelmChart } from '../services/types';
import { ChartService } from '../services';

interface ChartDetailProps {
  chart: HelmChart;
  selectedRepo?: string; // 현재 선택된 저장소 이름
  onBack: () => void;
  onDeploy: () => void;
}

export function ChartDetail({ chart, selectedRepo, onBack, onDeploy }: ChartDetailProps) {
  const [copiedCommand, setCopiedCommand] = useState<string | null>(null);
  const [readmeContent, setReadmeContent] = useState<string>('Loading README...');
  const [valuesContent, setValuesContent] = useState<string>('Loading values...');
  const [versionHistory, setVersionHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedVersion, setSelectedVersion] = useState<string>(chart.version);
  const [versionLoading, setVersionLoading] = useState(false);
  const [chartSources, setChartSources] = useState("");

  // 버전별 README와 Values를 로드하는 함수
  const fetchVersionSpecificData = async (version: string) => {
    console.log('Fetching data for version:', version);
    setVersionLoading(true);
    setError(null);

    try {
      // Repository 이름 결정
      let repoName = chart.repositoryName;
      if (!repoName && chart.repository) {
        repoName = chart.repository.split('/')[0];
      }
      if (!repoName) {
        throw new Error('Repository name not found');
      }

      console.log('Fetching README and Values for:', { repoName, chartName: chart.name, version });

      // README와 Values를 병렬로 가져오기
      const [readmeData, valuesData] = await Promise.allSettled([
        ChartService.getChartReadme(repoName, chart.name, version),
        ChartService.getChartValues(repoName, chart.name, version)
      ]);

      // README 설정
      if (readmeData.status === 'fulfilled') {
        console.log('README loaded for version:', version);
        setReadmeContent(readmeData.value.readmeContent || 'No README available for this chart.');
      } else {
        console.error('Failed to load README for version:', version, readmeData.reason);
        setReadmeContent('Failed to load README from the repository.');
      }

      // Values 설정
      if (valuesData.status === 'fulfilled') {
        console.log('Values loaded for version:', version, 'Content:', valuesData.value.valuesContent);
        setValuesContent(valuesData.value.valuesContent || 'No values.yaml available for this chart.');
      } else {
        console.error('Failed to load Values for version:', version, valuesData.reason);
        setValuesContent('Failed to load values.yaml from the repository.');
      }
    } catch (error) {
      console.error('Failed to load version-specific data:', error);
      setError('Failed to load chart data for the selected version.');
    } finally {
      setVersionLoading(false);
    }
  };

  // 버전 변경 시 데이터 다시 로드
  useEffect(() => {
    console.log('useEffect triggered - selectedVersion:', selectedVersion);

    // 초기 로딩이 완료된 후에만 버전별 데이터 로드
    if (!loading) {
      console.log('Loading is false, fetching data for version:', selectedVersion);
      fetchVersionSpecificData(selectedVersion);
    } else {
      console.log('Still loading, skipping version-specific fetch');
    }
  }, [selectedVersion]);

  // Chart 정보를 로드하는 함수
  useEffect(() => {
    const fetchChartDetails = async () => {
      setLoading(true);
      setError(null);

      try {
        // Repository 이름 결정 (우선순위: selectedRepo > chart.repositoryName > chart.repository에서 추출)
        let repoName = chart.repositoryName;

        if (!repoName && chart.repository) {
          // chart.repository에서 추출 ("bitnami/nginx" -> "bitnami")
          repoName = chart.repository.split('/')[0];
        }

        if (!repoName) {
          throw new Error('Repository name not found');
        }

        console.log('Using repository name:', repoName);

        // README, Values, Chart Detail을 병렬로 가져오기
        const [readmeData, valuesData, chartDetailData] = await Promise.allSettled([
          ChartService.getChartReadme(repoName, chart.name, chart.version),
          ChartService.getChartValues(repoName, chart.name, chart.version),
          ChartService.getChartDetail(repoName, chart.name)
        ]);

        // README 설정
        if (readmeData.status === 'fulfilled') {
          console.log(readmeData.value);
          setReadmeContent(readmeData.value.readmeContent || 'No README available for this chart.');
          console.log('README loaded successfully');
        } else {
          console.error('Failed to load README:', readmeData.reason);
          setReadmeContent('Failed to load README from the repository.\n\nThis might be because:\n- The chart does not have a README file\n- The repository is not accessible\n- Network connection issues');
        }

        // Values 설정
        if (valuesData.status === 'fulfilled') {
          setValuesContent(valuesData.value.valuesContent || 'No values.yaml available for this chart.');
          console.log('Values.yaml loaded successfully');
        } else {
          console.error('Failed to load values.yaml:', valuesData.reason);
          setValuesContent('Failed to load values.yaml from the repository.\n\nThis might be because:\n- The chart does not have a values.yaml file\n- The repository is not accessible\n- Network connection issues');
        }

        // Chart Detail 설정 (versionHistory 포함)
        if (chartDetailData.status === 'fulfilled') {
          console.log('Chart Detail loaded:', chartDetailData.value);
          setVersionHistory(chartDetailData.value.versionHistory || []);
          chart.maintainers = chartDetailData.value.maintainers || [];
          setChartSources(chartDetailData.value.source || "");
          console.log('Version history loaded successfully');
        } else {
          console.error('Failed to load chart detail:', chartDetailData.reason);
          setVersionHistory([]);
          setChartSources("");
        }



      } catch (error) {
        console.error('Error fetching chart details:', error);
        setError('Failed to fetch chart details. Please check your connection and try again.');
        setReadmeContent('Error loading README due to network or server issues.');
        setValuesContent('Error loading values.yaml due to network or server issues.');
      } finally {
        setLoading(false);
      }
    };

    if (chart) {
      fetchChartDetails();
    }
  }, [chart]);

  // Repository 이름 추출 함수
  const extractRepoName = (repository: string): string => {
    // "bitnami/nginx" -> "bitnami"
    // "kubernetes/ingress-nginx" -> "kubernetes"
    return repository.split('/')[0] || 'unknown';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatDownloads = (downloads: number) => {
    return downloads.toLocaleString('ko-KR');
  };

  const copyToClipboard = (text: string, command: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCommand(command);
    setTimeout(() => setCopiedCommand(null), 2000);
  };

  const getInstallCommands = () => [
    {
      title: 'Add Repository',
      command: `helm repo add ${chart.repository.split('/')[0]} https://charts.${chart.repository.split('/')[0]}.io`,
      description: 'Add the Helm repository to your local setup'
    },
    {
      title: 'Update Repository',
      command: `helm repo update`,
      description: 'Update your local repository cache'
    },
    {
      title: 'Install Chart',
      command: `helm install my-${chart.name} ${chart.repository} --version ${selectedVersion}`,
      description: `Install the chart version ${selectedVersion} with default values`
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" onClick={onBack}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>

              {/* Loading indicator */}
              {loading && (
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  <span>Loading chart details...</span>
                </div>
              )}

              {/* Error message */}
              {error && (
                <div className="text-sm text-red-600">
                  {error}
                </div>
              )}

              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  {chart.icon ? (
                    <ImageWithFallback src={chart.icon} alt={chart.name} className="w-8 h-8" />
                  ) : (
                    <Package className="w-6 h-6 text-white" />
                  )}
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{chart.name}</h1>
                  <p className="text-gray-600">{chart.description}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (chartSources && chartSources.length > 0) {
                    window.open(chartSources, '_blank');
                  } else {
                    alert('Source URL이 없습니다.');
                  }
                }}
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                View Source
              </Button>
              <Button onClick={onDeploy} size="sm" disabled={loading || versionLoading}>
                Deploy Chart
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Chart Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Chart Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <span className="text-sm text-gray-500">Version</span>
                  <Select value={selectedVersion} onValueChange={(value) => {
                    console.log('Select value changed from', selectedVersion, 'to', value);
                    setSelectedVersion(value);
                  }}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {versionHistory.length > 0 ? (
                        versionHistory.map((version) => (
                          <SelectItem key={version.version} value={version.version}>
                            {version.version} {version.version === chart.version && '(Current)'}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value={chart.version}>{chart.version}</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">App Version</span>
                  <span className="text-sm">
                    {versionHistory.find(v => v.version === selectedVersion)?.appVersion || chart.appVersion}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Repository</span>
                  <span className="text-sm">{chart.repository}</span>
                </div>
                {/* <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Downloads</span>
                  <div className="flex items-center space-x-1">
                    <Download className="w-3 h-3 text-gray-400" />
                    <span className="text-sm">{formatDownloads(chart.downloads)}</span>
                  </div>
                </div> */}
                {/* <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Stars</span>
                  <div className="flex items-center space-x-1">
                    <Star className="w-3 h-3 text-yellow-400 fill-current" />
                    <span className="text-sm">{chart.stars}</span>
                  </div>
                </div> */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Updated</span>
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-3 h-3 text-gray-400" />
                    <span className="text-sm">{formatDate(chart.updatedAt)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Maintainers */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Maintainers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {chart.maintainers && chart.maintainers.length > 0 ? (
                    chart.maintainers.map((maintainer: Record<string, any>, index: number) => (
                      <div key={index} className="border rounded-md p-2 mb-2 bg-gray-50">
                        {Object.entries(maintainer).map(([key, value]) => (
                          <div key={key} className="flex space-x-2 text-sm">
                            <Badge key={key} variant="outline" className="text-xs">
                              {key}
                            </Badge>
                            <Badge key={value} variant="outline" className="text-xs">
                              {value}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    ))
                  ) : (
                    <div className="text-sm text-gray-500">No maintainer information available</div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Keywords */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Keywords</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {chart.keywords && chart.keywords.length > 0 ? (
                    chart.keywords.map((keyword) => (
                      <Badge key={keyword} variant="outline" className="text-xs">
                        {keyword}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-sm text-gray-500">No keywords available</span>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <Tabs defaultValue="readme" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="readme">
                  <FileText className="w-4 h-4 mr-2" />
                  README
                </TabsTrigger>
                <TabsTrigger value="install">
                  <Code className="w-4 h-4 mr-2" />
                  Install
                </TabsTrigger>
                <TabsTrigger value="values">
                  <Shield className="w-4 h-4 mr-2" />
                  Values
                </TabsTrigger>
                <TabsTrigger value="versions">
                  <Tag className="w-4 h-4 mr-2" />
                  Versions
                </TabsTrigger>
              </TabsList>

              <TabsContent value="readme" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">README
                      <Badge key={selectedVersion} variant="outline" className="text-xs">{selectedVersion}</Badge>
                    </CardTitle>
                    <CardDescription>
                      Documentation and usage instructions for this chart
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="prose max-w-none">
                      {loading || versionLoading ? (
                        <div className="flex items-center justify-center py-8">
                          <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                          <span className="ml-2 text-gray-600">Loading README from repository...</span>
                        </div>
                      ) : (
                        <div className="relative">
                          <pre className="whitespace-pre-wrap text-sm leading-relaxed bg-gray-50 p-4 rounded-lg border">
                            <MarkdownRenderer content={readmeContent} />
                            {/* {readmeContent} */}
                          </pre>
                          {readmeContent && !readmeContent.includes('Failed to load') && !readmeContent.includes('Error loading') && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="absolute top-2 right-2"
                              onClick={() => copyToClipboard(readmeContent, 'readme')}
                            >
                              {copiedCommand === 'readme' ? (
                                <Check className="w-3 h-3" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="install" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Install Commands
                      <Badge key={selectedVersion} variant="outline" className="text-xs ml-2">{selectedVersion}</Badge>
                    </CardTitle>
                    <CardDescription>
                      Commands to install this chart version in your Kubernetes cluster
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {getInstallCommands().map((cmd, index) => (
                        <Card key={index}>
                          <CardHeader>
                            <CardTitle className="text-lg">{cmd.title}</CardTitle>
                            <CardDescription>{cmd.description}</CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="relative">
                              <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-sm overflow-x-auto">
                                {cmd.command}
                              </pre>
                              <Button
                                variant="outline"
                                size="sm"
                                className="absolute top-2 right-2"
                                onClick={() => copyToClipboard(cmd.command, cmd.title)}
                              >
                                {copiedCommand === cmd.title ? (
                                  <Check className="w-3 h-3" />
                                ) : (
                                  <Copy className="w-3 h-3" />
                                )}
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="values" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Default Values
                      <Badge key={selectedVersion} variant="outline" className="text-xs">{selectedVersion}</Badge>
                    </CardTitle>
                    <CardDescription>
                      These are the default configuration values for this chart
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="relative">
                      {loading || versionLoading ? (
                        <div className="flex items-center justify-center py-8">
                          <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                          <span className="ml-2 text-gray-600">Loading values.yaml from repository...</span>
                        </div>
                      ) : (
                        <>
                          <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-sm overflow-x-auto">
                            {valuesContent}
                          </pre>
                          {valuesContent && !valuesContent.includes('Failed to load') && !valuesContent.includes('Error loading') && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="absolute top-2 right-2"
                              onClick={() => copyToClipboard(valuesContent, 'values')}
                            >
                              {copiedCommand === 'values' ? (
                                <Check className="w-3 h-3" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </Button>
                          )}
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="versions" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Available Versions</CardTitle>
                    <CardDescription>
                      Chart version history and releases
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                        <span className="ml-2 text-gray-600">Loading version history...</span>
                      </div>
                    ) : versionHistory && versionHistory.length > 0 ? (
                      <div className="space-y-4">
                        {versionHistory.map((version, index) => (
                          <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                            <div className="flex items-center space-x-3">
                              <GitBranch className="w-4 h-4 text-gray-400" />
                              <div>
                                <div className="font-medium">{version.version}</div>
                                <div className="text-sm text-gray-500">App version: {version.appVersion}</div>
                              </div>
                            </div>
                            <div className="text-sm text-gray-500">
                              {formatDate(version.created)}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-sm text-gray-500">No version history available</div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}
