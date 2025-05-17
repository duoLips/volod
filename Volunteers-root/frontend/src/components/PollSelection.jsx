import { useEffect, useState } from 'react';
import { useSession } from '../context/SessionProvider.jsx';
import { Card, Radio, Button, Typography, Space, message } from 'antd';
import API from '../api/axios';

const { Title, Text } = Typography;

export default function PollSection({ entityType, entityId }) {
    const [poll, setPoll] = useState(null);
    const [selected, setSelected] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const { session } = useSession();
    const fetchPoll = async () => {
        setLoading(true);
        try {
            const res = await API.get(`/poll?entityType=${entityType}&entityId=${entityId}`);
            setPoll(res.data);
            setSelected(res.data?.userVote || null);
        } catch {
            setPoll(null);
        } finally {
            setLoading(false);
        }
    };

    const handleVote = async () => {
        if (!selected) return;

        setSubmitting(true);
        try {
            await API.post('/poll/vote', {
                pollId: poll.id,
                optionId: selected
            });
            message.success('Ваш голос зараховано');
            fetchPoll();
        } catch (err) {
            message.error(err.response?.data?.message || 'Помилка голосування');
        } finally {
            setSubmitting(false);
        }
    };

    useEffect(() => {
        fetchPoll();
    }, [entityType, entityId]);

    if (loading || !poll) return null;

    return (
        <Card style={{ marginTop: 32 }}>
            <Title level={5}>{poll.question}</Title>

            {poll.userVote ? (
                <Space direction="vertical">
                    {poll.options.map(opt => (
                        <Text key={opt.id}>
                            • {opt.text} — <strong>{opt.votes}</strong> голосів
                        </Text>
                    ))}
                </Space>
            ) : (
                <>
                    <Radio.Group
                        onChange={e => setSelected(e.target.value)}
                        value={selected}
                        style={{ display: 'flex', flexDirection: 'column', gap: 8 }}
                    >
                        {poll.options.map(opt => (
                            <Radio key={opt.id} value={opt.id}>
                                {opt.text}
                            </Radio>
                        ))}
                    </Radio.Group>
                    {session?.authenticated && (
                        <Button
                            type="link"
                            size="small"
                            onClick={() => handleVote(option.id)}
                            disabled={poll.userVote !== null}
                        >
                            Голосувати
                        </Button>
                    )}
                </>
            )}
        </Card>
    );
}
