import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Descriptions, Radio, Tag, Button, Space, Typography, Input, Divider, message, Popconfirm, Tooltip } from 'antd';
import { ArrowLeftOutlined, EditOutlined, DeleteOutlined, ShareAltOutlined, PlayCircleOutlined, CopyOutlined, PlusOutlined, FilePdfOutlined, FileWordOutlined, FilePptOutlined, AudioOutlined, FileOutlined } from '@ant-design/icons';
import { getKnowledgeDetail } from '../mock/api';
import type { KnowledgeItem, Visibility } from '../types';

const { Title, Text } = Typography;

const fileIconMap: Record<string, React.ReactNode> = {
  pdf: <FilePdfOutlined style={{ color: '#e94560', fontSize: 24 }} />,
  docx: <FileWordOutlined style={{ color: '#2b5797', fontSize: 24 }} />,
  pptx: <FilePptOutlined style={{ color: '#d24726', fontSize: 24 }} />,
  mp3: <AudioOutlined style={{ color: '#1db954', fontSize: 24 }} />,
  mp4: <AudioOutlined style={{ color: '#1db954', fontSize: 24 }} />,
};

const visibilityLabel: Record<string, string> = {
  private: '仅个人可见（我的知识）',
  department: '本部门可见',
  company: '全公司可见（所有人可检索）',
};

