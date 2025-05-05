import { useEffect, useState } from 'react';
import { testConnection } from '../api/test';
import { Typography, Spin, Alert } from 'antd';
import ReportsList from '../components/ReportsList.jsx';
import AuctionsList from '../components/AuctionsList.jsx';
import MainSection from "../components/MainSection.jsx";
import NewsList from '../components/NewsList.jsx';



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
    return (<>
        <MainSection />
        <ReportsList type="preview" />
        <AuctionsList type="preview" />
        <NewsList type="preview" />
    </>);
}

export default HomePage;
