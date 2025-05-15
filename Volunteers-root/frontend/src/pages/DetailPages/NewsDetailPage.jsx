import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import CommentsSection from "../../components/CommentsSection.jsx";
import API from '../../api/axios.js';
import {Typography, Spin, Alert, Image, Modal, Button} from 'antd';
import dayjs from 'dayjs';
import ArticleForm from "../../components/ArticleForm.jsx";
import {useSession} from "../../context/SessionProvider.jsx";
import {useState} from "react";
import DeleteArticleButton from "../../components/DeleteArticleButton.jsx";

const { Title, Paragraph } = Typography;

function NewsDetailPage() {
    const { id } = useParams();
    const { session } = useSession();
    const [open, setOpen] = useState(false);
    const isAdmin = session?.user?.role === 1;
    const { data, isLoading, isError } = useQuery({
        queryKey: ['news', id],
        queryFn: () => API.get(`/news/${id}`).then(res => res.data),
        enabled: !!id,
    });

    if (isLoading) return <Spin />;
    if (isError) return <Alert message="Не вдалося завантажити новину" type="error" showIcon />;
    if (!data) return <Alert message="Новина не знайдена" type="warning" showIcon />;

    return (
        <div>
            <Button type="primary" onClick={() => setOpen(true)} style={{ marginTop: 24 }}>
                Редагувати новину
            </Button>
            <DeleteArticleButton articleId={id} type="news" />

            <Modal
                title="Редагуваання"
                open={open}
                onCancel={() => setOpen(false)}
                footer={null}
                destroyOnClose
            >
                <ArticleForm
                    type="news"
                    mode="edit"
                    articleId={data.id}
                    initialData={data}
                    active={open}
                    onSuccess={() => setOpen(false)}
                />
            </Modal>
            <Title>{data.title}</Title>
            {data.img_path && (
                <Image
                    src={data.img_path}
                    alt={data.alt_text || 'News image'}
                    style={{ margin: '20px 0', maxHeight: 400, objectFit: 'cover' }}
                />
            )}
            <Paragraph>{data.body}</Paragraph>
            <div style={{ marginTop: 20, color: 'gray' }}>
                Опубліковано: {dayjs(data.created_at).format('DD.MM.YYYY HH:mm')}
            </div>
            <CommentsSection entityType="news" entityId={id} />
        </div>
    );
}

export default NewsDetailPage;
