import type {
  User, KnowledgeItem, ChatSession, CallRecord, AbilityRadar,
  AbilityTrend, SalesRanking, TeamMetrics, ConversionFeature,
  AtRiskSales, SOPGoal, SOPStep, CaseItem, NavItem
} from '../types';

// ===== 当前用户 =====
export const currentUser: User = {
  id: 'u1',
  name: '李明',
  department: '销售部',
  role: 'sales',
};

export const managerUser: User = {
  id: 'u2',
  name: '王经理',
  department: '销售部',
  role: 'manager',
};

// ===== 导航配置 =====
export const navItems: NavItem[] = [
  { key: 'knowledge', label: '知识库', icon: 'book', path: '/knowledge', roles: ['sales', 'manager'] },
  { key: 'assistant', label: 'AI助手', icon: 'robot', path: '/assistant', roles: ['sales', 'manager'] },
  { key: 'workbench', label: '销售工作台', icon: 'dashboard', path: '/workbench', roles: ['sales'] },
  { key: 'manager', label: '管理看板', icon: 'team', path: '/manager', roles: ['manager'] },
  { key: 'cases', label: '案例库', icon: 'star', path: '/cases', roles: ['sales', 'manager'] },
  { key: 'settings', label: '系统设置', icon: 'setting', path: '/settings', roles: ['manager'] },
];

// ===== 知识库数据 =====
export const knowledgeItems: KnowledgeItem[] = [
  {
    id: 'k1',
    title: '2025-Q4产品发布会纪要',
    fileName: '2025-Q4产品发布会纪要.pdf',
    fileType: 'pdf',
    fileSize: '3.2 MB',
    uploader: '张三',
    uploaderDept: '销售部',
    uploadTime: '2025-12-17T10:00:00',
    visibility: 'department',
    tags: ['产品参数', '会议纪要'],
    viewCount: 23,
  },
  {
    id: 'k2',
    title: '客户投诉处理SOP V3',
    fileName: '客户投诉处理SOP V3.docx',
    fileType: 'docx',
    fileSize: '1.8 MB',
    uploader: '运营部-李四',
    uploaderDept: '运营部',
    uploadTime: '2025-12-16T15:30:00',
    visibility: 'company',
    tags: ['SOP', '客户服务'],
    viewCount: 89,
  },
  {
    id: 'k3',
    title: '竞品分析报告-华为vs苹果',
    fileName: '竞品分析报告-华为vs苹果.pptx',
    fileType: 'pptx',
    fileSize: '5.6 MB',
    uploader: '市场部-王五',
    uploaderDept: '市场部',
    uploadTime: '2025-12-16T09:00:00',
    visibility: 'department',
    tags: ['竞品对比'],
    viewCount: 67,
  },
  {
    id: 'k4',
    title: '销售培训录音_20251215',
    fileName: '销售培训录音_20251215.mp3',
    fileType: 'mp3',
    fileSize: '15.2 MB',
    duration: '00:32:15',
    uploader: '张三',
    uploaderDept: '销售部',
    uploadTime: '2025-12-15T14:00:00',
    visibility: 'department',
    tags: ['销售话术', '客户异议处理', '新人培训'],
    viewCount: 45,
    transcript: [
      { timestamp: '00:00', speaker: '销售', text: '王总您好，我是NIHO公司的李明，感谢您抽出时间接听电话。' },
      { timestamp: '00:15', speaker: '客户', text: '嗯，你们这个产品价格有点高啊，比竞品A贵了不少。' },
      { timestamp: '00:22', speaker: '销售', text: '我理解您的顾虑，其实从长期来看，我们的总拥有成本更低的...' },
      { timestamp: '01:05', speaker: '客户', text: '那售后服务怎么样？我们之前用的那家响应太慢了。' },
      { timestamp: '01:15', speaker: '销售', text: '售后服务是我们最大的优势之一，我们承诺2小时响应...' },
      { timestamp: '02:30', speaker: '客户', text: '这个不错，那你们有没有实际的案例可以看看？' },
      { timestamp: '02:45', speaker: '销售', text: '当然，我稍后发给您一份我们服务过的同行业客户案例...' },
    ],
  },
  {
    id: 'k5',
    title: '报价审批流程',
    fileName: '报价审批流程.pdf',
    fileType: 'pdf',
    fileSize: '1.1 MB',
    uploader: '财务部',
    uploaderDept: '财务部',
    uploadTime: '2025-12-14T11:00:00',
    visibility: 'company',
    tags: ['流程规范'],
    viewCount: 134,
  },
  {
    id: 'k6',
    title: '金牌销售异议处理话术合集',
    fileName: '金牌销售异议处理话术合集.docx',
    fileType: 'docx',
    fileSize: '2.4 MB',
    uploader: '销售部-赵敏',
    uploaderDept: '销售部',
    uploadTime: '2025-12-13T08:00:00',
    visibility: 'department',
    tags: ['销售话术', '客户异议处理'],
    viewCount: 89,
  },
  {
    id: 'k7',
    title: '2026春节活动政策',
    fileName: '2026春节活动政策.pdf',
    fileType: 'pdf',
    fileSize: '4.2 MB',
    uploader: '市场部',
    uploaderDept: '市场部',
    uploadTime: '2025-12-12T16:00:00',
    visibility: 'company',
    tags: ['活动政策'],
    viewCount: 67,
  },
  {
    id: 'k8',
    title: '新员工入职培训手册',
    fileName: '新员工入职培训手册.pdf',
    fileType: 'pdf',
    fileSize: '8.5 MB',
    uploader: 'HR部门',
    uploaderDept: 'HR',
    uploadTime: '2025-12-10T10:00:00',
    visibility: 'company',
    tags: ['新人培训'],
    viewCount: 45,
  },
];

