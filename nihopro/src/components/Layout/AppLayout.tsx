import { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Layout, Menu, Avatar, Dropdown, Switch, Space, Typography } from 'antd';
import {
  BookOutlined, RobotOutlined, DashboardOutlined, TeamOutlined,
  StarOutlined, SettingOutlined, UserOutlined, MenuFoldOutlined,
  MenuUnfoldOutlined, LogoutOutlined,
} from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { getCurrentUser } from '../../mock/api';
import { navItems } from '../../mock/data';
import type { User, UserRole } from '../../types';

const { Sider, Content, Header } = Layout;
const { Text } = Typography;

const iconMap: Record<string, React.ReactNode> = {
  book: <BookOutlined />,
  robot: <RobotOutlined />,
  dashboard: <DashboardOutlined />,
  team: <TeamOutlined />,
  star: <StarOutlined />,
  setting: <SettingOutlined />,
};

export default function AppLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<UserRole>('sales');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    getCurrentUser(role).then(setUser);
  }, [role]);

  // 根据当前路由和角色构建菜单项
  const menuItems: MenuProps['items'] = navItems
    .filter(item => item.roles.includes(role))
    .map(item => ({
      key: item.path,
      icon: iconMap[item.icon],
      label: item.label,
    }));

  const selectedKey = '/' + location.pathname.split('/')[1];

  const userMenuItems: MenuProps['items'] = [
    { key: 'profile', icon: <UserOutlined />, label: `${user?.name} · ${user?.department}` },
    { type: 'divider' },
    { key: 'logout', icon: <LogoutOutlined />, label: '退出登录', danger: true },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        width={200}
        style={{
          background: 'linear-gradient(180deg, #1a1a2e 0%, #16213e 100%)',
          borderRight: 'none',
        }}
      >
        <div style={{
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'flex-start',
          padding: collapsed ? 0 : '0 16px',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
        }}>
          {collapsed ? (
            <span style={{ color: '#e94560', fontSize: 22, fontWeight: 800 }}>N</span>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <img src="/logo.png" alt="NIHO" style={{ height: 36, maxWidth: 120 }} />
              <span style={{ color: '#fff', fontSize: 12, marginLeft: 8, opacity: 0.6 }}>销售赋能平台</span>
            </div>
          )}
        </div>

        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[selectedKey]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
          style={{
            background: 'transparent',
            borderRight: 'none',
            marginTop: 8,
          }}
        />

        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          padding: '16px',
          borderTop: '1px solid rgba(255,255,255,0.1)',
        }}>
          {!collapsed && (
            <div style={{ marginBottom: 12 }}>
              <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11 }}>
                当前角色
              </Text>
            </div>
          )}
          <Switch
            checkedChildren="👔"
            unCheckedChildren="💼"
            checked={role === 'manager'}
            onChange={(v) => setRole(v ? 'manager' : 'sales')}
            size="small"
            style={{ width: collapsed ? '100%' : 'auto' }}
          />
        </div>
      </Sider>

      <Layout>
        <Header style={{
          background: '#fff',
          padding: '0 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
          zIndex: 10,
        }}>
          <Space>
            <span
              onClick={() => setCollapsed(!collapsed)}
              style={{ fontSize: 18, cursor: 'pointer', color: '#666' }}
            >
              {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            </span>
            <Text style={{ fontSize: 15, fontWeight: 500, color: '#1a1a2e' }}>
              {role === 'manager' ? '管理后台' : '销售工作台'}
            </Text>
          </Space>

          <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
            <Space style={{ cursor: 'pointer' }}>
              <Avatar size={32} icon={<UserOutlined />} style={{ background: '#e94560' }} />
              {!collapsed && (
                <span>
                  <Text strong>{user?.name}</Text>
                  <Text type="secondary" style={{ marginLeft: 6, fontSize: 12 }}>
                    {user?.department}
                  </Text>
                </span>
              )}
            </Space>
          </Dropdown>
        </Header>

        <Content style={{
          margin: 16,
          padding: 24,
          background: '#f5f6fa',
          borderRadius: 8,
          overflow: 'auto',
          minHeight: 280,
        }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
