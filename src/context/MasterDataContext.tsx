import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { PartType, Customer, Supplier, Machine, Department } from '@/types';
import { getMasterData, upsertMasterItem, deleteMasterItem } from '@/lib/api';
import {
  defaultPartTypes,
  defaultCustomers,
  defaultSuppliers,
  defaultMachines,
  defaultDepartments,
} from '@/data/masterData';

interface MasterDataContextType {
  partTypes: PartType[];
  customers: Customer[];
  suppliers: Supplier[];
  machines: Machine[];
  departments: Department[];
  isLoading: boolean;

  // Part Types
  addPartType: (partType: Omit<PartType, 'id'>) => Promise<void>;
  updatePartType: (id: string, partType: Partial<PartType>) => Promise<void>;
  deletePartType: (id: string) => Promise<void>;

  // Customers
  addCustomer: (customer: Omit<Customer, 'id'>) => Promise<void>;
  updateCustomer: (id: string, customer: Partial<Customer>) => Promise<void>;
  deleteCustomer: (id: string) => Promise<void>;

  // Suppliers
  addSupplier: (supplier: Omit<Supplier, 'id'>) => Promise<void>;
  updateSupplier: (id: string, supplier: Partial<Supplier>) => Promise<void>;
  deleteSupplier: (id: string) => Promise<void>;

  // Machines
  addMachine: (machine: Omit<Machine, 'id'>) => Promise<void>;
  updateMachine: (id: string, machine: Partial<Machine>) => Promise<void>;
  deleteMachine: (id: string) => Promise<void>;

  // Departments
  addDepartment: (department: Omit<Department, 'id'>) => Promise<void>;
  updateDepartment: (id: string, department: Partial<Department>) => Promise<void>;
  deleteDepartment: (id: string) => Promise<void>;
}

const MasterDataContext = createContext<MasterDataContextType | undefined>(undefined);

export function MasterDataProvider({ children }: { children: React.ReactNode }) {
  const [partTypes, setPartTypes] = useState<PartType[]>(defaultPartTypes);
  const [customers, setCustomers] = useState<Customer[]>(defaultCustomers);
  const [suppliers, setSuppliers] = useState<Supplier[]>(defaultSuppliers);
  const [machines, setMachines] = useState<Machine[]>(defaultMachines);
  const [departments, setDepartments] = useState<Department[]>(defaultDepartments);
  const [isLoading, setIsLoading] = useState(true);

  // ── Fetch from API on mount ────────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        const data = await getMasterData();
        if (data.partTypes.length)   setPartTypes(data.partTypes);
        if (data.customers.length)   setCustomers(data.customers);
        if (data.suppliers.length)   setSuppliers(data.suppliers);
        if (data.machines.length)    setMachines(data.machines);
        if (data.departments.length) setDepartments(data.departments);
      } catch {
        // Fallback to defaults
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const generateId = () => Math.random().toString(36).substr(2, 9);

  // Helper for API mutations
  const runMutation = async <T,>(
    listKey: string,
    action: 'upsert' | 'delete',
    payload: any,
    stateSetter: React.Dispatch<React.SetStateAction<T[]>>
  ) => {
    try {
      const result = action === 'upsert'
        ? await upsertMasterItem(listKey, payload)
        : await deleteMasterItem(listKey, payload);
      
      stateSetter(result.items as T[]);
    } catch (err) {
      console.error(`MasterData Mutation Error [${listKey}]:`, err);
      throw err;
    }
  };

  // Part Types
  const addPartType = useCallback(async (partType: Omit<PartType, 'id'>) => {
    await runMutation('part_types', 'upsert', { ...partType, id: generateId() }, setPartTypes);
  }, []);
  const updatePartType = useCallback(async (id: string, partType: Partial<PartType>) => {
    const existing = partTypes.find(p => p.id === id);
    if (existing) {
      await runMutation('part_types', 'upsert', { ...existing, ...partType }, setPartTypes);
    }
  }, [partTypes]);
  const deletePartType = useCallback(async (id: string) => {
    await runMutation('part_types', 'delete', id, setPartTypes);
  }, []);

  // Customers
  const addCustomer = useCallback(async (customer: Omit<Customer, 'id'>) => {
    await runMutation('customers', 'upsert', { ...customer, id: generateId() }, setCustomers);
  }, []);
  const updateCustomer = useCallback(async (id: string, customer: Partial<Customer>) => {
    const existing = customers.find(c => c.id === id);
    if (existing) {
      await runMutation('customers', 'upsert', { ...existing, ...customer }, setCustomers);
    }
  }, [customers]);
  const deleteCustomer = useCallback(async (id: string) => {
    await runMutation('customers', 'delete', id, setCustomers);
  }, []);

  // Suppliers
  const addSupplier = useCallback(async (supplier: Omit<Supplier, 'id'>) => {
    await runMutation('suppliers', 'upsert', { ...supplier, id: generateId() }, setSuppliers);
  }, []);
  const updateSupplier = useCallback(async (id: string, supplier: Partial<Supplier>) => {
    const existing = suppliers.find(s => s.id === id);
    if (existing) {
      await runMutation('suppliers', 'upsert', { ...existing, ...supplier }, setSuppliers);
    }
  }, [suppliers]);
  const deleteSupplier = useCallback(async (id: string) => {
    await runMutation('suppliers', 'delete', id, setSuppliers);
  }, []);

  // Machines
  const addMachine = useCallback(async (machine: Omit<Machine, 'id'>) => {
    await runMutation('machines', 'upsert', { ...machine, id: generateId() }, setMachines);
  }, []);
  const updateMachine = useCallback(async (id: string, machine: Partial<Machine>) => {
    const existing = machines.find(m => m.id === id);
    if (existing) {
      await runMutation('machines', 'upsert', { ...existing, ...machine }, setMachines);
    }
  }, [machines]);
  const deleteMachine = useCallback(async (id: string) => {
    await runMutation('machines', 'delete', id, setMachines);
  }, []);

  // Departments
  const addDepartment = useCallback(async (department: Omit<Department, 'id'>) => {
    await runMutation('departments', 'upsert', { ...department, id: generateId() }, setDepartments);
  }, []);
  const updateDepartment = useCallback(async (id: string, department: Partial<Department>) => {
    const existing = departments.find(d => d.id === id);
    if (existing) {
      await runMutation('departments', 'upsert', { ...existing, ...department }, setDepartments);
    }
  }, [departments]);
  const deleteDepartment = useCallback(async (id: string) => {
    await runMutation('departments', 'delete', id, setDepartments);
  }, []);

  return (
    <MasterDataContext.Provider value={{
      partTypes, customers, suppliers, machines, departments, isLoading,
      addPartType, updatePartType, deletePartType,
      addCustomer, updateCustomer, deleteCustomer,
      addSupplier, updateSupplier, deleteSupplier,
      addMachine, updateMachine, deleteMachine,
      addDepartment, updateDepartment, deleteDepartment,
    }}>
      {children}
    </MasterDataContext.Provider>
  );
}

export function useMasterData() {
  const context = useContext(MasterDataContext);
  if (context === undefined) {
    throw new Error('useMasterData must be used within a MasterDataProvider');
  }
  return context;
}
