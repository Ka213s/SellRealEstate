import React, { useState, useEffect } from 'react';
import CallApi from '../CallApi';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import Adminmenu from "./admin-menu";
import UserAdmin from '../../list/userIAdmin';

export default function AdminAgencyBooking() {
    const [agencyAccounts, setAgencyAccounts] = useState([]);
    const navigate = useNavigate(); // Sử dụng useNavigate
    const userLoginBasicInformationDto = JSON.parse(localStorage.getItem('userLoginBasicInformationDto'));
    useEffect(() => {
        const fetchData = async () => {
            try {
                const getAllAcc = await CallApi.getAllAccount();
                const getAllAccAgency = getAllAcc.filter(
                    AccAgency => AccAgency.roleId === 1
                );
                const getAllRes = await CallApi.getAllReservations();
                // Lọc ra những reservation có agencyId
                const getAgenBook = getAllRes.filter(
                    reservation => reservation.agencyId !== null && reservation.status === 2
                );

                // Lập bản đồ để đếm số lần booking cho mỗi Agency
                const bookingCounts = getAgenBook.reduce((acc, curr) => {
                    acc[curr.agencyId] = (acc[curr.agencyId] || 0) + 1;
                    return acc;
                }, {});

                // Thêm thông tin booking vào mỗi Agency
                const agencyWithBooking = getAllAccAgency.map(agency => ({
                    ...agency,
                    bookingCount: bookingCounts[agency.id] || 0 // Thêm số lượng booking hoặc 0 nếu không có booking nào
                }));

                setAgencyAccounts(agencyWithBooking);
            } catch (error) {
                console.error('Error at fetchData', error);
            }
        };
        fetchData();
    }, []);

    const handleBookingClick = (agencyId) => {
        navigate(`/admin-DetailBookingAgen/${agencyId}`); // Thay đổi ở đây
    };


    return (
        <div className='admin-AB-container'>
            <div className=''>
                <Adminmenu
                    userLoginBasicInformationDto={userLoginBasicInformationDto}
                    UserMenu={UserAdmin}
                />
            </div>
            <div className='table-container' style={{ marginRight: '100px' }}>
                <div className="account-list">
                    {/* <h1 className='text-tongsodon'></h1> */}
                    <h2 className="account-list-title" style={{marginTop:'100px', fontWeight:'bold'}}>Tổng số đơn đặt của Agency</h2>
                    <table className="account-table" >
                        <thead style={{ textAlign: 'center' }}>
                            <tr>
                                <th className="account-table-header">STT</th>
                                <th className="account-table-header">Agency ID</th>
                                <th className="account-table-header">Tên Agency</th>
                                <th className="account-table-header">Tổng số đơn</th>
                                <th className="account-table-header">Chi tiết</th>
                            </tr>
                        </thead>
                        <tbody>
                            {agencyAccounts.map((agency, index) => (
                                <tr key={index}>
                                    <td>{index + 1}</td>
                                    <td>{agency.id}</td>
                                    <td>{agency.username}</td>
                                    <td >{agency.bookingCount}</td>
                                    <td style={{ textAlign: 'center' }}>
                                        <button onClick={() => handleBookingClick(agency.id)} class="btn btn-outline-success"> Tại đây </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
