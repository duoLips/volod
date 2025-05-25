import { useEffect, useState } from 'react';
import { useSession } from '../context/SessionProvider.jsx';
import { Card, Button, Typography, Space, message } from 'antd';
import API from '../api/axios';
import LoginModal from "./modals/LoginModal.jsx";
import RegisterModal from "./modals/RegisterModal.jsx";

const { Title, Text } = Typography;

export default function PollSection({ entityType, entityId, onLoginClick }) {
    const [poll, setPoll] = useState(null);
    const [loginOpen, setLoginOpen] = useState(false);
    const [registerOpen, setRegisterOpen] = useState(false);
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
                optionId: selected,
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

    const totalVotes = poll.options.reduce((sum, o) => sum + o.votes, 0);
    const isVoted = poll.userVote !== null;
    const canVote = session?.authenticated && !isVoted;

    return (
        <div style={{ margin: 0, padding: 10, background: '#0F3E9833' }}>
            <Title level={4} style={{ color: 'black' }}>{poll.question}</Title>

            <Space direction="vertical" style={{ width: '100%' }} size={6}>
                {poll.options.map(opt => {
                    const percent = totalVotes ? (opt.votes / totalVotes) * 100 : 0;
                    const isSelected = selected === opt.id;

                    return (
                        <div
                            key={opt.id}
                            onClick={() => canVote && setSelected(opt.id)}
                            style={{
                                cursor: canVote ? 'pointer' : 'default',
                                border: `1px solid ${isSelected ? '#0F3E98' : '#d9d9d9'}`,
                                borderRadius: 6,
                                padding: "0px 10px 0px 10px",
                                transition: 'all 0.2s',
                                background: isSelected ? '#E6EDF9' : '#fff',
                            }}
                        >
                            <div style={{ fontWeight: 500, marginBottom: 4 }}>{opt.text}</div>
                            <div style={{
                                height: 8,
                                background: '#E6EDF9',
                                borderRadius: 4,
                                overflow: 'hidden',
                            }}>
                                <div
                                    style={{
                                        height: '100%',
                                        width: `${percent}%`,
                                        background: '#0F3E98',
                                        transition: 'width 0.4s ease',
                                    }}
                                />
                            </div>
                            <Text type="secondary" style={{ fontSize: 12 }}>
                                {opt.votes} голосів ({percent.toFixed(1)}%)
                            </Text>
                        </div>
                    );
                })}
            </Space>

            {session?.authenticated ? (
                !isVoted && (
                    <Button
                        type="primary"
                        onClick={handleVote}
                        loading={submitting}
                        disabled={!selected}
                        style={{ marginTop: 16, background: '#0F3E98', borderColor: '#0F3E98' }}
                    >
                        Голосувати
                    </Button>
                )
            ) : (
                <div>
                    <Button
                        type="link"
                        onClick={() => setLoginOpen(true)}
                    >
                        Увійдіть, щоб проголосувати
                    </Button>

                    <LoginModal
                        open={loginOpen}
                        onClose={() => setLoginOpen(false)}
                        onOpenRegister={() => {
                            setLoginOpen(false);
                            setRegisterOpen(true);
                        }}
                    />
                    <RegisterModal open={registerOpen} onClose={() => setRegisterOpen(false)} />
                </div>
            )}
        </div>
    );
}
