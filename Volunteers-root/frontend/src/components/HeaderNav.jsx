import {Menu, Input, Button, Avatar, Dropdown} from 'antd';
import {Link, useNavigate} from 'react-router-dom';
import {useState} from 'react';
import Logo from '../assets/Logo.svg';
import {UserOutlined} from '@ant-design/icons';
import RegisterModal from "./modals/RegisterModal.jsx";
import LoginModal from './modals/LoginModal.jsx';
import API from '../api/axios';
import {useSession} from '../context/SessionProvider';

const {Search} = Input;

function HeaderNav() {
    const [current, setCurrent] = useState(null);
    const [loginOpen, setLoginOpen] = useState(false);
    const [registerOpen, setRegisterOpen] = useState(false);
    const navigate = useNavigate();
    const {session} = useSession();

    const handleLogout = async () => {
        await API.post('/auth/logout');
        window.location.reload();
    };

    const handleClick = (e) => {
        setCurrent(e.key);
    };

    const userDropdown = {
        items: [{
            key: 'profile', label: <Link to="/profile">Особистий кабінет</Link>,
        }, {
            key: 'logout', label: <span onClick={handleLogout}>Вихід</span>,
        }]
    };

    return (<div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'start',
            height: '100%',
            maxWidth: 1200,
            margin: '0 auto',
            width: '100%',
        }}>
            <Link to="/"
                  style={{display: 'flex', alignItems: 'center', gap: 4, color: '#0F3E98', textDecoration: 'none'}}>
                <img src={Logo} alt="Logo" style={{height: 32}}/>
                <span style={{fontSize: 20, fontWeight: 600}}>Volunteers</span>
            </Link>

            <div style={{display: 'column', flexBasis: "70%"}}>
                <Menu
                    mode="horizontal"
                    theme="light"
                    style={{
                        background: 'transparent',
                        justifyContent: 'space-between',
                        fontFamily: `'Jura', sans-serif`,
                        fontWeight: '400',
                        fontSize: '1rem',
                        border: 'none'
                    }}
                    onClick={handleClick}
                    selectedKeys={[current]}
                    items={[{label: <Link to="/about">Про нас</Link>, key: 'about'}, {
                        label: <Link to="/news">Новини</Link>, key: 'news'
                    }, {
                        label: 'Аукціони ⌄',
                        key: 'auctions',
                        children: [{label: <Link to="/auctions/current">Поточні</Link>, key: 'current'}, {
                            label: <Link to="/auctions/closed">Завершені</Link>, key: 'closed'
                        }]
                    }, {label: <Link to="/reports">Звіти</Link>, key: 'reports'}, {
                        label: <Link to="/gallery">Галерея</Link>, key: 'gallery'
                    }, {label: <Link to="/contact">Контакти</Link>, key: 'contact'}, {
                        key: 'auth',
                        label: session?.authenticated ? (
                            <Dropdown menu={userDropdown}>
                            <span style={{cursor: 'pointer'}}>
                                <Avatar
                                    src={session.user.avatar_url}
                                    size="small"
                                    style={{ marginRight: 8 }}
                                />
                                {session.user.username ||
                                    `${session.user.firstName || ''} ${session.user.lastName || ''}`.trim() ||
                                    'Користувач'}

                             </span>
                            </Dropdown>) : (<Button
                                color="primary"
                                variant="outlined"
                                iconPosition="end"
                                icon={<UserOutlined/>}

                                onClick={() => setLoginOpen(true)}
                            >
                                Вхід
                            </Button>)
                    }

                    ]}
                />

                <LoginModal open={loginOpen}
                            onClose={() => setLoginOpen(false)}
                            onOpenRegister={() => setRegisterOpen(true)}
                />
                <RegisterModal open={registerOpen} onClose={() => setRegisterOpen(false)} />
                <Search
                    placeholder="Пошук..."
                    style={{padding: "0 15px 0 35px"}}
                    allowClear
                    onSearch={(value) => {
                        if (value.trim()) {
                            navigate(`/search?q=${encodeURIComponent(value)}`);
                        }
                    }}
                />
            </div>
        </div>);
}

export default HeaderNav;