// ===== AI 助手数据 =====
export const chatSessions: ChatSession[] = [
  {
    id: 'c1',
    title: '竞品A对比问题',
    createdAt: '2025-12-17T10:30:00',
    messages: [
      {
        id: 'm1',
        role: 'user',
        content: '客户问我们产品和竞品A的主要区别，我应该怎么回答？',
        timestamp: '2025-12-17T10:30:00',
      },
      {
        id: 'm2',
        role: 'assistant',
        content: `根据您有权限访问的知识库，我为您整理了以下回答要点：

**建议回答框架：**
1. 先认同客户的比较行为（体现专业和自信）
2. 从三个核心维度对比：功能、性价比、售后服务

**具体话术参考：**
"王总，您提到竞品A我很了解。我们最大的区别在于产品理念——我们注重的是为企业提供长期增长引擎，而不是简单的一个工具。"

**差异化优势（来源：竞品分析报告_2025Q4.pdf）：**
• 我们支持实时语音分析，竞品A需要手动上传
• 我们的私有化部署成本比竞品A低约30%
• 售后服务响应时间我们承诺2小时，行业平均是24小时`,
        timestamp: '2025-12-17T10:30:05',
        references: [
          { title: '竞品分析报告-华为vs苹果.pptx', page: '第8页', docId: 'k3' },
          { title: '产品销售FAQ_V2.docx', page: '异议处理章节', docId: 'k2' },
        ],
      },
    ],
  },
];

