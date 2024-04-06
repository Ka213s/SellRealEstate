import React, { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import CallApi from '../CallApi';

export default function Agencymenu({ userLoginBasicInformationDto, UserMenu, handleLogout }) {
    const navigate = useNavigate();
    const [notificationCount, setNotificationCount] = useState(0);
    const [showNotificationList, setShowNotificationList] = useState(false);
    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const getAllNotification = await CallApi.getAllNotificationByAccount(userLoginBasicInformationDto.accountId);
                setNotifications(getAllNotification);

                const newCount = getAllNotification.filter(notification => notification.status === true).length;
                setNotificationCount(newCount);
            } catch (error) {
                console.error("Error at fetchData", error);
            }
        };
        fetchData();
    }, []);

    const toggleNotificationList = () => {
        setShowNotificationList(!showNotificationList);
    };

    const handleNotificationClick = async () => {
        try {
            await CallApi.bookmarkbyAccount(userLoginBasicInformationDto.accountId, { status: false });
            setNotificationCount(0);
            // Redirect to the notifications page
            navigate(`/thongbao/${userLoginBasicInformationDto.accountId}`);
        } catch (error) {
            console.error("Error handling notification click", error);
        }
    };

    const navigateToNewPage = () => {
        navigate(`/thongbao/${userLoginBasicInformationDto.accountId}`);
    };

    return (
        <div className="admin-menu">
            <a href='/admin-trangchu'>
                <img src={require('./logo-footer.png')} alt="" />
            </a>
            {notificationCount >= 0 && (
                <button type="button" className="button" onClick={handleNotificationClick}>
                    <span className="notification-icon">
                        <i className="fas fa-bell" style={{ color: 'black', fontSize: '26px' }}></i>
                        <span className="notification-count" style={{ color: 'red' }}>{notificationCount}</span>
                    </span>
                </button>
            )}
            <span style={{marginLeft:'30px'}} className="admin-menu__welcome">Chào mừng, {userLoginBasicInformationDto.username}!</span>
            
            <hr></hr>
            <ul className="admin-menu__list">
                {UserMenu.map(menuItem => (
                    <li key={menuItem.id} className="admin-menu__item">
                        <NavLink
                            to={menuItem.link}
                            className={({ isActive }) => isActive ? "admin-menu__link admin-menu__link--active" : "admin-menu__link"}
                        >
                            {menuItem.name}
                        </NavLink>
                    </li>
                ))}
            </ul>
           
        </div>
    );
}
