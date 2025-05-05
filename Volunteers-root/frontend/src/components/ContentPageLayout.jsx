// shared/components/ContentPageLayout.jsx
import { Breadcrumb, Typography } from 'antd';
import { Link } from 'react-router-dom';

const { Title } = Typography;

function ContentPageLayout({ title, children }) {
    return (
        <div style={{ padding: '24px 40px' }}>
            <Breadcrumb style={{ marginBottom: 16 }}>
                <Breadcrumb.Item><Link to="/">Головна</Link></Breadcrumb.Item>
                <Breadcrumb.Item>{title}</Breadcrumb.Item>
            </Breadcrumb>
            {children}
        </div>
    );
}

export default ContentPageLayout;
