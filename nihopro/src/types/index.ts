// ===== 用户与权限 =====
export type UserRole = 'sales' | 'manager';

export interface User {
  id: string;
  name: string;
  department: string;
  role: UserRole;
  avatar?: string;
}

export type Visibility = 'private' | 'department' | 'company';

// ===== 知识库 =====
export interface KnowledgeItem {
  id: string;
  title: string;
  fileName: string;
  fileType: 'pdf' | 'docx' | 'pptx' | 'mp3' | 'mp4' | 'xlsx' | 'other';
  fileSize: string;
  duration?: string;
  uploader: string;
  uploaderDept: string;
  uploadTime: string;
  visibility: Visibility;
  tags: string[];
  viewCount: number;
  content?: string;
  transcript?: TranscriptEntry[];
}

export interface TranscriptEntry {
  timestamp: string;
  speaker: string;
  text: string;
}

// ===== AI 助手 =====
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  references?: Reference[];
  timestamp: string;
}

export interface Reference {
  title: string;
  page?: string;
  docId: string;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: string;
}

// ===== 销售分析 =====
export interface CallRecord {
  id: string;
  salesperson: string;
  customerName: string;
  customerAge?: number;
  customerCompany?: string;
  duration: string;
  uploadTime: string;
  status: 'analyzing' | 'completed' | 'failed';
  // 分析结果
  sentiment?: Sentiment;
  sopCompletion?: SOPResult[];
  completionRate?: number;
  improvements?: string[];
  suggestions?: string[];
  highlights?: string;
}

export interface Sentiment {
  positive: number;
  neutral: number;
  negative: number;
}

export interface SOPResult {
  step: string;
  completed: boolean;
  partial?: boolean;
}

// ===== 销售能力 =====
export interface AbilityRadar {
  demandMining: number;    // 需求挖掘
  sopCompletion: number;   // SOP完成度
  objectionHandling: number; // 异议处理
  closing: number;         // 促成
  comprehensive: number;   // 综合能力
}

export interface AbilityTrend {
  date: string;
  rate: number;
}

// ===== 销售排名 =====
export interface SalesRanking {
  rank: number;
  name: string;
  rate: number;
  change: number; // 排名变化: 正=上升, 0=持平, 负=下降
}

// ===== 团队指标 =====
export interface TeamMetrics {
  todayUploads: number;
  analyzedCount: number;
  avgCompletionRate: number;
  rateChange: number;
  bestSales: string;
  bestRate: number;
  mostImproved: string;
  mostImprovedChange: number;
}

// ===== 高转化特征 =====
export interface ConversionFeature {
  id: number;
  rank: number;
  description: string;
  successGroupRate: number;
  failGroupRate: number;
  difference: number;
  isGold: boolean;
}

// ===== 需关注销售 =====
export interface AtRiskSales {
  name: string;
  rate: number;
  weakness: string;
  recommendation: string;
}

// ===== SOP 配置 =====
export interface SOPGoal {
  id: string;
  name: string;
  type: 'call_behavior' | 'business_result';
  rule: string;
  teams: string[];
  active: boolean;
}

export interface SOPStep {
  id: string;
  order: number;
  name: string;
  timeLimit?: number;
  requiredActions: string[];
  checkpoints: string[];
  isCritical: boolean;
}

// ===== 案例库 =====
export interface CaseItem {
  id: string;
  title: string;
  scenario: string;
  tags: string[];
  salesperson: string;
  rate: number;
  result: string;
  dialogueSnippet: string;
  timestamp: string;
  tips: string[];
  learnCount: number;
  collected: boolean;
}

// ===== 导航 =====
export interface NavItem {
  key: string;
  label: string;
  icon: string;
  path: string;
  roles: UserRole[];
}
