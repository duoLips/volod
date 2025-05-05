import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import API from '../api/axios';
import { Typography, Row, Col, Spin, Alert } from 'antd';
import { useSearchParams, Link } from 'react-router-dom';
import dayjs from 'dayjs';
import PaginationControl from '../components/PaginationControl';

const { Title } = Typography;

function NewsList({ type = 'full' }) {
    const isPreview = type === 'preview';
    const [searchParams, setSearchParams] = useSearchParams();
    const currentPage = parseInt(searchParams.get('page')) || 1;
    const [limit] = useState(isPreview ? 5 : 8);

    // Ensure page=1 is in URL on mount
    useEffect(() => {
        if (!searchParams.get('page')) {
            setSearchParams({ page: 1 });
        }
    }, []);

    const { data, isLoading, isError, isFetching } = useQuery({
        queryKey: ['news', currentPage, limit],
        queryFn: () =>
            API.get(`/news?page=${currentPage}&limit=${limit}`).then(res => res.data),
        keepPreviousData: true,
    });

    if (isLoading) return <Spin />;
    if (isError) return <Alert message="Помилка при завантаженні новин" type="error" showIcon />;

    const newsData = data?.data || [];
    const totalPages = data?.pagination?.totalPages || 1;

    const handleLoadMore = () => {
        const nextPage = currentPage + 1;
        setSearchParams({ page: nextPage });
    };

    const formatAuthor = (item) => {
        if (item.username) return item.username;
        if (item.first_name && item.last_name)
            return `${item.first_name} ${item.last_name.charAt(0)}.`;
        return 'Невідомий автор';
    };

    return (
        <div style={{ padding: isPreview ? '40px 0' : '40px 0 80px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
                <Title level={3} style={{ margin: 0 }}>Новини</Title>
                {isPreview && (
                    <Link to="/news" style={{ fontSize: 16, color: '#0038A8' }}>Всі новини ↗</Link>
                )}
            </div>

            {isPreview ? (
                <Row gutter={[24, 24]}>
                    <Col xs={24} md={12}>
                        {newsData.slice(0, 3).map((item) => (
                            <div key={item.id} style={{ marginBottom: 24, borderBottom: '1px solid #ccc', paddingBottom: 12 }}>
                                <div style={{ fontSize: 12, color: 'gray', marginBottom: 4 }}>
                                    Опубліковано: {formatAuthor(item)}
                                    <span style={{ float: 'right' }}>{dayjs(item.created_at).format('DD.MM.YYYY')}</span>
                                </div>
                                <Link to={`/news/${item.id}`} style={{ fontWeight: 600, fontSize: '18px', textTransform: 'uppercase', color: 'black' }}>
                                    {item.title}
                                </Link>
                            </div>
                        ))}
                    </Col>

                    <Col xs={24} md={12}>
                        <Row gutter={[24, 24]}>
                            {newsData.slice(3, 5).map((news) => (
                                <Col xs={24} sm={12} key={news.id}>
                                    <Link to={`/news/${news.id}`} style={{ color: 'inherit' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                                            <div style={{ overflow: 'hidden', height: 180, borderRadius: 4 }}>
                                                <img
                                                    src={news.img_path}
                                                    alt={news.alt_text || 'news'}
                                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                />
                                            </div>
                                            <div style={{ marginTop: 12 }}>
                                                <div style={{ fontSize: 12, color: 'gray', marginBottom: 4 }}>
                                                    Опубліковано: {formatAuthor(news)}
                                                    <span style={{ float: 'right' }}>{dayjs(news.created_at).format('DD.MM.YYYY')}</span>
                                                </div>
                                                <div style={{ fontWeight: 600, fontSize: 18, marginBottom: 4 }}>
                                                    {news.title}
                                                </div>
                                                <div style={{ fontSize: 14, color: '#444' }}>
                                                    {news.body.length > 150 ? news.body.slice(0, 150) + '...' : news.body}
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                </Col>
                            ))}
                        </Row>
                    </Col>
                </Row>
            ) : (
                <>
                    <Row gutter={[24, 24]}>
                        {newsData.map((item) => (
                            <Col xs={24} md={12} key={item.id}>
                                <div style={{ display: 'flex', gap: 16 }}>
                                    <img
                                        src={item.img_path}
                                        alt={item.alt_text || 'news'}
                                        style={{ width: 160, height: 100, objectFit: 'cover', flexShrink: 0 }}
                                    />
                                    <div style={{ flexGrow: 1, borderBottom: '1px solid #ccc', paddingBottom: 8 }}>
                                        <div style={{ fontSize: 12, color: 'gray', marginBottom: 4 }}>
                                            Опубліковано: {formatAuthor(item)}
                                            <span style={{ float: 'right' }}>{dayjs(item.created_at).format('DD.MM.YYYY')}</span>
                                        </div>
                                        <Link to={`/news/${item.id}`} style={{ fontWeight: 600, fontSize: 16, textTransform: 'uppercase', color: 'black' }}>
                                            {item.title}
                                        </Link>
                                    </div>
                                </div>
                            </Col>
                        ))}
                    </Row>

                    <PaginationControl
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onChangePage={(page) => setSearchParams({ page })}
                        onLoadMore={handleLoadMore}
                        isLoading={isFetching}
                    />
                </>
            )}
        </div>
    );
}

export default NewsList;
