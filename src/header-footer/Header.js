import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import duan from '../list/duan';
import tintuc from '../list/tintuc';
import '@fortawesome/fontawesome-free/css/all.css';
import { getToken } from '../authentication/Auth';
import listheaderCustomer from '../list/listheaderCustomer';
import listheaderAgency from '../list/listheaderAgency';
import listheaderInvestor from '../list/listheaderInvestor';
import { NavLink } from 'react-router-dom';
import CallApi from '../components/CallApi';
import axios from 'axios'; // Import Axios

export default function Header() {
    const userLoginBasicInformationDto = JSON.parse(localStorage.getItem('userLoginBasicInformationDto'));
    const checkRoleID = userLoginBasicInformationDto ? userLoginBasicInformationDto.roleName : null;
    const token = getToken();
    const accountID = userLoginBasicInformationDto ? userLoginBasicInformationDto.accountId : null;

    const [notificationCount, setNotificationCount] = useState(0); // State to hold notification count
    const [showNotificationList, setShowNotificationList] = useState(false); // State to control visibility of notification list
    const [notifications, setNotifications] = useState([]); // State to hold notifications data
    const navigate = useNavigate();
    useEffect(() => {
        const fetchData = async () => {
            try {
                const getAllNotification = await CallApi.getAllNotificationByAccount(accountID);
                console.log('getAllNotification:', getAllNotification);
                setNotifications(getAllNotification);

                // Filter notifications with status === true and count them
                const newCount = getAllNotification.filter(notification => notification.status === true).length;
                console.log('newCount:', newCount);
                setNotificationCount(newCount);
            } catch (error) {
                console.error("Error at fetchData", error);
            }
        };
        fetchData();
    }, []);
    const navigateToNewPage = () => {
        navigate(`/thongbao/${userLoginBasicInformationDto.accountId}`); // Navigate to new page with accountId
    };

    const toggleNotificationList = () => {
        setShowNotificationList(!showNotificationList);
    };

    const handleNotificationClick = async () => {
        try {
            CallApi.bookmarkbyAccount(accountID, { status: false });
            setNotificationCount(0);
        } catch (error) {
            console.error("Error handling notification click", error);
        }
    };

    const handleDropdownItemClick = (event) => {
        event.stopPropagation();
        // Thêm các xử lý khác ở đây nếu cần
    };

    let headerItems;
    if (checkRoleID === 'Agency') {
        headerItems = listheaderAgency;
    } else if (checkRoleID === 'Customer') {
        headerItems = listheaderCustomer;
    } else if (checkRoleID === 'Investor') {
        headerItems = listheaderInvestor;
    } else {
        // Default to customer if role is not defined
        headerItems = listheaderCustomer;
    }
    const cacuDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();

        const yearDiff = now.getFullYear() - date.getFullYear();
        if (yearDiff > 0) return yearDiff + " năm trước";

        const monthDiff = now.getMonth() - date.getMonth();
        if (monthDiff > 0) return monthDiff + " tháng trước";

        const dayDiff = now.getDate() - date.getDate();
        if (dayDiff > 0) return dayDiff + " ngày trước";

        return "Hôm nay";
    };


    return (
        <nav className="navbar navbar-default navbar-trans navbar-expand-lg fixed-top">
            <div className="container">
                <button className="navbar-toggler collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#navbarDefault" aria-controls="navbarDefault" aria-expanded="false" aria-label="Toggle navigation">
                    <span></span>
                    <span></span>
                    <span></span>
                </button>
                <a className="navbar-brand text-brand" href="/trangchu">
                    <img className='lgo-header' src='/logoheader/logo-header.png' alt='lgo-header' />
                </a>

                <div className="navbar-collapse collapse justify-content-center" id="navbarDefault">
                    <ul className="navbar-nav">

                        <li className="nav-item">
                            <NavLink exact activeClassName="active" className="nav-link" to="/trangchu">Trang chủ</NavLink>
                        </li>

                        <li className="nav-item">
                            <NavLink activeClassName="active" className="nav-link" to="/gioithieu">Giới thiệu</NavLink>
                        </li>

                        <li className="nav-item dropdown">
                            <NavLink activeClassName="active" className="nav-link dropdown-toggle" id='navbarDropdown' role='button' data-bs-toggle='dropdown' aria-haspopup='true' aria-expanded='false' to="/tintuc">Tin tức</NavLink>
                            <div className="dropdown-menu">
                                {tintuc.map((tintuc) => (
                                    <li key={tintuc.id}><Link className='text-drop' to={tintuc.link}>{tintuc.title}</Link></li>
                                ))}
                            </div>
                        </li>


                        <li className="nav-item dropdown">
                            <NavLink activeClassName="active" className="nav-link dropdown-toggle" id='navbarDropdown' role='button' data-bs-toggle='dropdown' aria-haspopup='true' aria-expanded='false' to="/duan">Dự án</NavLink>
                            <div className="dropdown-menu">
                                {duan.map((duan) => (
                                    <li key={duan.id}><Link className='text-drop' to={duan.link}>{duan.name}</Link></li>
                                ))}
                            </div>
                        </li>
                        <li className="nav-item">
                            <NavLink activeClassName="active" className="nav-link" to="/lienhe">Liên hệ</NavLink>
                        </li>
                    </ul>
                </div>
                {token && userLoginBasicInformationDto ? (
                    <button type="button" className="button" onClick={toggleNotificationList}>
                        <div className="container-login">
                            <span className="notification-icon">
                            <i className="fas fa-bell" onClick={handleNotificationClick} style={{ color: 'black', fontSize: '26px' }}></i>

                                {notificationCount > 0 && (
                                    <span className="notification-count" onClick={handleNotificationClick} style={{ color: 'red' }}>{notificationCount}</span>
                                )}
                            </span>
                        </div>
                    </button>) : null}

                <div className="navbar-toggle-wrapper">
                    <div className="header-content">
                        <div class="container-login">
                            {token && userLoginBasicInformationDto ? (
                                <div class="dropdown">
                                    <span class="login-link">
                                        {userLoginBasicInformationDto.username}
                                    </span>
                                    <div class="dropdown-menu">
                                        {headerItems.map((item) => (
                                            <Link class="dropdown-item" to={item.link} key={item.id} onClick={handleDropdownItemClick}>{item.name}</Link>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div>
                                    <Link class='login-link' to='/dangnhap'>Đăng Nhập</Link>
                                    <Link class='register-link' to='/dangki'>Đăng Ký</Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                <div style={{ transform: 'translateX(-180px)', fontWeight: '10px', width: '200px' }}>
                    {token && userLoginBasicInformationDto && (
                        <div className={`dropdown-menu ${showNotificationList ? 'show' : ''}`} style={{ width: '400px', marginTop: '20px', border: 'white', boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.5)', padding: '10px' }}>
                            <p style={{ fontWeight: 'bold', marginLeft: '15px', fontSize: '20px' }}>Thông báo</p>
                            <div>
                                {notifications.slice(-6).reverse().map((notification) => {
                                    return (
                                        <div key={notification.id} className="dropdown-item" style={{ whiteSpace: 'pre-line' }}>
                                            <div style={{ fontSize: '15px' }}>
                                                {notification.description}
                                            </div>
                                            <div style={{ fontSize: '12px' }}>
                                                {cacuDate(notification.createAt)}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                            <hr></hr>
                            <div style={{ textAlign: 'center' }}>
                                <button className="btn btn-outline-success" onClick={navigateToNewPage}>Tất cả thông báo</button>
                            </div>
                        </div>
                    )}
                </div>
                

            </div>
        </nav>
    )
}
