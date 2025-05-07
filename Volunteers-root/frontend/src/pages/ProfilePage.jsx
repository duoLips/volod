import { useState } from 'react';
import ProfileSidebar from '../components/ProfileSidebar';
import UpdateProfileForm from "../components/settings/UpdateProfileForm.jsx";
export default function ProfilePage() {
    const [activeTab, setActiveTab] = useState('auctions');

    const renderContent = () => {
        switch (activeTab) {
            case 'settings':
                return (
                    <>
                        <h2>Налаштування профілю</h2>
                        <UpdateProfileForm />
                    </>
                );
            case 'auctions':
                return <h2>Aукціони</h2>;
            case 'comments':
                return <h2>Коментарі</h2>;
            case 'stats':
                return <h2>Статистика</h2>;
            default:
                return null;
        }
    };

    return (
        <div style={{ display: 'flex', maxWidth: 1200, margin: '2rem auto', gap: 40 }}>
            <ProfileSidebar selectedKey={activeTab} onSelect={setActiveTab} />
            <div style={{ flex: 1 }}>
                {renderContent()}
            </div>
        </div>
    );
}
