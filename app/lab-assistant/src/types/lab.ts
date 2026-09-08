export type LabType = 'chemistry' | 'physics' | 'biology';

export type AppPage = 'login' | 'student-hub' | 'lab-store' | 'staff-dashboard';

export type Category = 
  // Chemistry
  | 'Acids & Bases'
  | 'Salts & Reagents'
  | 'Organic Solvents'
  | 'Indicators & Dyes'
  | 'Glassware'
  | 'Heating & Support'
  // Physics
  | 'Optics & Light'
  | 'Electricity & Magnetism'
  | 'Mechanics & Measurement'
  | 'Waves & Sound'
  | 'Thermodynamics'
  | 'Electronic Sensors'
  // Biology
  | 'Microscopes & Optics'
  | 'Prepared Slides'
  | 'Biological Stains'
  | 'Specimens & Models'
  | 'Dissection Tools'
  | 'Culture & Glassware';

export type HazardLevel = 'safe' | 'caution' | 'corrosive' | 'flammable' | 'toxic' | 'biohazard' | 'fragile';

export type UnitType = 'g' | 'kg' | 'mL' | 'L' | 'pcs' | 'sets' | 'boxes' | 'vials' | 'bottles';

export interface SupplierInfo {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  catalogNumber?: string;
  leadTimeDays?: number;
}

export interface LabItem {
  id: string;
  name: string;
  chemicalFormula?: string;
  labType: LabType;
  category: Category;
  quantity: number;
  unit: UnitType;
  minThreshold: number;
  location: {
    room: string;
    cabinet: string;
    shelf: string;
  };
  hazardLevel: HazardLevel;
  hazardNotes?: string;
  description: string;
  specifications?: string[];
  handlingPrecautions?: string[];
  supplier?: SupplierInfo;
  imageUrl?: string;
  isAvailableForStudentRequest: boolean;
  lastUpdated: string;
  lastUsedBy?: string;
}

export interface CartItem {
  item: LabItem;
  quantityRequested: number;
  unit: UnitType;
}

export type RequestStatus = 'pending' | 'approved' | 'prepared' | 'ready' | 'rejected' | 'fulfilled';

export interface MaterialRequest {
  id: string;
  studentName: string;
  studentEmail: string;
  studentGrade: string;
  itemName: string;
  itemId?: string;
  labType: LabType;
  quantityRequested: number;
  unit: UnitType;
  experimentPurpose: string;
  dateNeeded: string;
  status: RequestStatus;
  urgency: 'low' | 'normal' | 'high';
  createdAt: string;
  adminNotes?: string;
  reviewedBy?: string;
}

export interface UsageLog {
  id: string;
  itemId: string;
  itemName: string;
  labType: LabType;
  quantityUsed: number;
  unit: UnitType;
  remainingStock: number;
  experimentName: string;
  conductedBy: string;
  loggedByAssistant: string;
  notes?: string;
  timestamp: string;
}

export type BreakageStatus = 'damaged' | 'under-repair' | 'written-off' | 'replaced';

export interface BreakageLog {
  id: string;
  itemId: string;
  itemName: string;
  labType: LabType;
  quantityBroken: number;
  unit: UnitType;
  incidentDetails: string;
  reportedBy: string;
  status: BreakageStatus;
  estimatedCost?: string;
  actionTaken: string;
  timestamp: string;
}

export type UserRole = 'student' | 'staff';

export interface UserProfile {
  name: string;
  email: string;
  role: UserRole;
  grade?: string;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  title: string;
  message: string;
}

export type SortOption = 
  | 'alphabetical-asc'
  | 'alphabetical-desc'
  | 'quantity-desc'
  | 'quantity-asc'
  | 'hazard';
