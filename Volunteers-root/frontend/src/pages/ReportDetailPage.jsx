import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import API from '../api/axios';
import dayjs from 'dayjs';
import { Typography, Spin, Alert, Image } from 'antd';

const { Title, Paragraph } = Typography;

function ReportDetailPage() {
    const { id } = useParams();

    const { data, isLoading, isError } = useQuery({
        queryKey: ['report', id],
        queryFn: () => API.get(`/reports/${id}`).then(res => res.data),
        enabled: !!id,
    });

    if (isLoading) return <Spin />;
    if (isError) return <Alert message="Не вдалося завантажити звіт" type="error" showIcon />;
    if (!data) return <Alert message="Звіт не знайдено" type="warning" showIcon />;

    return (
        <div>
            <Title>{data.title}</Title>
            {data.img_path && (
                <Image
                    src={data.img_path}
                    alt={data.alt_text || 'Report image'}
                    style={{ margin: '20px 0', maxHeight: 400, objectFit: 'cover' }}
                />
            )}
            <Paragraph>{data.body}</Paragraph>
            <div style={{ marginTop: 20, color: 'gray' }}>
                Опубліковано: {dayjs(data.created_at).format('DD.MM.YYYY HH:mm')}
            </div>
        </div>
    );
}

export default ReportDetailPage;
