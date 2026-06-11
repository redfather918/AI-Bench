import { useState, useEffect, useRef } from 'react';
import { Card, Input, Button, Typography, Space, Tag, Segmented, Empty, Spin, List } from 'antd';
import { RobotOutlined, UserOutlined, SendOutlined, ClearOutlined, HistoryOutlined, FileTextOutlined, LikeOutlined, DislikeOutlined } from '@ant-design/icons';
import { getChatSessions, sendMessage } from '../mock/api';
import type { ChatMessage, ChatSession } from '../types';

const { Text, Paragraph } = Typography;

export default function AIAssistant() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSession, setActiveSession] = useState<ChatSession | null>(null);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getChatSessions().then(data => {
      setSessions(data);
      if (data.length > 0) setActiveSession(data[0]);
    });
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeSession?.messages]);

  const handleSend = async () => {
    if (!input.trim() || !activeSession) return;
    setLoading(true);
    const updated = await sendMessage(activeSession.id, input);
    setActiveSession({ ...updated });
    setSessions(prev => prev.map(s => s.id === updated.id ? updated : s));
    setInput('');
    setLoading(false);
  };

  const handleClear = () => {
    if (activeSession) {
      const cleared = { ...activeSession, messages: [] };
      setActiveSession(cleared);
      setSessions(prev => prev.map(s => s.id === cleared.id ? cleared : s));
    }
  };

  const renderMessage = (msg: ChatMessage) => {
    const isUser = msg.role === 'user';
    return (
      <div key={msg.id} style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 12, flexDirection: isUser ? 'row-reverse' : 'row' }}>
          <div style={{
            width: 36, height: 36, borderRadius: '50%',
            background: isUser ? '#1890ff' : '#e94560',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontSize: 16, flexShrink: 0,
          }}>
            {isUser ? <UserOutlined /> : <RobotOutlined />}
          </div>
          <div style={{
            maxWidth: '75%',
            padding: '12px 16px',
            borderRadius: 12,
            background: isUser ? '#1890ff' : '#fff',
            color: isUser ? '#fff' : '#333',
            boxShadow: isUser ? 'none' : '0 1px 3px rgba(0,0,0,0.1)',
          }}>
            {isUser ? (
              <Text style={{ color: '#fff' }}>{msg.content}</Text>
            ) : (
              <div>
                <div style={{ whiteSpace: 'pre-wrap', marginBottom: msg.references ? 12 : 0 }}>
                  <RenderMarkdown text={msg.content} />
                </div>
                {msg.references && msg.references.length > 0 && (
                  <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: 10, marginTop: 8 }}>
                    <Text type="secondary" style={{ fontSize: 12 }}>📎 参考来源：</Text>
                    {msg.references.map((ref, i) => (
                      <Tag key={i} icon={<FileTextOutlined />} color="blue" style={{ marginTop: 4, cursor: 'pointer' }}>
                        {ref.title}{ref.page ? ` [${ref.page}]` : ''}
                      </Tag>
                    ))}
                  </div>
                )}
                <div style={{ marginTop: 8 }}>
                  <Space size={12}>
                    <Button size="small" type="text" icon={<LikeOutlined />} />
                    <Button size="small" type="text" icon={<DislikeOutlined />} />
                    <Text type="secondary" style={{ fontSize: 11 }}>{new Date(msg.timestamp).toLocaleTimeString('zh-CN')}</Text>
                  </Space>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Space>
          <RobotOutlined style={{ fontSize: 24, color: '#e94560' }} />
          <Text strong style={{ fontSize: 18 }}>NIHO 知识助手</Text>
        </Space>
        <Space>
          <Button icon={<HistoryOutlined />} onClick={() => setShowHistory(!showHistory)}>
            {showHistory ? '关闭历史' : '历史记录'}
          </Button>
          <Button icon={<ClearOutlined />} onClick={handleClear} danger>
            清空对话
          </Button>
        </Space>
      </div>

      <div style={{ display: 'flex', gap: 16 }}>
        {/* 对话区 */}
        <div style={{ flex: 1 }}>
          <Card
            style={{ height: 'calc(100vh - 280px)', overflow: 'auto', marginBottom: 16 }}
            bodyStyle={{ padding: 16 }}
          >
            {activeSession && activeSession.messages.length > 0 ? (
              activeSession.messages.map(renderMessage)
            ) : (
              <div style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                justifyContent: 'center', height: '100%', color: '#999',
              }}>
                <RobotOutlined style={{ fontSize: 48, marginBottom: 16, color: '#ddd' }} />
                <Text type="secondary" style={{ fontSize: 15 }}>您好，我是 NIHO 知识助手</Text>
                <Text type="secondary" style={{ fontSize: 13, marginTop: 8 }}>
                  试试问我：客户问我们产品和竞品A的区别，怎么回答？
                </Text>
              </div>
            )}
            {loading && (
              <div style={{ textAlign: 'center', padding: 16 }}>
                <Spin tip="正在为您检索知识库..." />
              </div>
            )}
            <div ref={messagesEndRef} />
          </Card>

          <div style={{ display: 'flex', gap: 8 }}>
            <Input.TextArea
              value={input}
              onChange={e => setInput(e.target.value)}
              onPressEnter={e => {
                if (!e.shiftKey) { e.preventDefault(); handleSend(); }
              }}
              placeholder="输入您的问题，例如'竞品A和我们的产品有什么区别？'（Enter发送，Shift+Enter换行）"
              autoSize={{ minRows: 2, maxRows: 4 }}
              disabled={loading}
            />
            <Button
              type="primary"
              icon={<SendOutlined />}
              onClick={handleSend}
              loading={loading}
              style={{ height: 'auto' }}
            >
              发送
            </Button>
          </div>
        </div>

        {/* 历史对话侧栏 */}
        {showHistory && (
          <Card
            title="历史对话"
            size="small"
            style={{ width: 220, flexShrink: 0 }}
            bodyStyle={{ padding: 0 }}
          >
            <List
              dataSource={sessions}
              renderItem={s => (
                <List.Item
                  style={{
                    padding: '10px 16px',
                    cursor: 'pointer',
                    background: activeSession?.id === s.id ? '#e6f7ff' : '#fff',
                  }}
                  onClick={() => setActiveSession(s)}
                >
                  <List.Item.Meta
                    title={<Text style={{ fontSize: 13 }} ellipsis>{s.title}</Text>}
                    description={
                      <Text type="secondary" style={{ fontSize: 11 }}>
                        {s.messages.length}条消息 · {new Date(s.createdAt).toLocaleDateString('zh-CN')}
                      </Text>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        )}
      </div>
    </div>
  );
}

// 简单的 Markdown 渲染
function RenderMarkdown({ text }: { text: string }) {
  const lines = text.split('\n');
  return (
    <>
      {lines.map((line, i) => {
        if (line.startsWith('**') && line.endsWith('**')) {
          return <Text strong key={i} style={{ display: 'block', marginTop: 8 }}>{line.replace(/\*\*/g, '')}</Text>;
        }
        if (line.startsWith('• ')) {
          return <Text key={i} style={{ display: 'block', paddingLeft: 12 }}>{line}</Text>;
        }
        if (/^\d+\./.test(line.trim())) {
          return <Text key={i} style={{ display: 'block', paddingLeft: 12 }}>{line}</Text>;
        }
        return <Text key={i} style={{ display: 'block' }}>{line || '\u00A0'}</Text>;
      })}
    </>
  );
}
