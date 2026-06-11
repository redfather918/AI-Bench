/**
 * NIHO API 统一服务层
 *
 * ── 自动后端模式（默认）──
 * 所有请求优先调用 FastAPI 后端（http://localhost:8000），
 * 失败时回退到本地 mock 数据。
 *
 * ── 强制 Mock 模式 ──
 * 在浏览器控制台执行: localStorage.setItem('NIHO_USE_MOCK', '1')
 */

import client from '../api/client';
import type {
  User, KnowledgeItem, ChatSession, ChatMessage, CallRecord,
  AbilityRadar, AbilityTrend, SalesRanking, TeamMetrics,
  ConversionFeature, AtRiskSales, SOPGoal, SOPStep, CaseItem,
} from '../types';

// ═══════════════════════════════════════════════
//  Helpers
// ═══════════════════════════════════════════════

let _useMockCache: boolean | null = null;

function useMock(): boolean {
  if (_useMockCache === null) {
    _useMockCache = typeof localStorage !== 'undefined' && localStorage.getItem('NIHO_USE_MOCK') === '1';
  }
  return _useMockCache;
}

const BASE = 'http://localhost:8001';

async function apiGet<T>(path: string): Promise<T> {
  if (useMock()) throw new Error('FORCE_MOCK');
  const res = await client.get(path);
  return res.data;
}

async function apiPost<T>(path: string, body?: unknown): Promise<T> {
  if (useMock()) throw new Error('FORCE_MOCK');
  const res = await client.post(path, body);
  return res.data;
}

// ═══════════════════════════════════════════════
//  Transformers: backend → frontend types
// ═══════════════════════════════════════════════

interface BackendKnowledge {
  id: number;
  title: string;
  file_type: string;
  file_size: string;
  visibility: string;
  department: string;
  uploader_name: string;
  tags: string;
  content: string;
  view_count: number;
  duration: string;
  created_at: string | null;
}

const EXT_MAP: Record<string, string> = {
  pdf: '.pdf', docx: '.docx', pptx: '.pptx',
  mp3: '.mp3', mp4: '.mp4', xlsx: '.xlsx',
};

function toKnowledgeItem(b: BackendKnowledge): KnowledgeItem {
  const ext = EXT_MAP[b.file_type] || '';
  return {
    id: String(b.id),
    title: b.title,
    fileName: b.title + ext,
    fileType: b.file_type,
    fileSize: b.file_size || '-',
    uploader: b.uploader_name,
    uploaderDept: b.department || '',
    uploadTime: b.created_at || new Date().toISOString(),
    visibility: b.visibility as 'private' | 'department' | 'company',
    tags: b.tags ? b.tags.split(',').map((t: string) => t.trim()).filter(Boolean) : [],
    viewCount: b.view_count || 0,
    content: b.content || '',
    duration: b.duration || '',
  };
}

interface BackendRecording {
  id: number;
  sales_name: string;
  customer_name: string;
  customer_company: string;
  customer_age: number;
  duration_display: string;
  transcription: string;
  emotion_positive: number;
  emotion_neutral: number;
  emotion_negative: number;
  sop_completion: string;   // JSON array
  sop_score: number;
  skill_need_discovery: number;
  skill_sop_completion: number;
  skill_objection_handling: number;
  skill_closing: number;
  improvement_points: string; // JSON array
  suggested_learning: string; // JSON array
  created_at: string | null;
}

function toCallRecord(r: BackendRecording): CallRecord {
  let sopCompletionParsed: Array<{ step: string; completed: boolean; partial?: boolean }> = [];
  try {
    const raw = JSON.parse(r.sop_completion || '[]') as Array<{ step_name: string; status: string }>;
    sopCompletionParsed = raw.map((s) => ({
      step: s.step_name,
      completed: s.status === 'pass',
      partial: s.status === 'warn',
    }));
  } catch { /* keep empty */ }

  let improvementsParsed: string[] = [];
  try { improvementsParsed = JSON.parse(r.improvement_points || '[]'); } catch { /* */ }

  let suggestionsParsed: Array<{ title: string }> = [];
  try { suggestionsParsed = JSON.parse(r.suggested_learning || '[]'); } catch { /* */ }

  const status = r.sop_score > 0 ? 'completed' as const : 'analyzing' as const;

  return {
    id: String(r.id),
    salesperson: r.sales_name,
    customerName: r.customer_name,
    customerAge: r.customer_age || undefined,
    customerCompany: r.customer_company || undefined,
    duration: r.duration_display,
    uploadTime: r.created_at || new Date().toISOString(),
    status,
    sentiment: { positive: r.emotion_positive, neutral: r.emotion_neutral, negative: r.emotion_negative },
    sopCompletion: sopCompletionParsed,
    completionRate: r.sop_score,
    improvements: improvementsParsed,
    suggestions: suggestionsParsed.map((s) => s.title),
  };
}

