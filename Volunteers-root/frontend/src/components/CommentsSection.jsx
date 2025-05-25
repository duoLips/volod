import { useState } from 'react';
import {
    Avatar,
    Input,
    Button,
    List,
    Typography,
    Space,
    message,
    Card,
} from 'antd';
import { Comment } from '@ant-design/compatible';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import API from '../api/axios.js';
import { useSession } from '../context/SessionProvider.jsx';
import dayjs from 'dayjs';
import LoginModal from './modals/LoginModal.jsx';
import RegisterModal from './modals/RegisterModal.jsx';
import { CloseOutlined } from '@ant-design/icons';


const { TextArea } = Input;
const { Text } = Typography;

export default function CommentsSection({ entityType, entityId }) {
    const { session } = useSession();
    const [newComment, setNewComment] = useState('');
    const [loginOpen, setLoginOpen] = useState(false);
    const [registerOpen, setRegisterOpen] = useState(false);
    const queryClient = useQueryClient();

    const { data, isLoading } = useQuery({
        queryKey: ['comments', entityType, entityId],
        queryFn: () =>
            API.get('/comments', {
                params: { entityType, entityId },
            }).then(res => res.data.comments),
    });

    const postComment = useMutation({
        mutationFn: payload => API.post('/comments', payload),
        onSuccess: () => {
            queryClient.invalidateQueries(['comments', entityType, entityId]);
            setNewComment('');
        },
        onError: () => {
            message.error('Не вдалося додати коментар');
        },
    });

    const deleteComment = useMutation({
        mutationFn: id => API.delete(`/comments/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries(['comments', entityType, entityId]);
        },
        onError: () => {
            message.error('Не вдалося видалити коментар');
        },
    });

    const handleSubmit = () => {
        if (!newComment.trim()) return;
        postComment.mutate({ entityType, entityId, body: newComment });
    };

    const handleReplySubmit = (text, parentId) => {
        if (!text.trim()) return;
        postComment.mutate({ entityType, entityId, body: text, parentId });
    };

    if (isLoading) return <div>Завантаження...</div>;

    const topLevel = data.filter(c => c.parent_id === null);

    return (
        <Card
            style={{
                marginTop: 48,
                background: '#f9fbff',
                border: 'none',
                padding: 24,
            }}
            title="Коментарі"
        >
            {session?.authenticated ? (
                <>
                    <TextArea
                        rows={3}
                        placeholder="Напишіть коментар..."
                        value={newComment}
                        onChange={e => setNewComment(e.target.value)}
                    />
                    <Button type="primary" onClick={handleSubmit} style={{ marginTop: 8 }}>
                        Надіслати
                    </Button>
                </>
            ) : (
                <div style={{ marginBottom: 24 }}>
                    <Text>Щоб залишити коментар, </Text>
                    <Button
                        type="link"
                        onClick={() => setLoginOpen(true)}
                        style={{ padding: 0, color: '#0F3E98' }}
                    >
                        увійдіть
                    </Button>
                </div>
            )}

            <List
                itemLayout="horizontal"
                dataSource={topLevel}
                locale={{ emptyText: 'Коментарів ще немає' }}
                renderItem={item => (
                    <SingleComment
                        key={item.id}
                        comment={item}
                        allComments={data}
                        onReplySubmit={handleReplySubmit}
                        onDelete={id => deleteComment.mutate(id)}
                        canInteract={!!session?.authenticated}
                    />
                )}
                style={{ marginTop: 24 }}
            />


            <LoginModal
                open={loginOpen}
                onClose={() => setLoginOpen(false)}
                onOpenRegister={() => {
                    setLoginOpen(false);
                    setRegisterOpen(true);
                }}
            />
            <RegisterModal open={registerOpen} onClose={() => setRegisterOpen(false)} />
        </Card>
    );
}

function SingleComment({
                           comment,
                           allComments,
                           onReplySubmit,
                           onDelete,
                           canInteract,
                       }) {
    const { session } = useSession();
    const [replying, setReplying] = useState(false);
    const [replyText, setReplyText] = useState('');

    const handleSendReply = () => {
        onReplySubmit(replyText, comment.id);
        setReplyText('');
        setReplying(false);
    };

    const isDeleted = !!comment.deleted_at;
    const isAuthor = session?.user?.username === comment.username;
    const isAdmin = session?.user?.role === 1;
    const canDelete = isAuthor || isAdmin;

    return (
        <div style={{ position: 'relative' }}>
            {canDelete && (
                <CloseOutlined
                    onClick={() => onDelete(comment.id)}
                    style={{
                        position: 'absolute',
                        top: 8,
                        right: 12,
                        fontSize: 14,
                        color: '#ff4d4f',
                        cursor: 'pointer',
                        zIndex: 2,
                    }}
                />
            )}
            <Comment
                author={!isDeleted ? <strong>{comment.username}</strong> : <i>Користувача немає</i>}
                avatar={!isDeleted ? <Avatar src={comment.avatar_url} /> : <Avatar />}
                content={isDeleted ? <i>Коментар видалено</i> : comment.body}
                datetime={dayjs(comment.created_at).format('DD.MM.YYYY HH:mm')}
                actions={
                    !isDeleted && canInteract
                        ? [
                            <Button
                                size="small"
                                type="text"
                                style={{
                                    background: 'rgba(15,62,152,0.52)',
                                    color: 'white',
                                    borderColor: '#d9d9d9',
                                    marginTop: 8,
                                }}
                                onClick={() => setReplying(!replying)}
                            >
                                Відповісти
                            </Button>
                        ]
                        : []
                }
            >
                {canInteract && replying && (
                    <div style={{ marginBottom: 16 }}>
                        <TextArea
                            rows={2}
                            value={replyText}
                            onChange={e => setReplyText(e.target.value)}
                        />
                        <Button
                            type="default"
                            size="small"
                            onClick={handleSendReply}
                            style={{
                                background: '#0F3E9833',
                                color: 'white',
                                borderColor: '#d9d9d9',
                                marginTop: 8,
                            }}
                        >
                            Надіслати
                        </Button>

                    </div>
                )}
                {renderNestedReplies(comment.id, allComments, onReplySubmit, onDelete, canInteract)}
            </Comment>
        </div>
    );
}


function renderNestedReplies(parentId, allComments, onReplySubmit, onDelete, canInteract) {
    const replies = allComments.filter(c => c.parent_id === parentId);
    return replies.map(reply => (
        <SingleComment
            key={reply.id}
            comment={reply}
            allComments={allComments}
            onReplySubmit={onReplySubmit}
            onDelete={onDelete}
            canInteract={canInteract}
        />
    ));
}
