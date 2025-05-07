import { Layout } from 'antd';
import { Outlet } from 'react-router-dom';
import HeaderNav from "../HeaderNav.jsx";
const { Header, Content, Footer } = Layout;




function LayoutWrapper() {
    return (
        <Layout style={{ minHeight: '100vh', background: '#fff', fontFamily: `'Jura', sans-serif`}}>
            <Header style={{
                background: 'transparent',
                color: 'white',
                fontSize: '1.25rem',
                display: 'flex',
                alignItems: 'center',
                height: '100%',
                zIndex: 1
            }}>
                <HeaderNav onLoginClick={() => console.log('open login modal')} />
            </Header>

            <Content style={{ padding: '24px', maxWidth: 1200, margin: '0 auto',  }}>
                <Outlet />
            </Content>

            <Footer style={{ textAlign: 'center' }}>© 2025 Volunteer Platform</Footer>
        </Layout>
    );
}

export default LayoutWrapper;
