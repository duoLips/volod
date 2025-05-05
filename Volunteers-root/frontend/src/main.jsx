import React from 'react';
import ReactDOM from 'react-dom/client';
import { SessionProvider } from './context/SessionProvider';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App';
import 'antd/dist/reset.css';
import './styles.css';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';


const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <QueryClientProvider client={queryClient}>
            <SessionProvider>
                <BrowserRouter>
                    <App />
                </BrowserRouter>
            </SessionProvider>
        </QueryClientProvider>
    </React.StrictMode>
);
