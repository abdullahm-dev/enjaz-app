import { LucideIcon } from "lucide-react";

export interface Package {
  id: number;
  name: string;
  category: string;
  description: string;
  price: number;
  old_price: number;
  rating: number;
  reviews_count: number;
  delivery_days: number;
  features: string[];
}

export interface ProjectFile {
  id: string;
  name: string;
  url: string;
  type: 'image' | 'document';
  uploadedBy: 'client' | 'technical';
  date: string;
}

export interface ProjectStage {
  id: string;
  title: string;
  status: 'pending' | 'in_progress' | 'completed' | 'revision';
  files: ProjectFile[];
  clientApproved: boolean;
  suggestions?: string;
  feedback?: string;
  readyForApproval?: boolean;
}

export interface ChatMessage {
  id: string;
  sender: 'client' | 'technical';
  text: string;
  files?: ProjectFile[];
  timestamp: string;
  seen: boolean;
}

export interface Project {
  id: number;
  name: string;
  package_id: number;
  status: 'in_review' | 'in_progress' | 'completed';
  progress: number;
  start_date: string;
  end_date?: string;
  description: string;
  budget?: number;
  earned_points?: number;
  used_discount?: {
    code: string;
    discount: number;
    points: number;
  };
  department: {
    name: string;
    title: string;
    online: boolean;
    lastSeen?: string;
    workingHours: string;
  };
  stages: ProjectStage[];
  files: {
    source_code: ProjectFile[];
    design: ProjectFile[];
    database: ProjectFile[];
    others: ProjectFile[];
    client: ProjectFile[];
  };
  chat: {
    messages: ChatMessage[];
  };
}

export interface Invoice {
  id: number;
  project_id: number;
  project_name?: string;
  amount: number;
  status: 'paid' | 'unpaid';
  date: string;
}

export interface Stats {
  totalProjects: number;
  currentProjects: number;
  completedProjects: number;
  totalPayments: number;
  unpaidInvoices: number;
}
