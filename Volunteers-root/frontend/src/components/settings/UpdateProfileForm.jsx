import { useEffect, useState, useCallback } from 'react';
import { Form, Input, Button, message, Spin, Tag } from 'antd';
import {
    CheckCircleOutlined,
    CloseCircleOutlined,
    LoadingOutlined,
} from '@ant-design/icons';
import debounce from 'lodash.debounce';
import API from '../../api/axios';

export default function UpdateProfileForm() {
    const [form] = Form.useForm();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [formStatus, setFormStatus] = useState(null); // 'success' | 'error'
    const [checkingUsername, setCheckingUsername] = useState(false);
    const [usernameAvailable, setUsernameAvailable] = useState(null);
    const [currentUsername, setCurrentUsername] = useState('');

    useEffect(() => {
        async function loadUser() {
            try {
                const res = await API.get('/users/me');
                setUser(res.data);
                setCurrentUsername(res.data.username);
                form.setFieldsValue({
                    firstName: res.data.first_name,
                    lastName: res.data.last_name,
                    username: res.data.username,
                    address: res.data.address,
                    phone: res.data.phone,
                });
            } catch {
                message.error('Не вдалося завантажити дані користувача');
            } finally {
                setLoading(false);
            }
        }

        loadUser();
    }, [form]);

    const checkUsernameAvailability = useCallback(
        debounce(async (value) => {
            if (!value || value === currentUsername) {
                setUsernameAvailable(null);
                return;
            }

            const isValid = /^[a-zA-Z0-9._]{5,20}$/.test(value);
            if (!isValid) {
                setUsernameAvailable(null); // don't flag it as taken if just invalid
                return;
            }

            setCheckingUsername(true);
            try {
                const res = await API.get(`/auth/available/${value}`);
                setUsernameAvailable(!res.data.exists);
            } catch {
                setUsernameAvailable(false);
            } finally {
                setCheckingUsername(false);
                form.validateFields(['username']); // retrigger validation after async check
            }
        }, 400),
        [currentUsername, form]
    );


    const handleSubmit = async (current) => {
        if (!user) return;

        for (const [key, value] of Object.entries(current)) {
            if (!`${value || ''}`.trim()) {
                message.error(`Поле "${key}" не може бути порожнім`);
                return;
            }
        }

        if (
            current.username !== currentUsername &&
            (!/^[a-zA-Z0-9._]{5,20}$/.test(current.username) || usernameAvailable === false)
        ) {
            message.error('Імʼя користувача недоступне або некоректне');
            return;
        }

        const original = {
            firstName: user.first_name || '',
            lastName: user.last_name || '',
            username: user.username || '',
            address: user.address || '',
            phone: user.phone || '',
        };

        const updates = {};
        for (const key in current) {
            if ((current[key] || '') !== (original[key] || '')) {
                updates[key] = current[key];
            }
        }

        if (Object.keys(updates).length === 0) {
            setFormStatus('error');
            message.error('Зміни не виявлено. Поля залишилися без змін.');
            return;
        }

        try {
            await API.patch('/users/profile', updates);
            setFormStatus('success');
            message.success('Зміни збережено');

            const updated = await API.get('/users/me');
            setUser(updated.data);
            setCurrentUsername(updated.data.username);
            form.setFieldsValue({
                firstName: updated.data.first_name,
                lastName: updated.data.last_name,
                username: updated.data.username,
                address: updated.data.address,
                phone: updated.data.phone,
            });
        } catch (err) {
            setFormStatus('error');
            message.error(err.response?.data?.message || 'Помилка оновлення профілю');
        }
    };

    if (loading) {
        return (
            <div style={{ padding: '4rem 0', textAlign: 'center' }}>
                <Spin tip="Завантаження профілю..." />
            </div>
        );
    }
    const isEmpty = (name) => !form.getFieldValue(name)?.trim();

    return (
        <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            requiredMark={false}
            onValuesChange={(changed) => {
                if (changed.username !== undefined) {
                    checkUsernameAvailability(changed.username);
                }
            }}
        >
            <div style={{ margin: 16 }}>
                {formStatus === 'success' && (
                    <Tag icon={<CheckCircleOutlined />} color="success">
                        Зміни збережено
                    </Tag>
                )}
                {formStatus === 'error' && (
                    <Tag icon={<CloseCircleOutlined />} color="error">
                        Помилка збереження
                    </Tag>
                )}
            </div>

            <Form.Item name="firstName" label="Імʼя" rules={[{ required: true, message: 'Це поле не може бути пустим' }]}>
                <Input />
            </Form.Item>
            <Form.Item name="lastName" label="Прізвище" rules={[{ required: true, message: 'Це поле не може бути пустим' }]}>
                <Input />
            </Form.Item>

            <Form.Item
                name="username"
                label="Імʼя користувача"
                rules={[
                    { required: true, message: " "},
                    { whitespace: true, message: 'Це поле не може бути пустим' },
                    {
                        validator(_, value) {
                            if (!value) return Promise.reject('Це поле не може бути пустим');
                            if (!/^[a-zA-Z0-9._]{5,20}$/.test(value)) {
                                return Promise.reject('Має містити 5–20 символів');
                            }
                            if (usernameAvailable === false) {
                                return Promise.reject('Це імʼя вже зайняте');
                            }
                            return Promise.resolve();
                        },
                    },
                ]}
                validateTrigger={['onChange', 'onBlur']}
            >
            <Input
                    suffix={
                        checkingUsername ? (
                            <LoadingOutlined style={{ color: '#1890ff' }} />
                        ) : usernameAvailable === true ? (
                            <CheckCircleOutlined style={{ color: '#52c41a' }} />
                        ) : usernameAvailable === false ? (
                            <CloseCircleOutlined style={{ color: '#ff4d4f' }} />
                        ) : null
                    }
                />
            </Form.Item>


            <Form.Item name="address" label="Адреса" rules={[{ required: true, message: 'Це поле не може бути пустим' }]}>
                <Input />
            </Form.Item>

            <Form.Item name="phone" label="Телефон" rules={[{ required: true, message: 'Це поле не може бути пустим' }]}>
                <Input />
            </Form.Item>

            <Button type="primary" htmlType="submit">
                Зберегти зміни
            </Button>
        </Form>
    );
}
