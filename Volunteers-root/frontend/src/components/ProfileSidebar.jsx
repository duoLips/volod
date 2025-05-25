import { useEffect, useState } from 'react';
import { Avatar, Menu, Divider } from 'antd';
import { SettingOutlined, LogoutOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useSession } from '../context/SessionProvider';

export default function ProfileSidebar({ selectedKey, onSelect }) {
    const navigate = useNavigate();
    const { session } = useSession();

    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const displayName =
        session?.user.username ||
        `${session?.user.firstName?.[0] || ''}${session?.user.lastName?.[0] || ''}` ||
        'Користувач';

    const menuItems = [
        { key: 'comments', label: 'Коментарі' },
        ...(session?.user?.role === 1 ? [{ key: 'admin', label: 'Адмін-панель' }] : []),
    ];

    const settingsItems = [
        {
            key: 'settings',
            icon: <SettingOutlined />,
            label: 'Налаштування',
            onClick: () => onSelect('settings'),
        },
        {
            key: 'logout',
            icon: <LogoutOutlined />,
            label: 'Вихід',
            onClick: async () => {
                await fetch('http://localhost:5050/api/auth/logout', { method: 'POST', credentials: 'include' });
                window.location.href = '/';
            },
        },
    ];

    return (
        <div
            style={{
                width: isMobile ? '100%' : 200,
                background: '#e4eaf7',
                padding: '1rem',
                borderRadius: 10,
                height: 'fit-content',
            }}
        >
            {!isMobile && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 16 }}>
                    <Avatar src={session?.user.avatar_url} size={64} />
                    <div style={{ marginTop: 8, fontWeight: 500 }}>{displayName}</div>
                </div>
            )}

            <Menu
                mode={isMobile ? 'horizontal' : 'inline'}
                selectedKeys={[selectedKey]}
                onClick={({ key }) => onSelect(key)}
                style={{ background: 'transparent', borderRight: 0, justifyContent: 'center' }}
                items={menuItems}
            />

            {!isMobile && <Divider />}

            <Menu
                mode={isMobile ? 'horizontal' : 'inline'}
                style={{ background: 'transparent', borderRight: 0, justifyContent: 'center', marginTop: isMobile ? 12 : 0 }}
                items={settingsItems}
            />
        </div>
    );
}
