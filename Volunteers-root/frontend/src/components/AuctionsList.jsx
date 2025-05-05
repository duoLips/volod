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
    Image
} from 'antd';
import { Link, useSearchParams } from 'react-router-dom';
import dayjs from 'dayjs';
import PaginationControl from '../components/PaginationControl';

const { Title, Paragraph, Text } = Typography;

function AuctionsList({ type = 'preview' }) {
    const isPreview = type === 'preview';
    const [status, setStatus] = useState('all');
    const [searchParams, setSearchParams] = useSearchParams();
    const currentPage = parseInt(searchParams.get('page')) || 1;
    const limit = isPreview ? 4 : 8;

    const { data, isLoading, isError, isFetching } = useQuery({
        queryKey: ['auctions-grid', type, status, currentPage],
        queryFn: () =>
            API.get(`/auctions?page=${currentPage}&limit=${limit}${status !== 'all' ? `&status=${status}` : ''}`)
                .then(res => res.data),
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
        <div style={{ padding: isPreview ? '40px 0' : '40px 0 80px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                <Title level={3}>Аукціони</Title>
                {isPreview && <Link to="/auctions">Дивитися всі</Link>}
            </div>

            <Radio.Group
                options={statusOptions}
                onChange={e => {
                    setSearchParams({ page: 1 });
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
                <>
                    <Row
                        gutter={[16, 16]}
                        justify={isPreview && auctionData.length < 4 ? 'center' : 'start'}
                    >
                        {auctionData.map(auction => (
                            <Col xs={24} sm={isPreview ? 12 : 24} md={isPreview ? 6 : 12} key={auction.id}>
                                <Link to={`/auctions/${auction.id}`} style={{ color: 'inherit' }}>
                                    {isPreview ? (
                                        <Card
                                            hoverable
                                            cover={
                                                <img
                                                    src={auction.img_path}
                                                    alt={auction.alt_text || 'auction image'}
                                                    style={{ height: 180, objectFit: 'cover' }}
                                                />
                                            }
                                        >
                                            <Text type="secondary">
                                                Завершення: {dayjs(auction.ends_at).format('DD.MM.YYYY')}
                                            </Text>
                                            <Paragraph style={{ marginTop: 8 }}>
                                                <strong>{auction.title}</strong>
                                            </Paragraph>
                                            <Paragraph>🎁 Приз: {auction.prize}</Paragraph>
                                            <Tag color={auction.status ? 'green' : 'red'}>
                                                {auction.status ? 'Відкритий' : 'Завершений'}
                                            </Tag>
                                        </Card>
                                    ) : (
                                        <div style={{ display: 'flex', gap: 16 }}>
                                            <Image
                                                src={auction.img_path}
                                                alt={auction.alt_text || 'auction'}
                                                width={160}
                                                height={100}
                                                style={{ objectFit: 'cover', borderRadius: 4 }}
                                            />
                                            <div style={{ flexGrow: 1, borderBottom: '1px solid #ccc', paddingBottom: 8 }}>
                                                <div style={{ fontSize: 12, color: 'gray', marginBottom: 4 }}>
                                                    Завершення: {dayjs(auction.ends_at).format('DD.MM.YYYY')}
                                                </div>
                                                <div style={{ fontWeight: 600, fontSize: 16, textTransform: 'uppercase' }}>
                                                    {auction.title}
                                                </div>
                                                <div style={{ fontSize: 14, color: '#444' }}>
                                                    🎁 {auction.prize}
                                                </div>
                                                <Tag color={auction.status ? 'green' : 'red'}>
                                                    {auction.status ? 'Відкритий' : 'Завершений'}
                                                </Tag>
                                            </div>
                                        </div>
                                    )}
                                </Link>
                            </Col>
                        ))}
                    </Row>

                    {!isPreview && (
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

export default AuctionsList;
