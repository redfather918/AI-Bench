import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Input, List, Tag, Tabs, Typography, Space, Badge } from 'antd';
import { SearchOutlined, FilePdfOutlined, FileWordOutlined, FilePptOutlined, AudioOutlined, FileOutlined, FireOutlined, ClockCircleOutlined, TagOutlined } from '@ant-design/icons';
import { getKnowledgeList } from '../mock/api';
import type { KnowledgeItem } from '../types';

const { Text, Title } = Typography;

const fileIconMap: Record<string, React.ReactNode> = {
  pdf: <FilePdfOutlined style={{ color: '#e94560' }} />,
  docx: <FileWordOutlined style={{ color: '#2b5797' }} />,
  pptx: <FilePptOutlined style={{ color: '#d24726' }} />,
  mp3: <AudioOutlined style={{ color: '#1db954' }} />,
  mp4: <AudioOutlined style={{ color: '#1db954' }} />,
};

const visibilityColor: Record<string, string> = {
  private: '#999',
  department: '#1890ff',
  company: '#52c41a',
};

const visibilityLabel: Record<string, string> = {
  private: '个人',
  department: '部门',
  company: '全员',
};

function timeAgo(dateStr: string): string {
  const now = new Date();
  const d = new Date(dateStr);
  const hours = Math.floor((now.getTime() - d.getTime()) / 3600000);
  if (hours < 1) return '刚刚';
  if (hours < 24) return `${hours}小时前`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}天前`;
  return d.toLocaleDateString('zh-CN');
}

const commonTags = ['产品参数', '销售话术', '竞品对比', '会议纪要', 'SOP', '活动政策', '新人培训'];

export default function KnowledgeHome() {
  const [items, setItems] = useState<KnowledgeItem[]>([]);
  const [space, setSpace] = useState('department');
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    getKnowledgeList(space).then(data => {
      setItems(data);
      setLoading(false);
    });
  }, [space]);

  const filtered = items.filter(item =>
    !searchText || item.title.includes(searchText) || item.tags.some(t => t.includes(searchText))
  );

  const recent = [...filtered].sort((a, b) => new Date(b.uploadTime).getTime() - new Date(a.uploadTime).getTime());
  const hot = [...filtered].sort((a, b) => b.viewCount - a.viewCount).filter(i => i.viewCount >= 20);

  return (
    <div>
      <Input.Search
        placeholder="搜索知识库...（支持文件名、标签搜索）"
        allowClear
        enterButton={<><SearchOutlined /> 搜索</>}
        size="large"
        style={{ marginBottom: 20 }}
        onSearch={setSearchText}
        onChange={e => { if (!e.target.value) setSearchText(''); }}
      />

      <div style={{ display: 'flex', gap: 20 }}>
        {/* 左侧导航 */}
        <Card size="small" style={{ width: 200, flexShrink: 0 }}>
          <Title level={5} style={{ marginBottom: 12 }}>📚 知识导航</Title>
          <Tabs
            tabPosition="left"
            activeKey={space}
            onChange={setSpace}
            size="small"
            items={[
              { key: 'private', label: <span>我的知识<Badge count={items.filter(i => i.visibility === 'private').length} size="small" style={{ marginLeft: 4, background: '#999' }} /></span> },
              { key: 'department', label: <span>部门知识<Badge count={items.filter(i => i.visibility === 'department').length} size="small" style={{ marginLeft: 4, background: '#1890ff' }} /></span> },
              { key: 'company', label: <span>公司知识<Badge count={items.filter(i => i.visibility === 'company').length} size="small" style={{ marginLeft: 4, background: '#52c41a' }} /></span> },
            ]}
          />

          <div style={{ marginTop: 20 }}>
            <Text type="secondary"><TagOutlined /> 常用标签</Text>
            <div style={{ marginTop: 8 }}>
              {commonTags.map(tag => (
                <Tag
                  key={tag}
                  style={{ marginBottom: 6, cursor: 'pointer' }}
                  onClick={() => setSearchText(tag)}
                >
                  {tag}
                </Tag>
              ))}
            </div>
          </div>
        </Card>

        {/* 右侧主区 */}
        <div style={{ flex: 1 }}>
          {/* 最近更新 */}
          <Card
            title={<><ClockCircleOutlined /> 最近更新</>}
            extra={<a onClick={() => {}}>查看全部</a>}
            loading={loading}
            style={{ marginBottom: 20 }}
          >
            <List
              dataSource={recent.slice(0, 5)}
              renderItem={item => (
                <List.Item
                  style={{ cursor: 'pointer', padding: '10px 0' }}
                  onClick={() => navigate(`/knowledge/${item.id}`)}
                >
                  <List.Item.Meta
                    avatar={fileIconMap[item.fileType] || <FileOutlined />}
                    title={
                      <Space>
                        <Text strong>{item.title}</Text>
                        <Tag color={visibilityColor[item.visibility]} style={{ fontSize: 11 }}>
                          {visibilityLabel[item.visibility]}
                        </Tag>
                      </Space>
                    }
                    description={
                      <Space size={12}>
                        <Text type="secondary" style={{ fontSize: 12 }}>{timeAgo(item.uploadTime)}</Text>
                        <Text type="secondary" style={{ fontSize: 12 }}>{item.uploader}</Text>
                        <Text type="secondary" style={{ fontSize: 12 }}>{item.fileSize}</Text>
                      </Space>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>

          {/* 热门知识 */}
          <Card
            title={<><FireOutlined style={{ color: '#e94560' }} /> 热门知识</>}
            extra={<a onClick={() => {}}>更多</a>}
            loading={loading}
          >
            <List
              dataSource={hot.slice(0, 3)}
              renderItem={item => (
                <List.Item
                  style={{ cursor: 'pointer', padding: '10px 0' }}
                  onClick={() => navigate(`/knowledge/${item.id}`)}
                >
                  <List.Item.Meta
                    avatar={fileIconMap[item.fileType] || <FileOutlined />}
                    title={
                      <Space>
                        <Text strong>{item.title}</Text>
                        <Tag color={visibilityColor[item.visibility]} style={{ fontSize: 11 }}>
                          {visibilityLabel[item.visibility]}
                        </Tag>
                      </Space>
                    }
                    description={
                      <Space>
                        <Text type="secondary" style={{ fontSize: 12 }}>{item.viewCount}人查看</Text>
                      </Space>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </div>
      </div>
    </div>
  );
}
