import { useEffect, useState } from 'react';
import { Form, Input, Button, message, Tag } from 'antd';
import API from '../../api/axios';
import { refreshSession } from '../../api/session';
import { useSession } from '../../context/SessionProvider.jsx';

export default function UpdateProfileForm() {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(true);
    const [initialData, setInitialData] = useState({});
    const [changedFields, setChangedFields] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const { refetchSession } = useSession();

    useEffect(() => {
        API.get('/users/me')
            .then((res) => {
                const data = res.data;
                const formattedPhone = String(data.phone || '').replace(/^\+?380/, '');


                const normalizedData = {
                    firstName: data.first_name,
                    lastName: data.last_name,
                    username: data.username,
                    phone: formattedPhone,
                    address: data.address
                };
                setInitialData(normalizedData);
                form.setFieldsValue(normalizedData);
                setLoading(false);
            })
            .catch(() => {
                message.error('Не вдалося завантажити профіль');
                setLoading(false);
            });
    }, []);

    const onValuesChange = (_, allValues) => {
        const changed = {};
        for (const key in allValues) {
            if (allValues[key] !== initialData[key]) {
                changed[key] = allValues[key];
            }
        }
        setChangedFields(changed);
    };

    const onFinish = async () => {
        if (Object.keys(changedFields).length === 0) return;

        setSubmitting(true);
        try {
            const payload = { ...changedFields };
            if (payload.phone) {
                payload.phone = `+380${payload.phone}`;
            }

            await API.patch('/users/profile', payload);
            await refreshSession();
            refetchSession();
            setSuccessMessage('Профіль успішно оновлено');
            setChangedFields({});
        } catch (err) {
            const msg = err.response?.data?.message;

            if (msg?.toLowerCase().includes('username')) {
                form.setFields([{ name: 'username', errors: [msg] }]);
            } else if (msg?.toLowerCase().includes('phone')) {
                form.setFields([{ name: 'phone', errors: [msg] }]);
            } else {
                message.error(msg || 'Помилка при оновленні профілю');
            }
        } finally {
            setSubmitting(false);
        }
    };

    const isSaveDisabled =
        Object.keys(changedFields).length === 0 ||
        submitting ||
        !form.isFieldsTouched(true) ||
        form.getFieldsError().some(({ errors }) => errors.length > 0);

    return (
        <Form
            form={form}
            layout="vertical"
            onValuesChange={onValuesChange}
            onFinish={onFinish}
        >
            {successMessage && (
                <div style={{ marginBottom: 16 }}>
                    <Tag color="green">{successMessage}</Tag>
                </div>
            )}

            <Form.Item label="Імʼя" name="firstName">
                <Input />
            </Form.Item>

            <Form.Item label="Прізвище" name="lastName">
                <Input />
            </Form.Item>

            <Form.Item label="Імʼя користувача" name="username">
                <Input />
            </Form.Item>

            <Form.Item label="Адреса" name="address">
                <Input />
            </Form.Item>

            <Form.Item
                label="Телефон"
                name="phone"
                rules={[
                    {
                        pattern: /^\d{9}$/,
                        message: 'Введіть 9 цифр після +380',
                    },
                ]}
            >
                <Input
                    addonBefore="+380"
                    maxLength={9}
                    onChange={(e) => {
                        const onlyDigits = e.target.value.replace(/\D/g, '').slice(0, 9);
                        form.setFieldValue('phone', onlyDigits);
                    }}
                />
            </Form.Item>

            <Form.Item>
                <Button
                    type="primary"
                    htmlType="submit"
                    disabled={isSaveDisabled}
                    loading={submitting}
                >
                    Зберегти
                </Button>
            </Form.Item>
        </Form>
    );
}
