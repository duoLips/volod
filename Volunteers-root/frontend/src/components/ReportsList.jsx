import { useQuery } from '@tanstack/react-query';
import API from '../api/axios';
import { Typography, Row, Col, Spin, Alert } from 'antd';
import { Link, useSearchParams } from 'react-router-dom';
import dayjs from 'dayjs';
import { useState } from 'react';
import PaginationControl from '../components/PaginationControl';

const { Title } = Typography;

function ReportList({ type = 'full' }) {
    const isPreview = type === 'preview';

    const [searchParams, setSearchParams] = useSearchParams();
    const currentPage = parseInt(searchParams.get('page')) || 1;
    const [limit] = useState(isPreview ? 3 : 8);

    const { data, isLoading, isError, isFetching } = useQuery({
        queryKey: ['reports', currentPage, limit],
        queryFn: () => API.get(`/reports?page=${currentPage}&limit=${limit}`).then(res => res.data),
        keepPreviousData: true,
    });

    if (isLoading) return <Spin />;
    if (isError) return <Alert message="Помилка при завантаженні звітів" type="error" showIcon />;
    if (!data?.data?.length) return <Alert message="Немає звітів для показу" type="info" showIcon />;

    const reports = data.data;
    const totalPages = data.pagination?.totalPages || 1;

    const formatAuthor = (item) => {
        if (item.username) return item.username;
        if (item.first_name && item.last_name)
            return `${item.first_name} ${item.last_name.charAt(0)}.`;
        return 'Невідомий автор';
    };

    const handleLoadMore = () => {
        const nextPage = currentPage + 1;
        setSearchParams({ page: nextPage });
    };

    return (
        <div style={{ padding: isPreview ? '40px 0' : '40px 0 80px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
                <Title level={3} style={{ margin: 0 }}>Проєкти та звіти</Title>
                {isPreview && (
                    <Link to="/reports" style={{ fontSize: 16, color: '#0038A8' }}>Всі звіти ↗</Link>
                )}
            </div>

            {isPreview ? (
                <Row gutter={[16, 16]}>
                    {reports.map(report => (
                        <Col xs={24} sm={12} md={8} key={report.id}>
                            <Link to={`/reports/${report.id}`} style={{ color: 'inherit' }}>
                                <div style={{ border: '1px solid #eee', borderRadius: 6, overflow: 'hidden' }}>
                                    <img
                                        alt={report.alt_text || 'cover'}
                                        src={report.img_path}
                                        style={{ height: 180, width: '100%', objectFit: 'cover' }}
                                    />
                                    <div style={{ padding: 12 }}>
                                        <div style={{ fontSize: 12, color: 'gray', marginBottom: 4 }}>
                                            Опубліковано: {formatAuthor(report)} <span style={{ float: 'right' }}>{dayjs(report.created_at).format('DD.MM.YYYY')}</span>
                                        </div>
                                        <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 4 }}>
                                            {report.title}
                                        </div>
                                        <div style={{ fontSize: 14, color: '#444' }}>
                                            {report.body.length > 150 ? `${report.body.slice(0, 150)}...` : report.body}
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        </Col>
                    ))}
                </Row>
            ) : (
                <>
                    <Row gutter={[24, 24]}>
                        {reports.map((item) => (
                            <Col xs={24} md={12} key={item.id}>
                                <div style={{ display: 'flex', gap: 16 }}>
                                    <img
                                        src={item.img_path}
                                        alt={item.alt_text || 'report'}
                                        style={{ width: 160, height: 100, objectFit: 'cover', flexShrink: 0 }}
                                    />
                                    <div style={{ flexGrow: 1, borderBottom: '1px solid #ccc', paddingBottom: 8 }}>
                                        <div style={{ fontSize: 12, color: 'gray', marginBottom: 4 }}>
                                            Опубліковано: {formatAuthor(item)} <span style={{ float: 'right' }}>{dayjs(item.created_at).format('DD.MM.YYYY')}</span>
                                        </div>
                                        <Link to={`/reports/${item.id}`} style={{ fontWeight: 600, fontSize: 16, textTransform: 'uppercase', color: 'black' }}>
                                            {item.title}
                                        </Link>
                                    </div>
                                </div>
                            </Col>
                        ))}
                    </Row>

                    {totalPages > 1 && (
                        <PaginationControl
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onChangePage={(page) => setSearchParams({ page })}
                            onLoadMore={handleLoadMore}
                            isLoading={isFetching}
                        />
                    )}
                </>
            )}
        </div>
    );
}

export default ReportList;
