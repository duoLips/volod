import { Form, Input, Button, message } from 'antd';
import API from '../api/axios';

export default function ContactForm() {
    const [form] = Form.useForm();

    const handleSubmit = async (values) => {
        try {
            await API.post('/otp', values);
            message.success('Повідомлення надіслано!');
            form.resetFields();
        } catch (err) {
            message.error(err.response?.data?.message || 'Не вдалося надіслати повідомлення');
        }
    };

    return (
        <Form
            layout="vertical"
            form={form}
            onFinish={handleSubmit}
            style={{ maxWidth: 600, margin: '0 auto' }}
        >
            <Form.Item
                label="Ваше імʼя"
                name="name"
                rules={[{ required: true, message: 'Введіть імʼя' }]}
            >
                <Input />
            </Form.Item>

            <Form.Item
                label="Електронна пошта"
                name="email"
                rules={[
                    { required: true, message: 'Введіть e‑mail' },
                    {
                        pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                        message: 'Невірний формат e‑mail',
                    },
                ]}
            >
                <Input />
            </Form.Item>

            <Form.Item
                label="Повідомлення"
                name="message"
                rules={[{ required: true, message: 'Напишіть щось' }]}
            >
                <Input.TextArea rows={5} />
            </Form.Item>

            <Form.Item>
                <Button type="primary" htmlType="submit">
                    Надіслати
                </Button>
            </Form.Item>
        </Form>
    );
}
