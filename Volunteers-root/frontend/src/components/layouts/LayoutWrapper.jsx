import { Layout } from 'antd';
import { Outlet } from 'react-router-dom';
import HeaderNav from "../HeaderNav.jsx";

const { Header, Content, Footer } = Layout;

function LayoutWrapper() {
    return (
        <Layout style={{ minHeight: '100vh', background: '#fff' }}>
            <Header style={{ background: 'transparent', padding: 0, zIndex: 1 }}>
                <div
                    style={{
                        maxWidth: 1200,
                        margin: '0 auto',
                        padding: '0',
                        width: '100%',
                    }}
                >
                    <HeaderNav />
                </div>
            </Header>

            <Content style={{ padding: '24px 0' }}>
                <div
                    style={{
                        maxWidth: 1200,
                        margin: '0 auto',
                        padding: '0 16px',
                        width: '100%',
                    }}
                >
                    <Outlet />
                </div>
            </Content>

            <Footer style={{ background: '#0F3E9833', padding: '24px 0' }}>
                <div
                    style={{
                        maxWidth: 1200,
                        margin: '0 auto',
                        padding: '0 16px',
                        width: '100%',
                        textAlign: 'center',
                    }}
                >
                    © 2025 Volunteer Platform
                </div>
            </Footer>
        </Layout>
    );
}

export default LayoutWrapper;
