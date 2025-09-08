import React, { useState } from "react";
import {
  X,
  Package,
  Server,
  Settings,
  CheckCircle,
  AlertCircle,
  Loader2,
  Play,
  Terminal,
} from "lucide-react";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Badge } from "./ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "./ui/tabs";
import { Separator } from "./ui/separator";
import { Alert, AlertDescription } from "./ui/alert";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { HelmChart } from "../services/types";

interface DeployModalProps {
  open: boolean;
  onClose: () => void;
  chart: HelmChart;
}

interface DeploymentStep {
  id: string;
  title: string;
  status: "pending" | "running" | "completed" | "error";
  message?: string;
}

export function DeployModal({
  open,
  onClose,
  chart,
}: DeployModalProps) {
  const [deploymentName, setDeploymentName] = useState(
    `my-${chart.name}`,
  );
  const [namespace, setNamespace] = useState("default");
  const [selectedCluster, setSelectedCluster] = useState("");
  const [customValues, setCustomValues] = useState("");
  const [isDeploying, setIsDeploying] = useState(false);
  const [deploymentSteps, setDeploymentSteps] = useState<
    DeploymentStep[]
  >([]);
  const [deploymentComplete, setDeploymentComplete] =
    useState(false);
  const [deploymentId, setDeploymentId] = useState<
    string | null
  >(null);

  // Mock clusters
  const clusters = [
    {
      id: "prod-cluster",
      name: "Production Cluster",
      status: "healthy",
    },
    {
      id: "staging-cluster",
      name: "Staging Cluster",
      status: "healthy",
    },
    {
      id: "dev-cluster",
      name: "Development Cluster",
      status: "healthy",
    },
  ];

  const handleDeploy = async () => {
    if (!selectedCluster || !deploymentName) {
      alert("클러스터와 배포 이름을 선택해주세요.");
      return;
    }

    setIsDeploying(true);
    setDeploymentComplete(false);

    const steps: DeploymentStep[] = [
      {
        id: "validate",
        title: "배포 구성 ��증",
        status: "pending",
      },
      {
        id: "connect",
        title: "클러스터 연결",
        status: "pending",
      },
      {
        id: "prepare",
        title: "네임스페이스 준비",
        status: "pending",
      },
      {
        id: "install",
        title: "Helm 차트 설치",
        status: "pending",
      },
      {
        id: "verify",
        title: "배포 상태 확인",
        status: "pending",
      },
    ];

    setDeploymentSteps(steps);

    try {
      // Mock deployment API call
      const mockDeploymentId = `deploy-${Date.now()}`;
      setDeploymentId(mockDeploymentId);

      console.log(
        `Deploying ${chart.name} to ${selectedCluster} cluster`,
      );

      // Simulate deployment process steps
      for (let i = 0; i < steps.length; i++) {
        await new Promise((resolve) =>
          setTimeout(resolve, 1500),
        );

        setDeploymentSteps((prev) =>
          prev.map((step, index) => {
            if (index === i) {
              return {
                ...step,
                status: "running",
                message: `${step.title} 진행 중...`,
              };
            }
            return step;
          }),
        );

        await new Promise((resolve) =>
          setTimeout(resolve, 2000),
        );

        setDeploymentSteps((prev) =>
          prev.map((step, index) => {
            if (index === i) {
              return {
                ...step,
                status: "completed",
                message: `${step.title} 완료`,
              };
            }
            return step;
          }),
        );
      }

      setDeploymentComplete(true);
    } catch (error) {
      console.log("Deployment error:", error);
      setDeploymentSteps((prev) =>
        prev.map((step) => ({
          ...step,
          status:
            step.status === "running" ? "error" : step.status,
          message:
            step.status === "running"
              ? "배포 중 오류 발생"
              : step.message,
        })),
      );
    } finally {
      setIsDeploying(false);
    }
  };

  const getStatusIcon = (status: DeploymentStep["status"]) => {
    switch (status) {
      case "pending":
        return (
          <div className="w-4 h-4 rounded-full border-2 border-gray-300" />
        );
      case "running":
        return (
          <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
        );
      case "completed":
        return (
          <CheckCircle className="w-4 h-4 text-green-600" />
        );
      case "error":
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              {chart.icon ? (
                <ImageWithFallback
                  src={chart.icon}
                  alt={chart.name}
                  className="w-5 h-5"
                />
              ) : (
                <Package className="w-4 h-4 text-white" />
              )}
            </div>
            <span>Deploy {chart.name}</span>
            <Badge>{chart.version}</Badge>
          </DialogTitle>
          <DialogDescription>
            Configure and deploy this Helm chart to your
            Kubernetes cluster
          </DialogDescription>
        </DialogHeader>

        {!isDeploying && !deploymentComplete ? (
          <Tabs defaultValue="config" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="config">
                Configuration
              </TabsTrigger>
              <TabsTrigger value="values">Values</TabsTrigger>
              <TabsTrigger value="review">Review</TabsTrigger>
            </TabsList>

            <TabsContent value="config" className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="deployment-name">
                    Deployment Name
                  </Label>
                  <Input
                    id="deployment-name"
                    value={deploymentName}
                    onChange={(e) =>
                      setDeploymentName(e.target.value)
                    }
                    placeholder="my-deployment"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="namespace">Namespace</Label>
                  <Input
                    id="namespace"
                    value={namespace}
                    onChange={(e) =>
                      setNamespace(e.target.value)
                    }
                    placeholder="default"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cluster">Target Cluster</Label>
                <Select
                  value={selectedCluster}
                  onValueChange={setSelectedCluster}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a cluster" />
                  </SelectTrigger>
                  <SelectContent>
                    {clusters.map((cluster) => (
                      <SelectItem
                        key={cluster.id}
                        value={cluster.id}
                      >
                        <div className="flex items-center space-x-2">
                          <Server className="w-4 h-4" />
                          <span>{cluster.name}</span>
                          <Badge
                            variant={
                              cluster.status === "healthy"
                                ? "default"
                                : "destructive"
                            }
                          >
                            {cluster.status}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* {!user && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    배포하려면 로그인이 필요합니다.
                  </AlertDescription>
                </Alert>
              )} */}
            </TabsContent>

            <TabsContent value="values" className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="custom-values">
                  Custom Values (YAML)
                </Label>
                <Textarea
                  id="custom-values"
                  value={customValues}
                  onChange={(e) =>
                    setCustomValues(e.target.value)
                  }
                  placeholder="# Override default values here
replicaCount: 2
service:
  type: LoadBalancer"
                  className="font-mono text-sm min-h-64"
                />
              </div>
              <div className="text-xs text-gray-500">
                Leave empty to use default values, or provide
                YAML configuration to override specific values.
              </div>
            </TabsContent>

            <TabsContent value="review" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Deployment Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm text-gray-600">
                        Chart
                      </Label>
                      <div className="text-sm">
                        {chart.name} v{chart.version}
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm text-gray-600">
                        App Version
                      </Label>
                      <div className="text-sm">
                        {chart.appVersion}
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm text-gray-600">
                        Deployment Name
                      </Label>
                      <div className="text-sm">
                        {deploymentName}
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm text-gray-600">
                        Namespace
                      </Label>
                      <div className="text-sm">{namespace}</div>
                    </div>
                  </div>
                  <Separator />
                  <div>
                    <Label className="text-sm text-gray-600">
                      Target Cluster
                    </Label>
                    <div className="text-sm">
                      {clusters.find(
                        (c) => c.id === selectedCluster,
                      )?.name || "Not selected"}
                    </div>
                  </div>
                  {customValues && (
                    <>
                      <Separator />
                      <div>
                        <Label className="text-sm text-gray-600">
                          Custom Values
                        </Label>
                        <pre className="text-xs bg-gray-50 p-2 rounded border mt-1 overflow-x-auto">
                          {customValues}
                        </pre>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              <div className="flex justify-end space-x-3">
                <Button variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button
                  onClick={handleDeploy}
                  disabled={
                    !selectedCluster || !deploymentName
                  }
                >
                  <Play className="w-4 h-4 mr-2" />
                  Deploy
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        ) : isDeploying ? (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-lg mb-2">
                Deploying {chart.name}
              </h3>
              <p className="text-gray-600">
                Please wait while we deploy your chart...
              </p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Terminal className="w-4 h-4" />
                  <span>Deployment Progress</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {deploymentSteps.map((step, index) => (
                    <div
                      key={step.id}
                      className="flex items-center space-x-3"
                    >
                      {getStatusIcon(step.status)}
                      <div className="flex-1">
                        <div className="text-sm">
                          {step.title}
                        </div>
                        {step.message && (
                          <div className="text-xs text-gray-500">
                            {step.message}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="text-center">
              <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
              <h3 className="text-lg mb-2">
                Deployment Successful!
              </h3>
              <p className="text-gray-600">
                {chart.name} has been successfully deployed to
                your cluster.
              </p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Deployment Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Name:</span>
                  <span>{deploymentName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">
                    Namespace:
                  </span>
                  <span>{namespace}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">
                    Cluster:
                  </span>
                  <span>
                    {
                      clusters.find(
                        (c) => c.id === selectedCluster,
                      )?.name
                    }
                  </span>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end space-x-3">
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
              <Button>View in Dashboard</Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}