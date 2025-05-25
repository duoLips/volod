import { Menu, Input, Button, Avatar, Dropdown, Drawer, Grid } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import Logo from '../assets/Logo.svg';
import { UserOutlined, MenuOutlined } from '@ant-design/icons';
import RegisterModal from './modals/RegisterModal.jsx';
import LoginModal from './modals/LoginModal.jsx';
import API from '../api/axios';
import { useSession } from '../context/SessionProvider';
import '../header-lift-hover.css';

const { Search } = Input;
const { useBreakpoint } = Grid;

function HeaderNav() {
    const [current, setCurrent] = useState(null);
    const [loginOpen, setLoginOpen] = useState(false);
    const [registerOpen, setRegisterOpen] = useState(false);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const navigate = useNavigate();
    const { session } = useSession();
    const screens = useBreakpoint();
    const isMobile = !screens.md;

    const handleLogout = async () => {
        await API.post('/auth/logout');
        window.location.reload();
    };

    const handleClick = (e) => {
        setCurrent(e.key);
    };

    const userDropdown = {
        items: [
            { key: 'profile', label: <Link to="/profile">Особистий кабінет</Link> },
            { key: 'logout', label: <span onClick={handleLogout}>Вихід</span> },
        ],
    };

    const userMenuItems = session?.authenticated
        ? isMobile
            ? [
                { key: 'profile', label: <Link to="/profile">Особистий кабінет</Link> },
                { key: 'logout', label: <span onClick={handleLogout}>Вихід</span> }
            ]
            : [
                {
                    key: 'auth',
                    label: (
                        <Dropdown menu={userDropdown}>
                            <span style={{ cursor: 'pointer' }}>
                                <Avatar src={session.user.avatar_url} size="small" />
                            </span>
                        </Dropdown>
                    )
                }
            ]
        : [
            {
                key: 'auth',
                label: (
                    <Button icon={<UserOutlined />} onClick={() => setLoginOpen(true)}>
                        Вхід
                    </Button>
                )
            }
        ];

    const menuItems = [
        { label: <Link to="/news">Новини</Link>, key: 'news' },
        { label: <Link to="/auctions">Аукціони</Link>, key: 'auctions' },
        { label: <Link to="/reports">Звіти</Link>, key: 'reports' },
        { label: <Link to="/gallery">Галерея</Link>, key: 'gallery' },
        { label: <a href="/#contact">Контакти</a>, key: 'contact' },
        ...userMenuItems,
    ];

    return (
        <div
            style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                height: '100%',
                width: '100%',
                padding: '0',
            }}
        >
            <Link
                to="/"
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    color: '#0F3E98',
                    textDecoration: 'none',
                    whiteSpace: 'nowrap',
                    paddingLeft: '16px',
                }}
            >
                <img src={Logo} alt="Logo" style={{ height: 32 }} />
                <span style={{ fontSize: 20, fontWeight: 600 }}>Volunteers</span>
            </Link>

            {screens.md ? (
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-end',
                        width: 'fit-content',
                    }}
                >
                    <Menu
                        mode="horizontal"
                        theme="light"
                        style={{
                            background: 'transparent',
                            fontSize: '1rem',
                            border: 'none',
                            columnGap: 0,
                            display: 'flex',
                            padding: 0,
                        }}
                        onClick={handleClick}
                        selectedKeys={[current]}
                        items={menuItems}
                    />
                    <div style={{ paddingRight: '2%', width: '100%' }}>
                        <Search
                            placeholder="Пошук..."
                            allowClear
                            onSearch={(value) => {
                                if (value.trim()) {
                                    navigate(`/search?q=${encodeURIComponent(value)}`);
                                }
                            }}
                        />
                    </div>
                </div>
            ) : (
                <>
                    <Button
                        type="text"
                        icon={<MenuOutlined />}
                        onClick={() => setDrawerOpen(true)}
                        style={{ marginLeft: 'auto' }}
                    />
                    <Drawer
                        title="Меню"
                        placement="right"
                        onClose={() => setDrawerOpen(false)}
                        open={drawerOpen}
                    >
                        <Menu
                            mode="vertical"
                            selectedKeys={[current]}
                            onClick={(e) => {
                                handleClick(e);
                                setDrawerOpen(false);
                            }}
                            items={menuItems}
                        />
                        <Search
                            placeholder="Пошук..."
                            allowClear
                            onSearch={(value) => {
                                if (value.trim()) {
                                    navigate(`/search?q=${encodeURIComponent(value)}`);
                                    setDrawerOpen(false);
                                }
                            }}
                            style={{ marginTop: 16 }}
                        />
                    </Drawer>
                </>
            )}

            <LoginModal
                open={loginOpen}
                onClose={() => setLoginOpen(false)}
                onOpenRegister={() => {
                    setLoginOpen(false);
                    setRegisterOpen(true);
                }}
            />
            <RegisterModal open={registerOpen} onClose={() => setRegisterOpen(false)} />
        </div>
    );
}

export default HeaderNav;
