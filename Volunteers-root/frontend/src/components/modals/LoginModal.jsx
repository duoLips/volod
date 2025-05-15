import { Modal, Form, Input, Button, Typography, Alert } from 'antd';
import { useState } from 'react';
import API from '../../api/axios.js';
import { useQueryClient } from '@tanstack/react-query';
import { useSession } from '../../context/SessionProvider.jsx';

const { Title } = Typography;

export default function LoginModal({ open, onClose, onOpenRegister }) {
    const queryClient = useQueryClient();
    const [form] = Form.useForm();
    const [mode, setMode] = useState('otp'); // 'otp' or 'password'
    const [step, setStep] = useState('input'); // 'input', 'verify', or 'deleted'
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [deletedEmail, setDeletedEmail] = useState(null);
    const [restoreStep, setRestoreStep] = useState('start'); // 'start' or 'verify'
    const [restoreCode, setRestoreCode] = useState('');
    const { refetchSession } = useSession();
const handleOtpStart = async () => {
    const identifier = form.getFieldValue('identifier');
    try {
        setLoading(true);
        await API.post('/auth/login-otp/start', { identifier });
        setStep('verify');
        setError(null);
    } catch (err) {
        if (
            err.response?.status === 403 &&
            err.response?.data?.message === 'Account is deleted. Please reactivate.'
        ) {
            setDeletedEmail(identifier);
            setStep('deleted');
            setError(null);
            return;
        }
        setError(err.response?.data?.message || 'Не вдалося надіслати код');
    } finally {
        setLoading(false);
    }
};

const handleOtpVerify = async () => {
    const { identifier, code } = form.getFieldsValue();
    try {
        setLoading(true);
        await API.post('/auth/login-otp/verify', { identifier, code });
        await refetchSession();
        onClose();
    } catch (err) {
        if (
            err.response?.status === 403 &&
            err.response?.data?.message === 'Account is deleted.'
        ) {
            setDeletedEmail(identifier);
            setStep('deleted');
            setError(null);
            return;
        }
        setError(err.response?.data?.message || 'Невірний код');
    } finally {
        setLoading(false);
    }
};

const handlePasswordLogin = async () => {
    const { identifier, password } = form.getFieldsValue();
    try {
        setLoading(true);
        await API.post('/auth/login', { identifier, password });
        await refetchSession();
        onClose();
    } catch (err) {
        if (
            err.response?.status === 403 &&
            err.response?.data?.message === 'Account is deleted.'
        ) {
            setDeletedEmail(identifier);
            setStep('deleted');
            setError(null);
            return;
        }
        setError(err.response?.data?.message || 'Помилка входу');
    } finally {
        setLoading(false);
    }
};

const handleRequestRestoreOtp = async () => {
    setLoading(true);
    setError(null);
    try {
        await API.post('/auth/request-restore-otp', { email: deletedEmail });
        setRestoreStep('verify');
    } catch (err) {
        setError(err.response?.data?.message || 'Не вдалося надіслати код');
    } finally {
        setLoading(false);
    }
};

const handleRestoreVerify = async () => {
    setLoading(true);
    setError(null);
    try {
        await API.post('/auth/restore', {
            email: deletedEmail,
            code: restoreCode,
        });
        await refetchSession();
        onClose();
    } catch (err) {
        setError(err.response?.data?.message || 'Невірний код');
    } finally {
        setLoading(false);
    }
};

return (
    <Modal title="Вхід" open={open} onCancel={onClose} footer={null}>
        <Form form={form} layout="vertical">
            {step !== 'deleted' && (
                <>
                    <Form.Item
                        name="identifier"
                        label="Імʼя користувача або e‑mail"
                        rules={[{ required: true, message: 'Обовʼязкове поле' }]}
                    >
                        <Input />
                    </Form.Item>
                </>
            )}

            {mode === 'password' && step === 'input' && (
                <>
                    <Form.Item
                        name="password"
                        label="Пароль"
                        rules={[{ required: true, message: 'Введіть пароль' }]}
                    >
                        <Input.Password />
                    </Form.Item>
                    <Button type="primary" loading={loading} block onClick={handlePasswordLogin}>
                        Увійти
                    </Button>
                </>
            )}

            {mode === 'otp' && step === 'input' && (
                <Button type="primary" loading={loading} block onClick={handleOtpStart}>
                    Надіслати код
                </Button>
            )}

            {mode === 'otp' && step === 'verify' && (
                <>
                    <Form.Item
                        name="code"
                        label="Код з пошти"
                        rules={[{ required: true, message: 'Введіть код' }]}
                    >
                        <Input />
                    </Form.Item>
                    <Button type="primary" loading={loading} block onClick={handleOtpVerify}>
                        Увійти
                    </Button>
                </>
            )}

            {step === 'deleted' && (
                <>
                    <Form.Item
                        label="Електронна пошта для відновлення"
                        name="restoreEmail"
                        rules={[
                            { required: true, message: 'Введіть адресу електронної пошти' },
                            {
                                pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                message: 'Невірний формат e‑mail',
                            },
                        ]}
                    >
                        <Input />
                    </Form.Item>

                    {restoreStep === 'start' && (
                        <Button
                            type="primary"
                            loading={loading}
                            block
                            onClick={async () => {
                                const email = form.getFieldValue('restoreEmail');
                                if (!email) return;

                                setLoading(true);
                                setError(null);
                                try {
                                    await API.post('/auth/request-restore-otp', { email });
                                    setDeletedEmail(email);
                                    setRestoreStep('verify');
                                } catch (err) {
                                    setError(err.response?.data?.message || 'Не вдалося надіслати код, спробуйте через годину');
                                } finally {
                                    setLoading(false);
                                }
                            }}
                        >
                            Надіслати код для відновлення акаунта
                        </Button>
                    )}

                    {restoreStep === 'verify' && (
                        <>
                            <Form.Item label="Код з пошти">
                                <Input
                                    value={restoreCode}
                                    onChange={(e) => {
                                        setRestoreCode(e.target.value);
                                        setError(null);
                                    }}
                                />
                            </Form.Item>
                            <Button
                                type="primary"
                                loading={loading}
                                block
                                onClick={async () => {
                                    setLoading(true);
                                    setError(null);
                                    try {
                                        await API.post('/auth/restore', {
                                            email: deletedEmail,
                                            code: restoreCode,
                                        });
                                        await refetchSession();
                                        onClose();
                                    } catch (err) {
                                        setError(err.response?.data?.message || 'Невірний код');
                                    } finally {
                                        setLoading(false);
                                    }
                                }}
                            >
                                Відновити акаунт
                            </Button>
                        </>
                    )}
                </>
            )}


            {step !== 'deleted' && (
                <>
                    <Button
                        type="link"
                        style={{ marginTop: 10, padding: 0 }}
                        onClick={() => {
                            setMode(prev => (prev === 'otp' ? 'password' : 'otp'));
                            setStep('input');
                            setError(null);
                            form.resetFields(['password', 'code']);
                        }}
                    >
                        {mode === 'otp' ? 'Увійти за паролем' : 'Увійти без паролю'}
                    </Button>

                    <Button
                        type="link"
                        style={{ marginTop: 0, padding: 0, marginLeft: '20px' }}
                        onClick={() => {
                            onClose();
                            onOpenRegister();
                        }}
                    >
                        Зареєструватися
                    </Button>
                </>
            )}

            {error && <Alert type="error" message={error} showIcon style={{ marginTop: 12 }} />}
        </Form>
    </Modal>
);
}