// ===== 通话记录数据 =====
export const callRecords: CallRecord[] = [
  {
    id: 'cr1',
    salesperson: '李明',
    customerName: '王总',
    customerAge: 30,
    customerCompany: '某科技公司',
    duration: '15:23',
    uploadTime: '2025-12-16T10:00:00',
    status: 'completed',
    sentiment: { positive: 70, neutral: 25, negative: 5 },
    sopCompletion: [
      { step: '需求挖掘', completed: true },
      { step: '价值介绍', completed: true },
      { step: '异议处理', completed: false, partial: true },
      { step: '促成', completed: false },
    ],
    completionRate: 75,
    improvements: ['客户2次询价，未有效处理价格异议'],
    suggestions: ['价格异议处理五步法', '今日学习推荐'],
    highlights: '00:05:23 - 价格异议处理场景',
  },
  {
    id: 'cr2',
    salesperson: '李明',
    customerName: '李经理',
    duration: '22:45',
    uploadTime: '2025-12-16T14:00:00',
    status: 'completed',
    sentiment: { positive: 55, neutral: 30, negative: 15 },
    sopCompletion: [
      { step: '需求挖掘', completed: true },
      { step: '价值介绍', completed: true },
      { step: '异议处理', completed: true },
      { step: '促成', completed: true },
    ],
    completionRate: 90,
    improvements: [],
    suggestions: ['可作为优秀案例参考'],
    highlights: '00:12:45 - 挖掘隐性需求场景',
  },
  {
    id: 'cr3',
    salesperson: '李明',
    customerName: '张总',
    duration: '18:10',
    uploadTime: '2025-12-16T16:30:00',
    status: 'analyzing',
  },
];

// ===== 能力数据 =====
export const abilityRadar: AbilityRadar = {
  demandMining: 85,
  sopCompletion: 70,
  objectionHandling: 80,
  closing: 55,
  comprehensive: 72,
};

export const teamAvgRadar: AbilityRadar = {
  demandMining: 70,
  sopCompletion: 68,
  objectionHandling: 65,
  closing: 60,
  comprehensive: 65,
};

export const abilityTrends: AbilityTrend[] = [
  { date: '12/9', rate: 65 },
  { date: '12/10', rate: 58 },
  { date: '12/11', rate: 72 },
  { date: '12/12', rate: 75 },
  { date: '12/13', rate: 60 },
  { date: '12/14', rate: 70 },
  { date: '12/15', rate: 72 },
];

// ===== 排名数据 =====
export const salesRankings: SalesRanking[] = [
  { rank: 1, name: '赵敏', rate: 85, change: 1 },
  { rank: 2, name: '孙丽', rate: 78, change: 0 },
  { rank: 3, name: '李明', rate: 72, change: 3 },
  { rank: 4, name: '周杰', rate: 65, change: -1 },
  { rank: 5, name: '吴迪', rate: 58, change: 0 },
  { rank: 6, name: '郑爽', rate: 52, change: -2 },
  { rank: 7, name: '王磊', rate: 48, change: 1 },
  { rank: 8, name: '陈七', rate: 25, change: -1 },
  { rank: 9, name: '林八', rate: 18, change: 0 },
];

// ===== 团队指标 =====
export const teamMetrics: TeamMetrics = {
  todayUploads: 45,
  analyzedCount: 42,
  avgCompletionRate: 52,
  rateChange: 5,
  bestSales: '赵敏',
  bestRate: 85,
  mostImproved: '李明',
  mostImprovedChange: 15,
};

// ===== 高转化特征 =====
export const conversionFeatures: ConversionFeature[] = [
  {
    id: 1,
    rank: 1,
    description: '开场30秒内明确客户需求',
    successGroupRate: 78,
    failGroupRate: 23,
    difference: 55,
    isGold: true,
  },
  {
    id: 2,
    rank: 2,
    description: '客户提价后立刻追问使用场景',
    successGroupRate: 65,
    failGroupRate: 18,
    difference: 47,
    isGold: true,
  },
  {
    id: 3,
    rank: 3,
    description: '结束前明确下一步行动（约下次通话/发资料）',
    successGroupRate: 82,
    failGroupRate: 31,
    difference: 51,
    isGold: true,
  },
];

// ===== 待关注销售 =====
export const atRiskSales: AtRiskSales[] = [
  { name: '陈七', rate: 25, weakness: '异议处理', recommendation: '价格异议话术' },
  { name: '林八', rate: 18, weakness: '需求挖掘', recommendation: 'SPIN提问法' },
];

// ===== SOP 配置 =====
export const sopGoal: SOPGoal = {
  id: 'g1',
  name: '通话后7天内客户完成首单支付',
  type: 'business_result',
  rule: '关联CRM中【订单状态】=【已支付】且【支付时间】≤ 通话后7天',
  teams: ['所有销售团队'],
  active: true,
};