interface BackendRanking { name: string; rate: number; change: number; }

function toSalesRanking(r: BackendRanking, idx: number): SalesRanking {
  return { rank: idx + 1, name: r.name, rate: r.rate, change: r.change };
}

interface BackendFeature { rank: number; name: string; hit_rate: number; miss_rate: number; diff: number; }

function toConversionFeature(f: BackendFeature): ConversionFeature {
  return {
    id: f.rank, rank: f.rank,
    description: f.name,
    successGroupRate: f.hit_rate, failGroupRate: f.miss_rate,
    difference: f.diff, isGold: true,
  };
}

interface BackendAtRisk { name: string; rate: number; weakness: string; recommend: string; }

function toAtRiskSales(r: BackendAtRisk): AtRiskSales {
  return { name: r.name, rate: r.rate, weakness: r.weakness, recommendation: r.recommend };
}

interface BackendSopStep {
  id: number; order: number; name: string; description: string;
  required_actions: string; check_points: string; is_key_step: boolean;
}

function toSOPStep(s: BackendSopStep): SOPStep {
  let actions: string[] = [];
  let checkpoints: string[] = [];
  try { actions = JSON.parse(s.required_actions || '[]'); } catch { /* */ }
  try { checkpoints = JSON.parse(s.check_points || '[]'); } catch { /* */ }
  return {
    id: String(s.id), order: s.order, name: s.name,
    requiredActions: actions, checkpoints,
    isCritical: s.is_key_step,
  };
}

interface BackendSopTemplate { id: number; name: string; is_active: boolean; steps: BackendSopStep[]; }

interface BackendGoal {
  id: number; name: string; goal_type: string;
  rule_description: string; target_team: string; is_active: boolean;
}

function toSOPGoal(g: BackendGoal): SOPGoal {
  return {
    id: String(g.id), name: g.name,
    type: g.goal_type as 'call_behavior' | 'business_result',
    rule: g.rule_description,
    teams: g.target_team ? [g.target_team] : ['所有销售团队'],
    active: g.is_active,
  };
}

interface BackendCase {
  id: number; title: string; scene: string; sales_name: string;
  deal_result: string; dialog_excerpt: string; dialog_timestamp: string;
  success_points: string; category: string; learning_count: number;
}

function toCaseItem(c: BackendCase): CaseItem {
  let tips: string[] = [];
  try { tips = JSON.parse(c.success_points || '[]'); } catch { /* */ }
  return {
    id: String(c.id), title: c.title, scenario: c.scene,
    tags: c.category ? [c.category] : [],
    salesperson: c.sales_name, rate: 0, result: c.deal_result,
    dialogueSnippet: c.dialog_excerpt,
    timestamp: c.dialog_timestamp,
    tips, learnCount: c.learning_count, collected: false,
  };
}

// ═══════════════════════════════════════════════
//  API Functions (same signatures as before)
// ═══════════════════════════════════════════════

// --- 用户 ---
export async function getCurrentUser(role?: string): Promise<User> {
  // 没有专用登录 API，本地 fallback
  return role === 'manager'
    ? { id: 'u2', name: '王经理', department: '销售部', role: 'manager' }
    : { id: 'u1', name: '李明', department: '销售部', role: 'sales' };
}

// --- 知识库 ---
export async function getKnowledgeList(space?: string): Promise<KnowledgeItem[]> {
  try {
    const sp = space || 'all';
    const data = await apiGet<{ items: BackendKnowledge[]; total: number }>(`/api/knowledge/list?space=${sp}`);
    return (data.items || []).map(toKnowledgeItem);
  } catch {
    // fallback
    const { knowledgeItems } = await import('./data');
    if (!space || space === 'all') return knowledgeItems;
    return knowledgeItems.filter((item) => item.visibility === space);
  }
}

export async function getKnowledgeDetail(id: string): Promise<KnowledgeItem | null> {
  try {
    const data = await apiGet<BackendKnowledge>(`/api/knowledge/${id}`);
    return toKnowledgeItem(data);
  } catch {
    const { knowledgeItems } = await import('./data');
    return knowledgeItems.find((item) => item.id === id) || null;
  }
}

