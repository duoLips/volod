import React from 'react';
import ReactDOM from 'react-dom/client';
import { ConfigProvider } from 'antd';
import { SessionProvider } from './context/SessionProvider';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App';
import 'antd/dist/reset.css';

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <ConfigProvider
            theme={{
                token: {
                    fontFamily: 'Jura, sans-serif',
                    colorPrimary: '#0F3E98',
                    colorPrimaryHover: '#0F3E98',
                    colorPrimaryActive: '#0F3E9833',
                },
            }}
        >
        <QueryClientProvider client={queryClient}>
                <SessionProvider>
                    <BrowserRouter>
                        <App />
                    </BrowserRouter>
                </SessionProvider>
            </QueryClientProvider>
        </ConfigProvider>
    </React.StrictMode>
);
