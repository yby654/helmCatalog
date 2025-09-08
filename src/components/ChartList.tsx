import React from 'react';
import { Star, Download, Calendar, Tag, Package } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { HelmChart } from '../services/types';

interface ChartListProps {
  charts: HelmChart[];
  onChartSelect: (chart: HelmChart) => void;
  onDeploy: (chart: HelmChart) => void;
  viewMode: 'grid' | 'list';
  searchTerm: string;
  selectedCategory: string;
  loading?: boolean;
}

export function ChartList({
  charts,
  onChartSelect,
  onDeploy,
  viewMode,
  searchTerm,
  selectedCategory,
  loading = false
}: ChartListProps) {
  const filteredCharts = charts.filter(chart => {
    const matchesSearch = !searchTerm ||
      chart.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      chart.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      chart.keywords.some(keyword => keyword.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory = selectedCategory === 'all' || chart.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatDownloads = (downloads: number) => {
    if (downloads >= 1000000) {
      return `${(downloads / 1000000).toFixed(1)}M`;
    } else if (downloads >= 1000) {
      return `${(downloads / 1000).toFixed(1)}K`;
    }
    return downloads.toString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-gray-600">Loading charts...</span>
        </div>
      </div>
    );
  }

  if (filteredCharts.length === 0) {
    return (
      <div className="text-center py-12">
        <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600 mb-2">No charts found</p>
        <p className="text-sm text-gray-500">Try adjusting your search or filter criteria</p>
      </div>
    );
  }

  if (viewMode === 'list') {
    return (
      <div className="space-y-4">
        {filteredCharts.map((chart) => (
          <Card key={chart.id} className="hover:shadow-md transition-shadow cursor-pointer">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 flex-1">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                    {chart.icon ? (
                      <ImageWithFallback src={chart.icon} alt={chart.name} className="w-8 h-8" />
                    ) : (
                      <Package className="w-6 h-6 text-white" />
                    )}
                  </div>

                  <div className="flex-1" onClick={() => onChartSelect(chart)}>
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="text-lg hover:text-blue-600 transition-colors">{chart.name}</h3>
                      <Badge variant="secondary">{chart.version}</Badge>
                    </div>
                    <p className="text-gray-600 text-sm mb-2">{chart.description}</p>
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      {/* <div className="flex items-center space-x-1">
                        <Star className="w-3 h-3" />
                        <span>{chart.stars}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Download className="w-3 h-3" />
                        <span>{formatDownloads(chart.downloads)}</span>
                      </div> */}
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-3 h-3" />
                        <span>{formatDate(chart.updatedAt)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2 ml-4">
                  <Button variant="outline" size="sm" onClick={() => onChartSelect(chart)}>
                    View
                  </Button>
                  <Button size="sm" onClick={() => onDeploy(chart)}>
                    Deploy
                  </Button>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap gap-1">
                {chart.keywords.slice(0, 5).map((keyword) => (
                  <Badge key={keyword} variant="outline" className="text-xs">
                    {keyword}
                  </Badge>
                ))}
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {filteredCharts.map((chart) => (
        <Card key={chart.id} className="hover:shadow-lg transition-shadow cursor-pointer group">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between mb-2">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                {chart.icon ? (
                  <ImageWithFallback src={chart.icon} alt={chart.name} className="w-8 h-8" />
                ) : (
                  <Package className="w-6 h-6 text-white" />
                )}
              </div>
              <Badge variant="secondary">{chart.version}</Badge>
            </div>
            <CardTitle
              className="text-lg group-hover:text-blue-600 transition-colors"
              onClick={() => onChartSelect(chart)}
            >
              {chart.name}
            </CardTitle>
            <CardDescription className="line-clamp-2">
              {chart.description}
            </CardDescription>
          </CardHeader>

          <CardContent className="pb-3">
            <div className="flex flex-wrap gap-1 mb-3">
              {chart.keywords.slice(0, 3).map((keyword) => (
                <Badge key={keyword} variant="outline" className="text-xs">
                  {keyword}
                </Badge>
              ))}
              {chart.keywords.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{chart.keywords.length - 3}
                </Badge>
              )}
            </div>

            <div className="flex items-center justify-between text-xs text-gray-500">
              {/* <div className="flex items-center space-x-1">
                <Star className="w-3 h-3" />
                <span>{chart.stars}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Download className="w-3 h-3" />
                <span>{formatDownloads(chart.downloads)}</span>
              </div> */}
              <div className="flex items-center space-x-1">
                <Calendar className="w-3 h-3" />
                <span>{formatDate(chart.updatedAt)}</span>
              </div>
            </div>
          </CardContent>

          <CardFooter className="pt-0">
            <div className="flex w-full space-x-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => onChartSelect(chart)}
              >
                View
              </Button>
              <Button
                size="sm"
                className="flex-1"
                onClick={() => onDeploy(chart)}
              >
                Deploy
              </Button>
            </div>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}