import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import API from '../../api/axios.js';
import CommentsSection from "../../components/CommentsSection.jsx";
import dayjs from 'dayjs';
import {Typography, Spin, Alert, Image, Modal, Button} from 'antd';
import ArticleForm from "../../components/ArticleForm.jsx";
import DeleteArticleButton from "../../components/DeleteArticleButton.jsx";
import {useSession} from "../../context/SessionProvider.jsx";
import {useState} from "react";
import PollSection from "../../components/PollSelection.jsx";

const { Title, Paragraph } = Typography;

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
            {isAdmin && (
                <>

                    <Button type="primary" onClick={() => setOpen(true)} style={{ marginTop: 24 }}>
                        Редагувати звіт
                    </Button>
                    <DeleteArticleButton articleId={id} type="reports" />
                    <Modal
                        title="Редагуваання"
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
            <PollSection entityType="reports" entityId={id} />
            <CommentsSection entityType="report" entityId={id} />
        </div>
    );
}

export default ReportDetailPage;
