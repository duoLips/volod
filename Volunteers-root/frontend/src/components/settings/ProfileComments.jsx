import { useQuery } from '@tanstack/react-query';
import { List, Card, Typography, Spin, Alert } from 'antd';
import { useSession } from '../../context/SessionProvider';
import { Link } from 'react-router-dom';
import dayjs from 'dayjs';
import API from '../../api/axios';

const { Text, Paragraph } = Typography;

export default function ProfileComments() {
    const { session } = useSession();
    const userId = session?.user?.id;

    const { data, isLoading, error } = useQuery({
        queryKey: ['user-comments', userId],
        queryFn: () => API.get(`/comments/user/${userId}`).then(res => res.data),
        enabled: !!userId
    });

    if (isLoading) return <Spin />;
    if (error || !data?.comments)
        return <Alert type="error" message="Помилка при завантаженні коментарів" />;

    return (
        <List
            itemLayout="vertical"
            dataSource={data.comments}
            renderItem={(comment) => (
                <Card style={{ marginBottom: 16 }}>
                    <Paragraph>{comment.body}</Paragraph>
                    <Text type="secondary">
                        {dayjs(comment.created_at).format('DD.MM.YYYY HH:mm')} •{' '}
                        <Link to={`/${comment.entity_type}/${comment.entity_id}`}>
                            Перейти до {comment.entity_type === 'news' ? 'новини' :
                            comment.entity_type === 'auction' ? 'аукціону' :
                                comment.entity_type === 'report' ? 'звіту' : comment.entity_type}
                        </Link>
                    </Text>
                </Card>
            )}
        />
    );
}
