import { useEffect, useState } from 'react';
import { testConnection } from '../api/test';
import { Typography, Spin, Alert } from 'antd';

const { Title } = Typography;

function HomePage() {
    const [message, setMessage] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        testConnection()
            .then(res => setMessage(res.data.message))
            .catch(() => setError('API test failed'))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <Spin />;
    if (error) return <Alert message={error} type="error" showIcon />;
    console.log(message)
    return (<> <Title level={3}>{message}</Title> <Spin /> <Spin /> <Spin /> </>);
}

export default HomePage;
