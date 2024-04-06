import React, { useEffect, useState } from 'react';
import CallApi from './CallApi';
import { useParams, useNavigate } from 'react-router-dom'; // Import useNavigate from react-router-dom

export default function ThongBaoAll() {
    const { id } = useParams();
    const navigate = useNavigate(); // Initialize useNavigate
    const [notifications, setNotifications] = useState([]);
    const userLoginBasicInformationDto = JSON.parse(localStorage.getItem('userLoginBasicInformationDto'));
    useEffect(() => {
        const fetchData = async () => {
            try {
                const allNotifications = await CallApi.getAllNotificationByAccount(id);
                setNotifications(allNotifications.reverse());
            } catch (error) {
                console.error("Error at fetchData", error);
            }
        };
        fetchData();
    }, [id]);
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const day = date.getDate();
        const month = date.getMonth() + 1; // Tháng bắt đầu từ 0, nên cần cộng thêm 1
        const year = date.getFullYear();

        // Đảm bảo ngày và tháng hiển thị với 2 chữ số bằng cách thêm '0' nếu cần
        const formattedDay = day < 10 ? '0' + day : day;
        const formattedMonth = month < 10 ? '0' + month : month;

        return formattedDay + '/' + formattedMonth + '/' + year;
    };

    const navigateToHomePage = () => {
        navigate('/trangchu'); // Navigate to homepage
    };

    return (
        <div className="admin-all-account">
         
            <div className='table-container' style={{marginRight:'100px', marginBottom:'100px'}}>
            <h2 className="account-list-title" style={{marginTop:'100px', fontWeight:'bold'}}>Thông báo của {userLoginBasicInformationDto.username}</h2>
            <table>
                <thead>
                    <tr>
                        <th style={{textAlign:'center'}}>STT</th>
                        <th style={{textAlign:'center'}}>Nội dung</th>
                        <th style={{textAlign:'center'}}>Thời gian</th>
                    </tr>
                </thead>
                <tbody>
                    {notifications.map((notification,index) => (
                        <tr key={notification.id}>
                            <td style={{textAlign:'center'}}>{index+1}</td>
                            <td>{notification.description}</td>
                            <td style={{textAlign:'center'}}>{formatDate(notification.createAt)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            </div>
            <button onClick={navigateToHomePage} className="back-to-home">Back to Homepage</button> {/* Use button with onClick event */}
        </div>
    );
}
