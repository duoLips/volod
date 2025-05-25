import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import API from '../api/axios';
import {
    Card,
    Typography,
    Radio,
    Tag,
    Row,
    Col,
    Spin,
    Alert,
    Image,
} from 'antd';
import { Link, useSearchParams } from 'react-router-dom';
import dayjs from 'dayjs';
import PaginationControl from '../components/PaginationControl';

const { Title, Paragraph, Text } = Typography;

function PreviewCardBackground() {
    return (
        <div
            style={{
                position: 'absolute',
                inset: 0,
                background: '#0F3E9833',
                borderRadius: 0,
                zIndex: 0,
                top: '20%',
                bottom: '-15%',
            }}
        />
    );
}

function AuctionsList({ type = 'preview' }) {
    const isPreview = type === 'preview';
    const [status, setStatus] = useState('all');
    const [searchParams, setSearchParams] = useSearchParams();
    const currentPage = parseInt(searchParams.get('page')) || 1;
    const limit = isPreview ? 4 : 8;

    const { data, isLoading, isError, isFetching } = useQuery({
        queryKey: ['auctions-grid', type, status, currentPage],
        queryFn: () =>
            API.get(`/auctions?page=${currentPage}&limit=${limit}${status !== 'all' ? `&status=${status}` : ''}`).then(
                res => res.data
            ),
        keepPreviousData: true,
    });

    const auctionData = data?.data || [];
    const totalPages = data?.pagination?.totalPages || 1;

    const handleLoadMore = () => {
        const nextPage = currentPage + 1;
        setSearchParams({ page: nextPage });
    };

    const statusOptions = [
        { label: 'Усі', value: 'all' },
        { label: 'Поточні', value: 'open' },
        { label: 'Завершені', value: 'closed' },
    ];

    return (
        <div
            style={{
                padding: isPreview ? '40px 0' : '40px 0 80px',
                ...(isPreview
                    ? {}
                    : {
                        display: 'flex',
                        flexDirection: 'column',
                        minHeight: 'calc(100vh - 64px - 80px)',
                    }),
            }}
        >
            <div style={{ flexGrow: isPreview ? 'unset' : 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24, alignItems: 'baseline' }}>
                    <Title level={2} style={{ fontSize: 'clamp(0.5rem, 8vw, 1.5rem)', margin: 0 }}>Аукціони</Title>
                    {isPreview && (
                        <Link to="/auctions" style={{ fontSize: 'clamp(0.5rem, 8vw, 1.5rem)', color: '#0038A8' }}>
                            Всі аукціони ↗
                        </Link>
                    )}
                </div>

                <Radio.Group
                    options={statusOptions}
                    onChange={e => {
                        if (!isPreview) setSearchParams({ page: 1 });
                        setStatus(e.target.value);
                    }}
                    value={status}
                    optionType="button"
                    buttonStyle="solid"
                    style={{ marginBottom: 24 }}
                />

                {isLoading ? (
                    <Spin />
                ) : isError ? (
                    <Alert message="Помилка при завантаженні аукціонів" type="error" showIcon />
                ) : !auctionData.length ? (
                    <Alert message="Немає аукціонів для показу" type="info" showIcon />
                ) : (
                    <Row gutter={[16, 16]} justify={isPreview && auctionData.length < 4 ? 'center' : 'start'}>
                        {auctionData.map(auction => (
                            <Col
                                xs={24}
                                sm={isPreview ? 12 : 24}
                                md={isPreview ? 6 : 12}
                                key={auction.id}
                                style={isPreview ? { position: 'relative' } : {}}
                            >
                                {isPreview && <PreviewCardBackground />}
                                <Link to={`/auctions/${auction.id}`} style={{ color: 'inherit', position: 'relative', zIndex: 1 }}>
                                    {isPreview ? (
                                        <Card
                                            hoverable
                                            bordered={false}
                                            bodyStyle={{
                                                padding: 12,
                                                display: 'flex',
                                                flexDirection: 'column',
                                                height: '100%',
                                            }}
                                            style={{
                                                boxShadow: 'none',
                                                marginBottom: 12,
                                                height: 280,
                                                display: 'flex',
                                                flexDirection: 'column',
                                            }}
                                            cover={
                                                <div style={{ overflow: 'hidden', height: 120, borderRadius: 4 }}>
                                                    <img
                                                        src={auction.img_path}
                                                        alt={auction.alt_text || 'auction image'}
                                                        style={{
                                                            width: '100%',
                                                            height: '100%',
                                                            objectFit: 'cover',
                                                        }}
                                                    />
                                                </div>
                                            }
                                        >
                                            <div style={{ flexGrow: 1 }}>
                                                <Paragraph style={{ fontWeight: 600, fontSize: 18, marginBottom: 4 }}>
                                                    {auction.title}
                                                </Paragraph>
                                                <div style={{ fontSize: 14, color: '#444' }}>
                                                    {auction.body?.length > 50 ? auction.body.slice(0, 50) + '...' : auction.body}
                                                </div>
                                            </div>
                                            <div style={{ fontSize: 12, color: 'gray', marginTop: 'auto' }}>
                                                {dayjs(auction.created_at).format('DD.MM.YYYY')}
                                            </div>
                                        </Card>
                                    ) : (
                                        <div style={{ display: 'flex', gap: 16 }}>
                                            <Image
                                                src={auction.img_path}
                                                alt={auction.alt_text || 'auction'}
                                                width={160}
                                                height={100}
                                                style={{ objectFit: 'cover' }}
                                            />
                                            <div style={{ flexGrow: 1, borderBottom: '1px solid #ccc', paddingBottom: 8 }}>
                                                <div style={{ fontSize: 12, color: 'gray', marginBottom: 4 }}>
                                                    Завершення: {dayjs(auction.ends_at).format('DD.MM.YYYY')}
                                                </div>
                                                <div style={{ fontWeight: 600, fontSize: 16, textTransform: 'uppercase' }}>
                                                    {auction.title}
                                                </div>
                                                <div style={{ fontSize: 14, color: '#444' }}>
                                                    {auction.body?.length > 39 ? auction.body.slice(0, 39) + '...' : auction.body}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </Link>
                            </Col>
                        ))}
                    </Row>
                )}
            </div>

            {!isPreview && (
                <div style={{ marginTop: 32 }}>
                    <PaginationControl
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onChangePage={page => setSearchParams({ page })}
                        onLoadMore={handleLoadMore}
                        isLoading={isFetching}
                    />
                </div>
            )}
        </div>
    );
}

export default AuctionsList;
