import React, { createContext, useContext, useState, useCallback } from 'react';
import type { PartType, Customer, Supplier, Machine, Department } from '@/types';
import { 
  defaultPartTypes, 
  defaultCustomers, 
  defaultSuppliers, 
  defaultMachines, 
  defaultDepartments 
} from '@/data/masterData';

interface MasterDataContextType {
  partTypes: PartType[];
  customers: Customer[];
  suppliers: Supplier[];
  machines: Machine[];
  departments: Department[];
  
  // Part Types
  addPartType: (partType: Omit<PartType, 'id'>) => void;
  updatePartType: (id: string, partType: Partial<PartType>) => void;
  deletePartType: (id: string) => void;
  
  // Customers
  addCustomer: (customer: Omit<Customer, 'id'>) => void;
  updateCustomer: (id: string, customer: Partial<Customer>) => void;
  deleteCustomer: (id: string) => void;
  
  // Suppliers
  addSupplier: (supplier: Omit<Supplier, 'id'>) => void;
  updateSupplier: (id: string, supplier: Partial<Supplier>) => void;
  deleteSupplier: (id: string) => void;
  
  // Machines
  addMachine: (machine: Omit<Machine, 'id'>) => void;
  updateMachine: (id: string, machine: Partial<Machine>) => void;
  deleteMachine: (id: string) => void;
  
  // Departments
  addDepartment: (department: Omit<Department, 'id'>) => void;
  updateDepartment: (id: string, department: Partial<Department>) => void;
  deleteDepartment: (id: string) => void;
}

const MasterDataContext = createContext<MasterDataContextType | undefined>(undefined);

export function MasterDataProvider({ children }: { children: React.ReactNode }) {
  const [partTypes, setPartTypes] = useState<PartType[]>(defaultPartTypes);
  const [customers, setCustomers] = useState<Customer[]>(defaultCustomers);
  const [suppliers, setSuppliers] = useState<Supplier[]>(defaultSuppliers);
  const [machines, setMachines] = useState<Machine[]>(defaultMachines);
  const [departments, setDepartments] = useState<Department[]>(defaultDepartments);

  const generateId = () => Math.random().toString(36).substr(2, 9);

  // Part Types
  const addPartType = useCallback((partType: Omit<PartType, 'id'>) => {
    setPartTypes(prev => [...prev, { ...partType, id: generateId() }]);
  }, []);

  const updatePartType = useCallback((id: string, partType: Partial<PartType>) => {
    setPartTypes(prev => prev.map(pt => pt.id === id ? { ...pt, ...partType } : pt));
  }, []);

  const deletePartType = useCallback((id: string) => {
    setPartTypes(prev => prev.filter(pt => pt.id !== id));
  }, []);

  // Customers
  const addCustomer = useCallback((customer: Omit<Customer, 'id'>) => {
    setCustomers(prev => [...prev, { ...customer, id: generateId() }]);
  }, []);

  const updateCustomer = useCallback((id: string, customer: Partial<Customer>) => {
    setCustomers(prev => prev.map(c => c.id === id ? { ...c, ...customer } : c));
  }, []);

  const deleteCustomer = useCallback((id: string) => {
    setCustomers(prev => prev.filter(c => c.id !== id));
  }, []);

  // Suppliers
  const addSupplier = useCallback((supplier: Omit<Supplier, 'id'>) => {
    setSuppliers(prev => [...prev, { ...supplier, id: generateId() }]);
  }, []);

  const updateSupplier = useCallback((id: string, supplier: Partial<Supplier>) => {
    setSuppliers(prev => prev.map(s => s.id === id ? { ...s, ...supplier } : s));
  }, []);

  const deleteSupplier = useCallback((id: string) => {
    setSuppliers(prev => prev.filter(s => s.id !== id));
  }, []);

  // Machines
  const addMachine = useCallback((machine: Omit<Machine, 'id'>) => {
    setMachines(prev => [...prev, { ...machine, id: generateId() }]);
  }, []);

  const updateMachine = useCallback((id: string, machine: Partial<Machine>) => {
    setMachines(prev => prev.map(m => m.id === id ? { ...m, ...machine } : m));
  }, []);

  const deleteMachine = useCallback((id: string) => {
    setMachines(prev => prev.filter(m => m.id !== id));
  }, []);

  // Departments
  const addDepartment = useCallback((department: Omit<Department, 'id'>) => {
    setDepartments(prev => [...prev, { ...department, id: generateId() }]);
  }, []);

  const updateDepartment = useCallback((id: string, department: Partial<Department>) => {
    setDepartments(prev => prev.map(d => d.id === id ? { ...d, ...department } : d));
  }, []);

  const deleteDepartment = useCallback((id: string) => {
    setDepartments(prev => prev.filter(d => d.id !== id));
  }, []);

  return (
    <MasterDataContext.Provider value={{
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
