import { useState } from 'react';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Package, 
  Users, 
  Factory, 
  Building2, 
  Wrench,
  Search,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { useMasterData } from '@/context/MasterDataContext';
import type { PartType, Customer, Supplier, Machine, Department } from '@/types';

type EntityType = 'partTypes' | 'customers' | 'suppliers' | 'machines' | 'departments';

interface FormData {
  name: string;
  code: string;
  description: string;
  isActive: boolean;
  department?: string;
}

const defaultFormData: FormData = {
  name: '',
  code: '',
  description: '',
  isActive: true,
  department: '',
};

export default function MasterData() {
  const {
    partTypes,
    customers,
    suppliers,
    machines,
    departments,
    addPartType,
    updatePartType,
    deletePartType,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    addSupplier,
    updateSupplier,
    deleteSupplier,
    addMachine,
    updateMachine,
    deleteMachine,
    addDepartment,
    updateDepartment,
    deleteDepartment,
  } = useMasterData();

  const [activeTab, setActiveTab] = useState<EntityType>('partTypes');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [formData, setFormData] = useState<FormData>(defaultFormData);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const tabs = [
    { id: 'partTypes' as EntityType, label: 'Part Types', icon: Package },
    { id: 'customers' as EntityType, label: 'Customers', icon: Users },
    { id: 'suppliers' as EntityType, label: 'Suppliers', icon: Factory },
    { id: 'machines' as EntityType, label: 'Machines', icon: Wrench },
    { id: 'departments' as EntityType, label: 'Departments', icon: Building2 },
  ];

  const getData = () => {
    switch (activeTab) {
      case 'partTypes': return partTypes;
      case 'customers': return customers;
      case 'suppliers': return suppliers;
      case 'machines': return machines;
      case 'departments': return departments;
      default: return [];
    }
  };

  const filteredData = getData().filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAdd = () => {
    setEditingItem(null);
    setFormData(defaultFormData);
    setIsDialogOpen(true);
  };

  const handleEdit = (item: any) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      code: item.code,
      description: item.description || '',
      isActive: item.isActive,
      department: (item as Machine).department || '',
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this item?')) {
      setIsSaving(true);
      try {
        switch (activeTab) {
          case 'partTypes':
            await deletePartType(id);
            break;
          case 'customers':
            await deleteCustomer(id);
            break;
          case 'suppliers':
            await deleteSupplier(id);
            break;
          case 'machines':
            await deleteMachine(id);
            break;
          case 'departments':
            await deleteDepartment(id);
            break;
        }
        toast.success('Item deleted successfully');
      } catch (err) {
        toast.error('Failed to delete item');
      } finally {
        setIsSaving(false);
      }
    }
  };

  const handleSave = async () => {
    if (!formData.name || !formData.code) {
      toast.error('Name and code are required');
      return;
    }

    setIsSaving(true);
    try {
      const data = {
        name: formData.name,
        code: formData.code,
        description: formData.description,
        isActive: formData.isActive,
        ...(activeTab === 'machines' && { department: formData.department }),
      };

      if (editingItem) {
        switch (activeTab) {
          case 'partTypes':
            await updatePartType(editingItem.id, data);
            break;
          case 'customers':
            await updateCustomer(editingItem.id, data);
            break;
          case 'suppliers':
            await updateSupplier(editingItem.id, data);
            break;
          case 'machines':
            await updateMachine(editingItem.id, data);
            break;
          case 'departments':
            await updateDepartment(editingItem.id, data);
            break;
        }
        toast.success('Item updated successfully');
      } else {
        switch (activeTab) {
          case 'partTypes':
            await addPartType(data as Omit<PartType, 'id'>);
            break;
          case 'customers':
            await addCustomer(data as Omit<Customer, 'id'>);
            break;
          case 'suppliers':
            await addSupplier(data as Omit<Supplier, 'id'>);
            break;
          case 'machines':
            await addMachine(data as Omit<Machine, 'id'>);
            break;
          case 'departments':
            await addDepartment(data as Omit<Department, 'id'>);
            break;
        }
        toast.success('Item added successfully');
      }

      setIsDialogOpen(false);
      setFormData(defaultFormData);
      setEditingItem(null);
    } catch (err) {
      toast.error('Failed to save item');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-[#1A1A1A]">Master Data Management</h2>
          <p className="text-[#666666] mt-1">Manage dropdown values and reference data</p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as EntityType)}>
        <TabsList className="bg-white border border-[#E5E5E5] p-1 flex flex-wrap">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className="data-[state=active]:bg-[#C9A962] data-[state=active]:text-white flex items-center gap-2"
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </TabsTrigger>
            );
          })}
        </TabsList>

        {tabs.map((tab) => (
          <TabsContent key={tab.id} value={tab.id} className="mt-6">
            <Card className="card">
              <CardHeader className="pb-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <CardTitle className="section-title mb-0">{tab.label}</CardTitle>
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#999999]" />
                      <Input
                        placeholder="Search..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="input-field pl-10 w-64"
                      />
                    </div>
                    <Button onClick={handleAdd} className="btn-primary">
                      <Plus className="w-4 h-4 mr-2" />
                      Add {tab.label.slice(0, -1)}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="table-header">
                        <th className="text-left px-4 py-3 text-sm font-medium">Code</th>
                        <th className="text-left px-4 py-3 text-sm font-medium">Name</th>
                        <th className="text-left px-4 py-3 text-sm font-medium">Description</th>
                        {tab.id === 'machines' && (
                          <th className="text-left px-4 py-3 text-sm font-medium">Department</th>
                        )}
                        <th className="text-left px-4 py-3 text-sm font-medium">Status</th>
                        <th className="text-left px-4 py-3 text-sm font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredData.map((item: any) => (
                        <tr key={item.id} className="table-row">
                          <td className="px-4 py-3 text-sm font-medium number-display">{item.code}</td>
                          <td className="px-4 py-3 text-sm">{item.name}</td>
                          <td className="px-4 py-3 text-sm text-[#666666]">{item.description || '-'}</td>
                          {tab.id === 'machines' && (
                            <td className="px-4 py-3 text-sm">
                              {departments.find(d => d.id === item.department)?.name || '-'}
                            </td>
                          )}
                          <td className="px-4 py-3 text-sm">
                            <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs ${
                              item.isActive 
                                ? 'bg-green-100 text-green-700' 
                                : 'bg-gray-100 text-gray-700'
                            }`}>
                              {item.isActive ? (
                                <><CheckCircle2 className="w-3 h-3" /> Active</>
                              ) : (
                                <><XCircle className="w-3 h-3" /> Inactive</>
                              )}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleEdit(item)}
                                className="text-[#666666] hover:text-[#C9A962]"
                              >
                                <Edit2 className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDelete(item.id)}
                                className="text-[#666666] hover:text-red-500"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {filteredData.length === 0 && (
                        <tr>
                          <td 
                            colSpan={tab.id === 'machines' ? 6 : 5} 
                            className="px-4 py-8 text-center text-[#999999]"
                          >
                            No {tab.label.toLowerCase()} found. Click "Add {tab.label.slice(0, -1)}" to create one.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="section-title">
              {editingItem ? 'Edit' : 'Add'} {tabs.find(t => t.id === activeTab)?.label.slice(0, -1)}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label className="form-label">Code *</Label>
              <Input
                value={formData.code}
                onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
                className="input-field"
                placeholder="Enter code"
              />
            </div>
            <div>
              <Label className="form-label">Name *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="input-field"
                placeholder="Enter name"
              />
            </div>
            <div>
              <Label className="form-label">Description</Label>
              <Input
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="input-field"
                placeholder="Enter description (optional)"
              />
            </div>
            {activeTab === 'machines' && (
              <div>
                <Label className="form-label">Department</Label>
                <select
                  value={formData.department}
                  onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
                  className="input-field w-full"
                >
                  <option value="">Select Department</option>
                  {departments.filter(d => d.isActive).map(dept => (
                    <option key={dept.id} value={dept.id}>{dept.name}</option>
                  ))}
                </select>
              </div>
            )}
            <div className="flex items-center gap-3">
              <Switch
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
              />
              <Label className="text-sm">Active</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isSaving}>
              Cancel
            </Button>
            <Button onClick={handleSave} className="btn-primary" disabled={isSaving}>
              {isSaving ? 'Saving...' : editingItem ? 'Update' : 'Add'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
