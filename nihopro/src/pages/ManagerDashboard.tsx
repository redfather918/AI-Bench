import { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Typography, Tag, Button, Progress, Table, Space, Empty } from 'antd';
import { TrophyOutlined, RiseOutlined, FallOutlined, ArrowUpOutlined, ArrowDownOutlined, MinusOutlined, WarningOutlined, ExportOutlined } from '@ant-design/icons';
import { getTeamMetrics, getSalesRankings, getConversionFeatures, getAtRiskSales } from '../mock/api';
import type { TeamMetrics, SalesRanking, ConversionFeature, AtRiskSales } from '../types';

const { Text, Title } = Typography;

export default function ManagerDashboard() {
  const [metrics, setMetrics] = useState<TeamMetrics | null>(null);
  const [rankings, setRankings] = useState<SalesRanking[]>([]);
  const [features, setFeatures] = useState<ConversionFeature[]>([]);
  const [atRisk, setAtRisk] = useState<AtRiskSales[]>([]);

  useEffect(() => {
    getTeamMetrics().then(setMetrics);
    getSalesRankings().then(setRankings);
    getConversionFeatures().then(setFeatures);
    getAtRiskSales().then(setAtRisk);
  }, []);

  const rankIcons: Record<string, string> = {
    '1': '🥇', '2': '🥈', '3': '🥉',
  };

  return (
    <div>
      {/* 日期筛选 */}
      <Card size="small" style={{ marginBottom: 16 }}>
        <Space size={16}>
          <Text strong>📅 数据日期：昨日（2025-12-16）</Text>
          <Button size="small">周报</Button>
          <Button size="small">月报</Button>
          <Button size="small" icon={<ExportOutlined />} type="primary">导出报表</Button>
        </Space>
      </Card>

      {/* 团队核心指标 + 排名 */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={12}>
          <Card title="📊 团队核心指标" size="small">
            <Row gutter={[12, 12]}>
              <Col span={12}>
                <Statistic title="今日上传录音" value={metrics?.todayUploads || 0} suffix="个" />
              </Col>
              <Col span={12}>
                <Statistic title="分析完成" value={metrics?.analyzedCount || 0} suffix="个" />
              </Col>
              <Col span={12}>
                <Statistic
                  title="团队平均达成率"
                  value={metrics?.avgCompletionRate || 0}
                  suffix="%"
                  prefix={metrics && metrics.rateChange > 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
                  valueStyle={{ color: metrics && metrics.rateChange > 0 ? '#52c41a' : '#ff4d4f' }}
                />
                {metrics && (
                  <Text type={metrics.rateChange > 0 ? 'success' : 'danger'} style={{ fontSize: 12 }}>
                    {metrics.rateChange > 0 ? `↑${metrics.rateChange}%` : `↓${Math.abs(metrics.rateChange)}%`}
                  </Text>
                )}
              </Col>
              <Col span={12}>
                <Statistic
                  title="最佳销售"
                  value={metrics?.bestSales || '-'}
                  suffix={<Tag color="gold">{metrics?.bestRate}%</Tag>}
                  valueStyle={{ fontSize: 18 }}
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title="进步最快"
                  value={metrics?.mostImproved || '-'}
                  suffix={<Tag color="green">+{metrics?.mostImprovedChange}%</Tag>}
                  valueStyle={{ fontSize: 18 }}
                />
              </Col>
            </Row>
          </Card>
        </Col>

        <Col span={12}>
          <Card
            title={<><TrophyOutlined /> 销售能力排名</>}
            extra={<Button size="small" type="link">查看完整排名</Button>}
            size="small"
          >
            {rankings.slice(0, 5).map((r) => (
              <div key={r.rank} style={{ marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 24, textAlign: 'center', fontSize: 16 }}>
                  {rankIcons[String(r.rank)] || `${r.rank}.`}
                </span>
                <span style={{ width: 40, fontWeight: 500 }}>{r.name}</span>
                <Progress
                  percent={r.rate}
                  showInfo={false}
                  style={{ flex: 1 }}
                  strokeColor={r.rank <= 3 ? '#e94560' : '#1890ff'}
                  trailColor="#f0f0f0"
                  size="small"
                />
                <Tag color={r.change > 0 ? 'green' : r.change < 0 ? 'red' : 'default'} style={{ width: 40, textAlign: 'center' }}>
                  {r.change > 0 ? <><RiseOutlined />{r.change}</> : r.change < 0 ? <><FallOutlined />{Math.abs(r.change)}</> : <MinusOutlined />}
                </Tag>
                <span style={{ width: 36, textAlign: 'right', fontWeight: 600 }}>{r.rate}%</span>
              </div>
            ))}
          </Card>
        </Col>
      </Row>

      {/* 高转化特征挖掘 */}
      <Card
        title={<><TrophyOutlined style={{ color: '#e94560' }} /> 高转化特征挖掘</>}
        extra={<Button size="small">配置目标</Button>}
        style={{ marginBottom: 16 }}
      >
        <Text type="secondary" style={{ display: 'block', marginBottom: 12 }}>
          当前成功目标：通话后7天内客户完成首单支付
        </Text>

        <Text strong style={{ fontSize: 13 }}>✨ 高转化通话特征（达成组 vs 未达成组）</Text>

        {features.map(f => (
          <Card
            key={f.id}
            size="small"
            style={{ marginTop: 12, borderLeft: f.isGold ? '3px solid #faad14' : undefined }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 20 }}>{['🥇', '🥈', '🥉'][f.rank - 1]}</span>
              <div style={{ flex: 1 }}>
                <Text strong style={{ fontSize: 13 }}>金牌特征{f.rank}：{f.description}</Text>
                <div style={{ marginTop: 6, display: 'flex', gap: 24 }}>
                  <Text style={{ fontSize: 12 }}>
                    达成组使用率：<Text strong style={{ color: '#52c41a' }}>{f.successGroupRate}%</Text>
                  </Text>
                  <Text style={{ fontSize: 12 }}>
                    未达成组使用率：<Text strong style={{ color: '#ff4d4f' }}>{f.failGroupRate}%</Text>
                  </Text>
                  <Text style={{ fontSize: 12 }}>
                    <Tag color="red">↑ 差异 +{f.difference}%</Tag>
                  </Text>
                </div>
              </div>
            </div>
          </Card>
        ))}

        <div style={{ marginTop: 16, padding: '12px 16px', background: '#fff7e6', borderRadius: 6 }}>
          <Text>📝 基于以上特征，AI生成建议SOP话术：</Text>
          <Button type="link" size="small">《针对价格敏感型客户的标准沟通流程V2》</Button>
        </div>
      </Card>

      {/* 待关注销售 */}
      <Card
        title={<><WarningOutlined style={{ color: '#ff4d4f' }} /> 待关注销售（达成率低于30%）</>}
        extra={<Button size="small" type="primary" danger>一键关怀</Button>}
      >
        {atRisk.length === 0 ? (
          <Empty description="暂无需要关注的销售" />
        ) : (
          atRisk.map(s => (
            <div key={s.name} style={{
              display: 'flex', alignItems: 'center', gap: 16,
              padding: '10px 0', borderBottom: '1px solid #f0f0f0',
            }}>
              <Text strong>{s.name}</Text>
              <Tag color="red">达成率 {s.rate}%</Tag>
              <Text type="secondary">主要短板：{s.weakness}</Text>
              <Text type="secondary">推荐学习：</Text>
              <Tag color="blue" style={{ cursor: 'pointer' }}>{s.recommendation}</Tag>
            </div>
          ))
        )}
      </Card>
    </div>
  );
}
