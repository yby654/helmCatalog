import React, { useState } from 'react';
import {
  Plus,
  Trash2,
  Edit3,
  Check,
  X,
  Server,
  Key,
  Eye,
  EyeOff,
  TestTube,
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Alert, AlertDescription } from './ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Registry } from '../services/types';
import { HelmRepoService } from '../services';
import { HelmRepoEntity, CreateHelmRepoDto } from '../services/types';

interface RegistrySettingsProps {
  open: boolean;
  onClose: () => void;
}

interface RegistryForm {
  name: string;
  url: string;
  authType: 'none' | 'basic' | 'token';
  username: string;
  password: string;
  token: string;
}

const initialForm: RegistryForm = {
  name: '',
  url: '',
  authType: 'none',
  username: '',
  password: '',
  token: ''
};

export function RegistrySettings({ open, onClose }: RegistrySettingsProps) {
  const [registries, setRegistries] = useState<HelmRepoEntity[]>([]);
  const [loading, setLoading] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<RegistryForm>(initialForm);
  const [showPassword, setShowPassword] = useState(false);
  const [testingRegistry, setTestingRegistry] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<{ [key: string]: 'success' | 'error' | 'testing' }>({});

  // Load registries on component mount
  React.useEffect(() => {
    if (open) {
      loadRegistries();
    }
  }, [open]);

  const loadRegistries = async () => {
    setLoading(true);
    try {
      const repos = await HelmRepoService.getHelmRepos();
      console.log('Loaded registries:', repos); // Debug log
      setRegistries(repos || []);
    } catch (error) {
      console.error('Failed to load registries:', error);
      setRegistries([]);
      // Show error message to user
      alert('레지스트리 목록을 불러오는데 실패했습니다. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.name || !form.url) {
      alert('이름과 URL을 입력해주세요.');
      return;
    }

    // Validate authentication fields based on auth type
    if (form.authType === 'basic' && (!form.username || !form.password)) {
      alert('기본 인증을 사용할 경우 사용자명과 비밀번호를 입력해주세요.');
      return;
    }

    if (form.authType === 'token' && !form.token) {
      alert('토큰 인증을 사용할 경우 토큰을 입력해주세요.');
      return;
    }

    try {
      const createData: CreateHelmRepoDto = {
        name: form.name,
        url: form.url,
        insecureSkipTLSVerify: false,
        ...(form.authType === 'basic' && {
          username: form.username,
          password: form.password
        }),
        ...(form.authType === 'token' && {
          token: form.token
        })
      };

      console.log('Creating registry with data:', createData); // Debug log

      if (editingId) {
        // Update existing registry
        // Note: Update API might not exist, so we'll delete and recreate
        await HelmRepoService.deleteHelmRepo(editingId);
        await HelmRepoService.createHelmRepo(createData);
      } else {
        // Create new registry
        await HelmRepoService.createHelmRepo(createData);
      }

      // Reload registries after successful operation
      await loadRegistries();
      resetForm();
      alert('레지스트리가 성공적으로 저장되었습니다.');
    } catch (error) {
      console.error('Failed to save registry:', error);
      const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.';
      alert(`레지스트리 저장에 실패했습니다: ${errorMessage}`);
    }
  };

  const handleEdit = (registry: HelmRepoEntity) => {
    setEditingId(registry.name);
    setForm({
      name: registry.name,
      url: registry.url,
      authType: registry.username ? 'basic' : 'none', // Determine auth type based on available fields
      username: registry.username || '',
      password: '', // Don't show existing password for security
      token: '' // Token field doesn't exist in HelmRepoEntity, will be empty
    });
    setShowForm(true);
  };

  const handleDelete = async (name: string) => {
    if (confirm('정말 이 레지스트리를 삭제하시겠습니까?')) {
      try {
        await HelmRepoService.deleteHelmRepo(name);
        await loadRegistries();
      } catch (error) {
        console.error('Failed to delete registry:', error);
        alert('레지스트리 삭제에 실패했습니다. 다시 시도해주세요.');
      }
    }
  };

  const resetForm = () => {
    setForm(initialForm);
    setEditingId(null);
    setShowForm(false);
    setShowPassword(false);
  };

  const testRegistry = async (registry: HelmRepoEntity) => {
    setTestingRegistry(registry.name);
    setTestResults(prev => ({ ...prev, [registry.name]: 'testing' }));

    try {
      // Test registry by checking if it exists
      const exists = await HelmRepoService.isHelmRepoExist(registry.name);
      setTestResults(prev => ({
        ...prev,
        [registry.name]: exists ? 'success' : 'error'
      }));
    } catch (error) {
      setTestResults(prev => ({ ...prev, [registry.name]: 'error' }));
    } finally {
      setTestingRegistry(null);
    }
  };

  const getTestResultIcon = (registryId: string) => {
    const result = testResults[registryId];
    switch (result) {
      case 'testing':
        return <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />;
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Server className="w-5 h-5" />
            <span>Registry Settings</span>
          </DialogTitle>
          <DialogDescription>
            Manage your private and public Helm chart registries
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Registry List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg">Configured Registries</h3>
              <Button onClick={() => setShowForm(true)} size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add Registry
              </Button>
            </div>

            {registries.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <Server className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No registries configured</p>
                  <p className="text-sm text-gray-500">Add a registry to start browsing charts</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {registries.map((registry) => (
                  <Card key={registry.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h4 className="text-base">{registry.name}</h4>
                            {registry.username && (
                              <Badge variant="outline" className="text-xs">
                                <Key className="w-3 h-3 mr-1" />
                                Basic Auth
                              </Badge>
                            )}
                            {getTestResultIcon(registry.name)}
                          </div>
                          <p className="text-sm text-gray-600">{registry.url}</p>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => testRegistry(registry)}
                            disabled={testingRegistry === registry.name}
                          >
                            <TestTube className="w-3 h-3 mr-1" />
                            Test
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(registry)}
                          >
                            <Edit3 className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(registry.name)}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Add/Edit Form */}
          {showForm && (
            <>
              <Separator />
              <Card>
                <CardHeader>
                  <CardTitle>
                    {editingId ? 'Edit Registry' : 'Add New Registry'}
                  </CardTitle>
                  <CardDescription>
                    Configure connection details for your Helm registry
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="registry-name">Registry Name</Label>
                        <Input
                          id="registry-name"
                          value={form.name}
                          onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="My Private Registry"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="registry-url">Registry URL</Label>
                        <Input
                          id="registry-url"
                          value={form.url}
                          onChange={(e) => setForm(prev => ({ ...prev, url: e.target.value }))}
                          placeholder="https://charts.example.com"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="auth-type">Authentication Type</Label>
                      <Select
                        value={form.authType}
                        onValueChange={(value) => setForm(prev => ({
                          ...prev,
                          authType: value as 'none' | 'basic' | 'token'
                        }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">No Authentication</SelectItem>
                          <SelectItem value="basic">Basic Authentication</SelectItem>
                          <SelectItem value="token">Token Authentication</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {form.authType === 'basic' && (
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="username">Username</Label>
                          <Input
                            id="username"
                            value={form.username}
                            onChange={(e) => setForm(prev => ({ ...prev, username: e.target.value }))}
                            placeholder="username"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="password">Password</Label>
                          <div className="relative">
                            <Input
                              id="password"
                              type={showPassword ? 'text' : 'password'}
                              value={form.password}
                              onChange={(e) => setForm(prev => ({ ...prev, password: e.target.value }))}
                              placeholder="password"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-0 top-0 h-full px-3"
                              onClick={() => setShowPassword(!showPassword)}
                            >
                              {showPassword ? (
                                <EyeOff className="w-4 h-4" />
                              ) : (
                                <Eye className="w-4 h-4" />
                              )}
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}

                    {form.authType === 'token' && (
                      <div className="space-y-2">
                        <Label htmlFor="token">Access Token</Label>
                        <Input
                          id="token"
                          type={showPassword ? 'text' : 'password'}
                          value={form.token}
                          onChange={(e) => setForm(prev => ({ ...prev, token: e.target.value }))}
                          placeholder="Bearer token or API key"
                        />
                      </div>
                    )}

                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        인증 정보는 안전하게 암호화되어 저장됩니다.
                        개인정보 보호를 위해 프로덕션 환경에서는 적절한 보안 조치를 취해주세요.
                      </AlertDescription>
                    </Alert>

                    <div className="flex justify-end space-x-3">
                      <Button type="button" variant="outline" onClick={resetForm}>
                        <X className="w-4 h-4 mr-2" />
                        Cancel
                      </Button>
                      <Button type="submit">
                        <Check className="w-4 h-4 mr-2" />
                        {editingId ? 'Update' : 'Add'} Registry
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}