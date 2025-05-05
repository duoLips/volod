import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import API from '../api/axios';
import dayjs from 'dayjs';
import { Typography, Spin, Alert, Image, Tag } from 'antd';

const { Title, Paragraph, Text } = Typography;

function AuctionDetailPage() {
    const { id } = useParams();



    const { data, isLoading, isError } = useQuery({
        queryKey: ['auction', id],
        queryFn: () => API.get(`/auctions/${id}`).then(res => res.data),
        enabled: !!id,
    });

    if (isLoading) return <Spin />;
    if (isError) return <Alert message="Не вдалося завантажити аукціон" type="error" showIcon />;
    if (!data) return <Alert message="Аукціон не знайдено" type="warning" showIcon />;

    const status = data.status ? 'Відкритий' : 'Завершений';

    return (
        <div>
            <Title>{data.title}</Title>

            {data.img_path && (
                <Image
                    src={data.img_path}
                    alt={data.alt_text || 'Auction image'}
                    style={{ margin: '20px 0', maxHeight: 400, objectFit: 'cover' }}
                />
            )}

            <Paragraph>{data.body}</Paragraph>

            <Paragraph>
                🎁 Приз: <Text strong>{data.prize}</Text>
            </Paragraph>

            <Paragraph>
                🕒 Завершується: <Text>{dayjs(data.ends_at).format('DD.MM.YYYY HH:mm')}</Text>
            </Paragraph>

            <Paragraph>
                📌 Статус: <Tag color={data.status ? 'green' : 'red'}>{status}</Tag>
            </Paragraph>

            {data.winner_label && (
                <Paragraph>
                    🏆 Переможець: <Text strong>{data.winner_label}</Text>
                </Paragraph>
            )}

        </div>
    );
}

export default AuctionDetailPage;