export async function searchKnowledge(query: string): Promise<KnowledgeItem[]> {
  try {
    const data = await apiGet<{ items: BackendKnowledge[]; total: number }>(`/api/knowledge/list?search=${encodeURIComponent(query)}`);
    return (data.items || []).map(toKnowledgeItem);
  } catch {
    const { knowledgeItems } = await import('./data');
    const q = query.toLowerCase();
    return knowledgeItems.filter((item) =>
      item.title.toLowerCase().includes(q) ||
      item.tags.some((t) => t.toLowerCase().includes(q)),
    );
  }
}

// --- AI 助手 ---
export async function getChatSessions(): Promise<ChatSession[]> {
  // 聊天会话由前端管理，不需要后端持久化
  try {
    const { chatSessions } = await import('./data');
    return chatSessions;
  } catch {
    return [];
  }
}

export async function sendMessage(sessionId: string, content: string): Promise<ChatSession> {
  try {
    const data = await apiPost<{
      answer_framework: string;
      script_reference: string;
      differentiation_points: string[];
      references: Array<{ title: string; page?: string; docId?: string }>;
    }>('/api/ai/ask', { question: content, user_id: 1 });

    const { chatSessions } = await import('./data');
    let session = chatSessions.find((s) => s.id === sessionId);
    if (!session) {
      session = { id: sessionId, title: content.slice(0, 20), createdAt: new Date().toISOString(), messages: [] };
      chatSessions.push(session);
    }

    const userMsg: ChatMessage = {
      id: `m${Date.now()}`, role: 'user', content, timestamp: new Date().toISOString(),
    };
    session.messages.push(userMsg);

    const refs = (data.references || []).map((r, i) => ({
      title: r.title,
      page: r.page,
      docId: r.docId || `ref${i}`,
    }));

    const aiReply: ChatMessage = {
      id: `m${Date.now() + 1}`,
      role: 'assistant',
      content: `**回答框架：**\n${data.answer_framework}\n\n**参考话术：**\n${data.script_reference}\n\n**差异化要点：**\n${data.differentiation_points.map((p: string) => `- ${p}`).join('\n')}`,
      timestamp: new Date().toISOString(),
      references: refs,
    };
    session.messages.push(aiReply);
    return session;
  } catch {
    // fallback to mock
    const { chatSessions } = await import('./data');
    const session = chatSessions.find((s) => s.id === sessionId);
    if (!session) throw new Error('Session not found');
    const newMsg: ChatMessage = { id: `m${Date.now()}`, role: 'user', content, timestamp: new Date().toISOString() };
    session.messages.push(newMsg);
    const aiReply: ChatMessage = {
      id: `m${Date.now() + 1}`, role: 'assistant',
      content: `好的，关于"${content.slice(0, 20)}..."的问题，根据知识库中相关信息：\n\n**核心要点：**\n• 从知识库中找到了3条相关文档\n• 建议参考金牌销售的处理方式\n• 结合客户实际情况灵活应对`,
      timestamp: new Date().toISOString(),
      references: [{ title: '知识库匹配文档', docId: 'k1' }],
    };
    session.messages.push(aiReply);
    return session;
  }
}

// --- 语音分析 ---
export async function getCallRecords(): Promise<CallRecord[]> {
  try {
    const data = await apiGet<BackendRecording[]>('/api/voice/recordings');
    return (data || []).map(toCallRecord);
  } catch {
    const { callRecords } = await import('./data');
    return callRecords;
  }
}

// --- 能力雷达 ---
export async function getAbilityRadar(): Promise<{ personal: AbilityRadar; teamAvg: AbilityRadar }> {
  try {
    const data = await apiGet<{
      radar_scores: Record<string, number>;
      team_avg_scores: Record<string, number>;
    }>('/api/voice/dashboard?user_id=1');

    const rs = data.radar_scores || {};
    const tas = data.team_avg_scores || {};

    const personal: AbilityRadar = {
      demandMining: rs['需求挖掘'] || 0,
      sopCompletion: rs['SOP完成度'] || 0,
      objectionHandling: rs['异议处理'] || 0,
      closing: rs['促成'] || 0,
      comprehensive: Math.round((Object.values(rs).reduce((a, b) => a + b, 0)) / 5) || 0,
    };
    const teamAvg: AbilityRadar = {
      demandMining: tas['需求挖掘'] || 0,
      sopCompletion: tas['SOP完成度'] || 0,
      objectionHandling: tas['异议处理'] || 0,
      closing: tas['促成'] || 0,
      comprehensive: Math.round((Object.values(tas).reduce((a, b) => a + b, 0)) / 5) || 0,
    };
    return { personal, teamAvg };
  } catch {
    const { abilityRadar: personal, teamAvgRadar } = await import('./data');
    return { personal, teamAvg: teamAvgRadar };
  }
}