export default function KnowledgeDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [item, setItem] = useState<KnowledgeItem | null>(null);
  const [visibility, setVisibility] = useState<Visibility>('department');
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);

  useEffect(() => {
    if (id) {
      getKnowledgeDetail(id).then(data => {
        if (data) {
          setItem(data);
          setVisibility(data.visibility);
          setTags(data.tags);
        }
      });
    }
  }, [id]);

  if (!item) return <Card loading />;

  const deptName = currentUser?.department || '销售部';

  const handleVisibilityChange = (val: Visibility) => {
    setVisibility(val);
    message.success(`权限已更新为：${visibilityLabel[val]}`);
  };

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
      message.success('标签已添加');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag));
  };

  const handleTimestampClick = (ts: string) => {
    const [m, s] = ts.split(':').map(Number);
    setCurrentTime(m * 60 + s);
    message.info(`音频跳转到 ${ts}`);
  };

  return (
    <div style={{ maxWidth: 900 }}>
      {/* 顶部导航 */}
      <div style={{ marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Space>
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/knowledge')}>返回</Button>
          <Title level={4} style={{ margin: 0 }}>
            {fileIconMap[item.fileType] || <FileOutlined />} {item.title}
          </Title>
        </Space>
        <Space>
          <Button icon={<EditOutlined />}>编辑</Button>
          <Popconfirm title="确定删除此知识？" onConfirm={() => message.success('已删除')}>
            <Button danger icon={<DeleteOutlined />}>删除</Button>
          </Popconfirm>
          <Button icon={<ShareAltOutlined />}>分享</Button>
        </Space>
      </div>

      {/* 文件信息卡片 */}
      <Card title="📄 文件信息" style={{ marginBottom: 20 }}>
        <Descriptions column={2} size="small">
          <Descriptions.Item label="上传者">{item.uploader}（{item.uploaderDept}）</Descriptions.Item>
          <Descriptions.Item label="上传时间">{item.uploadTime}</Descriptions.Item>
          <Descriptions.Item label="文件类型">{item.fileType.toUpperCase()}</Descriptions.Item>
          <Descriptions.Item label="文件大小">{item.fileSize}</Descriptions.Item>
          {item.duration && (
            <Descriptions.Item label="时长">{item.duration}</Descriptions.Item>
          )}
        </Descriptions>

        <Divider />

        <div>
          <Text strong>🔐 权限设置：</Text>
          <div style={{ marginTop: 12 }}>
            <Radio.Group value={visibility} onChange={e => handleVisibilityChange(e.target.value)}>
              <Space direction="vertical">
                <Radio value="private">
                  {visibilityLabel.private}
                  {visibility === 'private' && <Tag color="blue" style={{ marginLeft: 8 }}>当前</Tag>}
                </Radio>
                <Radio value="department">
                  {visibilityLabel.department}（{deptName}）
                  {visibility === 'department' && <Tag color="blue" style={{ marginLeft: 8 }}>当前</Tag>}
                </Radio>
                <Radio value="company">
                  {visibilityLabel.company}
                  {visibility === 'company' && <Tag color="blue" style={{ marginLeft: 8 }}>当前</Tag>}
                </Radio>
              </Space>
            </Radio.Group>
          </div>
        </div>

        <Divider />

        <div>
          <Text strong>🏷️ 标签：</Text>
          <div style={{ marginTop: 8 }}>
            {tags.map(tag => (
              <Tag
                key={tag}
                closable
                onClose={() => handleRemoveTag(tag)}
                style={{ marginBottom: 6 }}
              >
                {tag}
              </Tag>
            ))}
            <Space style={{ display: 'inline-flex' }}>
              <Input
                size="small"
                placeholder="+ 添加标签"
                value={newTag}
                onChange={e => setNewTag(e.target.value)}
                onPressEnter={handleAddTag}
                style={{ width: 120 }}
                suffix={<PlusOutlined onClick={handleAddTag} style={{ cursor: 'pointer' }} />}
              />
            </Space>
          </div>
        </div>
      </Card>

      {/* 音频播放与转写 */}
      {item.fileType === 'mp3' && (
        <Card title="🎙️ 音频播放与转写内容" style={{ marginBottom: 20 }}>
          {/* 播放器 */}
          <Card size="small" style={{ marginBottom: 16, background: '#fafafa' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <Button
                type="primary"
                shape="circle"
                size="large"
                icon={playing ? <span>⏸</span> : <PlayCircleOutlined />}
                onClick={() => setPlaying(!playing)}
              />
              <div style={{ flex: 1 }}>
                <div style={{ marginBottom: 4 }}>
                  <Text>{playing ? '00:05:23' : '00:00:00'}</Text>
                  <Text type="secondary" style={{ float: 'right' }}>{item.duration}</Text>
                </div>
                <div style={{
                  height: 6,
                  background: '#e9e9e9',
                  borderRadius: 3,
                  overflow: 'hidden',
                }}>
                  <div style={{
                    height: '100%',
                    width: playing ? '18%' : '0%',
                    background: 'linear-gradient(90deg, #e94560, #0f3460)',
                    borderRadius: 3,
                    transition: 'width 0.3s',
                  }} />
                </div>
              </div>
              <Tooltip title="音量">
                <Button size="small" icon={<span>🔊</span>} />
              </Tooltip>
            </div>
          </Card>

          {/* 转写文本 */}
          <Card
            size="small"
            title="📝 转写文本（自动生成）"
            extra={<Button size="small" icon={<CopyOutlined />}>复制</Button>}
          >
            {item.transcript?.map((entry, idx) => (
              <div key={idx} style={{ marginBottom: 8, padding: '8px 12px', background: idx % 2 === 0 ? '#fafafa' : '#fff', borderRadius: 4 }}>
                <Space>
                  <Tag
                    color="blue"
                    style={{ cursor: 'pointer', fontFamily: 'monospace' }}
                    onClick={() => handleTimestampClick(entry.timestamp)}
                  >
                    [{entry.timestamp}]
                  </Tag>
                  <Text strong style={{ color: entry.speaker === '销售' ? '#0f3460' : '#e94560' }}>
                    {entry.speaker}：
                  </Text>
                  <Text>{entry.text}</Text>
                </Space>
              </div>
            ))}
          </Card>
        </Card>
      )}
    </div>
  );
}

// Helper - 简化访问
const currentUser = { department: '销售部' };
