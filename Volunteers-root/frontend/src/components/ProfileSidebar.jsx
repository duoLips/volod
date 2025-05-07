import { Avatar, Menu, Divider } from 'antd';
import { SettingOutlined, LogoutOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useSession } from '../context/SessionProvider';

export default function ProfileSidebar({ selectedKey, onSelect }) {
    const navigate = useNavigate();
    const { session } = useSession();

    const displayName =
        session?.user.username ||
        `${session?.user.firstName?.[0] || ''}${session?.user.lastName?.[0] || ''}` ||
        'Користувач';

    return (
        <div style={{
            width: 200,
            background: '#e4eaf7',
            padding: '1rem',
            borderRadius: 10,
            height: 'fit-content'
        }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 16 }}>
                <Avatar src={session?.user.avatar_url} size={64} />
                <div style={{ marginTop: 8, fontWeight: 500 }}>{displayName}</div>
            </div>

            <Menu
                mode="inline"
                selectedKeys={[selectedKey]}
                onClick={({ key }) => onSelect(key)}
                style={{ background: 'transparent', borderRight: 0 }}
                items={[
                    {
                        key: 'auctions',
                        label: 'Аукціони',
                    },
                    {
                        key: 'comments',
                        label: 'Коментарі',
                    },
                    {
                        key: 'stats',
                        label: 'Статистика',
                    }
                ]}
            />

            <Divider />

            <Menu
                mode="inline"
                style={{ background: 'transparent', borderRight: 0 }}
                items={[
                    {
                        key: 'settings',
                        icon: <SettingOutlined />,
                        label: 'Налаштування',
                        onClick: () => onSelect('settings')
                    },
                    {
                        key: 'logout',
                        icon: <LogoutOutlined />,
                        label: 'Вихід',
                        onClick: async () => {
                            await fetch('http://localhost:5050/api/auth/logout', { method: 'POST', credentials: 'include' });
                            window.location.href = '/';
                        }
                    }
                ]}
            />
        </div>
    );
}