// --- 能力趋势 ---
export async function getAbilityTrends(): Promise<AbilityTrend[]> {
  try {
    const data = await apiGet<{ trend_data: AbilityTrend[] }>('/api/voice/dashboard?user_id=1');
    return (data.trend_data || []).map((t: AbilityTrend) => ({ date: t.date, rate: t.rate }));
  } catch {
    const { abilityTrends } = await import('./data');
    return abilityTrends;
  }
}

// --- 销售排名 ---
export async function getSalesRankings(): Promise<SalesRanking[]> {
  try {
    const data = await apiGet<{ rankings: BackendRanking[] }>('/api/manager/dashboard');
    return (data.rankings || []).map(toSalesRanking);
  } catch {
    const { salesRankings } = await import('./data');
    return salesRankings;
  }
}

// --- 团队指标 ---
export async function getTeamMetrics(): Promise<TeamMetrics> {
  try {
    const data = await apiGet<{
      today_uploads: number; analyzed_count: number;
      avg_deal_rate: number; deal_rate_change: number;
      best_sales: string; best_rate: number;
      top_improver: string; top_improve_pct: number;
    }>('/api/manager/dashboard');

    return {
      todayUploads: data.today_uploads,
      analyzedCount: data.analyzed_count,
      avgCompletionRate: data.avg_deal_rate,
      rateChange: data.deal_rate_change,
      bestSales: data.best_sales,
      bestRate: data.best_rate,
      mostImproved: data.top_improver,
      mostImprovedChange: data.top_improve_pct,
    };
  } catch {
    const { teamMetrics } = await import('./data');
    return teamMetrics;
  }
}

// --- 高转化特征 ---
export async function getConversionFeatures(): Promise<ConversionFeature[]> {
  try {
    const data = await apiGet<{ high_conversion_features: BackendFeature[] }>('/api/manager/dashboard');
    return (data.high_conversion_features || []).map(toConversionFeature);
  } catch {
    const { conversionFeatures } = await import('./data');
    return conversionFeatures;
  }
}

// --- 待关注销售 ---
export async function getAtRiskSales(): Promise<AtRiskSales[]> {
  try {
    const data = await apiGet<{ at_risk_sales: BackendAtRisk[] }>('/api/manager/dashboard');
    return (data.at_risk_sales || []).map(toAtRiskSales);
  } catch {
    const { atRiskSales } = await import('./data');
    return atRiskSales;
  }
}

// --- SOP 配置 ---
export async function getSOPGoal(): Promise<SOPGoal> {
  try {
    const goals = await apiGet<BackendGoal[]>('/api/manager/goals');
    if (goals && goals.length > 0) return toSOPGoal(goals[0]);
    throw new Error('No goals');
  } catch {
    const { sopGoal } = await import('./data');
    return sopGoal;
  }
}

export async function getSOPGoalTemplates(): Promise<string[]> {
  // 后端无模板 API，使用本地 mock
  const { sopGoalTemplates } = await import('./data');
  return sopGoalTemplates;
}

export async function getSOPSteps(): Promise<SOPStep[]> {
  try {
    const templates = await apiGet<BackendSopTemplate[]>('/api/manager/sop');
    if (templates && templates.length > 0) {
      const tpl = templates.find((t) => t.is_active) || templates[0];
      return (tpl.steps || []).map(toSOPStep);
    }
    throw new Error('No SOP templates');
  } catch {
    const { sopSteps } = await import('./data');
    return sopSteps;
  }
}

// --- 案例库 ---
export async function getCaseItems(): Promise<CaseItem[]> {
  try {
    const data = await apiGet<BackendCase[]>('/api/manager/cases');
    return (data || []).map(toCaseItem);
  } catch {
    const { caseItems } = await import('./data');
    return caseItems;
  }
}

export async function getHotCases(): Promise<{ title: string; learnCount: number }[]> {
  try {
    const data = await apiGet<BackendCase[]>('/api/manager/cases/top?limit=5');
    return (data || []).map((c) => ({ title: c.title, learnCount: c.learning_count }));
  } catch {
    const { hotCases } = await import('./data');
    return hotCases;
  }
}
