import { useState, useEffect } from 'react';
import { Card, Input, Radio, Select, Switch, Button, Typography, Space, Tag, List, Divider, message } from 'antd';
import { PlusOutlined, SaveOutlined, DeleteOutlined, HolderOutlined, BulbOutlined } from '@ant-design/icons';
import { getSOPGoal, getSOPGoalTemplates, getSOPSteps } from '../mock/api';
import type { SOPGoal, SOPStep } from '../types';

const { Text, Title, Paragraph } = Typography;

export default function SOPConfig() {
  const [goal, setGoal] = useState<SOPGoal | null>(null);
  const [templates, setTemplates] = useState<string[]>([]);
  const [steps, setSteps] = useState<SOPStep[]>([]);
  const [newAction, setNewAction] = useState('');
  const [editingStep, setEditingStep] = useState<string | null>(null);

  useEffect(() => {
    getSOPGoal().then(setGoal);
    getSOPGoalTemplates().then(setTemplates);
    getSOPSteps().then(setSteps);
  }, []);

  const handleSaveAll = () => {
    message.success('设置已保存');
  };

  return (
    <div style={{ maxWidth: 900 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={4} style={{ margin: 0 }}>⚙️ 系统设置 - 成功目标与SOP模板</Title>
        <Button type="primary" icon={<SaveOutlined />} onClick={handleSaveAll}>保存设置</Button>
      </div>

      {/* 成功目标定义 */}
      <Card
        title="🎯 成功目标定义"
        extra={<Button icon={<PlusOutlined />} size="small">新增目标</Button>}
        style={{ marginBottom: 20 }}
      >
        {goal && (
          <>
            <Text type="secondary">当前激活目标：{goal.name}</Text>

            <Card size="small" style={{ marginTop: 12, background: '#fafafa' }}>
              <div style={{ marginBottom: 16 }}>
                <Text strong>目标名称：</Text>
                <Input value={goal.name} style={{ marginTop: 4 }} />
              </div>

              <div style={{ marginBottom: 16 }}>
                <Text strong>目标类型：</Text>
                <div style={{ marginTop: 4 }}>
                  <Radio.Group value={goal.type}>
                    <Radio value="call_behavior">单次通话行为</Radio>
                    <Radio value="business_result">最终业务结果</Radio>
                  </Radio.Group>
                </div>
              </div>

              <div style={{ marginBottom: 16 }}>
                <Text strong>判定规则：</Text>
                <Input.TextArea value={goal.rule} rows={2} style={{ marginTop: 4 }} />
              </div>

              <div style={{ marginBottom: 16 }}>
                <Text strong>适用团队：</Text>
                <Select
                  mode="multiple"
                  value={goal.teams}
                  style={{ width: '100%', marginTop: 4 }}
                  options={[
                    { value: '所有销售团队', label: '所有销售团队' },
                    { value: '销售一部', label: '销售一部' },
                    { value: '销售二部', label: '销售二部' },
                  ]}
                />
              </div>

              <div>
                <Text strong>状态：</Text>
                <Switch checked={goal.active} checkedChildren="启用" unCheckedChildren="停用" style={{ marginLeft: 8 }} />
              </div>
            </Card>

            {/* 目标模板库 */}
            <div style={{ marginTop: 16 }}>
              <Text strong>📋 目标模板库（可快速选择）</Text>
              <List
                size="small"
                dataSource={templates}
                renderItem={t => (
                  <List.Item style={{ cursor: 'pointer', padding: '8px 0' }}>
                    <Text>• {t}</Text>
                    <Button size="small" type="link">选择</Button>
                  </List.Item>
                )}
              />
            </div>
          </>
        )}
      </Card>

      {/* SOP流程配置 */}
      <Card
        title="📋 SOP流程配置"
        extra={<Button icon={<PlusOutlined />} size="small">新增步骤</Button>}
        style={{ marginBottom: 20 }}
      >
        <Text type="secondary" style={{ display: 'block', marginBottom: 12 }}>
          销售标准流程（SOP模板）
        </Text>

        {steps.map((step, idx) => (
          <Card
            key={step.id}
            size="small"
            style={{
              marginBottom: 12,
              borderLeft: step.isCritical ? '4px solid #faad14' : undefined,
            }}
            title={
              <Space>
                <HolderOutlined style={{ cursor: 'grab', color: '#999' }} />
                <Text strong>{step.name}</Text>
                {step.timeLimit && <Tag color="blue">{step.timeLimit}秒内</Tag>}
                {step.isCritical && <Tag color="gold">关键步骤</Tag>}
                <Switch
                  size="small"
                  checked={true}
                  checkedChildren="启用"
                  unCheckedChildren="停用"
                />
              </Space>
            }
            extra={
              <Button size="small" danger icon={<DeleteOutlined />} type="text" />
            }
          >
            <div style={{ marginBottom: 8 }}>
              <Text type="secondary">必做动作：</Text>
              <div style={{ marginTop: 4 }}>
                {step.requiredActions.map((action, ai) => (
                  <Tag key={ai} closable>{action}</Tag>
                ))}
                <Input
                  size="small"
                  placeholder="+ 添加动作"
                  style={{ width: 140 }}
                  onPressEnter={e => {
                    message.info('动作已添加');
                  }}
                  suffix={<PlusOutlined style={{ cursor: 'pointer' }} />}
                />
              </div>
            </div>
            <div>
              <Text type="secondary">检查点：</Text>
              <div style={{ marginTop: 4 }}>
                {step.checkpoints.map((cp, ci) => (
                  <Tag key={ci} color="purple">{cp}</Tag>
                ))}
              </div>
            </div>
          </Card>
        ))}

        {/* AI 建议 */}
        <div style={{
          marginTop: 16, padding: '14px 18px',
          background: 'linear-gradient(135deg, #e6f7ff 0%, #fff7e6 100%)',
          borderRadius: 8, border: '1px solid #91d5ff',
        }}>
          <Space>
            <BulbOutlined style={{ color: '#faad14', fontSize: 18 }} />
            <Text strong style={{ color: '#0f3460' }}>
              💡 AI建议：基于最近高转化通话分析，建议强化【步骤2 需求挖掘】的标准
            </Text>
          </Space>
          <div style={{ marginTop: 8 }}>
            <Button size="small" type="primary">查看建议详情</Button>
            <Button size="small" style={{ marginLeft: 8 }}>一键应用</Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
