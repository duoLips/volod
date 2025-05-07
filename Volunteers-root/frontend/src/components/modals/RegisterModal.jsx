import { Modal, Form, Input, Button, Alert, Typography } from 'antd';
import { useState, useEffect } from 'react';
import API from '../../api/axios.js';
import { useSession } from '../../context/SessionProvider.jsx';

const { Title } = Typography;

export default function RegisterModal({ open, onClose }) {
    const [form] = Form.useForm();
    const [otpSent, setOtpSent] = useState(false);
    const [otpVerified, setOtpVerified] = useState(false);
    const [checkingUsername, setCheckingUsername] = useState(false);
    const [usernameError, setUsernameError] = useState(null);
    const [otpError, setOtpError] = useState(null);
    const [registerError, setRegisterError] = useState(null);
    const { refetchSession } = useSession();

    // Frontend username format validation
    const isValidUsernameFormat = (username) => {
        const re = /^[a-zA-Z0-9._]{5,20}$/;
        return re.test(username);
    };

    // Live check username availability
    const checkUsername = async (username) => {
        setUsernameError(null);
        if (!username) return;

        if (!isValidUsernameFormat(username)) {
            setUsernameError('Імʼя користувача повинно містити 5–20 символів: літери, цифри, ".", "_"');
            return;
        }

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
    };

    // Send OTP
    const handleSendOtp = async () => {
        const email = form.getFieldValue('email');
        setOtpError(null);
        try {
            await API.post('/otp/new', { email });
            setOtpSent(true);
        } catch (err) {
            setOtpError(err.response?.data?.message || 'Не вдалося надіслати код');
        }
    };

    // Verify OTP
    const handleVerifyOtp = async () => {
        const { email, otp } = form.getFieldsValue();
        setOtpError(null);
        try {
            await API.post('/otp/verify', { email, code: otp });
            setOtpVerified(true);
        } catch (err) {
            setOtpError(err.response?.data?.message || 'Код недійсний');
        }
    };

    const handleSubmit = async () => {
        try {
            const values = form.getFieldsValue();
            const body = {
                firstName: values.firstName,
                lastName: values.lastName,
                username: values.username || null,
                email: values.email,
                password: values.password,
                address: values.address || null
            };
            await API.post('/auth/register', body);
            await refetchSession();
            onClose();
        } catch (err) {
            setRegisterError(err.response?.data?.message || 'Не вдалося зареєструватися');
        }
    };

    return (
        <Modal title="Реєстрація" open={open} onCancel={onClose} footer={null}>
            <Form layout="vertical" form={form}>
                <Form.Item
                    name="email"
                    label="Електронна пошта"
                    rules={[{ required: true, type: 'email', message: 'Введіть дійсний email' }]}
                >
                    <Input disabled={otpVerified} />
                </Form.Item>

                {!otpVerified && (
                    <>
                        <div style={{ display: 'flex', gap: 8 }}>
                            <Button onClick={handleSendOtp}>Надіслати код</Button>
                            <Form.Item name="otp" noStyle rules={[{ required: true, message: 'Введіть код' }]}>
                                <Input placeholder="Код" style={{ flex: 1 }} />
                            </Form.Item>
                            <Button type="primary" onClick={handleVerifyOtp}>Підтвердити</Button>
                        </div>
                        {otpError && <Alert type="error" message={otpError} showIcon style={{ marginTop: 8 }} />}
                    </>
                )}

                {otpVerified && (
                    <>
                        <Form.Item
                            name="firstName"
                            label="Імʼя"
                            rules={[{ required: true, message: 'Обовʼязкове поле' }]}
                        >
                            <Input />
                        </Form.Item>

                        <Form.Item
                            name="lastName"
                            label="Прізвище"
                            rules={[{ required: true, message: 'Обовʼязкове поле' }]}
                        >
                            <Input />
                        </Form.Item>

                        <Form.Item
                            name="username"
                            label="Імʼя користувача (необовʼязково)"
                            hasFeedback
                            validateStatus={usernameError ? 'error' : ''}
                            help={usernameError}
                        >
                            <Input onBlur={(e) => checkUsername(e.target.value)} />
                        </Form.Item>

                        <Form.Item
                            name="password"
                            label="Пароль"
                            rules={[
                                { required: true, message: 'Введіть пароль' },
                                { min: 8, message: 'Пароль повинен містити щонайменше 8 символів' }
                            ]}
                        >
                            <Input.Password />
                        </Form.Item>


                        <Form.Item
                            name="address"
                            label="Адреса"
                        >
                            <Input />
                        </Form.Item>

                        <Button
                            type="primary"
                            block
                            onClick={handleSubmit}
                            disabled={usernameError || checkingUsername}
                        >
                            Зареєструватися
                        </Button>

                        {registerError && <Alert type="error" message={registerError} showIcon style={{ marginTop: 12 }} />}
                    </>
                )}
            </Form>
        </Modal>
    );
}
