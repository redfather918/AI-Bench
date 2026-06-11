import { useState, useEffect } from 'react';
import { Card, Row, Col, Button, Upload, Typography, Tag, Collapse, Space, Statistic, Empty } from 'antd';
import { UploadOutlined, InboxOutlined, RadarChartOutlined, LineChartOutlined, TrophyOutlined, DownloadOutlined, CheckCircleOutlined, ExclamationCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { getCallRecords, getAbilityRadar, getAbilityTrends, getSalesRankings } from '../mock/api';
import type { CallRecord, AbilityRadar, AbilityTrend } from '../types';

const { Text } = Typography;
const { Dragger } = Upload;

export default function SalesWorkbench() {
  const [records, setRecords] = useState<CallRecord[]>([]);
  const [radar, setRadar] = useState<{ personal: AbilityRadar; teamAvg: AbilityRadar } | null>(null);
  const [trends, setTrends] = useState<AbilityTrend[]>([]);
  const [currentRank, setCurrentRank] = useState(8);

  useEffect(() => {
    getCallRecords().then(setRecords);
    getAbilityRadar().then(setRadar);
    getAbilityTrends().then(setTrends);
    getSalesRankings().then(rankings => {
      const me = rankings.find(r => r.name === '李明');
      if (me) setCurrentRank(me.rank);
    });
  }, []);

  const radarData = radar ? [
    { subject: '需求挖掘', personal: radar.personal.demandMining, team: radar.teamAvg.demandMining, full: 100 },
    { subject: 'SOP完成度', personal: radar.personal.sopCompletion, team: radar.teamAvg.sopCompletion, full: 100 },
    { subject: '异议处理', personal: radar.personal.objectionHandling, team: radar.teamAvg.objectionHandling, full: 100 },
    { subject: '促成', personal: radar.personal.closing, team: radar.teamAvg.closing, full: 100 },
    { subject: '综合能力', personal: radar.personal.comprehensive, team: radar.teamAvg.comprehensive, full: 100 },
  ] : [];

  return (
    <div>
      <Row gutter={16} style={{ marginBottom: 16 }}>
        {/* 上传区 */}
        <Col span={8}>
          <Card title="📤 上传今日录音" size="small">
            <Dragger
              name="audio"
              multiple
              accept=".mp3,.wav,.m4a,.aac"
              style={{ marginBottom: 12 }}
            >
              <p className="ant-upload-drag-icon"><InboxOutlined style={{ fontSize: 36, color: '#1890ff' }} /></p>
              <p style={{ fontSize: 13 }}>点击或拖拽音频文件至此上传</p>
              <p style={{ fontSize: 11, color: '#999' }}>支持 MP3 / WAV / M4A / AAC</p>
            </Dragger>
            <div style={{ textAlign: 'center', marginTop: 8 }}>
              <Space direction="vertical" size={4}>
                <Text strong>已上传今日：{records.length}个录音</Text>
                <Text type="secondary">待分析：{records.filter(r => r.status === 'analyzing').length}个</Text>
              </Space>
            </div>
            <div style={{ marginTop: 12, textAlign: 'center' }}>
              <Space>
                <Button icon={<UploadOutlined />}>批量上传</Button>
                <Button>查看历史</Button>
              </Space>
            </div>
          </Card>
        </Col>

        {/* 雷达图 */}
        <Col span={8}>
          <Card
            title={<><RadarChartOutlined /> 我的能力雷达图</>}
            extra={<Tag color="blue">昨日</Tag>}
            size="small"
          >
            <ResponsiveContainer width="100%" height={220}>
              <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="70%">
                <PolarGrid stroke="#e9e9e9" />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: '#666' }} />
                <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} axisLine={false} />
                <Radar name="我的能力" dataKey="personal" stroke="#e94560" fill="#e94560" fillOpacity={0.2} />
                <Radar name="团队平均" dataKey="team" stroke="#1890ff" fill="#1890ff" fillOpacity={0.1} strokeDasharray="4 4" />
              </RadarChart>
            </ResponsiveContainer>
            <div style={{ textAlign: 'center', marginTop: 4 }}>
              <Space>
                <Tag color="#e94560">我的能力</Tag>
                <Tag color="#1890ff">团队平均</Tag>
                <Button size="small" type="link">查看详情</Button>
              </Space>
            </div>
          </Card>
        </Col>

        {/* 排名信息 */}
        <Col span={8}>
          <Card size="small" style={{ height: '100%' }}>
            <Statistic
              title={<><TrophyOutlined /> 今日排名</>}
              value={`第${currentRank}名`}
              suffix={<Tag color="green">↑ 较昨日上升2名</Tag>}
              valueStyle={{ fontSize: 28, color: '#e94560' }}
            />
            <div style={{ marginTop: 16 }}>
              <Button type="link" block>查看完整排名</Button>
            </div>
          </Card>
        </Col>
      </Row>

      {/* 趋势图 */}
      <Card
        title={<><LineChartOutlined /> 我的能力趋势（近7天）</>}
        extra={<Button size="small">周榜</Button>}
        style={{ marginBottom: 16 }}
      >
        <Text type="secondary" style={{ marginBottom: 8, display: 'block' }}>
          成功目标达成率（目标：通话后7天内签单）
        </Text>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={trends}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="date" tick={{ fontSize: 12 }} />
            <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} unit="%" />
            <Tooltip formatter={(v: number) => [`${v}%`, '达成率']} />
            <Line
              type="monotone"
              dataKey="rate"
              stroke="#e94560"
              strokeWidth={2}
              dot={{ r: 4, fill: '#e94560' }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {/* 通话分析报告 */}
      <Card
        title={<><DownloadOutlined /> 昨日通话分析报告（2025-12-16）</>}
        extra={<Button size="small" icon={<DownloadOutlined />}>下载报告</Button>}
      >
        {records.filter(r => r.status === 'completed').length === 0 ? (
          <Empty description="暂无分析完成的通话记录" />
        ) : (
          <Collapse
            defaultActiveKey={['cr1']}
            items={records.filter(r => r.status === 'completed').map(record => ({
              key: record.id,
              label: (
                <Space>
                  <Text strong>🎙️ 通话 | 客户：{record.customerName}</Text>
                  <Text type="secondary">| 时长：{record.duration}</Text>
                  <Tag color="blue">{record.completionRate}%</Tag>
                </Space>
              ),
              children: (
                <div>
                  {record.sentiment && (
                    <div style={{ marginBottom: 16 }}>
                      <Text type="secondary">客户情绪：</Text>
                      <div style={{
                        display: 'flex', height: 20, borderRadius: 10, overflow: 'hidden',
                        marginTop: 4, marginBottom: 4,
                      }}>
                        <div style={{ width: `${record.sentiment.positive}%`, background: '#52c41a' }} />
                        <div style={{ width: `${record.sentiment.neutral}%`, background: '#d9d9d9' }} />
                        <div style={{ width: `${record.sentiment.negative}%`, background: '#ff4d4f' }} />
                      </div>
                      <Space size={16}>
                        <Text style={{ fontSize: 12 }}>😊 正面 {record.sentiment.positive}%</Text>
                        <Text style={{ fontSize: 12 }}>😐 中性 {record.sentiment.neutral}%</Text>
                        <Text style={{ fontSize: 12 }}>😟 负面 {record.sentiment.negative}%</Text>
                      </Space>
                    </div>
                  )}

                  {record.sopCompletion && (
                    <div style={{ marginBottom: 16 }}>
                      <Text type="secondary">SOP完成度：</Text>
                      <Space style={{ marginTop: 4 }} wrap>
                        {record.sopCompletion.map((sop, idx) => (
                          <Tag
                            key={idx}
                            color={sop.completed ? 'success' : sop.partial ? 'warning' : 'error'}
                            icon={sop.completed ? <CheckCircleOutlined /> : sop.partial ? <ExclamationCircleOutlined /> : <CloseCircleOutlined />}
                          >
                            {sop.step}
                          </Tag>
                        ))}
                      </Space>
                    </div>
                  )}

                  {record.improvements && record.improvements.length > 0 && (
                    <div style={{ marginBottom: 16 }}>
                      <Text type="secondary">待改进：</Text>
                      <Text style={{ color: '#ff4d4f' }}>{record.improvements[0]}</Text>
                    </div>
                  )}

                  {record.suggestions && record.suggestions.length > 0 && (
                    <div>
                      <Text type="secondary">💡 建议学习：</Text>
                      <Space>
                        {record.suggestions.map((s, i) => (
                          <Tag key={i} color="blue" style={{ cursor: 'pointer' }}>{s}</Tag>
                        ))}
                      </Space>
                    </div>
                  )}
                </div>
              ),
            }))}
          />
        )}
      </Card>
    </div>
  );
}
