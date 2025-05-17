import {
    Table, Input, Select, DatePicker, Space, Typography, Row, Col,
    Card, Statistic, Tag, Button, Modal, message
} from 'antd';

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../api/axios';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;
const { Title } = Typography;

export default function AdminCommentsTable() {
    const [stats, setStats] = useState({});
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchUser, setSearchUser] = useState('');
    const [entityType, setEntityType] = useState('');
    const [dateRange, setDateRange] = useState([]);
    const [users, setUsers] = useState([]);
    const [userLoading, setUserLoading] = useState(true);
    const [confirmModal, setConfirmModal] = useState({
        visible: false,
        type: null,     // 'ban' | 'unban' | 'delete'
        userId: null,
    });

    const navigate = useNavigate();

    useEffect(() => {
        fetchComments();
        fetchStats();
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setUserLoading(true);
        try {
            const res = await API.get('/users');
            setUsers(res.data.data || []);
        } catch {
            setUsers([]);
        } finally {
            setUserLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const { data } = await API.get('/admin/stats');
            setStats(data);
        } catch {
            message.error('Не вдалося завантажити статистику');
        }
    };

    const fetchComments = async () => {
        setLoading(true);
        try {
            const res = await API.get('/comments/admin/all');
            setComments(res.data.comments || []);
        } catch {
            setComments([]);
        } finally {
            setLoading(false);
        }
    };

    const filteredData = comments.filter((c) => {
        const matchesUser =
            !searchUser ||
            c.username.toLowerCase().includes(searchUser.toLowerCase()) ||
            c.firstName?.toLowerCase().includes(searchUser.toLowerCase()) ||
            c.lastName?.toLowerCase().includes(searchUser.toLowerCase());

        const matchesEntity = !entityType || c.entity_type === entityType;

        const matchesDate =
            !dateRange.length ||
            (dayjs(c.created_at).isAfter(dayjs(dateRange[0])) &&
                dayjs(c.created_at).isBefore(dayjs(dateRange[1]).endOf('day')));

        return matchesUser && matchesEntity && matchesDate;
    });
    const handleBan = async (id) => {
        try {
            await API.patch(`/users/${id}/ban`);
            message.success('Користувача заблоковано');
            fetchUsers();
        } catch {
            message.error('Не вдалося заблокувати');
        }
    };

    const handleUnban = async (id) => {
        try {
            await API.patch(`/users/${id}/unban`);
            message.success('Користувача розблоковано');
            fetchUsers();
        } catch {
            message.error('Не вдалося розблокувати');
        }
    };

    const handleDelete = async (id) => {
        try {
            await API.delete(`/users/${id}`);
            message.success('Користувача видалено');
            fetchUsers();
        } catch {
            message.error('Не вдалося видалити');
        }
    };


    const columns = [
        {
            title: 'Користувач',
            dataIndex: 'username',
            key: 'username',
            render: (_, r) => `${r.firstName || ''} ${r.lastName || ''} (@${r.username})`,
        },
        {
            title: 'Тип',
            dataIndex: 'entity_type',
            key: 'entity_type',
            filters: [
                { text: 'Новини', value: 'news' },
                { text: 'Аукціони', value: 'auction' },
                { text: 'Звіти', value: 'report' },
            ],
            onFilter: (value, record) => record.entity_type === value,
        },
        {
            title: 'ID сутності',
            dataIndex: 'entity_id',
            key: 'entity_id',
        },
        {
            title: 'Текст',
            dataIndex: 'body',
            key: 'body',
            render: (text) => <span style={{ whiteSpace: 'pre-wrap' }}>{text}</span>,
        },
        {
            title: 'Дата',
            dataIndex: 'created_at',
            key: 'created_at',
            sorter: (a, b) => dayjs(a.created_at).unix() - dayjs(b.created_at).unix(),
            render: (val) => dayjs(val).format('DD.MM.YYYY HH:mm'),
        },
    ];

    const userColumns = [
        { title: 'ID', dataIndex: 'id', sorter: (a, b) => a.id - b.id },
        { title: 'Імʼя', dataIndex: 'firstName', sorter: (a, b) => a.firstName?.localeCompare(b.firstName) },
        { title: 'Прізвище', dataIndex: 'lastName', sorter: (a, b) => a.lastName?.localeCompare(b.lastName) },
        { title: 'Username', dataIndex: 'username', sorter: (a, b) => a.username.localeCompare(b.username) },
        { title: 'Email', dataIndex: 'email', sorter: (a, b) => a.email.localeCompare(b.email) },
        { title: 'Телефон', dataIndex: 'phone' },
        { title: 'Адреса', dataIndex: 'address' },
        {
            title: 'Дата створення',
            dataIndex: 'created_at',
            sorter: (a, b) => dayjs(a.created_at).unix() - dayjs(b.created_at).unix(),
            render: (val) => dayjs(val).format('DD.MM.YYYY HH:mm'),
        },
        {
            title: 'Стан',
            key: 'status',
            render: (_, record) => {
                if (record.deleted_at) {
                    return <Tag color="default">Видалено</Tag>;
                } else if (record.banned_at) {
                    return <Tag color="orange">Заблоковано</Tag>;
                } else {
                    return <Tag color="green">Активний</Tag>;
                }
            },
            sorter: (a, b) => {
                const getPriority = (u) => u.deleted_at ? 3 : u.banned_at ? 2 : 1;
                return getPriority(a) - getPriority(b);
            }
        }
        ,
        {
            title: 'Дії',
            render: (_, record) => (
                <Space>
                    {record.banned_at ? (
                        <Button
                            size="small"
                            onClick={(e) => {
                                e.stopPropagation();
                                setConfirmModal({ visible: true, type: 'unban', userId: record.id });
                            }}
                        >
                            Розблокувати
                        </Button>
                    ) : (
                        <Button
                            size="small"
                            danger
                            onClick={(e) => {
                                e.stopPropagation();
                                setConfirmModal({ visible: true, type: 'ban', userId: record.id });
                            }}
                        >
                            Заблокувати
                        </Button>
                    )}
                    <Button
                        size="small"
                        danger
                        onClick={(e) => {
                            e.stopPropagation();
                            setConfirmModal({ visible: true, type: 'delete', userId: record.id });
                        }}
                    >
                        Видалити
                    </Button>
                </Space>
            )
        }
    ];

    return (
        <>
            <Row gutter={16} style={{ marginBottom: 24 }}>
                <Col span={8}><Card><Statistic title="Користувачі" value={stats.users} /></Card></Col>
                <Col span={8}><Card><Statistic title="Коментарі" value={stats.comments} /></Card></Col>
                <Col span={8}><Card><Statistic title="Звіти" value={stats.reports} /></Card></Col>
            </Row>

            <Title level={4}>Коментарі</Title>
            <Space style={{ marginBottom: 16 }} wrap>
                <Input
                    placeholder="Пошук користувача"
                    value={searchUser}
                    onChange={(e) => setSearchUser(e.target.value)}
                    allowClear
                />
                <Select
                    placeholder="Тип сутності"
                    value={entityType}
                    onChange={setEntityType}
                    allowClear
                    options={[
                        { value: 'news', label: 'Новини' },
                        { value: 'auction', label: 'Аукціони' },
                        { value: 'report', label: 'Звіти' },
                    ]}
                    style={{ width: 160 }}
                />
                <RangePicker
                    value={dateRange}
                    onChange={(val) => setDateRange(val || [])}
                    allowClear
                />
            </Space>
            <Table
                dataSource={filteredData}
                columns={columns}
                loading={loading}
                rowKey="id"
                scroll={{ x: true }}
                onRow={(record) => ({
                    onClick: () =>
                        navigate(
                            `/${record.entity_type === 'news' ? 'news' : record.entity_type === 'auction' ? 'auctions' : 'reports'}/${record.entity_id}`
                        )
                })}
                rowClassName="clickable-row"
                style={{ cursor: 'pointer' }}
            />

            <Title level={4} style={{ marginTop: 40 }}>Користувачі</Title>
            <Table
                dataSource={Array.isArray(users) ? users : []}
                columns={userColumns}
                loading={userLoading}
                rowKey="id"
                scroll={{ x: true }}
            />
            <Modal
                open={confirmModal.visible}
                onCancel={() => setConfirmModal({ visible: false })}
                onOk={async () => {
                    const { type, userId } = confirmModal;
                    if (type === 'ban') await handleBan(userId);
                    if (type === 'unban') await handleUnban(userId);
                    if (type === 'delete') await handleDelete(userId);
                    setConfirmModal({ visible: false });
                }}
                okText="Так"
                cancelText="Скасувати"
                title="Підтвердити дію"
            >
                Ви впевнені, що хочете {confirmModal.type === 'delete'
                ? 'видалити'
                : confirmModal.type === 'ban'
                    ? 'заблокувати'
                    : 'розблокувати'} користувача?
            </Modal>

        </>
    );
}
