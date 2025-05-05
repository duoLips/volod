import { useSearchParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { searchQuery } from '../api/search';
import { Typography, Divider, List, Spin, Alert } from 'antd';

const { Title } = Typography;

function SearchPage() {
    const [params] = useSearchParams();
    const query = params.get('q');

    const { data, isLoading, isError } = useQuery({
        queryKey: ['search', query],
        queryFn: () => searchQuery(query).then(res => res.data),
        enabled: !!query,
    });
    function getPathForType(type) {
        if (type === 'report') return 'reports';
        if (type === 'auction') return 'auctions';
        return type;
    }

    if (!query) return <Alert message="Запит не заданий" type="warning" showIcon />;
    if (isLoading) return <Spin />;
    if (isError) return <Alert message="Помилка при пошуку" type="error" showIcon />;

    const grouped = data.reduce((acc, item) => {
        acc[item.type] = acc[item.type] || [];
        acc[item.type].push(item);
        return acc;
    }, {});

    return (
        <div>
            <Title level={3}>Результати пошуку: "{query}"</Title>
            {Object.entries(grouped).map(([type, items]) => (
                <div key={type}>
                    <Divider orientation="left">
                        {type === 'news' ? 'Новини' :
                            type === 'report' ? 'Звіти' :
                                type === 'auction' ? 'Аукціони' : 'Інше'}
                    </Divider>

                    <List
                        bordered
                        dataSource={items}
                        renderItem={item => (
                            <List.Item>
                                <div>
                                    <Link to={`/${getPathForType(type)}/${item.id}`}>
                                        <strong>{item.title}</strong>
                                    </Link>
                                    <div>{item.body}</div>
                                </div>
                            </List.Item>
                        )}
                    />
                </div>
            ))}
        </div>
    );
}

export default SearchPage;
