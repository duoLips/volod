import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import API from '../../api/axios.js';
import CommentsSection from "../../components/CommentsSection.jsx";
import dayjs from 'dayjs';
import {
    Typography,
    Spin,
    Alert,
    Image,
    Modal,
    Button,
    Row,
    Col
} from 'antd';
import ArticleForm from "../../components/ArticleForm.jsx";
import DeleteArticleButton from "../../components/DeleteArticleButton.jsx";
import { useSession } from "../../context/SessionProvider.jsx";
import { useState } from "react";
import PollSection from "../../components/PollSelection.jsx";
import Breadcrumbs from "../../components/layouts/Breadcrumbs.jsx";

const { Title, Paragraph, Text } = Typography;

function ReportDetailPage() {
    const { id } = useParams();
    const { session } = useSession();
    const [open, setOpen] = useState(false);
    const isAdmin = session?.user?.role === 1;

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
            <Breadcrumbs />

            {isAdmin && (
                <>
                    <Button type="primary" onClick={() => setOpen(true)} style={{ marginTop: 24 }}>
                        Редагувати звіт
                    </Button>
                    <DeleteArticleButton articleId={id} type="reports" />
                    <Modal
                        title="Редагування"
                        open={open}
                        onCancel={() => setOpen(false)}
                        footer={null}
                        destroyOnClose
                    >
                        <ArticleForm
                            type="reports"
                            mode="edit"
                            articleId={data.id}
                            initialData={data}
                            active={open}
                            onSuccess={() => setOpen(false)}
                        />
                    </Modal>
                </>
            )}

            <Row gutter={[32, 32]} style={{ marginTop: 24 }}>
                <Col xs={24} md={12}>
                    {data.img_path && (
                        <Image
                            src={data.img_path}
                            alt={data.alt_text || 'Report image'}
                            style={{
                                width: '100%',
                                height: 'auto',
                                maxHeight: 400,
                                minHeight: 250,
                                objectFit: 'contain',
                                borderRadius: 4,
                            }}
                        />
                    )}
                    <div style={{ marginTop: 12, fontSize: 12, color: 'gray' }}>
                        <Text>
                            Опубліковано: {data.username || 'Невідомий автор'}
                        </Text>
                        <span style={{ float: 'right' }}>
                            {dayjs(data.created_at).format('DD.MM.YYYY')}
                        </span>
                    </div>
                </Col>

                <Col xs={24} md={12}>
                    <Title level={3} style={{ marginTop: 0 }}>{data.title}</Title>
                    <Paragraph style={{ marginTop: 24 }}>{data.body}</Paragraph>

                    {data.auction_id && (
                        <div style={{ marginTop: 16 }}>
                            <Text strong>
                                Пов'язаний аукціон:{' '}
                                <Link to={`/auctions/${data.auction_id}`} style={{ color: '#0F3E98' }}>
                                    Переглянути →
                                </Link>
                            </Text>
                        </div>
                    )}
                </Col>
            </Row>

            <PollSection entityType="reports" entityId={id} />

            {data.edited_at && (
                <div style={{ margin: '24px 0 8px', color: 'gray', fontSize: 12 }}>
                    Останнє редагування: {dayjs(data.edited_at).format('DD.MM.YYYY HH:mm')}
                </div>
            )}

            <CommentsSection entityType="report" entityId={id} />
        </div>
    );
}

export default ReportDetailPage;
