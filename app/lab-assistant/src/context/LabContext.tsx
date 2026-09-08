import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  LabItem, 
  MaterialRequest, 
  UsageLog, 
  BreakageLog,
  BreakageStatus,
  LabType, 
  UserRole, 
  UserProfile, 
  ToastMessage, 
  RequestStatus,
  AppPage,
  CartItem
} from '../types/lab';
import { INITIAL_LAB_ITEMS, INITIAL_REQUESTS, INITIAL_USAGE_LOGS, INITIAL_BREAKAGE_LOGS } from '../data/initialData';

interface LabContextType {
  items: LabItem[];
  requests: MaterialRequest[];
  usageLogs: UsageLog[];
  breakageLogs: BreakageLog[];
  cart: CartItem[];
  isCartOpen: boolean;
  selectedLabPortal: LabType;
  selectedLab: LabType | 'all';
  page: AppPage;
  userRole: UserRole;
  currentUser: UserProfile | null;
  toasts: ToastMessage[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  setSelectedLabPortal: (lab: LabType) => void;
  setSelectedLab: (lab: LabType | 'all') => void;
  setPage: (page: AppPage) => void;
  setIsCartOpen: (open: boolean) => void;
  addToCart: (item: LabItem, quantity?: number) => void;
  removeFromCart: (itemId: string) => void;
  updateCartQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  submitCartRequisition: (params: {
    experimentPurpose: string;
    dateNeeded: string;
    urgency: 'low' | 'normal' | 'high';
  }) => boolean;
  loginAsStudent: (name: string, email: string, grade?: string) => void;
  loginAsStaff: (name: string, email: string) => void;
  logout: () => void;
  navigateTo: (page: AppPage, labPortal?: LabType) => void;
  addItem: (item: Omit<LabItem, 'id' | 'lastUpdated'>) => void;
  updateItem: (id: string, updates: Partial<LabItem>) => void;
  deleteItem: (id: string) => void;
  logUsage: (params: { 
    itemId: string; 
    quantityUsed: number; 
    experimentName: string; 
    conductedBy: string; 
    notes?: string 
  }) => boolean;
  logBreakage: (params: {
    itemId: string;
    quantityBroken: number;
    incidentDetails: string;
    reportedBy: string;
    status: BreakageStatus;
    estimatedCost?: string;
    actionTaken: string;
    deductStock?: boolean;
  }) => boolean;
  updateBreakageStatus: (id: string, status: BreakageStatus, actionTaken?: string) => void;
  createRequest: (request: Omit<MaterialRequest, 'id' | 'status' | 'createdAt'>) => void;
  updateRequestStatus: (requestId: string, status: RequestStatus, adminNotes?: string) => void;
  deleteRequest: (requestId: string) => void;
  addToast: (toast: Omit<ToastMessage, 'id'>) => void;
  removeToast: (id: string) => void;
  resetToDefaultData: () => void;
}

const LabContext = createContext<LabContextType | undefined>(undefined);

const STORAGE_KEYS = {
  ITEMS: 'omnilab_items_v9',
  REQUESTS: 'omnilab_requests_v9',
  LOGS: 'omnilab_logs_v9',
  BREAKAGE: 'omnilab_breakage_v9',
  USER: 'omnilab_user_v9',
  PAGE: 'omnilab_page_v9',
  PORTAL: 'omnilab_portal_v9',
  CART: 'omnilab_cart_v9',
};

type SharedLabRow = {
  id: string;
  kind: string;
  name: string;
  quantity?: number;
  data?: any;
  updatedAt?: string;
};

export const LabProvider: React.FC<{
  children: React.ReactNode;
  sharedRows?: SharedLabRow[];
}> = ({ children, sharedRows = [] }) => {
  const [items, setItems] = useState<LabItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ITEMS);
    return saved ? JSON.parse(saved) : INITIAL_LAB_ITEMS;
  });

  const [requests, setRequests] = useState<MaterialRequest[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.REQUESTS);
    return saved ? JSON.parse(saved) : INITIAL_REQUESTS;
  });

  const [usageLogs, setUsageLogs] = useState<UsageLog[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.LOGS);
    return saved ? JSON.parse(saved) : INITIAL_USAGE_LOGS;
  });

  const [breakageLogs, setBreakageLogs] = useState<BreakageLog[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.BREAKAGE);
    return saved ? JSON.parse(saved) : INITIAL_BREAKAGE_LOGS;
  });

  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CART);
    return saved ? JSON.parse(saved) : [];
  });

  const [isCartOpen, setIsCartOpen] = useState(false);

  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.USER);
    return saved ? JSON.parse(saved) : null;
  });

  const [page, setPageState] = useState<AppPage>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PAGE);
    if (saved) return saved as AppPage;
    return 'login';
  });

  const [selectedLabPortal, setSelectedLabPortalState] = useState<LabType>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PORTAL);
    return (saved as LabType) || 'physics';
  });

  const [selectedLab, setSelectedLabState] = useState<LabType | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.REQUESTS, JSON.stringify(requests));
  }, [requests]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(usageLogs));
  }, [usageLogs]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.BREAKAGE, JSON.stringify(breakageLogs));
  }, [breakageLogs]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(currentUser));
    } else {
      localStorage.removeItem(STORAGE_KEYS.USER);
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PAGE, page);
  }, [page]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PORTAL, selectedLabPortal);
  }, [selectedLabPortal]);

  // Project the shared SchoolOS lab records into the existing Lab Assistant
  // model. The assistant keeps its complete UI/workflows, while source ids and
  // quantities remain aligned with the platform inventory and requests.
  useEffect(() => {
    if (!sharedRows.length) return;
    const inventoryRows = sharedRows.filter((row) => row.kind === 'inventory');
    const requestRows = sharedRows.filter(
      (row) => row.kind === 'request' && (row.data || {}).type === 'lab',
    );
    const usageRows = sharedRows.filter((row) =>
      ['labUsage', 'equipmentUsage', 'materialUsage', 'chemicalUsage', 'transaction'].includes(row.kind),
    );
    if (inventoryRows.length) {
      setItems((current) => {
        const next = [...current];
        for (const row of inventoryRows) {
          const d = row.data || {};
          const index = next.findIndex(
            (item) => item.id === row.id || item.name === row.name,
          );
          const labText = String(d.lab || d.labType || d.department || '').toLowerCase();
          const labType: LabType = labText.includes('physics')
            ? 'physics'
            : labText.includes('biology')
              ? 'biology'
              : 'chemistry';
          const sharedItem: LabItem = {
            ...(index >= 0 ? next[index] : INITIAL_LAB_ITEMS[0]),
            id: row.id,
            name: row.name,
            chemicalFormula: d.chemicalFormula,
            labType,
            category: (d.category || 'Glassware') as any,
            quantity: Math.max(0, Number(row.quantity ?? d.quantity ?? 0)),
            unit: (d.unit || 'pcs') as any,
            minThreshold: Number(d.minimumQuantity ?? d.minThreshold ?? 0),
            location:
              typeof d.location === 'object'
                ? d.location
                : { room: d.room || labType + ' lab', cabinet: d.location || 'General', shelf: '—' },
            hazardLevel: (d.hazardLevel || 'safe') as any,
            hazardNotes: d.hazardNotes,
            description: d.description || d.notes || '',
            specifications: Array.isArray(d.specifications) ? d.specifications : [],
            handlingPrecautions: Array.isArray(d.handlingPrecautions) ? d.handlingPrecautions : [],
            isAvailableForStudentRequest: d.isAvailableForStudentRequest !== false,
            lastUpdated: row.updatedAt || new Date().toISOString(),
            lastUsedBy: d.lastUsedBy,
          };
          if (index >= 0) next[index] = sharedItem;
          else next.push(sharedItem);
        }
        return next;
      });
    }
    if (requestRows.length) {
      setRequests((current) => {
        const next = [...current];
        for (const row of requestRows) {
          const d = row.data || {};
          const index = next.findIndex((request) => request.id === row.id);
          const mapped: MaterialRequest = {
            ...(index >= 0 ? next[index] : INITIAL_REQUESTS[0]),
            id: row.id,
            studentName: d.studentName || 'Student',
            studentEmail: d.studentEmail || '',
            studentGrade: d.studentGrade || '',
            itemName: row.name,
            itemId: d.itemId,
            labType: String(d.labType || 'chemistry') as LabType,
            quantityRequested: Number(d.quantity || d.quantityRequested || 1),
            unit: (d.unit || 'pcs') as any,
            experimentPurpose: d.purpose || d.experimentPurpose || '',
            dateNeeded: d.desiredDate || d.dateNeeded || '',
            status: String(d.status || 'Pending').toLowerCase() as RequestStatus,
            urgency: (d.urgency || 'normal') as 'low' | 'normal' | 'high',
            createdAt: d.requestedAt || d.createdAt || row.updatedAt || new Date().toISOString(),
            adminNotes: d.notes,
            reviewedBy: d.reviewedBy,
          };
          if (index >= 0) next[index] = mapped;
          else next.push(mapped);
        }
        return next;
      });
    }
    if (usageRows.length) {
      setUsageLogs((current) => {
        const next = [...current];
        for (const row of usageRows) {
          const d = row.data || {};
          if (next.some((log) => log.id === row.id)) continue;
          next.push({
            id: row.id,
            itemId: d.itemId || '',
            itemName: row.name,
            labType: String(d.labType || 'chemistry') as LabType,
            quantityUsed: Number(d.quantity || d.amount || 0),
            unit: (d.unit || 'pcs') as any,
            remainingStock: Number(d.newQuantity ?? d.remainingStock ?? 0),
            experimentName: d.experimentName || d.purpose || 'SchoolOS usage',
            conductedBy: d.whoUsed || d.conductedBy || d.teacher || '',
            loggedByAssistant: d.actor || 'SchoolOS',
            notes: d.notes,
            timestamp: d.time || row.updatedAt || new Date().toISOString(),
          });
        }
        return next;
      });
    }
  }, [sharedRows]);

  const addToast = (toast: Omit<ToastMessage, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { ...toast, id }]);
    setTimeout(() => {
      removeToast(id);
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Cart operations
  const addToCart = (item: LabItem, quantity: number = 1) => {
    setCart((prev) => {
      const existingIndex = prev.findIndex((ci) => ci.item.id === item.id);
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantityRequested: updated[existingIndex].quantityRequested + quantity,
        };
        return updated;
      }
      return [...prev, { item, quantityRequested: quantity, unit: item.unit }];
    });

    addToast({
      type: 'success',
      title: 'Added to Requisition Cart',
      message: `${item.name} (${quantity} ${item.unit}) added. View your cart anytime on the bottom-right.`
    });
  };

  const removeFromCart = (itemId: string) => {
    setCart((prev) => prev.filter((ci) => ci.item.id !== itemId));
    addToast({
      type: 'info',
      title: 'Removed from Cart',
      message: 'Item removed from requisition list.'
    });
  };

  const updateCartQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }
    setCart((prev) =>
      prev.map((ci) =>
        ci.item.id === itemId ? { ...ci, quantityRequested: quantity } : ci
      )
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const submitCartRequisition = ({
    experimentPurpose,
    dateNeeded,
    urgency,
  }: {
    experimentPurpose: string;
    dateNeeded: string;
    urgency: 'low' | 'normal' | 'high';
  }): boolean => {
    if (cart.length === 0) {
      addToast({
        type: 'error',
        title: 'Empty Cart',
        message: 'Please add items to your cart before submitting.'
      });
      return false;
    }

    const studentName = currentUser?.name || 'Student';
    const studentEmail = currentUser?.email || 'student@school.edu';
    const studentGrade = currentUser?.grade || 'Student';

    const newRequests: MaterialRequest[] = cart.map((ci, index) => ({
      id: `req-${Date.now().toString().slice(-4)}${index}`,
      studentName,
      studentEmail,
      studentGrade,
      itemName: ci.item.name,
      itemId: ci.item.id,
      labType: ci.item.labType,
      quantityRequested: ci.quantityRequested,
      unit: ci.unit,
      experimentPurpose,
      dateNeeded,
      status: 'pending',
      urgency,
      createdAt: new Date().toISOString(),
    }));

    setRequests((prev) => [...newRequests, ...prev]);
    clearCart();
    setIsCartOpen(false);

    addToast({
      type: 'success',
      title: 'Requisition Batch Submitted!',
      message: `Sent ${newRequests.length} material requests to the lab assistant for "${experimentPurpose}".`
    });

    return true;
  };

  const setPage = (newPage: AppPage) => {
    setPageState(newPage);
  };

  const setSelectedLabPortal = (lab: LabType) => {
    setSelectedLabPortalState(lab);
    setSelectedLabState(lab);
  };

  const setSelectedLab = (lab: LabType | 'all') => {
    setSelectedLabState(lab);
    if (lab !== 'all') {
      setSelectedLabPortalState(lab);
    }
  };

  const navigateTo = (newPage: AppPage, labPortal?: LabType) => {
    if (labPortal) {
      setSelectedLabPortalState(labPortal);
      setSelectedLabState(labPortal);
    }
    setPageState(newPage);
  };

  const loginAsStudent = (name: string, email: string, grade: string = 'Student') => {
    const user: UserProfile = {
      name: name || 'Rohan Verma',
      email: email || 'rohan.verma@school.edu',
      role: 'student',
      grade,
    };
    setCurrentUser(user);
    setPageState('student-hub');
    addToast({
      type: 'success',
      title: 'Welcome to Lab Assistant!',
      message: `Signed in as ${user.name}. Choose a lab portal to explore.`
    });
  };

  const loginAsStaff = (name: string, email: string) => {
    const user: UserProfile = {
      name: name || 'Dr. Sarah Jenkins',
      email: email || 's.jenkins@school.edu',
      role: 'staff',
      grade: 'Chief Science Lab Incharge',
    };
    setCurrentUser(user);
    setPageState('staff-dashboard');
    addToast({
      type: 'info',
      title: 'Lab Assistant Console Ready',
      message: `Signed in as ${user.name}. You have stock management & requisition access.`
    });
  };

  const logout = () => {
    setCurrentUser(null);
    clearCart();
    setPageState('login');
    addToast({
      type: 'info',
      title: 'Logged Out',
      message: 'Returned to the login portal.'
    });
  };

  const userRole: UserRole = currentUser?.role || 'student';

  const addItem = (newItemData: Omit<LabItem, 'id' | 'lastUpdated'>) => {
    const newItem: LabItem = {
      ...newItemData,
      id: `${newItemData.labType.slice(0, 4)}-${Date.now().toString().slice(-4)}`,
      lastUpdated: new Date().toISOString(),
    };
    setItems((prev) => [newItem, ...prev]);
    addToast({
      type: 'success',
      title: 'Item Added Successfully',
      message: `${newItem.name} has been added to ${newItem.labType.toUpperCase()} Lab.`
    });
  };

  const updateItem = (id: string, updates: Partial<LabItem>) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, ...updates, lastUpdated: new Date().toISOString() }
          : item
      )
    );
    addToast({
      type: 'success',
      title: 'Item Updated',
      message: 'Lab material details updated in inventory.'
    });
  };

  const deleteItem = (id: string) => {
    const target = items.find((i) => i.id === id);
    setItems((prev) => prev.filter((i) => i.id !== id));
    addToast({
      type: 'warning',
      title: 'Item Removed',
      message: `${target?.name || 'Material'} was removed from the lab catalog.`
    });
  };

  const logUsage = ({
    itemId,
    quantityUsed,
    experimentName,
    conductedBy,
    notes,
  }: {
    itemId: string;
    quantityUsed: number;
    experimentName: string;
    conductedBy: string;
    notes?: string;
  }): boolean => {
    const targetItem = items.find((i) => i.id === itemId);
    if (!targetItem) {
      addToast({
        type: 'error',
        title: 'Error',
        message: 'Selected item does not exist.'
      });
      return false;
    }

    if (quantityUsed <= 0) {
      addToast({
        type: 'error',
        title: 'Invalid Quantity',
        message: 'Quantity used must be greater than 0.'
      });
      return false;
    }

    const remaining = Math.max(0, targetItem.quantity - quantityUsed);

    setItems((prev) =>
      prev.map((item) =>
        item.id === itemId
          ? {
              ...item,
              quantity: remaining,
              lastUpdated: new Date().toISOString(),
              lastUsedBy: `${conductedBy} (${experimentName})`,
            }
          : item
      )
    );

    const newLog: UsageLog = {
      id: `log-${Date.now()}`,
      itemId: targetItem.id,
      itemName: targetItem.name,
      labType: targetItem.labType,
      quantityUsed,
      unit: targetItem.unit,
      remainingStock: remaining,
      experimentName,
      conductedBy,
      loggedByAssistant: currentUser?.name || 'Lab Staff',
      notes,
      timestamp: new Date().toISOString(),
    };

    setUsageLogs((prev) => [newLog, ...prev]);

    if (remaining <= targetItem.minThreshold) {
      addToast({
        type: 'warning',
        title: 'Low Stock Alert!',
        message: `${targetItem.name} stock is now ${remaining} ${targetItem.unit} (Below min threshold ${targetItem.minThreshold} ${targetItem.unit}).`
      });
    } else {
      addToast({
        type: 'success',
        title: 'Usage Logged & Stock Deducted',
        message: `Logged ${quantityUsed} ${targetItem.unit} consumed for "${experimentName}".`
      });
    }

    return true;
  };

  // Broken / Damaged Equipment Logger
  const logBreakage = ({
    itemId,
    quantityBroken,
    incidentDetails,
    reportedBy,
    status,
    estimatedCost,
    actionTaken,
    deductStock = true,
  }: {
    itemId: string;
    quantityBroken: number;
    incidentDetails: string;
    reportedBy: string;
    status: BreakageStatus;
    estimatedCost?: string;
    actionTaken: string;
    deductStock?: boolean;
  }): boolean => {
    const targetItem = items.find((i) => i.id === itemId);
    if (!targetItem) {
      addToast({
        type: 'error',
        title: 'Error',
        message: 'Selected item not found.'
      });
      return false;
    }

    if (quantityBroken <= 0) {
      addToast({
        type: 'error',
        title: 'Invalid Quantity',
        message: 'Quantity must be at least 1.'
      });
      return false;
    }

    if (deductStock) {
      const remaining = Math.max(0, targetItem.quantity - quantityBroken);
      setItems((prev) =>
        prev.map((item) =>
          item.id === itemId
            ? { ...item, quantity: remaining, lastUpdated: new Date().toISOString() }
            : item
        )
      );
    }

    const newBreakage: BreakageLog = {
      id: `brk-${Date.now().toString().slice(-4)}`,
      itemId: targetItem.id,
      itemName: targetItem.name,
      labType: targetItem.labType,
      quantityBroken,
      unit: targetItem.unit,
      incidentDetails,
      reportedBy,
      status,
      estimatedCost,
      actionTaken,
      timestamp: new Date().toISOString(),
    };

    setBreakageLogs((prev) => [newBreakage, ...prev]);

    addToast({
      type: 'warning',
      title: 'Equipment Damage Incident Logged',
      message: `Recorded ${quantityBroken} ${targetItem.unit} of "${targetItem.name}" as ${status.toUpperCase()}.`
    });

    return true;
  };

  const updateBreakageStatus = (id: string, status: BreakageStatus, actionTaken?: string) => {
    setBreakageLogs((prev) =>
      prev.map((b) =>
        b.id === id
          ? { ...b, status, actionTaken: actionTaken !== undefined ? actionTaken : b.actionTaken }
          : b
      )
    );

    addToast({
      type: 'info',
      title: 'Equipment Status Updated',
      message: `Damage record marked as ${status.toUpperCase()}.`
    });
  };

  const createRequest = (
    requestData: Omit<MaterialRequest, 'id' | 'status' | 'createdAt'>
  ) => {
    const newReq: MaterialRequest = {
      ...requestData,
      id: `req-${Date.now().toString().slice(-5)}`,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    setRequests((prev) => [newReq, ...prev]);
    addToast({
      type: 'success',
      title: 'Material Requisition Sent!',
      message: `Your request for "${requestData.itemName}" has been sent to the lab attendant.`
    });
  };

  const updateRequestStatus = (
    requestId: string,
    status: RequestStatus,
    adminNotes?: string
  ) => {
    setRequests((prev) =>
      prev.map((req) =>
        req.id === requestId
          ? {
              ...req,
              status,
              adminNotes: adminNotes !== undefined ? adminNotes : req.adminNotes,
              reviewedBy: currentUser?.name || 'Lab Staff',
            }
          : req
      )
    );

    addToast({
      type: status === 'rejected' ? 'warning' : 'success',
      title: 'Requisition Status Updated',
      message: `Request status has been set to ${status.toUpperCase()}.`
    });
  };

  const deleteRequest = (requestId: string) => {
    setRequests((prev) => prev.filter((r) => r.id !== requestId));
    addToast({
      type: 'info',
      title: 'Request Removed',
      message: 'Request deleted from record.'
    });
  };

  const resetToDefaultData = () => {
    setItems(INITIAL_LAB_ITEMS);
    setRequests(INITIAL_REQUESTS);
    setUsageLogs(INITIAL_USAGE_LOGS);
    setBreakageLogs(INITIAL_BREAKAGE_LOGS);
    clearCart();
    localStorage.removeItem(STORAGE_KEYS.ITEMS);
    localStorage.removeItem(STORAGE_KEYS.REQUESTS);
    localStorage.removeItem(STORAGE_KEYS.LOGS);
    localStorage.removeItem(STORAGE_KEYS.BREAKAGE);
    localStorage.removeItem(STORAGE_KEYS.CART);
    addToast({
      type: 'info',
      title: 'Reset to Clean Data',
      message: 'Restored initial lab inventory and records.'
    });
  };

  return (
    <LabContext.Provider
      value={{
        items,
        requests,
        usageLogs,
        breakageLogs,
        cart,
        isCartOpen,
        selectedLabPortal,
        selectedLab,
        page,
        userRole,
        currentUser,
        toasts,
        searchQuery,
        setSearchQuery,
        setSelectedLabPortal,
        setSelectedLab,
        setPage,
        setIsCartOpen,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        submitCartRequisition,
        loginAsStudent,
        loginAsStaff,
        logout,
        navigateTo,
        addItem,
        updateItem,
        deleteItem,
        logUsage,
        logBreakage,
        updateBreakageStatus,
        createRequest,
        updateRequestStatus,
        deleteRequest,
        addToast,
        removeToast,
        resetToDefaultData,
      }}
    >
      {children}
    </LabContext.Provider>
  );
};

export const useLab = () => {
  const context = useContext(LabContext);
  if (!context) {
    throw new Error('useLab must be used within a LabProvider');
  }
  return context;
};
