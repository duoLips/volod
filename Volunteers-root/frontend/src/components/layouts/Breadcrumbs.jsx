import { Breadcrumb } from 'antd';
import { Link, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { breadcrumbMap } from './breadcrumbMap';
import API from '../../api/axios';

export default function Breadcrumbs() {
    const location = useLocation();
    const [dynamicLabel, setDynamicLabel] = useState(null);

    const pathSnippets = location.pathname.split('/').filter(Boolean);

    useEffect(() => {
        const loadDynamic = async () => {
            const id = pathSnippets[1];
            const type = pathSnippets[0];
            if (!id || !['news', 'auctions', 'reports'].includes(type)) return;

            try {
                const res = await API.get(`/${type}/${id}`);
                const title = res.data?.title || `ID: ${id}`;
                setDynamicLabel(title);
            } catch {
                setDynamicLabel('Не знайдено');
            }
        };

        if (pathSnippets.length === 2) {
            loadDynamic();
        }
    }, [location.pathname]);

    const breadcrumbs = [
        { path: '/', label: breadcrumbMap['/'] },
        ...pathSnippets.map((segment, index) => {
            const url = '/' + pathSnippets.slice(0, index + 1).join('/');
            const isLast = index === pathSnippets.length - 1;

            const staticLabel = breadcrumbMap[url];
            const label = isLast && dynamicLabel ? dynamicLabel : staticLabel || decodeURIComponent(segment);

            return { path: url, label };
        }),
    ];

    return (
        <Breadcrumb style={{ marginTop:30}}>
            {breadcrumbs.map((crumb, idx) => (
                <Breadcrumb.Item key={crumb.path}>
                    {idx !== breadcrumbs.length - 1 ? (
                        <Link to={crumb.path}>{crumb.label}</Link>
                    ) : (
                        crumb.label
                    )}
                </Breadcrumb.Item>
            ))}
        </Breadcrumb>
    );
}