export const sopGoalTemplates: string[] = [
  '通话中客户明确表达购买意向（情绪≥80%且出现"定下来""成交"等关键词）',
  '通话结束后客户主动添加销售微信',
  '通话结束后客户索要报价单',
];

export const sopSteps: SOPStep[] = [
  {
    id: 's1', order: 1, name: '开场破冰',
    timeLimit: 30,
    requiredActions: ['自我介绍', '感谢接听', '说明来意'],
    checkpoints: ['AI识别完成开场白'],
    isCritical: false,
  },
  {
    id: 's2', order: 2, name: '需求挖掘',
    requiredActions: ['提出至少2个开放性问题'],
    checkpoints: ['AI判断是否问出客户痛点或使用场景'],
    isCritical: true,
  },
  {
    id: 's3', order: 3, name: '产品价值介绍',
    requiredActions: ['结合客户需求进行FAB介绍'],
    checkpoints: ['AI识别FAB话术模式'],
    isCritical: false,
  },
  {
    id: 's4', order: 4, name: '异议处理',
    requiredActions: ['当客户提出价格、竞品等问题时，必须有回应'],
    checkpoints: ['AI识别异议并检测是否有有效回应'],
    isCritical: false,
  },
  {
    id: 's5', order: 5, name: '促成与结尾',
    requiredActions: ['明确下一步行动', '约定下次联系时间'],
    checkpoints: ['AI识别是否约定了下一步'],
    isCritical: false,
  },
];

// ===== 案例库数据 =====
export const caseItems: CaseItem[] = [
  {
    id: 'cs1',
    title: '如何优雅处理价格异议',
    scenario: '客户说"太贵了"',
    tags: ['异议处理'],
    salesperson: '赵敏',
    rate: 85,
    result: '7天内签约',
    dialogueSnippet: '"王总，您觉得贵是因为... 我们来看一下长期成本...',
    timestamp: '00:05:23',
    tips: ['先共情，不直接反驳', '将价格拆解到每天成本', '提供对比数据'],
    learnCount: 234,
    collected: false,
  },
  {
    id: 'cs2',
    title: '挖掘客户的隐性需求',
    scenario: '客户说"我再看看"',
    tags: ['需求挖掘'],
    salesperson: '孙丽',
    rate: 78,
    result: '签约',
    dialogueSnippet: '"您说再看看，是担心... 其实我注意到您提到..."',
    timestamp: '00:12:45',
    tips: ['追问具体顾虑点', '关联之前客户提到的痛点', '提供针对性解决方案'],
    learnCount: 189,
    collected: true,
  },
  {
    id: 'cs3',
    title: '开场3秒抓住注意力',
    scenario: '客户正忙',
    tags: ['开场破冰'],
    salesperson: '赵敏',
    rate: 85,
    result: '7天内签约',
    dialogueSnippet: '"张总，我知道您很忙，我就说三件事..."',
    timestamp: '00:00:10',
    tips: ['快速表明价值', '设置时间预期', '引发好奇心'],
    learnCount: 156,
    collected: false,
  },
  {
    id: 'cs4',
    title: '竞品对比的完美回答',
    scenario: '客户提到竞品',
    tags: ['竞品对比', '异议处理'],
    salesperson: '周杰',
    rate: 65,
    result: '签约',
    dialogueSnippet: '"您提到XX产品，它有它的优势，不过在售后服务这块..."',
    timestamp: '00:08:30',
    tips: ['不贬低竞品', '客观对比关键指标', '突出自身差异化优势'],
    learnCount: 120,
    collected: false,
  },
];

export const hotCases: { title: string; learnCount: number }[] = [
  { title: '如何应对客户说"再考虑考虑"', learnCount: 234 },
  { title: '产品介绍FAB话术模板', learnCount: 189 },
  { title: '异议处理五步法', learnCount: 156 },
  { title: '促成成交的3个信号', learnCount: 132 },
  { title: '开场白的黄金30秒', learnCount: 98 },
];
