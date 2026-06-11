import { useState, useEffect } from 'react';
import { Card, Input, Row, Col, Tag, Button, Typography, Space, Empty, Dropdown } from 'antd';
import { SearchOutlined, PlayCircleOutlined, StarOutlined, StarFilled, BookOutlined, FireOutlined, FilterOutlined } from '@ant-design/icons';
import { getCaseItems, getHotCases } from '../mock/api';
import type { CaseItem } from '../types';

const { Text, Title, Paragraph } = Typography;

const scenarioTags = ['全部', '异议处理', '需求挖掘', '开场破冰', '竞品对比', '促成'];

export default function CaseLibrary() {
  const [cases, setCases] = useState<CaseItem[]>([]);
  const [hotCases, setHotCases] = useState<{ title: string; learnCount: number }[]>([]);
  const [search, setSearch] = useState('');
  const [activeTag, setActiveTag] = useState('全部');

  useEffect(() => {
    getCaseItems().then(setCases);
    getHotCases().then(setHotCases);
  }, []);

  const filteredCases = cases.filter(c => {
    const matchSearch = !search || c.title.includes(search) || c.scenario.includes(search) || c.dialogueSnippet.includes(search);
    const matchTag = activeTag === '全部' || c.tags.includes(activeTag);
    return matchSearch && matchTag;
  });

  const toggleCollect = (id: string) => {
    setCases(prev => prev.map(c => c.id === id ? { ...c, collected: !c.collected } : c));
  };

  return (
    <div>
      {/* 搜索与筛选 */}
      <Card size="small" style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <Input.Search
            placeholder="搜索案例（标题/场景/对话内容）"
            allowClear
            onSearch={setSearch}
            style={{ width: 320 }}
          />
          <Space size={4}>
            {scenarioTags.map(tag => (
              <Tag
                key={tag}
                color={activeTag === tag ? '#e94560' : 'default'}
                style={{ cursor: 'pointer' }}
                onClick={() => setActiveTag(tag)}
              >
                {tag}
              </Tag>
            ))}
          </Space>
          <Button icon={<FilterOutlined />}>分类筛选</Button>
        </div>
      </Card>

      <Title level={5} style={{ marginBottom: 12 }}>
        ⭐ 金牌案例库 - 来自高转化通话
      </Title>

      {/* 案例卡片网格 */}
      {filteredCases.length === 0 ? (
        <Empty description="暂无匹配的案例" />
      ) : (
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          {filteredCases.map(cs => (
            <Col span={12} key={cs.id}>
              <Card
                size="small"
                title={
                  <Space>
                    <Text strong>📌 {cs.title}</Text>
                  </Space>
                }
                extra={
                  <Button
                    size="small"
                    type="text"
                    icon={cs.collected ? <StarFilled style={{ color: '#faad14' }} /> : <StarOutlined />}
                    onClick={() => toggleCollect(cs.id)}
                  />
                }
              >
                <Space direction="vertical" size={4} style={{ width: '100%' }}>
                  <div>
                    <Text type="secondary">场景：</Text>
                    <Text>{cs.scenario}</Text>
                    <Tag color="blue" style={{ marginLeft: 8 }}>{cs.tags[0]}</Tag>
                  </div>
                  <div>
                    <Text type="secondary">销售：</Text>
                    <Text strong>{cs.salesperson}</Text>
                    <Tag color="gold" style={{ marginLeft: 8 }}>达成率 {cs.rate}%</Tag>
                  </div>
                  <div>
                    <Text type="secondary">客户最终结果：</Text>
                    <Tag color="success">✅ {cs.result}</Tag>
                  </div>
                  <Divider style={{ margin: '8px 0' }} />
                  <div>
                    <Text type="secondary">🎙️ 关键对话片段（{cs.timestamp}）</Text>
                    <Card size="small" style={{ marginTop: 6, background: '#f9f9f9' }}>
                      <Text style={{ fontStyle: 'italic', color: '#555', fontSize: 13 }}>
                        "{cs.dialogueSnippet}"
                      </Text>
                    </Card>
                  </div>
                  <Divider style={{ margin: '8px 0' }} />
                  <div>
                    <Text type="secondary">✨ 成功要点：</Text>
                    <div style={{ marginTop: 4 }}>
                      {cs.tips.map((tip, i) => (
                        <Tag key={i} style={{ marginBottom: 4 }}>{tip}</Tag>
                      ))}
                    </div>
                  </div>
                  <Divider style={{ margin: '8px 0' }} />
                  <Space>
                    <Button size="small" icon={<PlayCircleOutlined />}>播放片段</Button>
                    <Button size="small" type="primary" icon={<BookOutlined />}>学习此SOP</Button>
                    <Button
                      size="small"
                      icon={cs.collected ? <StarFilled style={{ color: '#faad14' }} /> : <StarOutlined />}
                      onClick={() => toggleCollect(cs.id)}
                    >
                      {cs.collected ? '已收藏' : '收藏'}
                    </Button>
                  </Space>
                </Space>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      {/* 热门案例 Top 5 */}
      <Card
        title={<><FireOutlined style={{ color: '#e94560' }} /> 本周热门案例 Top 5</>}
        extra={<Button size="small" type="link">更多</Button>}
      >
        {hotCases.map((hc, idx) => (
          <div key={idx} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '10px 0', borderBottom: idx < hotCases.length - 1 ? '1px solid #f0f0f0' : 'none',
          }}>
            <Space>
              <Tag color={idx === 0 ? 'red' : idx === 1 ? 'orange' : idx === 2 ? 'gold' : 'default'}>
                #{idx + 1}
              </Tag>
              <Text>{hc.title}</Text>
            </Space>
            <Text type="secondary">已学习 {hc.learnCount}次</Text>
          </div>
        ))}
      </Card>
    </div>
  );
}
