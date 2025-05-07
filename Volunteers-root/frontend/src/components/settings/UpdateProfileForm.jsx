import { useEffect, useState } from 'react';
import { Form, Input, Button, message, Tag } from 'antd';
import debounce from 'lodash.debounce';
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
    const [usernameError, setUsernameError] = useState(null);
    const [checkingUsername, setCheckingUsername] = useState(false);
    const [isTouched, setIsTouched] = useState(false);
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

    const checkUsername = debounce(async (username) => {
        if (!username) {
            setUsernameError('Поле не може бути порожнім');
            return;
        }
        if (!/^[A-Za-z0-9._]{5,20}$/.test(username)) {
            setUsernameError('Імʼя користувача повинно містити 5–20 символів: літери, цифри, ".", "_"');
            return;
        }

        setUsernameError(null);
        if (username === initialData.username) return;

        setCheckingUsername(true);
        try {
            const { data } = await API.get(`/auth/available/${username}`);
            if (data.exists) {
                setUsernameError('Це імʼя вже зайнято');
            }
        } catch (err) {
            setUsernameError(err.response?.data?.message || 'Помилка перевірки');
        } finally {
            setCheckingUsername(false);
        }
    }, 500);

    const onValuesChange = (_, allValues) => {
        const changed = {};
        let touched = false;

        for (const key in allValues) {
            if (allValues[key] !== initialData[key]) {
                changed[key] = allValues[key];
                touched = true;
            }
        }
        setIsTouched(touched);
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
            setIsTouched(false);
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
    const anyRequiredChangedFieldIsEmpty = Object.entries(changedFields).some(
        ([key, value]) =>
            ['firstName', 'lastName', 'username', 'address', 'phone'].includes(key) &&
            (value === undefined || value === null || value === '')
    );
    const hasFormErrors = form.getFieldsError().some(({ errors }) => errors.length > 0);
    const isSaveDisabled =
        !isTouched ||
        submitting ||
        hasFormErrors ||
        checkingUsername ||
        !!usernameError ||
        anyRequiredChangedFieldIsEmpty;


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

            <Form.Item
                label="Імʼя"
                name="firstName"
                rules={[
                    ({ getFieldValue }) => ({
                        validator(_, value) {
                            if (value || initialData.firstName === '') return Promise.resolve();
                            return Promise.reject('Поле не може бути порожнім');
                        },
                    }),
                ]}
            >
                <Input />
            </Form.Item>

            <Form.Item
                label="Прізвище"
                name="lastName"
                rules={[
                    ({ getFieldValue }) => ({
                        validator(_, value) {
                            if (value || initialData.lastName === '') return Promise.resolve();
                            return Promise.reject('Поле не може бути порожнім');
                        },
                    }),
                ]}
            >
                <Input />
            </Form.Item>

            <Form.Item
                label="Імʼя користувача"
                name="username"
                validateStatus={usernameError ? 'error' : checkingUsername ? 'validating' : ''}
                help={usernameError || ''}
                rules={[
                    {
                        pattern: /^[A-Za-z0-9._]{5,20}$/,
                        message: '5–20 символів: букви, цифри, ".", "_"',
                    },
                    ({ getFieldValue }) => ({
                        validator(_, value) {
                            if (value || initialData.username === '') return Promise.resolve();
                            return Promise.reject('Поле не може бути порожнім');
                        },
                    }),
                ]}
            >
                <Input onChange={(e) => checkUsername(e.target.value)} />
            </Form.Item>

            <Form.Item
                label="Адреса"
                name="address"
                rules={[
                    ({ getFieldValue }) => ({
                        validator(_, value) {
                            if (value || initialData.address === '') return Promise.resolve();
                            return Promise.reject('Поле не може бути порожнім');
                        },
                    }),
                ]}
            >
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
                    ({ getFieldValue }) => ({
                        validator(_, value) {
                            if (value || initialData.phone === '') return Promise.resolve();
                            return Promise.reject('Поле не може бути порожнім');
                        },
                    }),
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
