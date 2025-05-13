import { useState } from 'react';
import {  Avatar, Input, Button, List, message } from 'antd';
import { Comment } from '@ant-design/compatible';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import API from '../api/axios.js';
import { useSession } from '../context/SessionProvider.jsx';
import dayjs from 'dayjs';

const { TextArea } = Input;

export default function CommentsSection({ entityType, entityId }) {
    const { session } = useSession();
    const [newComment, setNewComment] = useState('');
    const queryClient = useQueryClient();

    const { data, isLoading } = useQuery({
        queryKey: ['comments', entityType, entityId],
        queryFn: () =>
            API.get('/comments', {
                params: { entityType, entityId }
            }).then(res => res.data.comments),
    });

    const postComment = useMutation({
        mutationFn: (payload) => API.post('/comments', payload),
        onSuccess: () => {
            queryClient.invalidateQueries(['comments', entityType, entityId]);
            setNewComment('');
        },
        onError: () => {
            message.error('Не вдалося додати коментар');
        }
    });

    const deleteComment = useMutation({
        mutationFn: (id) => API.delete(`/comments/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries(['comments', entityType, entityId]);
        },
        onError: () => {
            message.error('Не вдалося видалити коментар');
        }
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
        <div>
            {session?.authenticated && (
                <>
                    <TextArea
                        rows={3}
                        placeholder="Напишіть коментар..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                    />
                    <Button type="primary" onClick={handleSubmit} style={{ marginTop: 8 }}>
                        Надіслати
                    </Button>
                </>
            )}


            <List
                itemLayout="horizontal"
                dataSource={topLevel}
                renderItem={(item) => (
                    <SingleComment
                        key={item.id}
                        comment={item}
                        allComments={data}
                        onReplySubmit={handleReplySubmit}
                        onDelete={(id) => deleteComment.mutate(id)}
                    />
                )}
                style={{ marginTop: 24 }}
            />
        </div>
    );
}

function SingleComment({ comment, allComments, onReplySubmit, onDelete }) {
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
        <Comment
            author={
                !isDeleted ? <strong>{comment.username}</strong> : <i>Користувача немає</i>
            }
            avatar={
                !isDeleted ? <Avatar src={comment.avatar_url} /> : <Avatar />
            }
            content={
                isDeleted ? <i>Коментар видалено</i> : comment.body
            }
            datetime={dayjs(comment.created_at).format('DD.MM.YYYY HH:mm')}
            actions={[
                !isDeleted && session?.authenticated && (
                    <span onClick={() => setReplying(!replying)} style={{ color: '#1677ff' }}>
            Відповісти
        </span>
                ),
                canDelete && (
                    <span
                        onClick={() => onDelete(comment.id)}
                        style={{ color: 'red' }}
                    >
            Видалити
        </span>
                )
            ]}

        >
            {session?.authenticated && replying && (
                <div style={{ marginBottom: 16 }}>
                    <TextArea
                        rows={2}
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                    />
                    <Button type="link" onClick={handleSendReply}>
                        Надіслати
                    </Button>
                </div>
            )}

            {renderNestedReplies(comment.id, allComments, onReplySubmit, onDelete)}
        </Comment>
    );
}

function renderNestedReplies(parentId, allComments, onReplySubmit, onDelete) {
    const replies = allComments.filter(c => c.parent_id === parentId);
    return replies.map(reply => (
        <SingleComment
            key={reply.id}
            comment={reply}
            allComments={allComments}
            onReplySubmit={onReplySubmit}
            onDelete={onDelete}
        />
    ));
}